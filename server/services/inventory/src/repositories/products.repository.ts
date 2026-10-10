import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { ProductListFilters } from '../requests';
import { numeric } from './prisma-values';

@Injectable()
export class ProductsRepository {
  constructor(private readonly db: PrismaService) {}

  async products(orgId: string, filters: ProductListFilters) {
    const orderBy = filters.sortBy === 'createdAt'
      ? [{ created_at: filters.sortOrder }, { id: 'asc' as const }]
      : filters.sortBy === 'sku'
        ? [{ sku: filters.sortOrder }, { id: 'asc' as const }]
        : [{ name: filters.sortOrder }, { id: 'asc' as const }];
    const products = await this.db.products.findMany({
      where: {
        organization_id: orgId,
        ...(filters.categoryId ? { category_id: filters.categoryId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.prescriptionType ? { prescription_type: filters.prescriptionType } : {}),
        ...(filters.search ? {
          OR: [
            { name: { contains: filters.search } },
            { sku: { contains: filters.search } },
            { active_ingredient: { contains: filters.search } },
            { strength: { contains: filters.search } },
            { dosage_form: { contains: filters.search } },
          ],
        } : {}),
      },
      orderBy,
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

  async createProduct(orgId: string, input: {
    id: string;
    sku: string;
    name: string;
    categoryId: string | null;
    activeIngredient: string | null;
    strength: string | null;
    dosageForm: string | null;
    prescriptionType: string;
    baseUnitId: string;
  }): Promise<void> {
    await this.db.$transaction(async transaction => {
      if (!await transaction.units.findUnique({ where: { id: input.baseUnitId }, select: { id: true } })) {
        throw new BadRequestException('Đơn vị không tồn tại hoặc không thuộc hệ thống');
      }
      if (input.categoryId && !await transaction.categories.findFirst({
        where: { id: input.categoryId, organization_id: orgId }, select: { id: true },
      })) throw new BadRequestException('Nhóm thuốc không tồn tại hoặc không thuộc hệ thống');

      await transaction.products.create({ data: {
        id: input.id,
        organization_id: orgId,
        sku: input.sku,
        name: input.name,
        category_id: input.categoryId,
        active_ingredient: input.activeIngredient,
        strength: input.strength,
        dosage_form: input.dosageForm,
        prescription_type: input.prescriptionType,
        base_unit_id: input.baseUnitId,
        status: 'ACTIVE',
      } });
      await transaction.product_units.create({ data: {
        id: randomUUID(), product_id: input.id, unit_id: input.baseUnitId, conversion_factor: 1, is_base_unit: true,
      } });
    });
  }

  async updateProduct(orgId: string, id: string, input: {
    sku: string;
    name: string;
    categoryId: string | null;
    activeIngredient: string | null;
    strength: string | null;
    dosageForm: string | null;
    prescriptionType: string;
    baseUnitId: string;
    status: string;
  }): Promise<void> {
    await this.db.$transaction(async transaction => {
      const product = await transaction.products.findFirst({
        where: { id, organization_id: orgId }, select: { base_unit_id: true },
      });
      if (!product) throw new BadRequestException('Thuốc không tồn tại hoặc không thuộc hệ thống');
      if (input.baseUnitId !== product.base_unit_id) throw new BadRequestException('Không thể đổi đơn vị gốc của thuốc đã tạo');
      if (input.categoryId && !await transaction.categories.findFirst({
        where: { id: input.categoryId, organization_id: orgId }, select: { id: true },
      })) throw new BadRequestException('Nhóm thuốc không tồn tại hoặc không thuộc hệ thống');

      await transaction.products.update({ where: { id }, data: {
        sku: input.sku,
        name: input.name,
        category_id: input.categoryId,
        active_ingredient: input.activeIngredient,
        strength: input.strength,
        dosage_form: input.dosageForm,
        prescription_type: input.prescriptionType,
        status: input.status,
      } });
    });
  }
}
