// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stock_transfer_lines' })
export class StockTransferLines {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'transfer_id', type: 'char', length: 36 })
  transferId!: string;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'lot_id', type: 'char', length: 36 })
  lotId!: string;

  @Column({ name: 'requested_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  requestedQty!: string;

  @Column({ name: 'shipped_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  shippedQty!: string;

  @Column({ name: 'received_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  receivedQty!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
