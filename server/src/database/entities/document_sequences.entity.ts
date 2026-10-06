// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'document_sequences' })
export class DocumentSequences {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'branch_id', type: 'char', length: 36, nullable: true })
  branchId!: string | null;

  @Column({ name: 'doc_type', type: 'varchar', length: 32 })
  docType!: string;

  @Column({ name: 'prefix', type: 'varchar', length: 32 })
  prefix!: string;

  @Column({ name: 'period_key', type: 'varchar', length: 16 })
  periodKey!: string;

  @Column({ name: 'current_no', type: 'bigint', unsigned: true, default: 0 })
  currentNo!: string;

  @Column({ name: 'version', type: 'bigint', unsigned: true, default: 0 })
  version!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

  @Column({ name: 'branch_scope_key', type: 'char', length: 36, asExpression: "coalesce(`branch_id`, '00000000-0000-0000-0000-000000000000')", generatedType: 'STORED', insert: false, update: false })
  branchScopeKey!: string;

}
