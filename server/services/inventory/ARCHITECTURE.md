# Inventory Service Architecture

## Purpose and boundaries

The inventory service owns the authenticated inventory API used by the pharmacy administration application. Its business areas include product catalog data, suppliers, lots, stock balances, receipts, issues, movements, lookups, and dashboard summaries.

The service runs as a NestJS application and stores operational data in MySQL through Prisma. It does not own login or token issuance: incoming bearer tokens are verified through the shared authentication RPC service.

## Runtime and request flow

```text
HTTP client
  -> NestJS bootstrap and global route prefix
  -> feature controller and InventoryAuthGuard
  -> InventoryService facade or feature service
  -> feature repository (Prisma)
  -> MySQL
```

1. `src/apps/main.ts` creates the Nest application, applies the shared prefix `api/v1/inventory`, enables shutdown hooks, and listens on `PORT` (default `3002`).
2. Each controller exposes a feature route and requires `InventoryAuthGuard`. The guard forwards the bearer token to the auth RPC endpoint and attaches the validated `AdminUser` to the request.
3. Controllers keep the HTTP layer thin. They pass the authenticated user and request data to the service layer.
4. `src/services/app.service.ts` is the cross-feature `InventoryService` facade. Feature services own feature-specific validation and orchestration.
5. Feature repositories read and write through `PrismaService`. Organization-owned records must always be scoped by the authenticated user's `organizationId`.

## Source layout

| Path | Responsibility |
| --- | --- |
| `src/apps/main.ts` | NestJS process entry point and global route prefix. |
| `src/apps/app.module.ts` | Runtime root module; composes the inventory module and runtime-only providers such as demo seeding. |
| `src/app.module.ts` | Inventory domain module; registers controllers, guards, services, repositories, and Prisma. |
| `src/controllers/` | HTTP routes and request-to-service delegation, one controller per feature. |
| `src/services/app.service.ts` | Facade that coordinates the feature services for the admin-facing API. |
| `src/services/*-service.ts` | Feature-specific validation and business orchestration. |
| `src/services/app-validation.ts` | Shared request validation helpers. |
| `src/repositories/` | Persistence operations, generally one repository per feature. `app.repository.ts` contains shared inventory/ledger persistence helpers. |
| `src/requests/` | Request and query types accepted by the API. |
| `src/responses/` | Shared response types. |
| `src/guards/app-auth.guard.ts` | Authentication RPC integration and request user context. |
| `src/shared/contracts/` | Contracts shared across service boundaries, including `AdminUser`. |
| `src/database/prisma.service.ts` | Prisma client lifecycle and database URL configuration. |
| `prisma/schema.prisma` | Prisma client schema used by runtime repositories. |
| `src/database/entities/` | TypeORM entity definitions retained for the migration/legacy persistence setup. |
| `src/database/migrations/` | TypeORM database migration history. |
| `src/apps/seeds/` | Optional demo data initialization. |

## HTTP API

The global prefix is configured once in `src/apps/main.ts`. Controller decorators should contain only the feature path (for example, `@Controller('products')`), not another `v1/inventory` prefix.

