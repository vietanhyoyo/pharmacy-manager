import { Column, Entity, PrimaryColumn } from 'typeorm';

/** One rule for one product, optionally limited to a sale unit. */
@Entity({ name: 'promotion_products' })
export class PromotionProducts {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'organization_id', type: 'char', length: 36 })
  organizationId!: string;

  @Column({ name: 'promotion_id', type: 'char', length: 36 })
  promotionId!: string;

  @Column({ name: 'promotion_type', type: 'varchar', length: 32 })
  promotionType!: 'PERCENT' | 'FIXED' | 'BUY_X_GET_Y';

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'product_unit_id', type: 'char', length: 36, nullable: true })
  productUnitId!: string | null;

  @Column({ name: 'minimum_quantity', type: 'decimal', precision: 20, scale: 6, default: 1 })
  minimumQuantity!: string;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 9, scale: 4, nullable: true })
  discountPercent!: string | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 19, scale: 4, nullable: true })
  discountAmount!: string | null;

  @Column({ name: 'buy_quantity', type: 'decimal', precision: 20, scale: 6, nullable: true })
  buyQuantity!: string | null;

  @Column({ name: 'get_quantity', type: 'decimal', precision: 20, scale: 6, nullable: true })
  getQuantity!: string | null;

  @Column({ name: 'gift_product_id', type: 'char', length: 36, nullable: true })
  giftProductId!: string | null;

  @Column({ name: 'gift_product_unit_id', type: 'char', length: 36, nullable: true })
  giftProductUnitId!: string | null;

  @Column({
    name: 'product_unit_scope_key',
    type: 'char',
    length: 36,
    asExpression: "coalesce(`product_unit_id`, '00000000-0000-0000-0000-000000000000')",
    generatedType: 'STORED',
    insert: false,
    update: false,
  })
  productUnitScopeKey!: string;

  @Column({ name: 'created_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;
}
