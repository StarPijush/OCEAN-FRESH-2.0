# Phase 0 — Recovery: install, build, lint, typecheck green

## Goal

Make `pnpm install`, `pnpm turbo build`, `pnpm lint` and `pnpm typecheck` all pass again for the whole monorepo (2 apps, 8 packages) with no redesign, no `as any`, no disabled lint rules.

## Problems found

### 1. Compiler blockers (broken imports)

| File                                                      | Problem                                                             | Root cause                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/storefront/src/components/layout/TopNav.tsx`        | Imported `../../stores/cart.js`                                     | `stores/cart` module was deleted during a refactor to services |
| `apps/storefront/src/components/layout/BottomNav.tsx`     | Imported `../../stores/cart.js`                                     | same                                                           |
| `apps/storefront/src/components/ui/FloatingCart.tsx`      | Imported `../../stores/cart.js`                                     | same                                                           |
| `apps/storefront/src/components/home/DeliveryChecker.tsx` | Imported `../../types/legacy.js`                                    | `types/legacy` was deleted                                     |
| `apps/admin/src/services/order.service.ts`                | `o.status === 'pending'` had no overlap with the `OrderStatus` enum | legacy status names vs enum values                             |

### 2. TypeScript unsoundness (`any` casts, missing types)

| File                                         | Problem                                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin/src/services/order.service.ts`   | `as any` casts, untyped mapping of legacy order statuses                                                                                                |
| `apps/admin/src/services/product.service.ts` | `as any` casts; `thumbnail` missing from shared `CreateProductInput` (repo/DB already supported it)                                                     |
| `apps/admin/src/services/stats.service.ts`   | `as any` casts on `findAll`                                                                                                                             |
| `apps/admin/src/services/auth.service.ts`    | unused `getAuthRepository` import                                                                                                                       |
| `packages/supabase/src/service.ts`           | untyped query builders (`any`), a hand-written `PostgrestFilterBuilder` generic alias that does not satisfy the supabase-js 2.110.7 generic constraints |

### 3. ESLint errors

- ~40 errors across storefront, admin, shared, supabase, settings:
  - duplicate `import ... from '.../services/index.js'` statements (products page, FeaturedCards, FreshCatch, order page)
  - `import()` with `any`-ish annotation (`products.tsx`)
  - `as any` in several service files
  - import-export sort violations (simple-import-sort)
  - empty `catch {}` block in `packages/shared/src/logger/factory.ts`
- 5 react-refresh / hooks warnings:
  - `Toast.tsx` exporting `showToast` next to a component
  - `AdminContext.tsx` exporting `useAdminContext` next to a component
  - `AdminToast.tsx` exporting `useAdminToast` next to a component
  - `useReveal.ts` unused `deps` parameter
- `eslint.config.mjs` referenced deleted `packages/category`

### 4. Broken / stale configuration

| File                               | Problem                                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `vitest.workspace.ts`              | referenced `packages/category` (deleted) and `packages/inventory`, `packages/pricing`, `packages/shipping`, `packages/users` (never existed)    |
| `eslint.config.mjs`                | `workspacesWithReact` listed `packages/category`                                                                                                |
| root `package.json`                | `"seed": "node scripts/seed.mjs"` pointed at a nonexistent script (scripts/ only has migrations/)                                               |
| `.env.production` / `.env.staging` | malformed `VITE_SENTRY_DSN=https://prod.sentry.io` / `https://staging.sentry.io` (a real Sentry DSN is required, these would break Sentry init) |

### 5. Fresh install broke typecheck (TS2688)

`tsconfig.json` (root) declares `"types": ["vite/client", "node"]`. With a clean strict pnpm install, no workspace has `vite` or `@types/node` in its own `node_modules`, so **all 10** workspaces failed `typecheck` with TS2688. The previous local `node_modules` had been created by a different pnpm version and accidentally hoisted the packages.

## What was fixed

### Storefront broken imports

- `TopNav.tsx`, `BottomNav.tsx`, `FloatingCart.tsx` → import `../../services/cart.service.js` (API-identical zustand store).
- `DeliveryChecker.tsx` → rewritten on `pincodeService.validate()` from `../../services/pincode.service.js` (same pincodes and user-facing messages; invalid → warn, unsupported → error, supported → ok).

### Admin services (typed, no casts)

