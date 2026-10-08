import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { SuppliersRepository } from '../repositories/suppliers.repository';
import { SupplierRequest } from '../requests';
import { IdResponse } from '../responses';
import { body, optional, required, translateDuplicate } from './inventory-validation';

@Injectable()
export class SuppliersService {
  constructor(private readonly repo: SuppliersRepository, private readonly db: PrismaService) {}

  suppliers(user: AdminUser) { return this.repo.suppliers(user.organizationId); }

  async createSupplier(user: AdminUser, input: SupplierRequest): Promise<IdResponse> {
    body(input);
    const id = randomUUID();
    try {
      await this.db.suppliers.create({ data: {
        id,
        organization_id: user.organizationId,
        code: required(input?.code, 'Mã nhà cung cấp', 64).toUpperCase(),
        name: required(input?.name, 'Tên nhà cung cấp'),
        phone: optional(input.phone, 32),
      } });
    } catch (error) { translateDuplicate(error, 'Mã nhà cung cấp đã tồn tại'); }
    return { id };
  }

  async updateSupplier(user: AdminUser, id: string, input: SupplierRequest): Promise<IdResponse> {
    body(input);
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new BadRequestException('Trạng thái không hợp lệ');
    const existing = await this.db.suppliers.findFirst({ where: { id, organization_id: user.organizationId }, select: { id: true } });
    if (!existing) throw new NotFoundException('Nhà cung cấp không tồn tại');
    try {
      await this.db.suppliers.update({ where: { id }, data: {
        code: required(input?.code, 'Mã nhà cung cấp', 64).toUpperCase(),
        name: required(input?.name, 'Tên nhà cung cấp'),
        phone: optional(input.phone, 32),
        status,
      } });
    } catch (error) { translateDuplicate(error, 'Mã nhà cung cấp đã tồn tại'); }
    return { id };
  }
}
