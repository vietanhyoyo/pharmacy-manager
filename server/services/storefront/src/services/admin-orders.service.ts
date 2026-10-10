import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { AdminUser } from '../guards/admin-auth.guard';
import { InventoryClientService } from './inventory-client.service';

const statuses = ['PLACED', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'] as const;
type Action = 'confirm' | 'dispatch' | 'complete' | 'cancel';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly db: PrismaService, private readonly inventory: InventoryClientService) {}

  private async accessibleBranches(admin: AdminUser) {
    const assigned = await this.db.user_branch_access.findMany({ where: { user_id: admin.id }, select: { branch_id: true } });
    return this.db.branches.findMany({ where: { organization_id: admin.organizationId, ...(assigned.length ? { id: { in: assigned.map(item => item.branch_id) } } : {}) }, select: { id: true, code: true, name: true, address: true }, orderBy: { code: 'asc' } });
  }

  async branches(admin: AdminUser) { return this.accessibleBranches(admin); }

  private async checkBranch(admin: AdminUser, branchId: string) {
    const branches = await this.accessibleBranches(admin);
    if (!branches.some(branch => branch.id === branchId)) throw new ForbiddenException('Không có quyền xem chi nhánh này');
  }

  async list(admin: AdminUser, query: { branchId?: string; status?: string; search?: string; page?: string }) {
    const branches = await this.accessibleBranches(admin);
    if (query.branchId && !branches.some(branch => branch.id === query.branchId)) throw new ForbiddenException('Không có quyền xem chi nhánh này');
    if (query.status && !statuses.includes(query.status as typeof statuses[number])) throw new BadRequestException('Trạng thái không hợp lệ');
    const page = Number(query.page ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) throw new BadRequestException('Trang không hợp lệ');
    const search = query.search?.trim().slice(0, 100);
    const where: Prisma.ordersWhereInput = { organization_id: admin.organizationId,
      branch_id: query.branchId ?? { in: branches.map(branch => branch.id) },
      ...(query.status ? { status: query.status } : {}),
      ...(search ? { OR: [{ order_number: { contains: search } }, { recipient_name: { contains: search } }, { recipient_phone: { contains: search } }] } : {}),
    };
    const [orders, total] = await Promise.all([
      this.db.orders.findMany({ where, include: { branches: { select: { name: true, code: true } }, order_lines: { select: { id: true } } }, orderBy: { placed_at: 'desc' }, skip: (page - 1) * 20, take: 20 }),
      this.db.orders.count({ where }),
    ]);
    return { items: orders.map(order => ({ id: order.id, orderNumber: order.order_number, status: order.status, paymentStatus: order.payment_status, branchId: order.branch_id, branchName: order.branches.name, recipientName: order.recipient_name, recipientPhone: order.recipient_phone, total: Number(order.total_amount), lineCount: order.order_lines.length, placedAt: order.placed_at })), total, page, pageSize: 20, totalPages: Math.ceil(total / 20) };
  }

  async detail(admin: AdminUser, id: string) {
    const order = await this.db.orders.findFirst({ where: { id, organization_id: admin.organizationId }, include: {
      branches: { select: { name: true, code: true, address: true } },
      order_lines: { orderBy: { created_at: 'asc' } }, order_events: { orderBy: { created_at: 'asc' } }, shipments: true,
    } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    await this.checkBranch(admin, order.branch_id);
    const lastEvent = order.order_events[order.order_events.length - 1];
    const pendingAction = order.status === 'PROCESSING' && lastEvent?.to_status === 'PROCESSING' && lastEvent.note?.startsWith('ACTION:')
      ? lastEvent.note.slice(7) : null;
    return { id: order.id, orderNumber: order.order_number, status: order.status, paymentStatus: order.payment_status, pendingAction,
      branchId: order.branch_id, branchName: order.branches.name, branchCode: order.branches.code,
      recipientName: order.recipient_name, recipientPhone: order.recipient_phone,
      address: [order.shipping_address_line1, order.shipping_ward, order.shipping_district, order.shipping_province].filter(Boolean).join(', '),
      subtotal: Number(order.subtotal), total: Number(order.total_amount), placedAt: order.placed_at,
      confirmedAt: order.confirmed_at, completedAt: order.completed_at, cancelledAt: order.cancelled_at,
      lines: order.order_lines.map(line => ({ id: line.id, name: line.product_name_snapshot, sku: line.product_sku_snapshot, unit: line.unit_code_snapshot, quantity: Number(line.quantity), unitPrice: Number(line.unit_price), total: Number(line.line_total) })),
      events: order.order_events.map(event => ({ id: event.id, fromStatus: event.from_status, toStatus: event.to_status, note: event.note, createdAt: event.created_at })),
      shipment: order.shipments && { status: order.shipments.status, shippedAt: order.shipments.shipped_at, deliveredAt: order.shipments.delivered_at },
    };
  }

  async action(admin: AdminUser, id: string, action: Action) {
    const order = await this.db.orders.findFirst({ where: { id, organization_id: admin.organizationId }, select: { id: true, branch_id: true, status: true,
      order_events: { orderBy: { created_at: 'desc' }, take: 1, select: { note: true, to_status: true, from_status: true } } } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    await this.checkBranch(admin, order.branch_id);
    const expected = action === 'confirm' ? 'PLACED' : action === 'dispatch' ? 'CONFIRMED' : action === 'complete' ? 'SHIPPED' : ['PLACED', 'CONFIRMED'];
    const next = action === 'confirm' ? 'CONFIRMED' : action === 'dispatch' ? 'SHIPPED' : action === 'complete' ? 'COMPLETED' : 'CANCELLED';
    if (order.status === next) return this.detail(admin, id);
    const resume = order.status === 'PROCESSING' && order.order_events[0]?.to_status === 'PROCESSING' && order.order_events[0].note === `ACTION:${action}`;
    const allowed = Array.isArray(expected) ? expected.includes(order.status) : order.status === expected;
    if (!allowed && !resume) throw new ConflictException('Trạng thái đơn hàng đã thay đổi; vui lòng tải lại');
    const original = resume ? order.order_events[0].from_status! : order.status;
    if (!resume) await this.db.$transaction(async tx => {
      const claimed = await tx.orders.updateMany({ where: { id, organization_id: admin.organizationId, status: original }, data: { status: 'PROCESSING', updated_at: new Date() } });
      if (claimed.count !== 1) throw new ConflictException('Đơn hàng đang được xử lý');
      await tx.order_events.create({ data: { id: randomUUID(), organization_id: admin.organizationId, order_id: id,
        from_status: original, to_status: 'PROCESSING', actor_type: 'STAFF', actor_user_id: admin.id, note: `ACTION:${action}` } });
    });
    try {
      if (action === 'confirm') await this.inventory.orderAction(admin.organizationId, id, 'reserve');
      if (action === 'dispatch') await this.inventory.orderAction(admin.organizationId, id, 'dispatch');
      if (action === 'cancel') await this.inventory.orderAction(admin.organizationId, id, 'release');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        await this.db.$transaction(async tx => {
          const reverted = await tx.orders.updateMany({ where: { id, organization_id: admin.organizationId, status: 'PROCESSING' }, data: { status: original, updated_at: new Date() } });
          if (reverted.count === 1) await tx.order_events.create({ data: { id: randomUUID(), organization_id: admin.organizationId, order_id: id,
            from_status: 'PROCESSING', to_status: original, actor_type: 'STAFF', actor_user_id: admin.id, note: 'Thao tác chưa hoàn thành' } });
        });
      }
      throw error;
    }
    await this.db.$transaction(async tx => {
      const updated = await tx.orders.updateMany({ where: { id, organization_id: admin.organizationId, status: 'PROCESSING' }, data: {
        status: next, ...(action === 'confirm' ? { confirmed_at: new Date() } : {}),
        ...(action === 'complete' ? { completed_at: new Date(), payment_status: 'PAID' } : {}),
        ...(action === 'cancel' ? { cancelled_at: new Date() } : {}),
        updated_at: new Date(),
      } });
      if (updated.count !== 1) throw new ConflictException('Trạng thái đơn hàng vừa thay đổi');
      if (action === 'dispatch') await tx.shipments.create({ data: { id: randomUUID(), organization_id: admin.organizationId, order_id: id, status: 'IN_TRANSIT', shipped_at: new Date() } });
      if (action === 'complete') await tx.shipments.updateMany({ where: { organization_id: admin.organizationId, order_id: id }, data: { status: 'DELIVERED', delivered_at: new Date(), updated_at: new Date() } });
      await tx.order_events.create({ data: { id: randomUUID(), organization_id: admin.organizationId, order_id: id, from_status: 'PROCESSING', to_status: next,
        actor_type: 'STAFF', actor_user_id: admin.id } });
    });
    return this.detail(admin, id);
  }
}
