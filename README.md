# Pharmacy Manager database

The `server` directory contains a NestJS backend with 47 TypeORM entity mappings and an initial MySQL 8.4 migration based on [the database specification](./pharmacy_pos_inventory_mysql_spec.md). This stage exposes only `GET /health`; business APIs and stock posting are not implemented yet.

## Run locally

1. Copy `.env.example` to `.env` and set two unique passwords. An existing local `.env` can be reused.
2. Run `docker compose up -d --build` from the project root.
3. Check `docker compose ps` and open `http://127.0.0.1:3000/health`.

MySQL is available on `127.0.0.1:3306` by default. The database name, application user, passwords, and host ports are configured in `.env`. The schema migration runs automatically when the backend starts. MySQL data is stored in the named Docker volume `mysql_data`; `docker compose down` keeps the data.

The migration creates the tables, primary and foreign keys, unique and check constraints, and indexes from the specification. `inventory_movements.ledger_seq` is an auto increment sequence, and `stock_counts.snapshot_sequence` references it. `document_sequences.branch_scope_key` is a generated column so organization level sequence rows remain unique when `branch_id` is `NULL`.

The database starts without a tenant or sample products. Tenant dependent seed data, including the transit warehouse, default locations, roles, and synthetic no lot records, belongs to the later organization setup workflow. Stock posting rules, tenant ownership checks, and ledger immutability require the business services specified in the document; there are no write endpoints at this stage.

## Development

Run `npm ci` in `server`, then `npm run typecheck` or `npm run build`. Entity mappings and the initial migration can be regenerated from the specification with `python3 server/scripts/generate-schema.py`; review changes before running them against an existing database. TypeORM `synchronize` is disabled.
