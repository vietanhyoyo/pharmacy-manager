import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductRequest } from '../requests';
import { IdResponse } from '../responses';
import { body, optional, requireEntity, required, translateDuplicate } from './inventory-validation';

@Injectable()
export class ProductsService {
  constructor(private readonly repo: ProductsRepository, private readonly db: PrismaService) {}

  products(user: AdminUser) { return this.repo.products(user.organizationId); }

  async createProduct(user: AdminUser, input: ProductRequest): Promise<IdResponse> {
    body(input);
    const sku = required(input?.sku, 'Mã thuốc', 64).toUpperCase();
    const name = required(input?.name, 'Tên thuốc');
    const baseUnitId = required(input?.baseUnitId, 'Đơn vị', 36);
    if (input?.prescriptionType && !['RX', 'OTC', 'OTHER'].includes(input.prescriptionType)) throw new BadRequestException('Loại kê đơn không hợp lệ');
    return this.db.$transaction(async manager => {
      requireEntity(await manager.units.findUnique({ where: { id: baseUnitId }, select: { id: true } }), 'Đơn vị');
      if (input.categoryId) requireEntity(await manager.categories.findFirst({ where: { id: input.categoryId, organization_id: user.organizationId }, select: { id: true } }), 'Nhóm thuốc');
      const id = randomUUID();
      try {
        await manager.products.create({ data: {
          id,
          organization_id: user.organizationId,
          sku,
          name,
          category_id: input.categoryId || null,
          active_ingredient: optional(input.activeIngredient),
          strength: optional(input.strength, 128),
          dosage_form: optional(input.dosageForm, 128),
          prescription_type: input.prescriptionType || 'OTC',
          base_unit_id: baseUnitId,
          status: 'ACTIVE',
        } });
      } catch (error) { translateDuplicate(error, 'Mã thuốc đã tồn tại'); }
      await manager.product_units.create({ data: { id: randomUUID(), product_id: id, unit_id: baseUnitId, conversion_factor: 1, is_base_unit: true } });
      return { id };
    });
  }

  async updateProduct(user: AdminUser, id: string, input: ProductRequest): Promise<IdResponse> {
    body(input);
    const sku = required(input?.sku, 'Mã thuốc', 64).toUpperCase();
    const name = required(input?.name, 'Tên thuốc');
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new BadRequestException('Trạng thái không hợp lệ');
    if (input.prescriptionType && !['RX', 'OTC', 'OTHER'].includes(input.prescriptionType)) throw new BadRequestException('Loại kê đơn không hợp lệ');
    return this.db.$transaction(async manager => {
      const product = requireEntity(await manager.products.findFirst({ where: { id, organization_id: user.organizationId }, select: { base_unit_id: true } }), 'Thuốc');
      if (input.baseUnitId !== product.base_unit_id) throw new BadRequestException('Không thể đổi đơn vị gốc của thuốc đã tạo');
      if (input.categoryId) requireEntity(await manager.categories.findFirst({ where: { id: input.categoryId, organization_id: user.organizationId }, select: { id: true } }), 'Nhóm thuốc');
      try {
        await manager.products.update({ where: { id }, data: {
          sku,
          name,
          category_id: input.categoryId || null,
          active_ingredient: optional(input.activeIngredient),
          strength: optional(input.strength, 128),
          dosage_form: optional(input.dosageForm, 128),
          prescription_type: input.prescriptionType || 'OTC',
          status,
        } });
      } catch (error) { translateDuplicate(error, 'Mã thuốc đã tồn tại'); }
      return { id };
    });
  }
}
