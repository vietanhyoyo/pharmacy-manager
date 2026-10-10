import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AdminUser } from '../shared/contracts/admin-user';

@Injectable()
export class LookupsRepository {
  constructor(private readonly db: PrismaService) {}

  async lookups(user: AdminUser) {
    const [categories, units, suppliers, products, lots, warehouses] = await Promise.all([
      this.db.categories.findMany({ where: { organization_id: user.organizationId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      this.db.units.findMany({ select: { id: true, code: true, name: true }, orderBy: { name: 'asc' } }),
      this.db.suppliers.findMany({ where: { organization_id: user.organizationId, status: 'ACTIVE' }, select: { id: true, code: true, name: true }, orderBy: { name: 'asc' } }),
      this.db.products.findMany({
        where: { organization_id: user.organizationId, status: 'ACTIVE', product_units: { some: { is_base_unit: true } } },
        select: { id: true, sku: true, name: true, product_units: { where: { is_base_unit: true }, select: { id: true }, take: 1 } },
        orderBy: { name: 'asc' },
      }).then(rows => rows.map(({ product_units, ...product }) => ({ ...product, productUnitId: product_units[0]?.id ?? null }))),
      this.db.inventory_lots.findMany({
        where: { organization_id: user.organizationId, status: 'ACTIVE' },
        select: { id: true, product_id: true, batch_number: true, expiry_date: true },
        orderBy: { expiry_date: 'asc' },
      }).then(rows => rows.map(({ product_id, batch_number, expiry_date, ...lot }) => ({
        ...lot, productId: product_id, batchNumber: batch_number, expiryDate: expiry_date,
      }))),
      this.db.warehouses.findMany({ where: { organization_id: user.organizationId }, select: { id: true, code: true, name: true }, orderBy: { name: 'asc' } }),
    ]);
    return { categories, units, suppliers, products, lots, warehouses };
  }
}
