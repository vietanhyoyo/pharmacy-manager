"""Generate the additive online-order schema migration and TypeORM entities.

Run from repository root:
  python3 server/scripts/generate-online-schema.py
  python3 server/scripts/generate-schema.py  # refresh entity barrel exports

The generated NestJS schema files live under server/services/inventory/src/database.

The 0002 migration records the original deployed table names. Current entity
names follow the 0003 rename migration; preserve both migration histories.
"""

from dataclasses import dataclass, field
from pathlib import Path
import json
import re


ROOT = Path(__file__).resolve().parents[2]
DB_DIR = ROOT / "server/services/inventory/src/database"
ENTITY_DIR = DB_DIR / "entities"
MIGRATION = DB_DIR / "migrations/1700000000002-OnlineOrders.ts"
RENAME_MIGRATION = DB_DIR / "migrations/1700000000003-RenameOnlineTables.ts"

# The 0002 migration is immutable history; 0003 removes these table prefixes.
RENAMED_TABLES = {
    "online_product_listings": "product_listings",
    "online_carts": "carts",
    "online_cart_items": "cart_items",
    "online_orders": "orders",
    "online_order_lines": "order_lines",
    "online_order_discounts": "order_discounts",
    "online_order_prescriptions": "order_prescriptions",
    "online_payment_attempts": "payment_attempts",
    "online_shipments": "shipments",
    "online_order_events": "order_events",
}


@dataclass
class Column:
    name: str
    sql_type: str
    nullable: bool = False
    default: str | int | None = None
    generated: str | None = None


@dataclass
class Table:
    name: str
    columns: list[Column]
    uniques: list[tuple[str, str]] = field(default_factory=list)
    checks: list[tuple[str, str]] = field(default_factory=list)
    indexes: list[tuple[str, str]] = field(default_factory=list)


def c(name: str, sql_type: str, nullable: bool = False, default: str | int | None = None, generated: str | None = None) -> Column:
    return Column(name, sql_type, nullable, default, generated)


ORDER_STATUSES = "'PLACED', 'AWAITING_REVIEW', 'CONFIRMED', 'RESERVED', 'PROCESSING', 'READY_FOR_PICKUP', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REJECTED'"

