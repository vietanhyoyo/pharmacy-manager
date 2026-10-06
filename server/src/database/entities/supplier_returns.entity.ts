// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'supplier_returns' })
export class SupplierReturns {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'branch_id', type: 'char', length: 36, nullable: true })
  branchId!: string | null;

  @Column({ name: 'warehouse_id', type: 'char', length: 36 })
  warehouseId!: string;

  @Column({ name: 'supplier_id', type: 'char', length: 36 })
  supplierId!: string;

  @Column({ name: 'return_number', type: 'varchar', length: 64 })
  returnNumber!: string;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'DRAFT' })
  status!: string;

  @Column({ name: 'returned_at', type: 'datetime', precision: 6, nullable: true })
  returnedAt!: Date | null;

  @Column({ name: 'created_by', type: 'char', length: 36 })
  createdBy!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
