import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductRequest } from '../requests';
import { IdResponse } from '../responses';
import { body, optional, required, translateDuplicate } from './inventory-validation';

@Injectable()
export class ProductsService {
  constructor(private readonly repo: ProductsRepository) {}

  products(user: AdminUser) { return this.repo.products(user.organizationId); }

  async createProduct(user: AdminUser, input: ProductRequest): Promise<IdResponse> {
    body(input);
    const sku = required(input?.sku, 'Mã thuốc', 64).toUpperCase();
    const name = required(input?.name, 'Tên thuốc');
    const baseUnitId = required(input?.baseUnitId, 'Đơn vị', 36);
    if (input?.prescriptionType && !['RX', 'OTC', 'OTHER'].includes(input.prescriptionType)) throw new BadRequestException('Loại kê đơn không hợp lệ');
    const id = randomUUID();
    try {
      await this.repo.createProduct(user.organizationId, {
        id, sku, name, baseUnitId,
        categoryId: input.categoryId || null,
        activeIngredient: optional(input.activeIngredient),
        strength: optional(input.strength, 128),
        dosageForm: optional(input.dosageForm, 128),
        prescriptionType: input.prescriptionType || 'OTC',
      });
    } catch (error) { translateDuplicate(error, 'Mã thuốc đã tồn tại'); }
    return { id };
  }

  async updateProduct(user: AdminUser, id: string, input: ProductRequest): Promise<IdResponse> {
    body(input);
    const sku = required(input?.sku, 'Mã thuốc', 64).toUpperCase();
    const name = required(input?.name, 'Tên thuốc');
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new BadRequestException('Trạng thái không hợp lệ');
    if (input.prescriptionType && !['RX', 'OTC', 'OTHER'].includes(input.prescriptionType)) throw new BadRequestException('Loại kê đơn không hợp lệ');
    try {
      await this.repo.updateProduct(user.organizationId, id, {
        sku, name, status, baseUnitId: input.baseUnitId,
        categoryId: input.categoryId || null,
        activeIngredient: optional(input.activeIngredient),
        strength: optional(input.strength, 128),
        dosageForm: optional(input.dosageForm, 128),
        prescriptionType: input.prescriptionType || 'OTC',
      });
    } catch (error) { translateDuplicate(error, 'Mã thuốc đã tồn tại'); }
    return { id };
  }
}
