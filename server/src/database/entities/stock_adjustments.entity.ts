// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stock_adjustments' })
export class StockAdjustments {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'branch_id', type: 'char', length: 36, nullable: true })
  branchId!: string | null;

  @Column({ name: 'warehouse_id', type: 'char', length: 36 })
  warehouseId!: string;

  @Column({ name: 'adjustment_number', type: 'varchar', length: 64 })
  adjustmentNumber!: string;

  @Column({ name: 'reason_code', type: 'varchar', length: 32 })
  reasonCode!: string;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'DRAFT' })
  status!: string;

  @Column({ name: 'adjusted_at', type: 'datetime', precision: 6, nullable: true })
  adjustedAt!: Date | null;

  @Column({ name: 'created_by', type: 'char', length: 36 })
  createdBy!: string;

  @Column({ name: 'approved_by', type: 'char', length: 36, nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 128, nullable: true })
  idempotencyKey!: string | null;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
