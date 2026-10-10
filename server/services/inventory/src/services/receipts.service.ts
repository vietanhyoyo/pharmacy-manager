import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AdminUser } from '../shared/contracts/admin-user';
import { InventoryRepository } from '../repositories/app.repository';
import { ReceiptsRepository } from '../repositories/receipts.repository';
import { ReceiptRequest } from '../requests';
import { ReceiptCreatedResponse } from '../responses';
import { body, positive, required } from './app-validation';

@Injectable()
export class ReceiptsService {
  constructor(private readonly repo: ReceiptsRepository, private readonly ledger: InventoryRepository) {}

  receipts(user: AdminUser, warehouseId?: string) { return this.repo.receipts(user.organizationId, warehouseId); }

  async receive(user: AdminUser, input: ReceiptRequest): Promise<ReceiptCreatedResponse> {
    const context = await this.ledger.context(user.organizationId, input.warehouseId);
    if (!context) throw new BadRequestException('Chưa có kho hoạt động');
    return this.receiveInContext(user, context, input);
  }

  async receiveInContext(user: AdminUser, context: { branchId: string; warehouseId: string; locationId: string }, input: ReceiptRequest): Promise<ReceiptCreatedResponse> {
    body(input);
    if (!Array.isArray(input?.lines) || input.lines.length < 1 || input.lines.length > 50) throw new BadRequestException('Phiếu nhập cần từ 1 đến 50 dòng');
    const id = randomUUID();
    const number = `NK-${Date.now()}-${id.slice(0, 6).toUpperCase()}`;
    const now = input.receivedAt ? new Date(input.receivedAt) : new Date();
    if (Number.isNaN(now.getTime())) throw new BadRequestException('Ngày nhập không hợp lệ');
    const supplierId = required(input.supplierId, 'Nhà cung cấp', 36);
    const lines = input.lines.map(line => {
      body(line);
      return {
        productId: required(line.productId, 'Thuốc', 36),
        lotId: required(line.lotId, 'Lô', 36),
        quantity: positive(line.quantity, 'Số lượng'),
        purchasePrice: positive(line.purchasePrice, 'Giá nhập', true),
      };
    });
    await this.repo.createReceipt({ id, receiptNumber: number, receivedAt: now, supplierId, user, context, lines });
    return { id, receiptNumber: number };
  }
}
