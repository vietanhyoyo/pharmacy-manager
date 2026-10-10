import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { AdminUser } from '../shared/contracts/admin-user';
import { InventoryContext, InventoryRepository } from './app.repository';
import { numeric } from './prisma-values';

@Injectable()
export class ReceiptsRepository {
  constructor(private readonly db: PrismaService, private readonly inventory: InventoryRepository) {}

  async receipts(orgId: string) {
    const receipts = await this.db.goods_receipts.findMany({
      where: { organization_id: orgId },
      orderBy: { received_at: 'desc' },
      include: {
        suppliers: { select: { name: true } },
        goods_receipt_lines: { select: { base_quantity: true, line_total: true } },
      },
    });

    return receipts.map(receipt => ({
      id: receipt.id,
      receiptNumber: receipt.receipt_number,
      receivedAt: receipt.received_at,
      status: receipt.status,
      supplierName: receipt.suppliers.name,
      lineCount: receipt.goods_receipt_lines.length,
      totalQuantity: receipt.goods_receipt_lines.reduce((total, line) => total + numeric(line.base_quantity), 0),
      totalAmount: receipt.goods_receipt_lines.reduce((total, line) => total + numeric(line.line_total), 0),
    }));
  }

  async createReceipt(input: {
    id: string;
    receiptNumber: string;
    receivedAt: Date;
    supplierId: string;
    user: AdminUser;
    context: InventoryContext;
    lines: { productId: string; lotId: string; quantity: number; purchasePrice: number }[];
  }): Promise<void> {
    await this.db.$transaction(async transaction => {
      const supplier = await transaction.suppliers.findFirst({
        where: { id: input.supplierId, organization_id: input.user.organizationId, status: 'ACTIVE' },
        select: { id: true },
      });
      if (!supplier) throw new BadRequestException('Nhà cung cấp không tồn tại hoặc không thuộc hệ thống');

      await transaction.goods_receipts.create({ data: {
        id: input.id,
        organization_id: input.user.organizationId,
        branch_id: input.context.branchId,
        warehouse_id: input.context.warehouseId,
        supplier_id: input.supplierId,
        receipt_number: input.receiptNumber,
        status: 'POSTED',
        received_at: input.receivedAt,
        posted_at: new Date(),
        created_by: input.user.id,
      } });

      for (const line of input.lines) {
        const product = await transaction.products.findFirst({
          where: {
            id: line.productId,
            organization_id: input.user.organizationId,
            status: 'ACTIVE',
            product_units: { some: { is_base_unit: true } },
          },
          select: { product_units: { where: { is_base_unit: true }, select: { id: true }, take: 1 } },
        });
        const productUnitId = product?.product_units[0]?.id;
        if (!productUnitId) throw new BadRequestException('Thuốc không tồn tại, không hoạt động hoặc chưa có đơn vị gốc');

        const lot = await transaction.inventory_lots.findFirst({
          where: { id: line.lotId, product_id: line.productId, organization_id: input.user.organizationId, status: 'ACTIVE' },
          select: { expiry_date: true },
        });
        if (!lot) throw new BadRequestException('Lô không tồn tại hoặc không hoạt động');
        const expiry = lot.expiry_date?.toISOString().slice(0, 10) ?? '';
        const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
        if (expiry && expiry < today) throw new BadRequestException('Không thể nhập lô đã hết hạn');

        const lineId = randomUUID();
        await transaction.goods_receipt_lines.create({ data: {
          id: lineId,
          goods_receipt_id: input.id,
          product_id: line.productId,
          product_unit_id: productUnitId,
          quantity: line.quantity,
          conversion_factor: 1,
          base_quantity: line.quantity,
          lot_id: line.lotId,
          purchase_price: line.purchasePrice,
          line_total: line.quantity * line.purchasePrice,
          net_cost: line.purchasePrice,
        } });

        const updatedAt = new Date();
        await transaction.inventory_balances.upsert({
          where: {
            organization_id_warehouse_id_location_id_product_id_lot_id: {
              organization_id: input.user.organizationId,
              warehouse_id: input.context.warehouseId,
              location_id: input.context.locationId,
              product_id: line.productId,
              lot_id: line.lotId,
            },
          },
          create: {
            organization_id: input.user.organizationId,
            warehouse_id: input.context.warehouseId,
            location_id: input.context.locationId,
            product_id: line.productId,
            lot_id: line.lotId,
            on_hand_qty: line.quantity,
            reserved_qty: 0,
            updated_at: updatedAt,
            version: 1n,
          },
          update: {
            on_hand_qty: { increment: line.quantity },
            updated_at: updatedAt,
            version: { increment: 1n },
          },
        });

        await this.inventory.recordMovement(transaction, input.user, input.context, line.productId, line.lotId,
          line.quantity, 'PURCHASE_RECEIPT', 'GOODS_RECEIPT', input.id, lineId, input.receiptNumber, line.purchasePrice);
      }
    });
  }
}
