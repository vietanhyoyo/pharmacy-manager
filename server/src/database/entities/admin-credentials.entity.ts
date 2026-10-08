import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'admin_credentials' })
export class AdminCredentials {
  @PrimaryColumn({ name: 'user_id', type: 'char', length: 36 })
  userId!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;
}
