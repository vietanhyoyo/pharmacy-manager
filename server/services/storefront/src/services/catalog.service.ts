import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRecord, CatalogRepository } from '../repositories/catalog.repository';

export function activePrice(record: Pick<CatalogRecord, 'organization_id' | 'price_list_items'>, productUnitId: string): number | null {
  const now = Date.now();
  const matching = record.price_list_items.find(item =>
    item.product_unit_id === productUnitId && item.price_lists.status === 'ACTIVE' &&
    item.price_lists.organization_id === record.organization_id &&
    item.effective_from.getTime() <= now && (!item.effective_to || item.effective_to.getTime() > now),
  );
  return matching ? Number(matching.price) : null;
}

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  async categories() {
    return this.repo.categories(await this.repo.organizationId());
  }

  async products(query: { search?: string; category?: string; page?: string }) {
    const search = query.search?.trim().slice(0, 100);
    const category = query.category?.trim();
    const page = Number(query.page ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) throw new BadRequestException('Trang không hợp lệ');
    if (category && !/^[0-9a-f-]{36}$/i.test(category)) throw new BadRequestException('Danh mục không hợp lệ');
    const organizationId = await this.repo.organizationId();
    const result = await this.repo.products(organizationId, { search, category, page });
    const items = await Promise.all(result.items.map(item => this.toResponse(item)));
    return { items, page, pageSize: 12, total: result.total, totalPages: Math.ceil(result.total / 12) };
  }

  async product(slug: string) {
    if (!slug || slug.length > 191) throw new NotFoundException('Không tìm thấy sản phẩm');
    const organizationId = await this.repo.organizationId();
    const record = await this.repo.productBySlug(organizationId, slug);
    if (!record) throw new NotFoundException('Không tìm thấy sản phẩm');
    return this.toResponse(record);
  }

  private async toResponse(record: CatalogRecord) {
    const units = record.product_units.map(unit => ({
      id: unit.id, name: unit.units.name, code: unit.units.code,
      conversionFactor: Number(unit.conversion_factor), price: activePrice(record, unit.id),
    }));
    const availableBaseQuantity = await this.repo.availability(record.organization_id, record.id);
    return {
      id: record.id, slug: record.product_listings!.slug, sku: record.sku,
      name: record.product_listings!.title, description: record.product_listings!.description,
      imageUrl: record.product_listings!.image_storage_key?.startsWith('https://') ? record.product_listings!.image_storage_key : null,
      category: record.categories ? { id: record.categories.id, name: record.categories.name } : null,
      activeIngredient: record.active_ingredient, strength: record.strength, dosageForm: record.dosage_form,
      prescriptionType: record.prescription_type, units, availableBaseQuantity,
    };
  }
}
