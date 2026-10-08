// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'supplier_return_lines' })
export class SupplierReturnLines {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'supplier_return_id', type: 'char', length: 36 })
  supplierReturnId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'lot_id', type: 'char', length: 36 })
  lotId!: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 20, scale: 6 })
  quantity!: string;

  @Column({ name: 'base_quantity', type: 'decimal', precision: 20, scale: 6 })
  baseQuantity!: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 19, scale: 4, nullable: true })
  unitCost!: string | null;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