TABLES = [
    Table("customer_accounts", [
        c("customer_id", "CHAR(36)"), c("auth_provider", "VARCHAR(32)"),
        c("provider_subject", "VARCHAR(191)"), c("email", "VARCHAR(255)", True),
        c("email_verified_at", "DATETIME(6)", True), c("phone_verified_at", "DATETIME(6)", True),
        c("status", "VARCHAR(32)", default="ACTIVE"),
    ],
        uniques=[("uq_customer_accounts_identity", "organization_id, auth_provider, provider_subject"),
                 ("uq_customer_accounts_customer_provider", "organization_id, customer_id, auth_provider")],
        checks=[("ck_customer_accounts_status", "status IN ('ACTIVE', 'LOCKED')")],
        indexes=[("idx_customer_accounts_customer", "organization_id, customer_id")]),

    Table("customer_addresses", [
        c("customer_id", "CHAR(36)"), c("label", "VARCHAR(64)", True),
        c("recipient_name", "VARCHAR(255)"), c("recipient_phone", "VARCHAR(32)"),
        c("address_line1", "VARCHAR(500)"), c("address_line2", "VARCHAR(500)", True),
        c("ward", "VARCHAR(128)", True), c("district", "VARCHAR(128)", True),
        c("province", "VARCHAR(128)"), c("postal_code", "VARCHAR(32)", True),
        c("country_code", "CHAR(2)", default="VN"), c("is_default", "TINYINT(1)", default=0),
        c("default_customer_key", "CHAR(36)", True,
          generated="CASE WHEN `is_default` = 1 THEN `customer_id` ELSE NULL END"),
    ],
        uniques=[("uq_customer_addresses_default", "organization_id, default_customer_key")],
        checks=[("ck_customer_addresses_default", "is_default IN (0, 1)")],
        indexes=[("idx_customer_addresses_customer", "organization_id, customer_id")]),

    Table("online_product_listings", [
        c("product_id", "CHAR(36)"), c("slug", "VARCHAR(191)"),
        c("title", "VARCHAR(255)"), c("description", "TEXT", True),
        c("image_storage_key", "VARCHAR(512)", True),
        c("status", "VARCHAR(32)", default="DRAFT"), c("published_at", "DATETIME(6)", True),
    ],
        uniques=[("uq_online_listings_product", "organization_id, product_id"),
                 ("uq_online_listings_slug", "organization_id, slug")],
        checks=[("ck_online_listings_status", "status IN ('DRAFT', 'PUBLISHED', 'HIDDEN')")],
        indexes=[("idx_online_listings_status", "organization_id, status, published_at")]),

    Table("online_carts", [
        c("customer_id", "CHAR(36)"), c("branch_id", "CHAR(36)", True),
        c("status", "VARCHAR(32)", default="ACTIVE"),
        c("expires_at", "DATETIME(6)", True), c("version", "BIGINT UNSIGNED", default=0),
        c("active_customer_key", "CHAR(36)", True,
          generated="CASE WHEN `status` = 'ACTIVE' THEN `customer_id` ELSE NULL END"),
    ],
        uniques=[("uq_online_carts_org_id", "organization_id, id"),
                 ("uq_online_carts_customer_id", "organization_id, customer_id, id"),
                 ("uq_online_carts_active_customer", "organization_id, active_customer_key")],
        checks=[("ck_online_carts_status", "status IN ('ACTIVE', 'CHECKED_OUT', 'ABANDONED')")],
        indexes=[("idx_online_carts_expiry", "status, expires_at")]),

    Table("online_cart_items", [
        c("cart_id", "CHAR(36)"), c("product_id", "CHAR(36)"),
        c("product_unit_id", "CHAR(36)"), c("quantity", "DECIMAL(20,6)"),
    ],
        uniques=[("uq_online_cart_items_unit", "cart_id, product_unit_id")],
        checks=[("ck_online_cart_items_qty", "quantity > 0")],
        indexes=[("idx_online_cart_items_cart", "organization_id, cart_id")]),

    Table("online_orders", [
        c("customer_id", "CHAR(36)"), c("branch_id", "CHAR(36)"),
        c("warehouse_id", "CHAR(36)"), c("cart_id", "CHAR(36)", True),
        c("order_number", "VARCHAR(64)"), c("idempotency_key", "VARCHAR(128)"),
        c("status", "VARCHAR(32)", default="PLACED"),
        c("payment_status", "VARCHAR(32)", default="UNPAID"),
        c("review_status", "VARCHAR(32)", default="NOT_REQUIRED"),
        c("reviewed_by", "CHAR(36)", True), c("reviewed_at", "DATETIME(6)", True),
        c("fulfillment_method", "VARCHAR(32)"), c("currency", "CHAR(3)", default="VND"),
        c("subtotal", "DECIMAL(19,4)", default=0),
        c("discount_amount", "DECIMAL(19,4)", default=0),
        c("tax_amount", "DECIMAL(19,4)", default=0),
        c("shipping_fee", "DECIMAL(19,4)", default=0),
        c("total_amount", "DECIMAL(19,4)", default=0),
        c("recipient_name", "VARCHAR(255)", True), c("recipient_phone", "VARCHAR(32)", True),
        c("shipping_address_line1", "VARCHAR(500)", True),
        c("shipping_address_line2", "VARCHAR(500)", True),
        c("shipping_ward", "VARCHAR(128)", True),
        c("shipping_district", "VARCHAR(128)", True),
        c("shipping_province", "VARCHAR(128)", True),
        c("shipping_postal_code", "VARCHAR(32)", True),
        c("shipping_country_code", "CHAR(2)", True),
        c("sale_id", "CHAR(36)", True),
        c("placed_at", "DATETIME(6)"), c("confirmed_at", "DATETIME(6)", True),
        c("completed_at", "DATETIME(6)", True), c("cancelled_at", "DATETIME(6)", True),
    ],
        uniques=[("uq_online_orders_org_id", "organization_id, id"),
                 ("uq_online_orders_number", "organization_id, order_number"),
                 ("uq_online_orders_idempotency", "organization_id, idempotency_key"),
                 ("uq_online_orders_sale", "organization_id, sale_id")],
        checks=[
            ("ck_online_orders_status", f"status IN ({ORDER_STATUSES})"),
            ("ck_online_orders_payment", "payment_status IN ('UNPAID', 'PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED')"),
            ("ck_online_orders_review", "review_status IN ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED')"),
            ("ck_online_orders_fulfillment", "fulfillment_method IN ('DELIVERY', 'PICKUP')"),
            ("ck_online_orders_money", "subtotal >= 0 AND discount_amount >= 0 AND tax_amount >= 0 AND shipping_fee >= 0 AND total_amount >= 0"),
            ("ck_online_orders_delivery_address", "fulfillment_method <> 'DELIVERY' OR (recipient_name IS NOT NULL AND recipient_phone IS NOT NULL AND shipping_address_line1 IS NOT NULL AND shipping_province IS NOT NULL)"),
        ],
        indexes=[("idx_online_orders_customer", "organization_id, customer_id, placed_at"),
                 ("idx_online_orders_branch_status", "organization_id, branch_id, status, placed_at"),
                 ("idx_online_orders_warehouse", "organization_id, warehouse_id, status")]),

    Table("online_order_lines", [
        c("order_id", "CHAR(36)"), c("product_id", "CHAR(36)"),
        c("product_unit_id", "CHAR(36)"), c("product_sku_snapshot", "VARCHAR(64)"),
        c("product_name_snapshot", "VARCHAR(255)"), c("unit_code_snapshot", "VARCHAR(32)"),
        c("quantity", "DECIMAL(20,6)"), c("conversion_factor", "DECIMAL(20,6)"),
        c("base_quantity", "DECIMAL(20,6)"), c("unit_price", "DECIMAL(19,4)"),
        c("vat_rate", "DECIMAL(9,4)", default=0),
        c("discount_amount", "DECIMAL(19,4)", default=0),
        c("tax_amount", "DECIMAL(19,4)", default=0),
        c("line_total", "DECIMAL(19,4)"),
        c("prescription_required", "TINYINT(1)", default=0),
    ],
        uniques=[("uq_online_order_lines_order_id", "order_id, id")],
        checks=[("ck_online_order_lines_qty", "quantity > 0 AND conversion_factor > 0 AND base_quantity > 0"),
                ("ck_online_order_lines_money", "unit_price >= 0 AND vat_rate >= 0 AND discount_amount >= 0 AND tax_amount >= 0 AND line_total >= 0"),
                ("ck_online_order_lines_rx", "prescription_required IN (0, 1)")],
        indexes=[("idx_online_order_lines_order", "organization_id, order_id"),
                 ("idx_online_order_lines_product", "organization_id, product_id")]),

    Table("online_order_discounts", [
        c("order_id", "CHAR(36)"), c("order_line_id", "CHAR(36)", True),
        c("promotion_id", "CHAR(36)", True), c("promotion_product_id", "CHAR(36)", True),
        c("code_snapshot", "VARCHAR(64)"), c("amount", "DECIMAL(19,4)"),
    ],
        checks=[("ck_online_order_discounts_amount", "amount > 0"),
                ("ck_online_order_discounts_rule", "promotion_product_id IS NULL OR promotion_id IS NOT NULL")],
        indexes=[("idx_online_order_discounts_order", "organization_id, order_id"),
                 ("idx_online_order_discounts_promotion", "organization_id, promotion_id")]),

    Table("online_order_prescriptions", [
        c("order_id", "CHAR(36)"), c("order_line_id", "CHAR(36)", True),
        c("file_storage_key", "VARCHAR(512)"), c("file_name", "VARCHAR(255)"),
        c("mime_type", "VARCHAR(128)"), c("status", "VARCHAR(32)", default="PENDING"),
        c("reviewed_by", "CHAR(36)", True), c("reviewed_at", "DATETIME(6)", True),
        c("rejection_reason", "VARCHAR(1000)", True),
    ],
        uniques=[("uq_online_prescriptions_file", "organization_id, file_storage_key")],
        checks=[("ck_online_prescriptions_status", "status IN ('PENDING', 'APPROVED', 'REJECTED')")],
        indexes=[("idx_online_prescriptions_order", "organization_id, order_id, status")]),

    Table("online_payment_attempts", [
        c("order_id", "CHAR(36)"), c("provider", "VARCHAR(64)"),
        c("payment_method", "VARCHAR(32)"),
        c("provider_request_id", "VARCHAR(191)", True),
        c("provider_transaction_id", "VARCHAR(191)", True),
        c("idempotency_key", "VARCHAR(128)"),
        c("amount", "DECIMAL(19,4)"), c("refunded_amount", "DECIMAL(19,4)", default=0),
        c("currency", "CHAR(3)", default="VND"),
        c("status", "VARCHAR(32)", default="INITIATED"),
        c("requested_at", "DATETIME(6)", default="CURRENT_TIMESTAMP(6)"),
        c("finalized_at", "DATETIME(6)", True),
    ],
        uniques=[("uq_online_payments_idempotency", "organization_id, idempotency_key"),
                 ("uq_online_payments_provider_request", "organization_id, provider, provider_request_id"),
                 ("uq_online_payments_provider_tx", "organization_id, provider, provider_transaction_id")],
        checks=[("ck_online_payments_amount", "amount > 0 AND refunded_amount >= 0 AND refunded_amount <= amount"),
                ("ck_online_payments_method", "payment_method IN ('CARD', 'QR', 'BANK_TRANSFER', 'EWALLET', 'CASH_ON_DELIVERY')"),
                ("ck_online_payments_status", "status IN ('INITIATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED')")],
        indexes=[("idx_online_payments_order", "organization_id, order_id, requested_at")]),

    Table("online_shipments", [
        c("order_id", "CHAR(36)"), c("carrier", "VARCHAR(64)", True),
        c("tracking_number", "VARCHAR(191)", True),
        c("status", "VARCHAR(32)", default="PENDING"),
        c("shipped_at", "DATETIME(6)", True), c("delivered_at", "DATETIME(6)", True),
        c("delivery_note", "VARCHAR(1000)", True),
    ],
        uniques=[("uq_online_shipments_order", "organization_id, order_id"),
                 ("uq_online_shipments_tracking", "organization_id, carrier, tracking_number")],
        checks=[("ck_online_shipments_status", "status IN ('PENDING', 'PACKED', 'HANDED_OVER', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED')")],
        indexes=[("idx_online_shipments_order", "organization_id, order_id, status")]),

    Table("online_order_events", [
        c("order_id", "CHAR(36)"), c("from_status", "VARCHAR(32)", True),
        c("to_status", "VARCHAR(32)"), c("actor_type", "VARCHAR(32)"),
        c("actor_user_id", "CHAR(36)", True), c("actor_customer_id", "CHAR(36)", True),
        c("note", "VARCHAR(1000)", True),
    ],
        checks=[("ck_online_order_events_from", f"from_status IS NULL OR from_status IN ({ORDER_STATUSES})"),
                ("ck_online_order_events_to", f"to_status IN ({ORDER_STATUSES})"),
                ("ck_online_order_events_actor", "(actor_type = 'SYSTEM' AND actor_user_id IS NULL AND actor_customer_id IS NULL) OR (actor_type = 'STAFF' AND actor_user_id IS NOT NULL AND actor_customer_id IS NULL) OR (actor_type = 'CUSTOMER' AND actor_customer_id IS NOT NULL AND actor_user_id IS NULL)")],
        indexes=[("idx_online_order_events_order", "organization_id, order_id, created_at")]),
]

