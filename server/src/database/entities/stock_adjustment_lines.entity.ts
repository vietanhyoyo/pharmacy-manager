// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stock_adjustment_lines' })
export class StockAdjustmentLines {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'stock_adjustment_id', type: 'char', length: 36 })
  stockAdjustmentId!: string;

  @Column({ name: 'location_id', type: 'char', length: 36 })
  locationId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'lot_id', type: 'char', length: 36 })
  lotId!: string;

  @Column({ name: 'quantity_delta', type: 'decimal', precision: 20, scale: 6 })
  quantityDelta!: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 19, scale: 4, nullable: true })
  unitCost!: string | null;

  @Column({ name: 'note', type: 'varchar', length: 1000, nullable: true })
  note!: string | null;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
