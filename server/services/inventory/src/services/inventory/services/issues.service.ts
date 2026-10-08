import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { InventoryRepository } from '../repositories/inventory.repository';
import { IssuesRepository } from '../repositories/issues.repository';
import { IssueRequest } from '../requests';
import { IssueCreatedResponse } from '../responses';
import { body, optional, positive, requireEntity } from './inventory-validation';

@Injectable()
export class IssuesService {
  constructor(private readonly repo: IssuesRepository, private readonly ledger: InventoryRepository, private readonly db: PrismaService) {}

  issues(user: AdminUser) { return this.repo.issues(user.organizationId); }

  async issue(user: AdminUser, input: IssueRequest): Promise<IssueCreatedResponse> {
    body(input);
    if (!['INTERNAL_USE', 'DAMAGED', 'EXPIRED', 'SAMPLE', 'OTHER'].includes(input?.reasonCode)) throw new BadRequestException('Lý do xuất không hợp lệ');
    if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 50) throw new BadRequestException('Phiếu xuất cần từ 1 đến 50 dòng');
    const context = await this.ledger.context(user.organizationId);
    if (!context) throw new BadRequestException('Chưa có kho hoạt động');
    const id = randomUUID();
    const number = `XK-${Date.now()}-${id.slice(0, 6).toUpperCase()}`;
    await this.db.$transaction(async manager => {
      await manager.stock_adjustments.create({ data: {
        id,
        organization_id: user.organizationId,
        branch_id: context.branchId,
        warehouse_id: context.warehouseId,
        adjustment_number: number,
        reason_code: input.reasonCode,
        status: 'POSTED',
        adjusted_at: new Date(),
        created_by: user.id,
        approved_by: user.id,
      } });
      for (const line of input.lines) {
        body(line);
        const quantity = positive(line.quantity, 'Số lượng');
        const lot = requireEntity(await manager.inventory_lots.findFirst({
          where: { id: line.lotId, product_id: line.productId, organization_id: user.organizationId, products: { status: 'ACTIVE' } },
          select: { status: true, expiry_date: true },
        }), 'Lô');
        if (!['EXPIRED', 'DAMAGED'].includes(input.reasonCode) && lot.status !== 'ACTIVE') throw new BadRequestException('Không thể xuất lô đang bị khóa');
        const expiry = lot.expiry_date?.toISOString().slice(0, 10) ?? '';
        if (!['EXPIRED', 'DAMAGED'].includes(input.reasonCode) && expiry && expiry < new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())) throw new BadRequestException('Lô đã hết hạn, hãy chọn lý do xuất phù hợp');
        const balanceKey = {
          organization_id_warehouse_id_location_id_product_id_lot_id: {
            organization_id: user.organizationId,
            warehouse_id: context.warehouseId,
            location_id: context.locationId,
            product_id: line.productId,
            lot_id: line.lotId,
          },
        };
        const balance = await manager.inventory_balances.findUnique({ where: balanceKey });
        if (!balance || Number(balance.on_hand_qty) - Number(balance.reserved_qty) < quantity) {
          throw new ConflictException('Tồn khả dụng không đủ để xuất kho');
        }
        const update = await manager.inventory_balances.updateMany({
          where: { ...balanceKey.organization_id_warehouse_id_location_id_product_id_lot_id, on_hand_qty: balance.on_hand_qty, reserved_qty: balance.reserved_qty },
          data: { on_hand_qty: { decrement: quantity }, updated_at: new Date(), version: { increment: 1n } },
        });
        if (update.count !== 1) throw new ConflictException('Tồn kho vừa thay đổi; hãy tải lại và thử lại');
        const lineId = randomUUID();
        await manager.stock_adjustment_lines.create({ data: {
          id: lineId,
          stock_adjustment_id: id,
          location_id: context.locationId,
          product_id: line.productId,
          lot_id: line.lotId,
          quantity_delta: -quantity,
          note: optional(input.note, 1000),
        } });
        const movementType = input.reasonCode === 'DAMAGED' ? 'DAMAGE' : input.reasonCode === 'EXPIRED' ? 'EXPIRY' : input.reasonCode === 'SAMPLE' ? 'SAMPLE' : 'INTERNAL_USE';
        await this.ledger.recordMovement(manager, user, context, line.productId, line.lotId, -quantity, movementType, 'STOCK_ADJUSTMENT', id, lineId, number, null);
      }
    });
    return { id, issueNumber: number };
  }
}
