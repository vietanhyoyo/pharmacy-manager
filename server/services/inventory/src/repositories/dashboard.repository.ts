import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AdminUser } from '../shared/contracts/admin-user';
import { numeric } from './prisma-values';

@Injectable()
export class DashboardRepository {
  constructor(private readonly db: PrismaService) {}

  async dashboard(user: AdminUser) {
    const organizationId = user.organizationId;
    const [productsCount, suppliers, lotsCount, balances, receipts, issues, activeProducts, expiringLots, recentMovements] = await Promise.all([
      this.db.products.count({ where: { organization_id: organizationId } }),
      this.db.suppliers.count({ where: { organization_id: organizationId } }),
      this.db.inventory_lots.count({ where: { organization_id: organizationId } }),
      this.db.inventory_balances.aggregate({ where: { organization_id: organizationId }, _sum: { on_hand_qty: true } }),
      this.db.goods_receipts.count({ where: { organization_id: organizationId, status: 'POSTED' } }),
      this.db.stock_adjustments.count({ where: { organization_id: organizationId, status: 'POSTED' } }),
      this.db.products.findMany({
        where: { organization_id: organizationId, status: 'ACTIVE' },
        select: { id: true, sku: true, name: true, inventory_balances: { where: { organization_id: organizationId }, select: { on_hand_qty: true } } },
      }),
      this.db.inventory_lots.findMany({
        where: {
          organization_id: organizationId,
          expiry_date: { lte: this.expiryWindowEnd() },
          inventory_balances: { some: { organization_id: organizationId, on_hand_qty: { gt: 0 } } },
        },
        orderBy: { expiry_date: 'asc' },
        take: 6,
        select: {
          id: true,
          batch_number: true,
          expiry_date: true,
          products: { select: { name: true } },
          inventory_balances: { where: { organization_id: organizationId }, select: { on_hand_qty: true } },
        },
      }),
      this.db.inventory_movements.findMany({
        where: { organization_id: organizationId },
        orderBy: { ledger_seq: 'desc' },
        take: 8,
        select: {
          id: true,
          movement_type: true,
          quantity_delta: true,
          posted_at: true,
          reference_no: true,
          products: { select: { name: true } },
          inventory_lots: { select: { batch_number: true } },
        },
      }),
    ]);

    const lowStock = activeProducts
      .map(product => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        quantity: product.inventory_balances.reduce((total, balance) => total + numeric(balance.on_hand_qty), 0),
      }))
      .filter(product => product.quantity < 30)
      .sort((left, right) => left.quantity - right.quantity)
      .slice(0, 6);
    const expiring = expiringLots.map(lot => ({
      id: lot.id,
      batchNumber: lot.batch_number,
      expiryDate: lot.expiry_date,
      productName: lot.products.name,
      quantity: lot.inventory_balances.reduce((total, balance) => total + numeric(balance.on_hand_qty), 0),
    }));
    const recent = recentMovements.map(movement => ({
      id: movement.id,
      movementType: movement.movement_type,
      quantityDelta: numeric(movement.quantity_delta),
      postedAt: movement.posted_at,
      productName: movement.products.name,
      batchNumber: movement.inventory_lots.batch_number,
      referenceNo: movement.reference_no,
    }));

    return {
      products: productsCount,
      suppliers,
      lots: lotsCount,
      totalUnits: numeric(balances._sum.on_hand_qty),
      receipts,
      issues,
      lowStock,
      expiring,
      recent,
    };
  }

  private expiryWindowEnd(): Date {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 90));
  }
}
