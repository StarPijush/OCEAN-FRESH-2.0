# Phase 0.75 Audit — Production Foundation

**Status:** COMPLETE — PRODUCTION FOUNDATION READY
**Scope:** Supabase Auth for admin, hardened RLS, single source of truth for store settings, complete repository layer, no plaintext credentials, no fake auth.

---

## 1. What changed

### 1.1 Database (`database/013_phase075.sql`)

- **`place_cod_order(jsonb)` SECURITY DEFINER RPC** — the ONLY way anonymous visitors can place COD orders:
  - Validates `order_number`, at least one item, `quantity > 0`, `unit_price_amount >= 0`, and status enum values.
  - **Always forces `user_id = NULL`** — a guest can never impersonate a customer.
  - Idempotency: duplicate `idempotency_key` returns the existing order instead of inserting twice.
  - Returns `{ order, items, timeline }` so the repository maps the full order with zero anon SELECT privileges.
- **Dropped all six anon order policies** (`orders_insert_anon`, `orders_select_anon`, `order_items_insert_anon`, `order_items_select_anon`, `order_timeline_insert_anon`, `order_timeline_select_anon`) — anonymous visitors can no longer read any order PII.
- **Added authenticated-customer INSERT policies** on `orders`, `order_items`, `order_timeline_entries` — a logged-in customer may create their own orders but still cannot read or modify anyone else's.
- **Tightened anon cart policies** (`carts_select_anon`, `carts_insert_anon`, `cart_items_all_anon`) — session-scoped only; no inserting into arbitrary carts, no reading authenticated users' carts.
- **Extended `shop_settings`** to the single source of truth for ALL store business values: `store_name`, `store_tagline`, `phone_display`, `phone_raw`, `email`, `address jsonb`, `hours jsonb`, `pincodes jsonb`, `delivery_areas jsonb`, `delivery_radius numeric`, `founded_year int`. Backfilled the `'default'` row with current live values.
- **Canonicalized WhatsApp to `918509597935`** in the DB seed (the fake `919876543210` is gone everywhere).
- **Dropped redundant `settings` / `setting_groups`** key-value tables (second source of truth).
- `010_verify.sql` updated: categories 24, products 33, users 15, shop_settings 17 columns; 7 FKs; 6 unique constraints via `pg_indexes`; plus new checks `place_cod_order_function` and `no_anon_order_policies`.
- Deleted `011_orders_rls.sql` and `012_settings.sql` (superseded; 013 is the tracked migration).

### 1.2 `@oceanfresh/supabase`

- Added `supabaseService.rpc<T>(fn, params)` (service.ts:153).
- Removed the hardcoded `isAdmin: false` / `isAdmin` field from `AuthUser` (auth.ts) — role comes from the DB, not the client.

### 1.3 `@oceanfresh/auth` — real Supabase auth

- **`PersistentSessionStore`** (localStorage key `oceanfresh.auth.session`) replaces in-memory sessions.
- **`IAuthProvider.updatePassword` / `SupabaseAuthProvider.updatePassword`** — uses `auth.updateUser({ password })`.
- **`IAuthRepository.getAdminProfile/updateAdminProfile`** + Supabase implementation (reads/writes `admin_profiles`).
- **`AuthorizationService.resolveRole`** now performs a real `admin_profiles` DB lookup and returns SUPER_ADMIN / ADMIN / CUSTOMER — no hardcoding.
- **`useAdminSession()`** hook — subscribes to Supabase Auth (persistent + auto-refresh), resolves the caller's role via the repository, exposes `{ status, user, adminProfile, isAdmin, error }`.
- **`useUpdatePassword`**, fixed `useRefreshSession` (calls `provider.refreshToken()`), rewritten `auth.mutations.ts` around a shared singleton `AuthService` (via new exported `getAuthService()` factory in `service/auth-service.factory.ts`).
- **Deleted `password.service.ts` and `hashed-password.ts`** — plaintext password verification is gone; credentials are handled exclusively by Supabase.
- 101 tests green; lint + typecheck clean.

