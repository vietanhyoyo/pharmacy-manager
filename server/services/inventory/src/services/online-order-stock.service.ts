import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';

const sourceType = 'ONLINE_ORDER';

@Injectable()
export class OnlineOrderStockService {
  constructor(private readonly db: PrismaService) {}

  async reserve(organizationId: string, orderId: string) {
    return this.db.$transaction(async tx => {
      const order = await tx.orders.findFirst({ where: { id: orderId, organization_id: organizationId }, include: { order_lines: true } });
      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.status !== 'PROCESSING') throw new ConflictException('Đơn hàng không còn chờ xác nhận');
      const existing = await tx.inventory_reservations.findMany({ where: { organization_id: organizationId, source_type: sourceType, source_id: orderId } });
      if (existing.length) {
        if (existing.every(item => item.status === 'ACTIVE')) return { reserved: true };
        throw new ConflictException('Đơn hàng đã xử lý tồn kho');
      }
      const requirements = new Map<string, number>();
      for (const line of order.order_lines) requirements.set(line.product_id, (requirements.get(line.product_id) ?? 0) + Number(line.base_quantity));
      const today = new Date(); today.setUTCHours(0, 0, 0, 0);
      for (const [productId, required] of requirements) {
        let remaining = required;
        const balances = await tx.inventory_balances.findMany({
          where: { organization_id: organizationId, warehouse_id: order.warehouse_id, product_id: productId,
            stock_locations: { status: 'ACTIVE' }, inventory_lots: { status: 'ACTIVE', OR: [{ expiry_date: null }, { expiry_date: { gte: today } }] } },
          include: { inventory_lots: { select: { expiry_date: true } } },
          orderBy: { lot_id: 'asc' },
        });
        balances.sort((a, b) => (a.inventory_lots.expiry_date?.getTime() ?? Infinity) - (b.inventory_lots.expiry_date?.getTime() ?? Infinity));
        for (const balance of balances) {
          const available = Number(balance.on_hand_qty) - Number(balance.reserved_qty);
          const quantity = Math.min(remaining, Math.max(0, available));
          if (quantity <= 0) continue;
          const key = { organization_id: organizationId, warehouse_id: balance.warehouse_id, location_id: balance.location_id, product_id: productId, lot_id: balance.lot_id };
          const updated = await tx.inventory_balances.updateMany({ where: { ...key, on_hand_qty: balance.on_hand_qty, reserved_qty: balance.reserved_qty }, data: { reserved_qty: { increment: quantity }, version: { increment: 1n }, updated_at: new Date() } });
          if (updated.count !== 1) throw new ConflictException('Tồn kho vừa thay đổi, vui lòng thử lại');
          await tx.inventory_reservations.create({ data: { id: randomUUID(), ...key, reserved_qty: quantity, source_type: sourceType, source_id: orderId, status: 'ACTIVE' } });
          remaining -= quantity;
          if (remaining <= 0.000001) break;
        }
        if (remaining > 0.000001) throw new BadRequestException('Không đủ tồn kho khả dụng để xác nhận đơn');
      }
      return { reserved: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 });
  }

  async release(organizationId: string, orderId: string) {
    return this.db.$transaction(async tx => {
      const reservations = await tx.inventory_reservations.findMany({ where: { organization_id: organizationId, source_type: sourceType, source_id: orderId } });
      if (reservations.some(item => item.status === 'CONSUMED')) throw new ConflictException('Đơn hàng đã xuất kho');
      for (const item of reservations.filter(item => item.status === 'ACTIVE')) {
        const changed = await tx.inventory_reservations.updateMany({ where: { id: item.id, status: 'ACTIVE' }, data: { status: 'RELEASED', updated_at: new Date() } });
        if (changed.count !== 1) throw new ConflictException('Phiếu giữ hàng vừa thay đổi');
        await tx.inventory_balances.update({ where: { organization_id_warehouse_id_location_id_product_id_lot_id: {
          organization_id: organizationId, warehouse_id: item.warehouse_id, location_id: item.location_id, product_id: item.product_id, lot_id: item.lot_id,
        } }, data: { reserved_qty: { decrement: item.reserved_qty }, version: { increment: 1n }, updated_at: new Date() } });
      }
      return { released: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 });
  }

  async dispatch(organizationId: string, orderId: string) {
    return this.db.$transaction(async tx => {
      const order = await tx.orders.findFirst({ where: { id: orderId, organization_id: organizationId }, select: { status: true, branch_id: true, order_number: true } });
      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.status !== 'PROCESSING') throw new ConflictException('Đơn hàng chưa được xác nhận');
      const reservations = await tx.inventory_reservations.findMany({ where: { organization_id: organizationId, source_type: sourceType, source_id: orderId } });
      if (!reservations.length) throw new ConflictException('Đơn hàng chưa được giữ hàng');
      if (reservations.every(item => item.status === 'CONSUMED')) return { dispatched: true };
      if (reservations.some(item => item.status !== 'ACTIVE')) throw new ConflictException('Trạng thái giữ hàng không hợp lệ');
      for (const item of reservations) {
        const changed = await tx.inventory_reservations.updateMany({ where: { id: item.id, status: 'ACTIVE' }, data: { status: 'CONSUMED', updated_at: new Date() } });
        if (changed.count !== 1) throw new ConflictException('Phiếu giữ hàng vừa thay đổi');
        await tx.inventory_balances.update({ where: { organization_id_warehouse_id_location_id_product_id_lot_id: {
          organization_id: organizationId, warehouse_id: item.warehouse_id, location_id: item.location_id, product_id: item.product_id, lot_id: item.lot_id,
        } }, data: { reserved_qty: { decrement: item.reserved_qty }, on_hand_qty: { decrement: item.reserved_qty }, version: { increment: 1n }, updated_at: new Date() } });
        const now = new Date();
        await tx.inventory_movements.create({ data: { id: randomUUID(), organization_id: organizationId, branch_id: order.branch_id,
          warehouse_id: item.warehouse_id, location_id: item.location_id, product_id: item.product_id, lot_id: item.lot_id,
          movement_type: 'SALE', quantity_delta: new Prisma.Decimal(item.reserved_qty).negated(), source_type: sourceType,
          source_id: orderId, source_line_id: item.id, reference_no: order.order_number, occurred_at: now, posted_at: now } });
      }
      return { dispatched: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 });
  }
}
