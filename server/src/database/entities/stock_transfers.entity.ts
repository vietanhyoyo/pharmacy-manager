// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stock_transfers' })
export class StockTransfers {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'transfer_number', type: 'varchar', length: 64 })
  transferNumber!: string;

  @Column({ name: 'from_branch_id', type: 'char', length: 36, nullable: true })
  fromBranchId!: string | null;

  @Column({ name: 'from_warehouse_id', type: 'char', length: 36 })
  fromWarehouseId!: string;

  @Column({ name: 'to_branch_id', type: 'char', length: 36, nullable: true })
  toBranchId!: string | null;

  @Column({ name: 'to_warehouse_id', type: 'char', length: 36 })
  toWarehouseId!: string;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'DRAFT' })
  status!: string;

  @Column({ name: 'shipped_at', type: 'datetime', precision: 6, nullable: true })
  shippedAt!: Date | null;

  @Column({ name: 'received_at', type: 'datetime', precision: 6, nullable: true })
  receivedAt!: Date | null;

  @Column({ name: 'created_by', type: 'char', length: 36 })
  createdBy!: string;

  @Column({ name: 'approved_by', type: 'char', length: 36, nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'received_by', type: 'char', length: 36, nullable: true })
  receivedBy!: string | null;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
