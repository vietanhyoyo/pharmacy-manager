import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { numeric } from './prisma-values';

@Injectable()
export class ProductsRepository {
  constructor(private readonly db: PrismaService) {}

  async products(orgId: string) {
    const products = await this.db.products.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
      include: {
        categories: { select: { name: true } },
        units: { select: { name: true } },
        inventory_balances: { where: { organization_id: orgId }, select: { on_hand_qty: true } },
      },
    });

    return products.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      activeIngredient: product.active_ingredient,
      strength: product.strength,
      dosageForm: product.dosage_form,
      prescriptionType: product.prescription_type,
      categoryId: product.category_id,
      categoryName: product.categories?.name ?? null,
      baseUnitId: product.base_unit_id,
      unitName: product.units.name,
      status: product.status,
      quantity: product.inventory_balances.reduce((total, balance) => total + numeric(balance.on_hand_qty), 0),
    }));
  }
}
