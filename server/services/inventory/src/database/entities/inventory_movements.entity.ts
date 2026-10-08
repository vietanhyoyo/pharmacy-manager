// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inventory_movements' })
export class InventoryMovements {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'ledger_seq', type: 'bigint', unsigned: true, unique: true, generated: 'increment' })
  ledgerSeq!: string;
  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'branch_id', type: 'char', length: 36, nullable: true })
  branchId!: string | null;

  @Column({ name: 'warehouse_id', type: 'char', length: 36 })
  warehouseId!: string;

  @Column({ name: 'location_id', type: 'char', length: 36 })
  locationId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'lot_id', type: 'char', length: 36 })
  lotId!: string;

  @Column({ name: 'movement_type', type: 'varchar', length: 32 })
  movementType!: string;

  @Column({ name: 'quantity_delta', type: 'decimal', precision: 20, scale: 6 })
  quantityDelta!: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 19, scale: 4, nullable: true })
  unitCost!: string | null;

  @Column({ name: 'source_type', type: 'varchar', length: 64 })
  sourceType!: string;

  @Column({ name: 'source_id', type: 'char', length: 36 })
  sourceId!: string;

  @Column({ name: 'source_line_id', type: 'char', length: 36, nullable: true })
  sourceLineId!: string | null;

  @Column({ name: 'reference_no', type: 'varchar', length: 128, nullable: true })
  referenceNo!: string | null;

  @Column({ name: 'occurred_at', type: 'datetime', precision: 6 })
  occurredAt!: Date;

  @Column({ name: 'posted_at', type: 'datetime', precision: 6 })
  postedAt!: Date;

  @Column({ name: 'created_by', type: 'char', length: 36, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'device_id', type: 'char', length: 36, nullable: true })
  deviceId!: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 128, nullable: true })
  idempotencyKey!: string | null;

  @Column({ name: 'reversal_of_id', type: 'char', length: 36, nullable: true })
  reversalOfId!: string | null;

  @Column({ name: 'note', type: 'varchar', length: 1000, nullable: true })
  note!: string | null;

}
