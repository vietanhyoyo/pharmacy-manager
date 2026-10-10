import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { numeric } from './prisma-values';

@Injectable()
export class LotsRepository {
  constructor(private readonly db: PrismaService) {}

  async lots(orgId: string, warehouseId?: string) {
    const lots = await this.db.inventory_lots.findMany({
      where: { organization_id: orgId },
      orderBy: { expiry_date: 'asc' },
      include: {
        products: { select: { name: true, sku: true } },
        inventory_balances: { where: { organization_id: orgId, ...(warehouseId ? { warehouse_id: warehouseId } : {}) }, select: { on_hand_qty: true } },
      },
    });

    return lots.map(lot => ({
      id: lot.id,
      productId: lot.product_id,
      productName: lot.products.name,
      sku: lot.products.sku,
      batchNumber: lot.batch_number,
      manufacturingDate: lot.manufacturing_date,
      expiryDate: lot.expiry_date,
      status: lot.status,
      quantity: lot.inventory_balances.reduce((total, balance) => total + numeric(balance.on_hand_qty), 0),
    }));
  }

  async createLot(orgId: string, input: {
    id: string;
    productId: string;
    batchNumber: string;
    manufacturingDate: Date | null;
    expiryDate: Date;
  }): Promise<void> {
    if (!await this.db.products.findFirst({ where: { id: input.productId, organization_id: orgId }, select: { id: true } })) {
      throw new BadRequestException('Thuốc không tồn tại hoặc không thuộc hệ thống');
    }
    await this.db.inventory_lots.create({ data: {
      id: input.id,
      organization_id: orgId,
      product_id: input.productId,
      batch_number: input.batchNumber,
      manufacturing_date: input.manufacturingDate,
      expiry_date: input.expiryDate,
    } });
  }

  async updateLot(orgId: string, id: string, input: {
    productId: string;
    batchNumber: string;
    manufacturingDate: Date | null;
    expiryDate: Date;
    status: string;
  }): Promise<void> {
    const lot = await this.db.inventory_lots.findFirst({
      where: { id, organization_id: orgId }, select: { product_id: true },
    });
    if (!lot) throw new BadRequestException('Lô không tồn tại hoặc không thuộc hệ thống');
    if (lot.product_id !== input.productId) throw new BadRequestException('Không thể đổi thuốc của lô');
    await this.db.inventory_lots.update({ where: { id }, data: {
      batch_number: input.batchNumber,
      manufacturing_date: input.manufacturingDate,
      expiry_date: input.expiryDate,
      status: input.status,
    } });
  }
}
