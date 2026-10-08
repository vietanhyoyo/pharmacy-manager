// Rename only: MySQL keeps rows, indexes, and foreign keys attached to each table.
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameOnlineTables1700000000003 implements MigrationInterface {
  name = 'RenameOnlineTables1700000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("RENAME TABLE `online_product_listings` TO `product_listings`, `online_carts` TO `carts`, `online_cart_items` TO `cart_items`, `online_orders` TO `orders`, `online_order_lines` TO `order_lines`, `online_order_discounts` TO `order_discounts`, `online_order_prescriptions` TO `order_prescriptions`, `online_payment_attempts` TO `payment_attempts`, `online_shipments` TO `shipments`, `online_order_events` TO `order_events`");
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("RENAME TABLE `product_listings` TO `online_product_listings`, `carts` TO `online_carts`, `cart_items` TO `online_cart_items`, `orders` TO `online_orders`, `order_lines` TO `online_order_lines`, `order_discounts` TO `online_order_discounts`, `order_prescriptions` TO `online_order_prescriptions`, `payment_attempts` TO `online_payment_attempts`, `shipments` TO `online_shipments`, `order_events` TO `online_order_events`");
  }
}
