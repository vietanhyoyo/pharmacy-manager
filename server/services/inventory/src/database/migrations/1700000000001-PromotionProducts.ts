import { MigrationInterface, QueryRunner } from 'typeorm';

export class PromotionProducts1700000000001 implements MigrationInterface {
  name = 'PromotionProducts1700000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Composite candidate keys let FKs reject cross-tenant and wrong-unit rules.
    await queryRunner.query('ALTER TABLE `promotions` ADD CONSTRAINT `uq_promotions_org_id_type` UNIQUE (`organization_id`, `id`, `promotion_type`)');
    await queryRunner.query('ALTER TABLE `products` ADD CONSTRAINT `uq_products_org_id` UNIQUE (`organization_id`, `id`)');
    await queryRunner.query('ALTER TABLE `product_units` ADD CONSTRAINT `uq_product_units_product_id` UNIQUE (`product_id`, `id`)');

    await queryRunner.query(`
      CREATE TABLE promotion_products (
        id CHAR(36) NOT NULL,
        organization_id CHAR(36) NOT NULL,
        promotion_id CHAR(36) NOT NULL,
        promotion_type VARCHAR(32) NOT NULL,
        product_id CHAR(36) NOT NULL,
        product_unit_id CHAR(36) NULL,
        minimum_quantity DECIMAL(20,6) NOT NULL DEFAULT 1,
        discount_percent DECIMAL(9,4) NULL,
        discount_amount DECIMAL(19,4) NULL,
        buy_quantity DECIMAL(20,6) NULL,
        get_quantity DECIMAL(20,6) NULL,
        gift_product_id CHAR(36) NULL,
        gift_product_unit_id CHAR(36) NULL,
        product_unit_scope_key CHAR(36) GENERATED ALWAYS AS
          (coalesce(product_unit_id, '00000000-0000-0000-0000-000000000000')) STORED,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        CONSTRAINT uq_promotion_products_scope UNIQUE (promotion_id, product_id, product_unit_scope_key),
        CONSTRAINT ck_promotion_products_min_qty CHECK (minimum_quantity > 0),
        CONSTRAINT ck_promotion_products_percent CHECK (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent <= 100)),
        CONSTRAINT ck_promotion_products_amount CHECK (discount_amount IS NULL OR discount_amount > 0),
        CONSTRAINT ck_promotion_products_buy_qty CHECK (buy_quantity IS NULL OR buy_quantity > 0),
        CONSTRAINT ck_promotion_products_get_qty CHECK (get_quantity IS NULL OR get_quantity > 0),
        CONSTRAINT ck_promotion_products_gift_unit CHECK (gift_product_unit_id IS NULL OR gift_product_id IS NOT NULL),
        CONSTRAINT ck_promotion_products_rule CHECK (
          (promotion_type = 'PERCENT' AND discount_percent IS NOT NULL AND discount_amount IS NULL
            AND buy_quantity IS NULL AND get_quantity IS NULL
            AND gift_product_id IS NULL AND gift_product_unit_id IS NULL)
          OR (promotion_type = 'FIXED' AND discount_amount IS NOT NULL AND discount_percent IS NULL
            AND buy_quantity IS NULL AND get_quantity IS NULL
            AND gift_product_id IS NULL AND gift_product_unit_id IS NULL)
          OR (promotion_type = 'BUY_X_GET_Y' AND product_unit_id IS NOT NULL
            AND buy_quantity IS NOT NULL AND get_quantity IS NOT NULL
            AND discount_percent IS NULL AND discount_amount IS NULL
            AND (gift_product_id IS NULL OR gift_product_unit_id IS NOT NULL))
        )
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query('CREATE INDEX `idx_promotion_products_product` ON `promotion_products` (`organization_id`, `product_id`, `promotion_id`)');
    await queryRunner.query('CREATE INDEX `idx_promotion_products_gift` ON `promotion_products` (`organization_id`, `gift_product_id`)');

    await queryRunner.query('ALTER TABLE `promotion_products` ADD CONSTRAINT `fk_pp_promotion` FOREIGN KEY (`organization_id`, `promotion_id`, `promotion_type`) REFERENCES `promotions` (`organization_id`, `id`, `promotion_type`) ON DELETE RESTRICT');
    await queryRunner.query('ALTER TABLE `promotion_products` ADD CONSTRAINT `fk_pp_product` FOREIGN KEY (`organization_id`, `product_id`) REFERENCES `products` (`organization_id`, `id`) ON DELETE RESTRICT');
    await queryRunner.query('ALTER TABLE `promotion_products` ADD CONSTRAINT `fk_pp_product_unit` FOREIGN KEY (`product_id`, `product_unit_id`) REFERENCES `product_units` (`product_id`, `id`) ON DELETE RESTRICT');
    await queryRunner.query('ALTER TABLE `promotion_products` ADD CONSTRAINT `fk_pp_gift_product` FOREIGN KEY (`organization_id`, `gift_product_id`) REFERENCES `products` (`organization_id`, `id`) ON DELETE RESTRICT');
    await queryRunner.query('ALTER TABLE `promotion_products` ADD CONSTRAINT `fk_pp_gift_unit` FOREIGN KEY (`gift_product_id`, `gift_product_unit_id`) REFERENCES `product_units` (`product_id`, `id`) ON DELETE RESTRICT');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `promotion_products`');
    await queryRunner.query('ALTER TABLE `product_units` DROP INDEX `uq_product_units_product_id`');
    await queryRunner.query('ALTER TABLE `products` DROP INDEX `uq_products_org_id`');
    await queryRunner.query('ALTER TABLE `promotions` DROP INDEX `uq_promotions_org_id_type`');
  }
}
