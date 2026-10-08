import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { LotsRepository } from '../repositories/lots.repository';
import { LotRequest } from '../requests';
import { IdResponse } from '../responses';
import { body, date, requireEntity, required, translateDuplicate } from './inventory-validation';

@Injectable()
export class LotsService {
  constructor(private readonly repo: LotsRepository, private readonly db: PrismaService) {}

  lots(user: AdminUser) { return this.repo.lots(user.organizationId); }

  async createLot(user: AdminUser, input: LotRequest): Promise<IdResponse> {
    body(input);
    const productId = required(input?.productId, 'Thuốc', 36);
    const batchNumber = required(input?.batchNumber, 'Số lô', 128);
    const expiryDate = date(input?.expiryDate, 'Hạn dùng');
    const manufacturingDate = input.manufacturingDate ? date(input.manufacturingDate, 'Ngày sản xuất') : null;
    if (manufacturingDate && manufacturingDate > expiryDate) throw new BadRequestException('Hạn dùng phải sau ngày sản xuất');
    const id = randomUUID();
    await this.db.$transaction(async manager => {
      requireEntity(await manager.products.findFirst({ where: { id: productId, organization_id: user.organizationId }, select: { id: true } }), 'Thuốc');
      try {
        await manager.inventory_lots.create({ data: {
          id,
          organization_id: user.organizationId,
          product_id: productId,
          batch_number: batchNumber,
          manufacturing_date: manufacturingDate ? new Date(`${manufacturingDate}T00:00:00.000Z`) : null,
          expiry_date: new Date(`${expiryDate}T00:00:00.000Z`),
        } });
      } catch (error) { translateDuplicate(error, 'Số lô đã tồn tại cho thuốc này'); }
    });
    return { id };
  }

  async updateLot(user: AdminUser, id: string, input: LotRequest): Promise<IdResponse> {
    body(input);
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'BLOCKED', 'QUARANTINED', 'CLOSED'].includes(status)) throw new BadRequestException('Trạng thái lô không hợp lệ');
    const expiryDate = date(input.expiryDate, 'Hạn dùng');
    const manufacturingDate = input.manufacturingDate ? date(input.manufacturingDate, 'Ngày sản xuất') : null;
    if (manufacturingDate && manufacturingDate > expiryDate) throw new BadRequestException('Hạn dùng phải sau ngày sản xuất');
    await this.db.$transaction(async manager => {
      const lot = requireEntity(await manager.inventory_lots.findFirst({ where: { id, organization_id: user.organizationId }, select: { product_id: true } }), 'Lô');
      if (lot.product_id !== input.productId) throw new BadRequestException('Không thể đổi thuốc của lô');
      try {
        await manager.inventory_lots.update({ where: { id }, data: {
          batch_number: required(input.batchNumber, 'Số lô', 128),
          manufacturing_date: manufacturingDate ? new Date(`${manufacturingDate}T00:00:00.000Z`) : null,
          expiry_date: new Date(`${expiryDate}T00:00:00.000Z`),
          status,
        } });
      } catch (error) { translateDuplicate(error, 'Số lô đã tồn tại cho thuốc này'); }
    });
    return { id };
  }
}
