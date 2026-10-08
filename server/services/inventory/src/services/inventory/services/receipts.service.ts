import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { InventoryRepository } from '../repositories/inventory.repository';
import { ReceiptsRepository } from '../repositories/receipts.repository';
import { ReceiptRequest } from '../requests';
import { ReceiptCreatedResponse } from '../responses';
import { body, positive, requireEntity } from './inventory-validation';

@Injectable()
export class ReceiptsService {
  constructor(private readonly repo: ReceiptsRepository, private readonly ledger: InventoryRepository, private readonly db: PrismaService) {}

  receipts(user: AdminUser) { return this.repo.receipts(user.organizationId); }

  async receive(user: AdminUser, input: ReceiptRequest): Promise<ReceiptCreatedResponse> {
    body(input);
    if (!Array.isArray(input?.lines) || input.lines.length < 1 || input.lines.length > 50) throw new BadRequestException('Phiếu nhập cần từ 1 đến 50 dòng');
    const context = await this.ledger.context(user.organizationId);
    if (!context) throw new BadRequestException('Chưa có kho hoạt động');
    const id = randomUUID();
    const number = `NK-${Date.now()}-${id.slice(0, 6).toUpperCase()}`;
    const now = input.receivedAt ? new Date(input.receivedAt) : new Date();
    if (Number.isNaN(now.getTime())) throw new BadRequestException('Ngày nhập không hợp lệ');
    await this.db.$transaction(async manager => {
      requireEntity(await manager.suppliers.findFirst({ where: { id: input.supplierId, organization_id: user.organizationId, status: 'ACTIVE' }, select: { id: true } }), 'Nhà cung cấp');
      await manager.goods_receipts.create({ data: {
        id,
        organization_id: user.organizationId,
        branch_id: context.branchId,
        warehouse_id: context.warehouseId,
        supplier_id: input.supplierId,
        receipt_number: number,
        status: 'POSTED',
        received_at: now,
        posted_at: new Date(),
        created_by: user.id,
      } });
      for (const line of input.lines) {
        body(line);
        const quantity = positive(line.quantity, 'Số lượng');
        const purchasePrice = positive(line.purchasePrice, 'Giá nhập', true);
        const product = requireEntity(await manager.products.findFirst({
          where: { id: line.productId, organization_id: user.organizationId, status: 'ACTIVE', product_units: { some: { is_base_unit: true } } },
          select: { product_units: { where: { is_base_unit: true }, select: { id: true }, take: 1 } },
        }), 'Thuốc');
        const productUnitId = product.product_units[0]?.id;
        if (!productUnitId) throw new BadRequestException('Thuốc chưa có đơn vị gốc');
        const lot = requireEntity(await manager.inventory_lots.findFirst({
          where: { id: line.lotId, product_id: line.productId, organization_id: user.organizationId, status: 'ACTIVE' },
          select: { expiry_date: true },
        }), 'Lô');
        const expiry = lot.expiry_date?.toISOString().slice(0, 10) ?? '';
        if (expiry && expiry < new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())) throw new BadRequestException('Không thể nhập lô đã hết hạn');
        const lineId = randomUUID();
        await manager.goods_receipt_lines.create({ data: {
          id: lineId,
          goods_receipt_id: id,
          product_id: line.productId,
          product_unit_id: productUnitId,
          quantity,
          conversion_factor: 1,
          base_quantity: quantity,
          lot_id: line.lotId,
          purchase_price: purchasePrice,
          line_total: quantity * purchasePrice,
          net_cost: purchasePrice,
        } });
        const balanceWhere = {
          organization_id_warehouse_id_location_id_product_id_lot_id: {
            organization_id: user.organizationId,
            warehouse_id: context.warehouseId,
            location_id: context.locationId,
            product_id: line.productId,
            lot_id: line.lotId,
          },
        };
        const nowUpdated = new Date();
        await manager.inventory_balances.upsert({
          where: balanceWhere,
          create: {
            organization_id: user.organizationId,
            warehouse_id: context.warehouseId,
            location_id: context.locationId,
            product_id: line.productId,
            lot_id: line.lotId,
            on_hand_qty: quantity,
            reserved_qty: 0,
            updated_at: nowUpdated,
            version: 1n,
          },
          update: {
            on_hand_qty: { increment: quantity },
            updated_at: nowUpdated,
            version: { increment: 1n },
          },
        });
        await this.ledger.recordMovement(manager, user, context, line.productId, line.lotId, quantity, 'PURCHASE_RECEIPT', 'GOODS_RECEIPT', id, lineId, number, purchasePrice);
      }
    });
    return { id, receiptNumber: number };
  }
}
