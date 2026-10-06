// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inventory_lots' })
export class InventoryLots {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'batch_number', type: 'varchar', length: 128 })
  batchNumber!: string;

  @Column({ name: 'manufacturing_date', type: 'date', nullable: true })
  manufacturingDate!: string | null;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate!: string | null;

  @Column({ name: 'manufacturer_id', type: 'char', length: 36, nullable: true })
  manufacturerId!: string | null;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'ACTIVE' })
  status!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