EXISTING_CANDIDATE_KEYS = [
    ("customers", "uq_customers_org_id", "organization_id, id"),
    ("branches", "uq_branches_org_id", "organization_id, id"),
    ("warehouses", "uq_warehouses_org_id", "organization_id, id"),
    ("sales", "uq_sales_org_id", "organization_id, id"),
    ("users", "uq_users_org_id", "organization_id, id"),
    ("promotions", "uq_promotions_org_id", "organization_id, id"),
    ("promotion_products", "uq_promotion_products_org_id", "organization_id, id"),
    ("promotion_products", "uq_promotion_products_rule_promotion", "organization_id, id, promotion_id"),
]

# Every online table has organization_id; composite FKs keep tenant ownership in SQL.
FOREIGN_KEYS = [
    ("customer_accounts", "customer", "organization_id, customer_id", "customers", "organization_id, id"),
    ("customer_addresses", "customer", "organization_id, customer_id", "customers", "organization_id, id"),
    ("online_product_listings", "product", "organization_id, product_id", "products", "organization_id, id"),
    ("online_carts", "customer", "organization_id, customer_id", "customers", "organization_id, id"),
    ("online_carts", "branch", "organization_id, branch_id", "branches", "organization_id, id"),
    ("online_cart_items", "cart", "organization_id, cart_id", "online_carts", "organization_id, id"),
    ("online_cart_items", "product", "organization_id, product_id", "products", "organization_id, id"),
    ("online_cart_items", "unit", "product_id, product_unit_id", "product_units", "product_id, id"),
    ("online_orders", "customer", "organization_id, customer_id", "customers", "organization_id, id"),
    ("online_orders", "branch", "organization_id, branch_id", "branches", "organization_id, id"),
    ("online_orders", "warehouse", "organization_id, warehouse_id", "warehouses", "organization_id, id"),
    ("online_orders", "cart", "organization_id, customer_id, cart_id", "online_carts", "organization_id, customer_id, id"),
    ("online_orders", "sale", "organization_id, sale_id", "sales", "organization_id, id"),
    ("online_orders", "reviewer", "organization_id, reviewed_by", "users", "organization_id, id"),
    ("online_order_lines", "order", "organization_id, order_id", "online_orders", "organization_id, id"),
    ("online_order_lines", "product", "organization_id, product_id", "products", "organization_id, id"),
    ("online_order_lines", "unit", "product_id, product_unit_id", "product_units", "product_id, id"),
    ("online_order_discounts", "order", "organization_id, order_id", "online_orders", "organization_id, id"),
    ("online_order_discounts", "line", "order_id, order_line_id", "online_order_lines", "order_id, id"),
    ("online_order_discounts", "promotion", "organization_id, promotion_id", "promotions", "organization_id, id"),
    ("online_order_discounts", "rule", "organization_id, promotion_product_id, promotion_id", "promotion_products", "organization_id, id, promotion_id"),
    ("online_order_prescriptions", "order", "organization_id, order_id", "online_orders", "organization_id, id"),
    ("online_order_prescriptions", "line", "order_id, order_line_id", "online_order_lines", "order_id, id"),
    ("online_order_prescriptions", "reviewer", "organization_id, reviewed_by", "users", "organization_id, id"),
    ("online_payment_attempts", "order", "organization_id, order_id", "online_orders", "organization_id, id"),
    ("online_shipments", "order", "organization_id, order_id", "online_orders", "organization_id, id"),
    ("online_order_events", "order", "organization_id, order_id", "online_orders", "organization_id, id"),
    ("online_order_events", "staff", "organization_id, actor_user_id", "users", "organization_id, id"),
    ("online_order_events", "customer", "organization_id, actor_customer_id", "customers", "organization_id, id"),
]


