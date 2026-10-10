---
name: admin-frontend
description: Guidelines for building and changing the pharmacy-manager admin interface.
---

# Admin UI Guidelines

Before changing the `admin` UI, inspect the shared components and prefer reusing them.

## Components

- Prefer existing components in `admin/src/components/ui` (shadcn/ui) for buttons, inputs, selects, tables, dialogs, badges, notifications, and loading or empty states.
- Read each component's current API and usage before using it. These components may be customized with Base UI and Tailwind.
- Reuse business-facing components from `admin/src/components` when appropriate. Create a new component or use a native HTML element only when the existing library does not meet the requirement.
- Do not add another UI library for a feature already supported by `src/components/ui`. Follow the existing class-composition patterns and use the `cn` helper when combining conditional classes.

## Data and State

- Each business route under `app/(admin)` owns its page UI, filters, and data-loading flow. Do not combine multiple routes into one generic `InventoryListPage`. Share only UI primitives or small utilities that do not contain page-specific behavior.
- Place request and response types in API-specific files (`req/products.req.ts`, `res/products.res.ts`, etc.). Keep only genuinely shared types in `res/common.res.ts`. Do not combine types from multiple business domains in `inventory.req.ts` or `inventory.res.ts`.
- Use the Zustand library already in the project for shared state. Do not fetch list APIs directly in individual components when the data needs to persist across route navigation.
- Create a separate API state manager under `src/lib/state` for each API (for example, `products-api-state.ts` and `lots-api-state.ts`). The coordinator should manage only the registry and invalidation dependencies between resource groups. Each manager is responsible for calling its API, normalizing query keys, maintaining the cache and loading/error state, and marking data that needs to be refreshed.
- When a page opens, show cached data if available and refresh it from the API in the background. After a successful response, update the cache and store so every component using that resource receives the new data.
- After a mutation, invalidate only dependent resource groups. Do not use `router.refresh()` or reload the whole page to synchronize lists.
- Deduplicate in-flight requests by query key and ignore responses started before an invalidation or clear so stale responses cannot overwrite newer data.
- Keep temporary UI state (for example, search text or whether a dialog is open) inside the component when it does not need to be shared across pages.

## Interaction and Accessibility

- Give every control a clear label. Use `aria-label` when there is no visible label.
- Show loading, error, empty-list, and no-matching-results states clearly.
- Ensure layouts work on small screens, controls are keyboard-accessible, and primary actions do not rely on color alone.
- Keep user-facing interface copy in Vietnamese and follow the existing naming and data-formatting conventions.

## Workflow

- Read `AGENTS.md` in this directory and the documentation shipped with the installed Next.js version before changing Next.js routes, structure, or APIs.
- Find the current call sites before changing API data types or shared behavior. Keep changes within the requested page or feature scope.
- Do not edit generated components or files under `node_modules`.
