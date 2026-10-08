// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'product_units' })
export class ProductUnits {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'unit_id', type: 'char', length: 36 })
  unitId!: string;

  @Column({ name: 'conversion_factor', type: 'decimal', precision: 20, scale: 6, default: 1 })
  conversionFactor!: string;

  @Column({ name: 'is_base_unit', type: 'tinyint', default: 0 })
  isBaseUnit!: boolean;

  @Column({ name: 'allow_purchase', type: 'tinyint', default: 1 })
  allowPurchase!: boolean;

  @Column({ name: 'allow_sale', type: 'tinyint', default: 1 })
  allowSale!: boolean;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
