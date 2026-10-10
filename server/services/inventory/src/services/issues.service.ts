import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AdminUser } from '../shared/contracts/admin-user';
import { InventoryRepository } from '../repositories/app.repository';
import { IssuesRepository } from '../repositories/issues.repository';
import { IssueRequest } from '../requests';
import { IssueCreatedResponse } from '../responses';
import { body, optional, positive, required } from './app-validation';

@Injectable()
export class IssuesService {
  constructor(private readonly repo: IssuesRepository, private readonly inventory: InventoryRepository) {}

  issues(user: AdminUser, warehouseId?: string) { return this.repo.issues(user.organizationId, warehouseId); }

  async issue(user: AdminUser, input: IssueRequest): Promise<IssueCreatedResponse> {
    body(input);
    if (!['INTERNAL_USE', 'DAMAGED', 'EXPIRED', 'SAMPLE', 'OTHER'].includes(input?.reasonCode)) {
      throw new BadRequestException('Lý do xuất không hợp lệ');
    }
    if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 50) {
      throw new BadRequestException('Phiếu xuất cần từ 1 đến 50 dòng');
    }

    const lines = input.lines.map(line => {
      body(line);
      return {
        productId: required(line.productId, 'Thuốc', 36),
        lotId: required(line.lotId, 'Lô', 36),
        quantity: positive(line.quantity, 'Số lượng'),
      };
    });
    const context = await this.inventory.context(user.organizationId, input.warehouseId);
    if (!context) throw new BadRequestException('Chưa có kho hoạt động');

    const id = randomUUID();
    const issueNumber = `XK-${Date.now()}-${id.slice(0, 6).toUpperCase()}`;
    await this.repo.createIssue({
      id,
      issueNumber,
      reasonCode: input.reasonCode,
      note: optional(input.note, 1000),
      user,
      context,
      lines,
    });
    return { id, issueNumber };
  }
}
