// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stock_count_lines' })
export class StockCountLines {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'stock_count_id', type: 'char', length: 36 })
  stockCountId!: string;

  @Column({ name: 'location_id', type: 'char', length: 36 })
  locationId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'lot_id', type: 'char', length: 36 })
  lotId!: string;

  @Column({ name: 'expected_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  expectedQty!: string;

  @Column({ name: 'counted_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  countedQty!: string;

  @Column({ name: 'difference_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  differenceQty!: string;

  @Column({ name: 'counted_at', type: 'datetime', precision: 6 })
  countedAt!: Date;

  @Column({ name: 'counted_by', type: 'char', length: 36 })
  countedBy!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
