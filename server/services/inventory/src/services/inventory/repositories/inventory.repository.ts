import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUser } from '../../../shared/contracts/admin-user';

export type InventoryContext = { branchId: string; warehouseId: string; locationId: string };

@Injectable()
export class InventoryRepository {
  constructor(private readonly db: PrismaService) {}

  async context(orgId: string) {
    const branch = await this.db.branches.findFirst({
      where: { organization_id: orgId, status: 'ACTIVE', warehouses: { some: { status: 'ACTIVE', stock_locations: { some: { status: 'ACTIVE' } } } } },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        warehouses: {
          where: { status: 'ACTIVE', stock_locations: { some: { status: 'ACTIVE' } } },
          orderBy: { created_at: 'asc' },
          take: 1,
          select: {
            id: true,
            stock_locations: { where: { status: 'ACTIVE' }, orderBy: { created_at: 'asc' }, take: 1, select: { id: true } },
          },
        },
      },
    });
    const warehouse = branch?.warehouses[0];
    const location = warehouse?.stock_locations[0];
    return branch && warehouse && location
      ? { branchId: branch.id, warehouseId: warehouse.id, locationId: location.id }
      : undefined;
  }

  async recordMovement(manager: Prisma.TransactionClient, user: AdminUser, context: { branchId: string; warehouseId: string; locationId: string },
    productId: string, lotId: string, delta: number, type: string, sourceType: string, sourceId: string, sourceLineId: string, referenceNo: string, unitCost: number | null) {
    const now = new Date();
    await manager.inventory_movements.create({
      data: {
        id: randomUUID(),
        organization_id: user.organizationId,
        branch_id: context.branchId,
        warehouse_id: context.warehouseId,
        location_id: context.locationId,
        product_id: productId,
        lot_id: lotId,
        movement_type: type,
        quantity_delta: delta,
        unit_cost: unitCost,
        source_type: sourceType,
        source_id: sourceId,
        source_line_id: sourceLineId,
        reference_no: referenceNo,
        occurred_at: now,
        posted_at: now,
        created_by: user.id,
      },
    });
  }
}
