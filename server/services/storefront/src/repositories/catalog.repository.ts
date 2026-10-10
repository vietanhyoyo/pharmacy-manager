import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

const detail = {
  categories: true,
  product_listings: true,
  product_units: { where: { allow_sale: true }, include: { units: true } },
  price_list_items: { include: { price_lists: true }, orderBy: { effective_from: 'desc' } },
} satisfies Prisma.productsInclude;

export type CatalogRecord = Prisma.productsGetPayload<{ include: typeof detail }>;

@Injectable()
export class CatalogRepository {
  constructor(private readonly db: PrismaService) {}

  async organizationId(): Promise<string> {
    const code = process.env.STOREFRONT_ORGANIZATION_CODE ?? 'PHARMACY_DEMO';
    const organization = await this.db.organizations.findUnique({ where: { code }, select: { id: true, status: true } });
    if (!organization || organization.status !== 'ACTIVE') throw new Error(`Storefront organization ${code} is unavailable`);
    return organization.id;
  }

  async categories(organizationId: string) {
    return this.db.categories.findMany({
      where: { organization_id: organizationId, products: { some: { status: 'ACTIVE', prescription_type: 'OTC', product_listings: { status: 'PUBLISHED' } } } },
      select: { id: true, name: true }, orderBy: { name: 'asc' },
    });
  }

  async products(organizationId: string, filters: { search?: string; category?: string; page: number }) {
    const where: Prisma.productsWhereInput = {
      organization_id: organizationId,
      status: 'ACTIVE', prescription_type: 'OTC',
      product_listings: { status: 'PUBLISHED' },
      ...(filters.search ? { OR: [
        { name: { contains: filters.search } }, { sku: { contains: filters.search } },
        { active_ingredient: { contains: filters.search } },
      ] } : {}),
      ...(filters.category ? { category_id: filters.category } : {}),
    };
    const [items, total] = await Promise.all([
      this.db.products.findMany({ where, include: detail, orderBy: [{ name: 'asc' }, { id: 'asc' }], skip: (filters.page - 1) * 12, take: 12 }),
      this.db.products.count({ where }),
    ]);
    return { items, total };
  }

  async productBySlug(organizationId: string, slug: string) {
    return this.db.products.findFirst({
      where: { organization_id: organizationId, status: 'ACTIVE', prescription_type: 'OTC', product_listings: { slug, status: 'PUBLISHED' } },
      include: detail,
    });
  }

  async availability(organizationId: string, productId: string) {
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const balances = await this.db.inventory_balances.findMany({
      where: { organization_id: organizationId, product_id: productId,
        inventory_lots: { status: 'ACTIVE', OR: [{ expiry_date: null }, { expiry_date: { gte: today } }] },
        warehouses: { allow_sale: true, status: 'ACTIVE' },
      },
      select: { on_hand_qty: true, reserved_qty: true },
    });
    return balances.reduce((sum, balance) => sum + Math.max(0, Number(balance.on_hand_qty) - Number(balance.reserved_qty)), 0);
  }
}
