// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_roles' })
export class UserRoles {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ name: 'role_id', type: 'char', length: 36 })
  roleId!: string;

}