def ident(name: str) -> str:
    return "`" + name + "`"


def columns_sql(names: str) -> str:
    return ", ".join(ident(part.strip()) for part in names.split(","))


def class_name(table: str) -> str:
    return "".join(part.capitalize() for part in table.split("_"))


def property_name(name: str) -> str:
    first, *rest = name.split("_")
    return first + "".join(part.capitalize() for part in rest)


def column_sql(column: Column) -> str:
    result = f"{ident(column.name)} {column.sql_type}"
    if column.generated:
        return result + f" GENERATED ALWAYS AS ({column.generated}) STORED"
    result += " NULL" if column.nullable else " NOT NULL"
    if column.default == "CURRENT_TIMESTAMP(6)":
        result += " DEFAULT CURRENT_TIMESTAMP(6)"
    elif isinstance(column.default, str):
        result += " DEFAULT '" + column.default.replace("'", "''") + "'"
    elif column.default is not None:
        result += f" DEFAULT {column.default}"
    if column.name == "updated_at":
        result += " ON UPDATE CURRENT_TIMESTAMP(6)"
    return result


def ts_column(column: Column) -> list[str]:
    match = re.fullmatch(r"([A-Z]+)(?:\((\d+)(?:,(\d+))?\))?( UNSIGNED)?", column.sql_type)
    assert match, column.sql_type
    sql_type, width, scale, unsigned = match.groups()
    opts = [f"name: '{column.name}'", f"type: '{sql_type.lower()}'"]
    if sql_type in {"VARCHAR", "CHAR"}:
        opts.append(f"length: {width}")
    if sql_type == "DECIMAL":
        opts.extend([f"precision: {width}", f"scale: {scale}"])
    if sql_type == "DATETIME":
        opts.append(f"precision: {width}")
    if unsigned:
        opts.append("unsigned: true")
    if column.nullable:
        opts.append("nullable: true")
    if column.generated:
        opts.extend([f"asExpression: {json.dumps(column.generated)}", "generatedType: 'STORED'", "insert: false", "update: false"])
    elif column.default == "CURRENT_TIMESTAMP(6)":
        opts.append("default: () => 'CURRENT_TIMESTAMP(6)'")
    elif isinstance(column.default, str):
        opts.append(f"default: {json.dumps(column.default)}")
    elif column.default is not None:
        opts.append(f"default: {column.default}")
    if column.name == "updated_at":
        opts.append("onUpdate: 'CURRENT_TIMESTAMP(6)'")
    ts_type = "boolean" if sql_type == "TINYINT" else "Date" if sql_type == "DATETIME" else "string"
    return [f"  @Column({{ {', '.join(opts)} }})",
            f"  {property_name(column.name)}!: {ts_type}{' | null' if column.nullable else ''};", ""]


