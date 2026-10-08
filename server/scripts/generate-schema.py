"""Generate the initial TypeORM mappings and MySQL migration from the V1 spec.

Run from the repository root: python3 server/scripts/generate-schema.py
The generated NestJS schema files live under server/services/inventory/src/database.
Review generated changes before applying them to an existing database.
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SPEC = (ROOT / "pharmacy_pos_inventory_mysql_spec.md").read_text()
SECTION = SPEC.split("# 5. Ma trận quan hệ chính")[0]
OUT = ROOT / "server/services/inventory/src/database"
(OUT / "migrations").mkdir(parents=True, exist_ok=True)

TABLES = re.findall(r"^### `([a-z_]+)`\n(.*?)(?=^### `|^## |\Z)", SECTION, re.M | re.S)
assert len(TABLES) == 47, f"Expected 47 tables, found {len(TABLES)}"

FK_EXCEPTIONS = {
    "actor_user_id": "users",
    "approved_by": "users",
    "base_unit_id": "units",
    "counted_by": "users",
    "created_by": "users",
    "device_id": "pos_devices",
    "from_branch_id": "branches",
    "from_warehouse_id": "warehouses",
    "location_id": "stock_locations",
    "lot_id": "inventory_lots",
    "opened_by": "users",
    "original_sale_id": "sales",
    "parent_id": "categories",
    "pos_device_id": "pos_devices",
    "received_by": "users",
    "reversal_of_id": "inventory_movements",
    "shift_id": "pos_shifts",
    "to_branch_id": "branches",
    "to_warehouse_id": "warehouses",
    "transfer_id": "stock_transfers",
}
FK_PLURALS = {
    "category": "categories",
    "company": "companies",
    "goods_receipt": "goods_receipts",
    "manufacturer": "manufacturers",
    "organization": "organizations",
    "permission": "permissions",
    "price_list": "price_lists",
    "product": "products",
    "product_unit": "product_units",
    "purchase_order": "purchase_orders",
    "role": "roles",
    "sale": "sales",
    "sale_line": "sale_lines",
    "sales_return": "sales_returns",
    "stock_adjustment": "stock_adjustments",
    "stock_count": "stock_counts",
    "supplier": "suppliers",
    "supplier_return": "supplier_returns",
    "unit": "units",
    "user": "users",
    "warehouse": "warehouses",
    "branch": "branches",
    "customer": "customers",
}
NO_FK = {"id", "entity_id", "source_id", "source_line_id"}
BRIDGES = {"user_roles", "role_permissions", "user_branch_access"}
NO_AUDIT_COLUMNS = BRIDGES | {"inventory_movements", "inventory_balances", "audit_logs"}

CHECK_VALUES = {
    ("organizations", "status"): "ACTIVE INACTIVE",
    ("branches", "status"): "ACTIVE INACTIVE",
    ("warehouses", "warehouse_type"): "SALE RESERVE RETURN QUARANTINE DAMAGED TRANSIT CENTRAL",
    ("users", "status"): "ACTIVE LOCKED INACTIVE",
    ("products", "product_type"): "MEDICINE SUPPLEMENT COSMETIC DEVICE OTHER",
    ("products", "prescription_type"): "RX OTC OTHER",
    ("inventory_lots", "status"): "ACTIVE BLOCKED QUARANTINED CLOSED",
    ("inventory_movements", "movement_type"): "PURCHASE_RECEIPT SUPPLIER_RETURN SALE SALE_RETURN TRANSFER_OUT TRANSFER_TRANSIT_IN TRANSFER_TRANSIT_OUT TRANSFER_IN STOCK_ADJUSTMENT COUNT_ADJUSTMENT DAMAGE EXPIRY REVERSAL INTERNAL_USE SAMPLE",
    ("inventory_reservations", "status"): "ACTIVE CONSUMED RELEASED EXPIRED",
    ("purchase_orders", "status"): "DRAFT APPROVED PARTIALLY_RECEIVED RECEIVED CANCELLED",
    ("goods_receipts", "status"): "DRAFT APPROVED POSTED CANCELLED",
    ("pos_shifts", "status"): "OPEN CLOSED",
    ("sales", "status"): "DRAFT COMPLETED VOIDED PARTIALLY_REFUNDED REFUNDED",
    ("sale_payments", "payment_method"): "CASH CARD QR BANK_TRANSFER EWALLET CUSTOMER_CREDIT",
    ("stock_transfers", "status"): "DRAFT APPROVED SHIPPED IN_TRANSIT PARTIALLY_RECEIVED RECEIVED CANCELLED",
    ("stock_counts", "status"): "DRAFT IN_PROGRESS COUNTED APPROVED POSTED CANCELLED",
    ("stock_adjustments", "status"): "DRAFT APPROVED POSTED CANCELLED",
    ("stock_adjustments", "reason_code"): "DAMAGED EXPIRED LOST FOUND COUNT_DIFFERENCE DATA_CORRECTION SAMPLE INTERNAL_USE OTHER",
    ("sales_returns", "status"): "DRAFT APPROVED POSTED CANCELLED",
    ("supplier_returns", "status"): "DRAFT APPROVED POSTED CANCELLED",
    ("promotions", "promotion_type"): "PERCENT FIXED BUY_X_GET_Y",
    ("promotions", "status"): "DRAFT ACTIVE INACTIVE ENDED",
}


def pascal(name: str) -> str:
    return "".join(word.capitalize() for word in name.split("_"))


def camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def sql_ident(name: str) -> str:
    return f"`{name}`"


def sql_default(raw: str) -> str:
    if raw in ("—", "AUTO_INCREMENT"):
        return ""
    if raw == "NULL":
        return " DEFAULT NULL"
    if re.fullmatch(r"\d+", raw):
        return f" DEFAULT {raw}"
    return " DEFAULT '" + raw.strip("'").replace("'", "''") + "'"


def ts_type(sql_type: str) -> str:
    if sql_type.startswith(("DECIMAL", "BIGINT")):
        return "string"
    if sql_type.startswith("TINYINT"):
        return "boolean"
    if sql_type.startswith("DATETIME"):
        return "Date"
    if sql_type == "DATE":
        return "string"
    if sql_type == "JSON":
        return "Record<string, unknown>"
    return "string"


def column_decorator(name: str, sql_type: str, nullable: bool, default: str, primary: bool) -> str:
    type_match = re.match(r"([A-Z]+)(?:\(([^)]+)\))?( UNSIGNED)?", sql_type)
    assert type_match, sql_type
    base, params, unsigned = type_match.groups()
    db_type = base.lower()
    options = [f"name: '{name}'", f"type: '{db_type}'"]
    if base in {"CHAR", "VARCHAR"}:
        options.append(f"length: {params}")
    if base == "DECIMAL":
        precision, scale = params.split(",")
        options.extend([f"precision: {precision}", f"scale: {scale}"])
    if base == "DATETIME":
        options.append(f"precision: {params}")
    if unsigned:
        options.append("unsigned: true")
    if nullable:
        options.append("nullable: true")
    if default not in ("—", "AUTO_INCREMENT", "NULL"):
        if re.fullmatch(r"\d+", default):
            options.append(f"default: {default}")
        else:
            options.append(f"default: '{default.strip(chr(39))}'")
    decorator = "PrimaryColumn" if primary else "Column"
    return f"@{decorator}({{ {', '.join(options)} }})"


parsed = []
table_names = {name for name, _ in TABLES}
for table, body in TABLES:
    columns = []
    for line in body.splitlines():
        match = re.match(r"^\| ([a-z_]+) \| ((?:CHAR|VARCHAR|DECIMAL|BIGINT|DATE|DATETIME|TINYINT|JSON)[^|]*) \| (NO|YES) \| ([^|]+) \|", line)
        if match:
            col, typ, null, default = [part.strip() for part in match.groups()]
            columns.append((col, typ, null == "YES", default))
    assert columns, table
    if table not in NO_AUDIT_COLUMNS and "id" in [c[0] for c in columns]:
        columns += [
            ("created_at", "DATETIME(6)", False, "CURRENT_TIMESTAMP(6)"),
            ("updated_at", "DATETIME(6)", False, "CURRENT_TIMESTAMP(6)"),
        ]
    constraints = body.split("**Ràng buộc:**", 1)[-1].split("**Index", 1)[0].split("**Quan hệ", 1)[0].split("**Ghi chú", 1)[0]
    uniques = [tuple(x.strip().strip("` ") for x in group.split(",")) for group in re.findall(r"UNIQUE \(([^)]+)\)", constraints)]
    checks = re.findall(r"CHECK \(([^)]+)\)", constraints)
    indexes = [(n, tuple(c.strip() for c in cols.split(","))) for n, cols in re.findall(r"`(idx_[a-z_]+)\(([^)]+)\)`", body)]
    fks = []
    for col, typ, _, _ in columns:
        if col in NO_FK or not typ.startswith("CHAR(36)"):
            continue
        if col in FK_EXCEPTIONS:
            ref = FK_EXCEPTIONS[col]
        elif col.endswith("_id"):
            ref = FK_PLURALS.get(col[:-3])
        else:
            ref = None
        if ref:
            assert ref in table_names, (table, col, ref)
            fks.append((col, ref))
    parsed.append((table, columns, uniques, checks, indexes, fks))

entities_dir = OUT / "entities"
entities_dir.mkdir(exist_ok=True)
entity_files = set()
for table, columns, _, _, _, _ in parsed:
    entity_files.add(f"{table}.entity.ts")
    entities = [
        "// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.",
        "// Migrations own the physical schema; synchronize is disabled.",
        "import { Column, Entity, PrimaryColumn } from 'typeorm';",
        "",
    ]
    entities += [f"@Entity({{ name: '{table}' }})", f"export class {pascal(table)} {{"]
    for col, typ, nullable, default in columns:
        if col == "ledger_seq":
            entities.append("  @Column({ name: 'ledger_seq', type: 'bigint', unsigned: true, unique: true, generated: 'increment' })")
            entities.append("  ledgerSeq!: string;")
            continue
        if col in {"created_at", "updated_at"} and default == "CURRENT_TIMESTAMP(6)":
            entities.append(f"  @Column({{ name: '{col}', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)'{', onUpdate: \'CURRENT_TIMESTAMP(6)\'' if col == 'updated_at' else ''} }})")
        else:
            is_primary = col == "id" or (table == "inventory_balances" and col in {"organization_id", "warehouse_id", "location_id", "product_id", "lot_id"})
            entities.append("  " + column_decorator(col, typ, nullable, default, is_primary))
        entities.append(f"  {camel(col)}!: {ts_type(typ)}{' | null' if nullable else ''};")
        entities.append("")
    if table == "document_sequences":
        entities += [
            "  @Column({ name: 'branch_scope_key', type: 'char', length: 36, asExpression: \"coalesce(`branch_id`, '00000000-0000-0000-0000-000000000000')\", generatedType: 'STORED', insert: false, update: false })",
            "  branchScopeKey!: string;",
            "",
        ]
    entities += ["}", ""]
    (entities_dir / f"{table}.entity.ts").write_text("\n".join(entities))

extensions = []
for extension_file in sorted(entities_dir.glob("*.entity.ts")):
    if extension_file.name in entity_files:
        continue
    match = re.search(r"^export class (\w+)", extension_file.read_text(), re.M)
    if match:
        extensions.append((extension_file.stem.removesuffix(".entity"), match.group(1)))

barrel = ["// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py."]
barrel += [f"import {{ {pascal(table)} }} from './{table}.entity';" for table, *_ in parsed]
barrel += [f"import {{ {class_name} }} from './{file_name}.entity';" for file_name, class_name in extensions]
barrel += [""]
barrel += [f"export {{ {pascal(table)} }} from './{table}.entity';" for table, *_ in parsed]
barrel += [f"export {{ {class_name} }} from './{file_name}.entity';" for file_name, class_name in extensions]
barrel += ["", "export const entities = ["]
barrel += [f"  {pascal(table)}," for table, *_ in parsed]
barrel += [f"  {class_name}," for _, class_name in extensions]
barrel += ["] as const;", ""]
(entities_dir / "index.ts").write_text("\n".join(barrel))
for stale in entities_dir.glob("*.entity.ts"):
    if stale.name not in entity_files and stale.read_text().startswith("// Generated from pharmacy_pos_inventory_mysql_spec.md"):
        stale.unlink()
legacy_file = OUT / "entities.ts"
if legacy_file.exists() and legacy_file.read_text().startswith("// Generated from pharmacy_pos_inventory_mysql_spec.md"):
    legacy_file.unlink()

queries = []
for table, columns, uniques, checks, indexes, fks in parsed:
    definitions = []
    for col, typ, nullable, default in columns:
        part = f"  {sql_ident(col)} {typ} {'NULL' if nullable else 'NOT NULL'}"
        if default == "AUTO_INCREMENT":
            part += " AUTO_INCREMENT"
        elif default == "CURRENT_TIMESTAMP(6)":
            part += " DEFAULT CURRENT_TIMESTAMP(6)"
            if col == "updated_at":
                part += " ON UPDATE CURRENT_TIMESTAMP(6)"
        else:
            part += sql_default(default)
        definitions.append(part)
    if table == "document_sequences":
        definitions.append("  `branch_scope_key` CHAR(36) GENERATED ALWAYS AS (coalesce(`branch_id`, '00000000-0000-0000-0000-000000000000')) STORED")
    if table == "inventory_balances":
        primary = "organization_id, warehouse_id, location_id, product_id, lot_id"
    else:
        primary = "id"
    definitions.append("  PRIMARY KEY (" + ", ".join(sql_ident(c.strip()) for c in primary.split(",")) + ")")
    if table == "inventory_movements":
        definitions.append("  CONSTRAINT `uq_inventory_movements_ledger_seq` UNIQUE (`ledger_seq`)")
    for number, unique in enumerate(uniques, 1):
        if table == "document_sequences" and "branch_id" in unique:
            unique = tuple("branch_scope_key" if c == "branch_id" else c for c in unique)
        cname = f"uq_{table}_{number:02d}"
        definitions.append(f"  CONSTRAINT {sql_ident(cname)} UNIQUE ({', '.join(sql_ident(c) for c in unique)})")
    if table == "stock_adjustments":
        definitions.append("  CONSTRAINT `uq_stock_adjustments_idempotency` UNIQUE (`organization_id`, `idempotency_key`)")
    for number, check in enumerate(checks, 1):
        definitions.append(f"  CONSTRAINT {sql_ident(f'ck_{table}_{number:02d}')} CHECK ({check})")
    for (check_table, col), values in CHECK_VALUES.items():
        if check_table == table:
            quoted = ", ".join("'" + value + "'" for value in values.split())
            definitions.append(f"  CONSTRAINT {sql_ident(f'ck_{table}_{col}')} CHECK ({sql_ident(col)} IN ({quoted}))")
    queries.append(f"CREATE TABLE {sql_ident(table)} (\n" + ",\n".join(definitions) + "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci")
    for idx_name, cols in indexes:
        queries.append(f"CREATE INDEX {sql_ident(idx_name)} ON {sql_ident(table)} ({', '.join(sql_ident(c) for c in cols)})")

# Add foreign keys only after all tables exist. The document uses polymorphic source
# identifiers and audit entity_id, so those intentionally have no SQL foreign key.
for table, columns, _, _, _, fks in parsed:
    for col, ref in fks:
        delete = "CASCADE" if table in BRIDGES else "RESTRICT"
        queries.append(f"ALTER TABLE {sql_ident(table)} ADD CONSTRAINT {sql_ident(f'fk_{table}_{col}')} FOREIGN KEY ({sql_ident(col)}) REFERENCES {sql_ident(ref)} (`id`) ON DELETE {delete}")

queries.append("ALTER TABLE `stock_counts` ADD CONSTRAINT `fk_stock_counts_snapshot_sequence` FOREIGN KEY (`snapshot_sequence`) REFERENCES `inventory_movements` (`ledger_seq`) ON DELETE RESTRICT")

migration = [
    "// Generated from pharmacy_pos_inventory_mysql_spec.md by scripts/generate-schema.py.",
    "import { MigrationInterface, QueryRunner } from 'typeorm';",
    "",
    "export class InitialSchema1700000000000 implements MigrationInterface {",
    "  name = 'InitialSchema1700000000000';",
    "",
    "  async up(queryRunner: QueryRunner): Promise<void> {",
]
for query in queries:
    migration.append("    await queryRunner.query(" + repr(query).replace("\\n", "\\n") + ");")
migration += ["  }", "", "  async down(queryRunner: QueryRunner): Promise<void> {"]
for table, columns, _, _, _, fks in reversed(parsed):
    for col, _ in reversed(fks):
        migration.append(f"    await queryRunner.query('ALTER TABLE `{table}` DROP FOREIGN KEY `fk_{table}_{col}`');")
migration.append("    await queryRunner.query('ALTER TABLE `stock_counts` DROP FOREIGN KEY `fk_stock_counts_snapshot_sequence`');")
for table, *_ in reversed(parsed):
    migration.append(f"    await queryRunner.query('DROP TABLE `{table}`');")
migration += ["  }", "}", ""]
(OUT / "migrations/1700000000000-InitialSchema.ts").write_text("\n".join(migration))
print(f"Generated {len(parsed)} entities and {len(queries)} DDL statements")
