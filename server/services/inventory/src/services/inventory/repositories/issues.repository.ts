import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';
import { InventoryContext, InventoryRepository } from './inventory.repository';
import { numeric } from './prisma-values';

@Injectable()
export class IssuesRepository {
  constructor(private readonly db: PrismaService, private readonly inventory: InventoryRepository) {}

  async issues(orgId: string) {
    const issues = await this.db.stock_adjustments.findMany({
      where: { organization_id: orgId, reason_code: { in: ['INTERNAL_USE', 'DAMAGED', 'EXPIRED', 'SAMPLE', 'OTHER'] } },
      orderBy: { adjusted_at: 'desc' },
      include: { stock_adjustment_lines: { select: { quantity_delta: true } } },
    });

    return issues.map(issue => ({
      id: issue.id,
      issueNumber: issue.adjustment_number,
      issuedAt: issue.adjusted_at,
      reasonCode: issue.reason_code,
      status: issue.status,
      lineCount: issue.stock_adjustment_lines.length,
      totalQuantity: issue.stock_adjustment_lines.reduce((total, line) => total - numeric(line.quantity_delta), 0),
    }));
  }

  async createIssue(input: {
    id: string;
    issueNumber: string;
    reasonCode: string;
    note: string | null;
    user: AdminUser;
    context: InventoryContext;
    lines: { productId: string; lotId: string; quantity: number }[];
  }): Promise<void> {
    await this.db.$transaction(async transaction => {
      await transaction.stock_adjustments.create({ data: {
        id: input.id,
        organization_id: input.user.organizationId,
        branch_id: input.context.branchId,
        warehouse_id: input.context.warehouseId,
        adjustment_number: input.issueNumber,
        reason_code: input.reasonCode,
        status: 'POSTED',
        adjusted_at: new Date(),
        created_by: input.user.id,
        approved_by: input.user.id,
      } });

      for (const line of input.lines) {
        const lot = await transaction.inventory_lots.findFirst({
          where: {
            id: line.lotId,
            product_id: line.productId,
            organization_id: input.user.organizationId,
            products: { status: 'ACTIVE' },
          },
          select: { status: true, expiry_date: true },
        });
        if (!lot) throw new BadRequestException('Lô không tồn tại hoặc không thuộc hệ thống');
        if (!['EXPIRED', 'DAMAGED'].includes(input.reasonCode) && lot.status !== 'ACTIVE') {
          throw new BadRequestException('Không thể xuất lô đang bị khóa');
        }
        const expiry = lot.expiry_date?.toISOString().slice(0, 10) ?? '';
        const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
        if (!['EXPIRED', 'DAMAGED'].includes(input.reasonCode) && expiry && expiry < today) {
          throw new BadRequestException('Lô đã hết hạn, hãy chọn lý do xuất phù hợp');
        }

        const balanceKey = {
          organization_id_warehouse_id_location_id_product_id_lot_id: {
            organization_id: input.user.organizationId,
            warehouse_id: input.context.warehouseId,
            location_id: input.context.locationId,
            product_id: line.productId,
            lot_id: line.lotId,
          },
        };
        const balance = await transaction.inventory_balances.findUnique({ where: balanceKey });
        if (!balance || Number(balance.on_hand_qty) - Number(balance.reserved_qty) < line.quantity) {
          throw new ConflictException('Tồn khả dụng không đủ để xuất kho');
        }
        const updated = await transaction.inventory_balances.updateMany({
          where: {
            ...balanceKey.organization_id_warehouse_id_location_id_product_id_lot_id,
            on_hand_qty: balance.on_hand_qty,
            reserved_qty: balance.reserved_qty,
          },
          data: { on_hand_qty: { decrement: line.quantity }, updated_at: new Date(), version: { increment: 1n } },
        });
        if (updated.count !== 1) throw new ConflictException('Tồn kho vừa thay đổi; hãy tải lại và thử lại');

        const lineId = randomUUID();
        await transaction.stock_adjustment_lines.create({ data: {
          id: lineId,
          stock_adjustment_id: input.id,
          location_id: input.context.locationId,
          product_id: line.productId,
          lot_id: line.lotId,
          quantity_delta: -line.quantity,
          note: input.note,
        } });
        const movementType = input.reasonCode === 'DAMAGED' ? 'DAMAGE'
          : input.reasonCode === 'EXPIRED' ? 'EXPIRY'
            : input.reasonCode === 'SAMPLE' ? 'SAMPLE' : 'INTERNAL_USE';
        await this.inventory.recordMovement(transaction, input.user, input.context, line.productId, line.lotId,
          -line.quantity, movementType, 'STOCK_ADJUSTMENT', input.id, lineId, input.issueNumber, null);
      }
    });
  }
}