BASE_COLUMNS = [c("id", "CHAR(36)"), c("organization_id", "CHAR(36)")]
AUDIT_COLUMNS = [c("created_at", "DATETIME(6)", default="CURRENT_TIMESTAMP(6)"),
                 c("updated_at", "DATETIME(6)", default="CURRENT_TIMESTAMP(6)")]

current_entity_files = set()
for table in TABLES:
    entity_table = RENAMED_TABLES.get(table.name, table.name)
    current_entity_files.add(f"{entity_table}.entity.ts")
    lines = ["// Generated by scripts/generate-online-schema.py.",
             "import { Column, Entity } from 'typeorm';",
             "import { OnlineBaseEntity } from './online-base.entity';", "",
             f"@Entity({{ name: '{entity_table}' }})",
             f"export class {class_name(entity_table)} extends OnlineBaseEntity {{"]
    for col in table.columns:
        lines += ts_column(col)
    lines += ["}", ""]
    (ENTITY_DIR / f"{entity_table}.entity.ts").write_text("\n".join(lines))

for stale in ENTITY_DIR.glob("*.entity.ts"):
    if stale.name not in current_entity_files and stale.read_text().startswith("// Generated by scripts/generate-online-schema.py."):
        stale.unlink()

statements = []
for table, name, columns in EXISTING_CANDIDATE_KEYS:
    statements.append(f"ALTER TABLE {ident(table)} ADD CONSTRAINT {ident(name)} UNIQUE ({columns_sql(columns)})")

