import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { integerValue } from './prisma-values';

@Injectable()
export class MovementsRepository {
  constructor(private readonly db: PrismaService) {}

  async movements(orgId: string, warehouseId?: string) {
    const movements = await this.db.inventory_movements.findMany({
      where: { organization_id: orgId, ...(warehouseId ? { warehouse_id: warehouseId } : {}) },
      orderBy: { ledger_seq: 'desc' },
      take: 200,
      include: {
        products: { select: { name: true } },
        inventory_lots: { select: { batch_number: true } },
      },
    });

    return movements.map(movement => ({
      id: movement.id,
      ledgerSeq: integerValue(movement.ledger_seq),
      movementType: movement.movement_type,
      quantityDelta: Number(movement.quantity_delta),
      postedAt: movement.posted_at,
      referenceNo: movement.reference_no,
      productName: movement.products.name,
      batchNumber: movement.inventory_lots.batch_number,
    }));
  }
}
