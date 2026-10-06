// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'products' })
export class Products {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'sku', type: 'varchar', length: 64 })
  sku!: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'short_name', type: 'varchar', length: 255, nullable: true })
  shortName!: string | null;

  @Column({ name: 'category_id', type: 'char', length: 36, nullable: true })
  categoryId!: string | null;

  @Column({ name: 'manufacturer_id', type: 'char', length: 36, nullable: true })
  manufacturerId!: string | null;

  @Column({ name: 'product_type', type: 'varchar', length: 32, default: 'MEDICINE' })
  productType!: string;

  @Column({ name: 'active_ingredient', type: 'varchar', length: 500, nullable: true })
  activeIngredient!: string | null;

  @Column({ name: 'strength', type: 'varchar', length: 128, nullable: true })
  strength!: string | null;

  @Column({ name: 'dosage_form', type: 'varchar', length: 128, nullable: true })
  dosageForm!: string | null;

  @Column({ name: 'registration_number', type: 'varchar', length: 128, nullable: true })
  registrationNumber!: string | null;

  @Column({ name: 'prescription_type', type: 'varchar', length: 32, nullable: true })
  prescriptionType!: string | null;

  @Column({ name: 'track_lot', type: 'tinyint', default: 1 })
  trackLot!: boolean;

  @Column({ name: 'track_expiry', type: 'tinyint', default: 1 })
  trackExpiry!: boolean;

  @Column({ name: 'base_unit_id', type: 'char', length: 36 })
  baseUnitId!: string;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 9, scale: 4, default: 0 })
  vatRate!: string;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'ACTIVE' })
  status!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