for table in TABLES:
    all_columns = BASE_COLUMNS + table.columns + AUDIT_COLUMNS
    definitions = ["  " + column_sql(column) for column in all_columns]
    definitions.append("  PRIMARY KEY (`id`)")
    for name, columns in table.uniques:
        definitions.append(f"  CONSTRAINT {ident(name)} UNIQUE ({columns_sql(columns)})")
    for name, expression in table.checks:
        definitions.append(f"  CONSTRAINT {ident(name)} CHECK ({expression})")
    statements.append(f"CREATE TABLE {ident(table.name)} (\n" + ",\n".join(definitions) + "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci")
    for name, columns in table.indexes:
        statements.append(f"CREATE INDEX {ident(name)} ON {ident(table.name)} ({columns_sql(columns)})")

for table, label, columns, ref_table, ref_columns in FOREIGN_KEYS:
    constraint = f"fk_{table}_{label}"
    assert len(constraint) <= 64, constraint
    statements.append(f"ALTER TABLE {ident(table)} ADD CONSTRAINT {ident(constraint)} FOREIGN KEY ({columns_sql(columns)}) REFERENCES {ident(ref_table)} ({columns_sql(ref_columns)}) ON DELETE RESTRICT")

migration = [
    "// Generated by scripts/generate-online-schema.py. Additive to the deployed V1 schema.",
    "import { MigrationInterface, QueryRunner } from 'typeorm';", "",
    "export class OnlineOrders1700000000002 implements MigrationInterface {",
    "  name = 'OnlineOrders1700000000002';", "",
    "  async up(queryRunner: QueryRunner): Promise<void> {",
]
for statement in statements:
    migration.append("    await queryRunner.query(" + json.dumps(statement, ensure_ascii=False) + ");")
