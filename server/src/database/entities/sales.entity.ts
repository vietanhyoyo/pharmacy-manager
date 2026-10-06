// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sales' })
export class Sales {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'branch_id', type: 'char', length: 36 })
  branchId!: string;

  @Column({ name: 'warehouse_id', type: 'char', length: 36 })
  warehouseId!: string;

  @Column({ name: 'sale_number', type: 'varchar', length: 64 })
  saleNumber!: string;

  @Column({ name: 'customer_id', type: 'char', length: 36, nullable: true })
  customerId!: string | null;

  @Column({ name: 'subtotal', type: 'decimal', precision: 19, scale: 4, default: 0 })
  subtotal!: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 19, scale: 4, default: 0 })
  discountAmount!: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 19, scale: 4, default: 0 })
  taxAmount!: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 19, scale: 4, default: 0 })
  totalAmount!: string;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'DRAFT' })
  status!: string;

  @Column({ name: 'sold_at', type: 'datetime', precision: 6, nullable: true })
  soldAt!: Date | null;

  @Column({ name: 'created_by', type: 'char', length: 36 })
  createdBy!: string;

  @Column({ name: 'pos_device_id', type: 'char', length: 36, nullable: true })
  posDeviceId!: string | null;

  @Column({ name: 'shift_id', type: 'char', length: 36, nullable: true })
  shiftId!: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 128 })
  idempotencyKey!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
