// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'product_barcodes' })
export class ProductBarcodes {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'product_unit_id', type: 'char', length: 36, nullable: true })
  productUnitId!: string | null;

  @Column({ name: 'barcode', type: 'varchar', length: 128 })
  barcode!: string;

  @Column({ name: 'barcode_type', type: 'varchar', length: 32, nullable: true })
  barcodeType!: string | null;

  @Column({ name: 'is_primary', type: 'tinyint', default: 0 })
  isPrimary!: boolean;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'ACTIVE' })
  status!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