migration += ["  }", "", "  async down(queryRunner: QueryRunner): Promise<void> {"]
for table in reversed(TABLES):
    migration.append(f"    await queryRunner.query('DROP TABLE {ident(table.name)}');")
for table, name, _ in reversed(EXISTING_CANDIDATE_KEYS):
    migration.append(f"    await queryRunner.query('ALTER TABLE {ident(table)} DROP INDEX {ident(name)}');")
migration += ["  }", "}", ""]
MIGRATION.write_text("\n".join(migration))
rename_up = "RENAME TABLE " + ", ".join(
    f"{ident(previous)} TO {ident(current)}" for previous, current in RENAMED_TABLES.items()
)
rename_down = "RENAME TABLE " + ", ".join(
    f"{ident(current)} TO {ident(previous)}" for previous, current in RENAMED_TABLES.items()
)
RENAME_MIGRATION.write_text("\n".join([
    "// Rename only: MySQL keeps rows, indexes, and foreign keys attached to each table.",
    "import { MigrationInterface, QueryRunner } from 'typeorm';", "",
    "export class RenameOnlineTables1700000000003 implements MigrationInterface {",
    "  name = 'RenameOnlineTables1700000000003';", "",
    "  async up(queryRunner: QueryRunner): Promise<void> {",
    "    await queryRunner.query(" + json.dumps(rename_up) + ");",
    "  }", "",
    "  async down(queryRunner: QueryRunner): Promise<void> {",
    "    await queryRunner.query(" + json.dumps(rename_down) + ");",
    "  }", "}", "",
]))
print(f"Generated {len(TABLES)} online entities and {len(statements)} migration statements")
