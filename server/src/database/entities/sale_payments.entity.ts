// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.
// Migrations own the physical schema; synchronize is disabled.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sale_payments' })
export class SalePayments {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'sale_id', type: 'char', length: 36 })
  saleId!: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 32 })
  paymentMethod!: string;

  @Column({ name: 'amount', type: 'decimal', precision: 19, scale: 4 })
  amount!: string;

  @Column({ name: 'provider', type: 'varchar', length: 128, nullable: true })
  provider!: string | null;

  @Column({ name: 'transaction_ref', type: 'varchar', length: 255, nullable: true })
  transactionRef!: string | null;

  @Column({ name: 'paid_at', type: 'datetime', precision: 6 })
  paidAt!: Date;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;

}
