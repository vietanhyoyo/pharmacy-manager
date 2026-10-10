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

  async branches() {
    return this.repo.branches(await this.repo.organizationId());
  }

  private async selectedBranch(organizationId: string, branchId?: string) {
    if (branchId && !/^[0-9a-f-]{36}$/i.test(branchId)) throw new BadRequestException('Chi nhánh không hợp lệ');
    const branch = await this.repo.branch(organizationId, branchId);
    if (!branch) throw new BadRequestException('Chi nhánh không nhận đơn hàng');
    return branch;
  }

  async categories(branchId?: string) {
    const organizationId = await this.repo.organizationId();
    const branch = await this.selectedBranch(organizationId, branchId);
    return this.repo.categories(organizationId, branch.warehouses[0].id);
  }

  async products(query: { search?: string; category?: string; page?: string; branchId?: string }) {
    const search = query.search?.trim().slice(0, 100);
    const category = query.category?.trim();
    const page = Number(query.page ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) throw new BadRequestException('Trang không hợp lệ');
    if (category && !/^[0-9a-f-]{36}$/i.test(category)) throw new BadRequestException('Danh mục không hợp lệ');
    const organizationId = await this.repo.organizationId();
    const branch = await this.selectedBranch(organizationId, query.branchId);
    const result = await this.repo.products(organizationId, { search, category, page, warehouseId: branch.warehouses[0].id });
    const items = await Promise.all(result.items.map(item => this.toResponse(item, branch.warehouses[0].id)));
    return { items, page, pageSize: 12, total: result.total, totalPages: Math.ceil(result.total / 12) };
  }

  async product(slug: string, branchId?: string) {
    if (!slug || slug.length > 191) throw new NotFoundException('Không tìm thấy sản phẩm');
    const organizationId = await this.repo.organizationId();
    const branch = await this.selectedBranch(organizationId, branchId);
    const record = await this.repo.productBySlug(organizationId, slug);
    if (!record) throw new NotFoundException('Không tìm thấy sản phẩm');
    return this.toResponse(record, branch.warehouses[0].id);
  }

  private async toResponse(record: CatalogRecord, warehouseId: string) {
    const units = record.product_units.map(unit => ({
      id: unit.id, name: unit.units.name, code: unit.units.code,
      conversionFactor: Number(unit.conversion_factor), price: activePrice(record, unit.id),
    }));
    const availableBaseQuantity = await this.repo.availability(record.organization_id, record.id, warehouseId);
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
