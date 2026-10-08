// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'purchase_order_lines' })
export class PurchaseOrderLines {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'purchase_order_id', type: 'char', length: 36 })
  purchaseOrderId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'product_unit_id', type: 'char', length: 36 })
  productUnitId!: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 20, scale: 6 })
  quantity!: string;

  @Column({ name: 'conversion_factor', type: 'decimal', precision: 20, scale: 6 })
  conversionFactor!: string;

  @Column({ name: 'base_quantity', type: 'decimal', precision: 20, scale: 6 })
  baseQuantity!: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 19, scale: 4, default: 0 })
  unitPrice!: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 19, scale: 4, default: 0 })
  discountAmount!: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 19, scale: 4, default: 0 })
  taxAmount!: string;

  @Column({ name: 'line_total', type: 'decimal', precision: 19, scale: 4, default: 0 })
  lineTotal!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
