// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sales_return_lines' })
export class SalesReturnLines {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'sales_return_id', type: 'char', length: 36 })
  salesReturnId!: string;

  @Column({ name: 'sale_line_id', type: 'char', length: 36, nullable: true })
  saleLineId!: string | null;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'lot_id', type: 'char', length: 36 })
  lotId!: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 20, scale: 6 })
  quantity!: string;

  @Column({ name: 'base_quantity', type: 'decimal', precision: 20, scale: 6 })
  baseQuantity!: string;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 19, scale: 4, default: 0 })
  refundAmount!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
