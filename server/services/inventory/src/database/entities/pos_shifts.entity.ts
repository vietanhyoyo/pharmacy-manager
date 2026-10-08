// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'pos_shifts' })
export class PosShifts {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'branch_id', type: 'char', length: 36 })
  branchId!: string;

  @Column({ name: 'pos_device_id', type: 'char', length: 36 })
  posDeviceId!: string;

  @Column({ name: 'opened_by', type: 'char', length: 36 })
  openedBy!: string;

  @Column({ name: 'opened_at', type: 'datetime', precision: 6 })
  openedAt!: Date;

  @Column({ name: 'closed_at', type: 'datetime', precision: 6, nullable: true })
  closedAt!: Date | null;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'OPEN' })
  status!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
