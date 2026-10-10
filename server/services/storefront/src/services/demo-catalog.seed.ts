import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';

const demoSkus = [
  'IBU-200', 'DIOS-3G', 'PROBIO-2ML', 'LOPE-2', 'ORS-245',
  'CETI-10', 'LORA-10', 'CHLOR-4', 'DEXTRO-15', 'ACETYL-200',
  'AMBRO-30', 'MULTI-VIT', 'CAL-D3', 'ZINC-20', 'B-COMPLEX',
  'OMEGA3-1000', 'FERRO-200', 'FOLIC-5', 'D3-1000', 'POVI-10',
  'CHLORHEX-005', 'HYDRO-1', 'CLOTRI-1', 'DICLO-GEL-1', 'TEARS-05',
  'PARA-SYR-120', 'CETI-SYR-1', 'ORS-GOI', 'PARA-500', 'VIT-C-1000',
  'OMEP-20', 'SIRON-HO',
];

/** Demo catalog only. Never creates or changes catalog records when SEED_DEMO_DATA=false. */
@Injectable()
export class DemoCatalogSeed implements OnApplicationBootstrap {
  constructor(private readonly db: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DEMO_DATA === 'false') return;
    const organization = await this.db.organizations.findUnique({ where: { code: process.env.STOREFRONT_ORGANIZATION_CODE ?? 'PHARMACY_DEMO' }, select: { id: true } });
    if (!organization) return;
    const priceList = await this.db.price_lists.upsert({
      where: { organization_id_code: { organization_id: organization.id, code: 'WEB-DEMO' } },
      update: {}, create: { id: randomUUID(), organization_id: organization.id, code: 'WEB-DEMO', name: 'Giá bán mẫu trên website' },
    });
    const products = await this.db.products.findMany({
      where: { organization_id: organization.id, status: 'ACTIVE', prescription_type: 'OTC', sku: { in: demoSkus } },
      include: { product_units: { where: { allow_sale: true, is_base_unit: true } }, product_listings: true },
      orderBy: { sku: 'asc' },
    });
    for (const [index, product] of products.entries()) {
      if (!product.product_listings) {
        await this.db.product_listings.create({ data: {
          id: randomUUID(), organization_id: organization.id, product_id: product.id,
          slug: product.sku.toLowerCase(), title: product.name,
          description: [product.active_ingredient && `Hoạt chất: ${product.active_ingredient}`, product.strength && `Hàm lượng: ${product.strength}`, product.dosage_form && `Dạng bào chế: ${product.dosage_form}`].filter(Boolean).join('. '),
          status: 'PUBLISHED', published_at: new Date(),
        } });
      }
      const unit = product.product_units[0];
      if (!unit) continue;
      const existing = await this.db.price_list_items.findFirst({ where: { price_list_id: priceList.id, product_id: product.id, product_unit_id: unit.id }, select: { id: true } });
      if (!existing) await this.db.price_list_items.create({ data: {
        id: randomUUID(), price_list_id: priceList.id, product_id: product.id, product_unit_id: unit.id,
        price: 12000 + (index % 18) * 3500, effective_from: new Date('2020-01-01T00:00:00.000Z'),
      } });
    }
  }
}
