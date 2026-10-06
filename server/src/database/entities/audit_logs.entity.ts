// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLogs {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'actor_user_id', type: 'char', length: 36, nullable: true })
  actorUserId!: string | null;

  @Column({ name: 'branch_id', type: 'char', length: 36, nullable: true })
  branchId!: string | null;

  @Column({ name: 'action', type: 'varchar', length: 128 })
  action!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 128 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'char', length: 36 })
  entityId!: string;

  @Column({ name: 'before_data', type: 'json', nullable: true })
  beforeData!: Record<string, unknown> | null;

  @Column({ name: 'after_data', type: 'json', nullable: true })
  afterData!: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'device_id', type: 'varchar', length: 128, nullable: true })
  deviceId!: string | null;

  @Column({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

}
