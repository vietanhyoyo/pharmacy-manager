import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StockRepository {
  constructor(private readonly db: PrismaService) {}

  async stock(orgId: string) {
    const balances = await this.db.inventory_balances.findMany({
      where: { organization_id: orgId },
      include: {
        products: { select: { sku: true, name: true } },
        inventory_lots: { select: { batch_number: true, expiry_date: true } },
        warehouses: { select: { name: true } },
      },
      orderBy: [{ products: { name: 'asc' } }, { inventory_lots: { expiry_date: 'asc' } }],
    });

    return balances.map(balance => ({
      productId: balance.product_id,
      sku: balance.products.sku,
      productName: balance.products.name,
      lotId: balance.lot_id,
      batchNumber: balance.inventory_lots.batch_number,
      expiryDate: balance.inventory_lots.expiry_date,
      warehouseName: balance.warehouses.name,
      onHandQty: Number(balance.on_hand_qty),
      reservedQty: Number(balance.reserved_qty),
      availableQty: Number(balance.on_hand_qty) - Number(balance.reserved_qty),
    }));
  }
}