- `order.service.ts`: `STATUS_MAP` `pending → VALIDATING`, `preparing → PROCESSING`, `delivered → DELIVERED`; `PENDING_STATUSES = {VALIDATING, PENDING_PAYMENT, PAID, CONFIRMED}`; typed `toOrderData(o: Order)` / `i: OrderItem`; `repo.findAll({ limit: 200 })` uncast.
- `product.service.ts`: new `toProductData(p: Product)` helper, `ProductStatus.ACTIVE` / `ProductStatus.OUT_OF_STOCK`, all `as any` removed.
- `stats.service.ts`: typed `toOrderData`/`OrderItem`, `as any` removed.
- `auth.service.ts`: unused `getAuthRepository` import removed.
- `packages/shared/src/types/product.ts`: added `thumbnail?: string` to `CreateProductInput`.

### Supabase service

- `type QueryBuilder = ReturnType<ReturnType<typeof getTable>['select']>` derived from the real chain (works with supabase-js 2.110.7).
- `applyQueries` / `applyOptions` / `query()` / `count()` / `executeInTransaction` all use it; unused `data` destructure removed.

### ESLint

- All duplicate imports merged, sort violations autofixed repo-wide (incl. both `vite.config.ts`).
- Empty `catch {}` in `logger/factory.ts` → behavior-preserving `catch { return false; }`.
- react-refresh warning fixes by extracting non-component exports:
  - storefront `components/ui/toast.ts` (`showToast`, via `setShowToastFn` registered by `Toast`)
  - admin `components/layout/admin-context.ts` + `use-admin-context.ts`
  - admin `components/shared/toast-context.ts` + `use-admin-toast.ts`
  - all 10 importer files updated
  - `useReveal.ts`: removed the never-used `deps` parameter (all callers pass nothing)

### Config & env

- `vitest.workspace.ts`: dropped the 5 dead workspace entries.
- `eslint.config.mjs`: dropped `packages/category`.
- root `package.json`: removed the broken `seed` script; added `vite@^6.4.3` and `@types/node@^26.1.1` as root devDependencies so every workspace resolves the root-tsconfig `types` via upward typeRoots.
- `.env.production` / `.env.staging`: `VITE_SENTRY_DSN=` emptied (matches `.env.example`); real Supabase credentials untouched.
- `pnpm-lock.yaml`: refreshed in sync with the manifest.

### Environment notes

- `pnpm` is not on PATH (`corepack enable pnpm` needs root): a shim `~/.local/bin/pnpm` runs `corepack pnpm`. Use `export PATH="$HOME/.local/bin:$PATH"` in new shells.

## Verification (all green)

| Command                      | Result                                                   |
| ---------------------------- | -------------------------------------------------------- |
| `pnpm install`               | clean, lockfile frozen (`CI=true`)                       |
| `pnpm typecheck`             | 10/10 packages                                           |
| `pnpm lint`                  | 10/10 packages, 0 errors, 0 warnings                     |
| `pnpm build` (`turbo build`) | 9/9 tasks; `vite build` succeeds in storefront and admin |

## Known issues left (backlog, not compile-time blockers)

1. **DB/TS enum case mismatch (runtime):** database enums are UPPERCASE (`'ACTIVE'`, `'DRAFT'`, … in `database/002_tables.sql`, `database/009_seed.sql`) while TS enums are lowercase — queries with lowercase values will not match DB rows at runtime. Needs an alignment decision (migration vs TS values).
2. **Admin authentication** still uses legacy localStorage-based auth (`auth.service.ts`); the `@oceanfresh/auth` package (`registerAuthRepository`, `user-avatar` components, `authRepository` in supabase package) is not wired into the admin app.
3. **`pg_transaction` RPC** in `packages/supabase/src/service.ts` (`executeInTransaction`) is unused by any app.
4. **`registerSettingsRepository()`** is never called in the admin/storefront entry points — settings service falls back to a stub at runtime.
5. **Vitest** was not run in this phase (not in the Phase-0 target list); `vitest.workspace.ts` is fixed and ready to run when desired.
6. `docs/audit-supabase-migration.md` still lists the enum mismatch and Sentry DSN as open items — Sentry DSN is now fixed, enum mismatch remains (see 1).

> Status: Phase 0 complete — install, build, lint, typecheck all green. Items 1–4 above are candidates for a Phase 1 (runtime/data-alignment) pass.
