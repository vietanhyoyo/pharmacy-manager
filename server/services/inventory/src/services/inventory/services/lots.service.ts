import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { LotsRepository } from '../repositories/lots.repository';
import { LotRequest } from '../requests';
import { IdResponse } from '../responses';
import { body, date, required, translateDuplicate } from './inventory-validation';

@Injectable()
export class LotsService {
  constructor(private readonly repo: LotsRepository) {}

  lots(user: AdminUser) { return this.repo.lots(user.organizationId); }

  async createLot(user: AdminUser, input: LotRequest): Promise<IdResponse> {
    body(input);
    const productId = required(input?.productId, 'Thuốc', 36);
    const batchNumber = required(input?.batchNumber, 'Số lô', 128);
    const expiryDate = date(input?.expiryDate, 'Hạn dùng');
    const manufacturingDate = input.manufacturingDate ? date(input.manufacturingDate, 'Ngày sản xuất') : null;
    if (manufacturingDate && manufacturingDate > expiryDate) throw new BadRequestException('Hạn dùng phải sau ngày sản xuất');
    const id = randomUUID();
    try {
      await this.repo.createLot(user.organizationId, {
        id,
        productId,
        batchNumber,
        manufacturingDate: manufacturingDate ? this.asDatabaseDate(manufacturingDate) : null,
        expiryDate: this.asDatabaseDate(expiryDate),
      });
    } catch (error) { translateDuplicate(error, 'Số lô đã tồn tại cho thuốc này'); }
    return { id };
  }

  async updateLot(user: AdminUser, id: string, input: LotRequest): Promise<IdResponse> {
    body(input);
    const status = input.status ?? 'ACTIVE';
    if (!['ACTIVE', 'BLOCKED', 'QUARANTINED', 'CLOSED'].includes(status)) throw new BadRequestException('Trạng thái lô không hợp lệ');
    const expiryDate = date(input.expiryDate, 'Hạn dùng');
    const manufacturingDate = input.manufacturingDate ? date(input.manufacturingDate, 'Ngày sản xuất') : null;
    if (manufacturingDate && manufacturingDate > expiryDate) throw new BadRequestException('Hạn dùng phải sau ngày sản xuất');
    try {
      await this.repo.updateLot(user.organizationId, id, {
        productId: input.productId,
        batchNumber: required(input.batchNumber, 'Số lô', 128),
        manufacturingDate: manufacturingDate ? this.asDatabaseDate(manufacturingDate) : null,
        expiryDate: this.asDatabaseDate(expiryDate),
        status,
      });
    } catch (error) { translateDuplicate(error, 'Số lô đã tồn tại cho thuốc này'); }
    return { id };
  }

  private asDatabaseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }
}