All endpoints below require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/inventory/dashboard` | Inventory dashboard summary. |
| `GET` | `/api/v1/inventory/lookups` | Reference data used by inventory forms and filters. |
| `GET`, `POST` | `/api/v1/inventory/products` | List and create products. |
| `PUT` | `/api/v1/inventory/products/:id` | Update a product. |
| `GET`, `POST` | `/api/v1/inventory/suppliers` | List and create suppliers. |
| `PUT` | `/api/v1/inventory/suppliers/:id` | Update a supplier. |
| `GET`, `POST` | `/api/v1/inventory/lots` | List and create product lots. |
| `PUT` | `/api/v1/inventory/lots/:id` | Update a lot. |
| `GET` | `/api/v1/inventory/stock` | Read stock balances. |
| `GET`, `POST` | `/api/v1/inventory/receipts` | List and create stock receipts. |
| `GET`, `POST` | `/api/v1/inventory/issues` | List and create stock issues. |
| `GET` | `/api/v1/inventory/movements` | Read inventory movements. |

The public `GET /api/v1/inventory/health` endpoint is used by the container healthcheck and does not require authentication.

### Product list query

`GET /api/v1/inventory/products` supports:

| Query parameter | Behavior |
| --- | --- |
| `search` | Searches product name, SKU, active ingredient, strength, and dosage form. |
| `categoryId` | Restricts results to a category. |
| `status` | `ACTIVE` or `INACTIVE`. |
| `prescriptionType` | `RX`, `OTC`, or `OTHER`. |
| `sortBy` | `name`, `sku`, or `createdAt`; defaults to `name`. |
| `sortOrder` | `asc` or `desc`; defaults to `asc`. |

The product service validates enum and sort values before calling the repository. The repository scopes the query to the caller's organization and uses a stable secondary `id` sort for deterministic results. Do not claim the other collection endpoints support filters unless their request types, services, and repositories implement them.

## Authentication and tenant isolation

`InventoryAuthGuard` requires a bearer token and calls:

```text
POST ${KAFKA_RPC_URL}/rpc
pattern: auth.authenticate
payload: { authorization: "Bearer ..." }
```

The request includes the `x-internal-service-secret` header. On success, the auth service returns an `AdminUser`; the guard validates the identity fields and stores it as `request.admin`. Missing/expired credentials produce an unauthorized response. Auth service failures or malformed responses produce a service unavailable response.

Configuration is supplied through environment variables; secrets must not be committed or copied into this document:

- `KAFKA_RPC_URL` (defaults to `http://localhost:3100`)
- `INTERNAL_SERVICE_SECRET`

Every organization-owned read and write must be constrained by `AdminUser.organizationId`. Never accept an organization identifier from an untrusted request as the tenant boundary.

## Persistence and schema changes

Runtime repositories use Prisma via `PrismaService`. The connection is taken from `DATABASE_URL` when present; otherwise it is composed from `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME`.

The repository contains both a Prisma schema and TypeORM entities/migrations. These have distinct roles in the current codebase: Prisma is used by runtime repositories, while the TypeORM migration setup and entity definitions are retained for schema migration/legacy operations. Before changing the database, inspect both the deployed migration history and the runtime Prisma schema so they remain compatible. Do not assume editing one representation updates the other.

For a runtime data-model change:

1. Update `prisma/schema.prisma` and the corresponding migration strategy.
2. Regenerate the client with `npm run prisma:generate` (also run by `npm run build`).
3. Update the feature request/response types, service validation, and repository queries as needed.
4. Keep data access organization-scoped and use transactions for multi-row invariants such as product creation and stock ledger updates.

## Local development and deployment

Useful package scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the TypeScript watch process from `src/apps/main.ts`. |
| `npm run build` | Generates Prisma Client and compiles the service into `dist/`. |
| `npm start` | Runs the compiled application from `dist/apps/main.js`. |
| `npm run typecheck` | Runs TypeScript without emitting output. |
| `npm run db:migrate:dev` | Runs the TypeORM migrations from TypeScript. |
| `npm run db:migrate` | Runs the compiled TypeORM migrations. |

The container build uses Node.js 22, compiles the service, exposes port `3002`, and starts the compiled application. In deployments, the database host and auth RPC URL are provided by the environment/container network; use the variable names above and do not hard-code deployment addresses in source.

The Nest runtime depends on TypeScript decorator metadata. If the watch runner fails to resolve injected providers while the compiled application starts correctly, check the development runner's metadata support and the TypeScript decorator settings before changing dependency injection registrations.

Demo seeding is wired during application bootstrap. `SEED_DEMO_DATA=false` disables it. Keep seed operations idempotent and avoid enabling demo data in production environments.

## Guidance for future changes

- Keep `src/apps/main.ts` as the single place that configures the shared API prefix and process lifecycle.
- Add a controller, feature service, and repository for new business areas instead of putting unrelated behavior into the facade or a shared repository.
- Keep controllers focused on HTTP concerns; validate and orchestrate in services, and keep Prisma queries in repositories.
- Preserve stable response shapes expected by the admin client.
- Use transactions when a business action updates multiple related records or maintains a stock ledger invariant.
- Add or extend request types and validation whenever accepting new query parameters or request fields.
- Do not log bearer tokens, internal secrets, or sensitive customer data.
- Update this document when route prefixes, module boundaries, authentication, persistence ownership, or runtime commands change.
