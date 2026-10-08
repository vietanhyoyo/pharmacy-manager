// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'price_list_items' })
export class PriceListItems {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'price_list_id', type: 'char', length: 36 })
  priceListId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'product_unit_id', type: 'char', length: 36 })
  productUnitId!: string;

  @Column({ name: 'price', type: 'decimal', precision: 19, scale: 4 })
  price!: string;

  @Column({ name: 'effective_from', type: 'datetime', precision: 6 })
  effectiveFrom!: Date;

  @Column({ name: 'effective_to', type: 'datetime', precision: 6, nullable: true })
  effectiveTo!: Date | null;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
