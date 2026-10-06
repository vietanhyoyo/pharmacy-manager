// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stock_counts' })
export class StockCounts {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'branch_id', type: 'char', length: 36 })
  branchId!: string;

  @Column({ name: 'warehouse_id', type: 'char', length: 36 })
  warehouseId!: string;

  @Column({ name: 'count_number', type: 'varchar', length: 64 })
  countNumber!: string;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'DRAFT' })
  status!: string;

  @Column({ name: 'started_at', type: 'datetime', precision: 6, nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', precision: 6, nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'snapshot_sequence', type: 'bigint', unsigned: true, nullable: true })
  snapshotSequence!: string | null;

  @Column({ name: 'created_by', type: 'char', length: 36 })
  createdBy!: string;

  @Column({ name: 'approved_by', type: 'char', length: 36, nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