### 1.4 New packages (all registered in the vitest workspace)

| Package                | Purpose                                                                                                                 | Tests |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----- |
| `@oceanfresh/settings` | Reads/writes the `shop_settings` row; explicit column mapping; throws `NotFoundError` when missing (no silent fallback) | 8     |
| `@oceanfresh/category` | `findAll` / `findById` / `findBySlug` on `categories` (RLS-safe `is_deleted=false`)                                     | 7     |
| `@oceanfresh/customer` | `users` table repository (getById, findByEmail, create, update)                                                         | 7     |

### 1.5 Order repository — guest orders via RPC

`SupabaseOrderRepository.create` routes **guest orders (`userId == null`) through `place_cod_order`** and maps the returned `{ order, items, timeline }`; authenticated orders keep the direct-insert path. Tests cover RPC payload shape (`user_id` stripped), idempotent mapping, and error propagation.

### 1.6 Admin app

- `main.tsx` registers auth, settings, category, and customer repositories.
- **Deleted the fake `auth.service.ts`**, `OTPScreen.tsx`, and the localStorage-based login (`admin_logged_in`, `admin_otp`, `admin_profile`, `admin_whatsapp`, `admin_delivery_charge` — all removed).
- **`AdminLayout` uses `useAdminSession()`** as the route guard (loading → unauthenticated/non-admin → `/login`).
- **Login is email + password** (Supabase `signInWithPassword`); "Forgot password" sends a Supabase reset email; recovery-link mode shows the password reset screen.
- **Sidebar** shows the real admin name/email from `useAdminSession` and signs out via `AuthService.logout`.
- **Settings page writes to the DB**: profile → `admin_profiles`, password → Supabase (`reauthenticate` + `updatePassword`), WhatsApp/delivery → `shop_settings`.
- Builds clean (tsc + vite).

### 1.7 Storefront

- `main.tsx` registers settings + category repositories.
- **Settings context loads from the DB** via `SettingsRepository` and surfaces errors (`useSettingsError`), no silent fallback.
- **Pincode service is dynamic** (`validate(pin, settings.pincodes)`); DeliveryChecker passes live pincodes.
- **Category filter chips come from the `categories` table** (slug-based IDs), replacing hardcoded "Fresh Fish / Sea Fish / …".
- **Order placement no longer silently swallows DB failures** — a failed `persistOrder` aborts with a toast instead of "WhatsApp order sent anyway".

### 1.8 Housekeeping (STEP H)

- `packages/shared/src/config/settings.ts` — canonical WhatsApp `918509597935`, `+91 85095 97935`, `+918509597935`, `deliveryRadius: 15`; documented as DB fallback only (DB is the source of truth).
- `turbo.json` — env list contains exactly `NODE_ENV`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_STORAGE_BUCKET`.
- Env files contain exactly those 3 variables (no service-role/secret keys); `.env.development/.production/.staging` chmod 600; `.env.example` committed as reference.

---

## 2. Verification results

| Check                                     | Result                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Workspace typecheck (`pnpm -r typecheck`) | Pass                                                                                                     |
| Workspace lint (`pnpm -r lint`)           | 0 errors (2 pre-existing fast-refresh warnings in storefront)                                            |
| Full test suite (`pnpm test`)             | **160/160 passed** (auth 101, product 11, order 9, shared 9, settings 8, cart 8, category 7, customer 7) |
| Admin production build                    | Pass                                                                                                     |
| Storefront production build               | Pass                                                                                                     |
| localStorage business keys                | None remaining (only `oceanfresh.auth.session`)                                                          |
| Plaintext password code                   | None remaining                                                                                           |

## 3. Remaining follow-ups (out of scope for 0.75)

- Run `database/013_phase075.sql` against the live Supabase project and confirm `010_verify.sql` passes.
- Create the admin Supabase user + `admin_profiles` row (seed comment in `009_seed.sql` documents the INSERT).
- Enable Supabase email templates (login confirmation / password recovery) in the dashboard.
- Volume discounts, payments, and customer accounts remain future phases.
