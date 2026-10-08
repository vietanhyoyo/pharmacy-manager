import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { numeric } from './prisma-values';

@Injectable()
export class LotsRepository {
  constructor(private readonly db: PrismaService) {}

  async lots(orgId: string) {
    const lots = await this.db.inventory_lots.findMany({
      where: { organization_id: orgId },
      orderBy: { expiry_date: 'asc' },
      include: {
        products: { select: { name: true, sku: true } },
        inventory_balances: { where: { organization_id: orgId }, select: { on_hand_qty: true } },
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
}
