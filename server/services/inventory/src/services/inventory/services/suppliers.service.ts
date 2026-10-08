import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { SuppliersRepository } from '../repositories/suppliers.repository';
import { SupplierRequest } from '../requests';
import { IdResponse } from '../responses';
import { body, optional, required, translateDuplicate } from './inventory-validation';

@Injectable()
export class SuppliersService {
  constructor(private readonly repo: SuppliersRepository) {}

  suppliers(user: AdminUser) { return this.repo.suppliers(user.organizationId); }

  async createSupplier(user: AdminUser, input: SupplierRequest): Promise<IdResponse> {
    body(input);
    const id = randomUUID();
    try {
      await this.repo.createSupplier(user.organizationId, {
        id,
        code: required(input?.code, 'Mã nhà cung cấp', 64).toUpperCase(),
        name: required(input?.name, 'Tên nhà cung cấp'),
        phone: optional(input.phone, 32),
      });
    } catch (error) { translateDuplicate(error, 'Mã nhà cung cấp đã tồn tại'); }
    return { id };
  }

  async updateSupplier(user: AdminUser, id: string, input: SupplierRequest): Promise<IdResponse> {
    body(input);
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new BadRequestException('Trạng thái không hợp lệ');
    try {
      const result = await this.repo.updateSupplier(user.organizationId, id, {
        code: required(input?.code, 'Mã nhà cung cấp', 64).toUpperCase(),
        name: required(input?.name, 'Tên nhà cung cấp'),
        phone: optional(input.phone, 32),
        status,
      });
      if (result.count === 0) throw new NotFoundException('Nhà cung cấp không tồn tại');
    } catch (error) { translateDuplicate(error, 'Mã nhà cung cấp đã tồn tại'); }
    return { id };
  }
}
