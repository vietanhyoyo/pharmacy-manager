// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'inventory_balances' })
export class InventoryBalances {
  @PrimaryColumn({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @PrimaryColumn({ name: 'warehouse_id', type: 'char', length: 36 })
  warehouseId!: string;

  @PrimaryColumn({ name: 'location_id', type: 'char', length: 36 })
  locationId!: string;

  @PrimaryColumn({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @PrimaryColumn({ name: 'lot_id', type: 'char', length: 36 })
  lotId!: string;

  @Column({ name: 'on_hand_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  onHandQty!: string;

  @Column({ name: 'reserved_qty', type: 'decimal', precision: 20, scale: 6, default: 0 })
  reservedQty!: string;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'version', type: 'bigint', unsigned: true, default: 0 })
  version!: string;

}
