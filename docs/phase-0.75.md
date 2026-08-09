# Phase 0.75 — Production Foundation (Auth, RLS, Settings)

**Scope:** Finish the production blockers found at the end of Phase 0.5 — fake admin auth, anonymous order access, scattered business settings, hardcoded store values, missing repository layer.
**Mode:** code + SQL changes; migration `database/013_phase075.sql` is ready to apply to live Supabase (not yet applied).
**Result:** `typecheck`, `lint`, `test` (160/160), admin build, storefront build — all green.

---

## 1. Problems found

### 1.1 Admin authentication was fake (critical)

- Login was **mobile number + password compared against a plaintext password stored in `localStorage`** (`admin_profile`).
- OTP "recovery" generated a random 6-digit code, stored it in localStorage, and **showed it to the user in an `alert()`**.
- Session was a boolean flag `admin_logged_in` in localStorage — anyone could set it and get in.
- `packages/supabase/src/auth.ts` hardcoded `isAdmin: false` on `AuthUser` — admin status never came from the database.

### 1.2 Anonymous visitors could read order PII (critical)

- `011`-era policies (`orders_select_anon`, `order_items_select_anon`, `order_timeline_select_anon`, …) let **any unauthenticated visitor SELECT all orders, items, and timeline entries** — names, phone numbers, addresses.
- Anyone could also INSERT orders/items directly, bypassing any validation or idempotency.

### 1.3 No secure entry point for guest orders

- After removing anon access there would be **no way for a guest (storefront visitor) to place a COD order at all** — the storefront is guest-only by design.

### 1.4 Business settings were scattered (drift)

- Delivery fee, free-delivery threshold, WhatsApp number, pincodes, areas, hours lived in **hardcoded `STORE_SETTINGS` constants**, localStorage keys (`admin_whatsapp`, `admin_delivery_charge`), AND redundant `settings`/`setting_groups` tables — **three sources of truth**.
- WhatsApp number had **drifted**: code said `919876543210` (fake), live DB was `918509597935` (real). Orders were being WhatsApp'd to the wrong number.
- Storefront loaded settings with a **silent fallback** — if the DB row was missing, the app rendered defaults with no error anywhere.

### 1.5 Missing repository packages

- No `settings`, `category`, or `customer` repository packages — those domains had no typed access layer.

### 1.6 Storefront hardcoded the catalog

- Category filter chips were hardcoded (`Fresh Fish / Sea Fish / Prawns / Crabs`) and never matched the real category IDs, so **filtering silently returned nothing**.
- Pincode serviceability was hardcoded to a frozen list.

### 1.7 Storefront swallowed order failures

- `placeOrder()` caught a failed DB save and **still sent the WhatsApp order** with only a `console.warn` — customers and admin could disagree on what was ordered.

### 1.8 Migration and env hygiene

- Redundant/unapplied migrations (`011_orders_rls.sql`, `012_settings.sql`) with no tracking.
- Real `.env` files were `chmod 755` (world-readable) and unverified against the allowed variable list.

---

## 2. How each was fixed

### 2.1 Real Supabase auth (`@oceanfresh/auth`)

- Admin login is now **email + password** via `auth.signInWithPassword`; password reset goes through `auth.resetPasswordForEmail` (recovery-link flow, no client-side OTP).
- **`PersistentSessionStore`** persists the session in `oceanfresh.auth.session`; `useRefreshSession` calls `provider.refreshToken()`.
- **`IAuthRepository.getAdminProfile/updateAdminProfile`** backed by `admin_profiles`; **`AuthorizationService.resolveRole`** now does a real DB lookup (SUPER_ADMIN / ADMIN / CUSTOMER).
- New **`useAdminSession()`** hook — single source of truth for the admin session (loading / unauthenticated / authenticated + `isAdmin`).
- **Deleted `password.service.ts` / `hashed-password.ts`** — no plaintext credentials anywhere; 101 auth tests green.
- Admin app: deleted fake `auth.service.ts` + `OTPScreen.tsx`; `AdminLayout` guards with `useAdminSession`; Sidebar shows real name/email; Settings page writes profile/password/WhatsApp/delivery to the DB.

### 2.2 Guest orders: `place_cod_order()` RPC (SECURITY DEFINER)

- All six anon order policies dropped. Guests now place orders ONLY through the RPC, which:
  - validates `order_number`, ≥1 item, `quantity > 0`, `unit_price >= 0`, valid status;
  - **forces `user_id = NULL`** (no impersonation);
  - is idempotent on `idempotency_key`;
  - returns `{ order, items, timeline }` — so the repo maps the order with zero anon SELECT.
- Added authenticated-customer INSERT policies (customer may create their own order, never read others').
- Tightened anon cart policies to session-scoped rows only.
- `SupabaseOrderRepository.create` routes `userId == null` orders through the RPC; tests verify `user_id` is stripped from the payload.

### 2.3 Single source of truth: `shop_settings`

- `shop_settings` extended to 17 columns (store name/tagline, phones, email, address, hours, pincodes, areas, delivery radius, founded year, WhatsApp, delivery fee/threshold).
- Redundant `settings`/`setting_groups` tables dropped.
- WhatsApp canonicalized to **`918509597935`** in DB and code.
- New `@oceanfresh/settings` package maps columns explicitly and **throws `NotFoundError` instead of silently falling back**.
- Storefront `SettingsProvider` surfaces load errors (`useSettingsError`); admin settings page writes to the DB.

### 2.4 New repository packages + catalog wiring

- `@oceanfresh/settings`, `@oceanfresh/category`, `@oceanfresh/customer` packages (typed, tested: 8 + 7 + 7 tests), registered in the vitest workspace and both apps.
- Storefront **category chips load from the `categories` table**; pincode checks use live `settings.pincodes`.
- `placeOrder()` now **aborts with a toast if the DB save fails** — no more silent WhatsApp-only orders.

### 2.5 Hygiene

- Deleted `011_orders_rls.sql`, `012_settings.sql`; `013_phase075.sql` is the tracked migration; `010_verify.sql` extended (table counts, FKs, unique constraints, `place_cod_order` check, `no_anon_order_policies` check).
- Env files verified to contain exactly `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_STORAGE_BUCKET`; real envs chmod **600**; `turbo.json` env list matches.

---

## 3. What to change in the future (ordered by impact)

### 3.1 Critical (before launch)

1. **Apply `013_phase075.sql` to live Supabase and run `010_verify.sql`** — everything above is verified in code/tests, not against the live DB yet.
2. **Create the admin user + `admin_profiles` row** in live Supabase (seed comment in `009_seed.sql` shows the INSERT) and enable Supabase email templates (confirmation / password recovery).
3. **Server-side price integrity**: `place_cod_order` validates shape but trusts client-supplied prices. Either reconcile `unit_price_amount`/`subtotal` against the `products` table inside the RPC, or enforce prices at the gateway once payments exist.

### 3.2 High

4. **RLS test on live data**: verify with the Supabase SQL editor (anon role) that orders/cart reads return zero rows and the RPC round-trips correctly.
5. **Cart→order ownership**: for authenticated customers, confirm `cart_id` on the order can't point at another user's cart (currently enforced only by policy, not by the RPC).
6. **Multi-instance rate limiting**: `AuthService` login throttle is in-memory (per browser tab). A real deployment needs DB-backed or gateway-level rate limiting.

### 3.3 Medium

7. **Server-side pincode validation**: the RPC doesn't validate `shipping_snapshot.pincode` against `shop_settings.pincodes`; a future RPC revision should.
8. **`useDeleteAccount`/`auth.admin.deleteUser`**: the provider calls the admin API from the client — fails without the service-role key. Remove the hook or move it behind a serverless function.
9. **Session storage & XSS**: `PersistentSessionStore` (localStorage) is only as safe as the renderer — audit `dangerouslySetInnerHTML` usages (e.g., order location status) since any XSS could exfiltrate the access token.
10. **Recovery-mode detection**: reset flow detects `#access_token` in the URL hash; verify end-to-end with a real recovery email in production.

### 3.4 Low / cleanup

11. **Keep `STORE_SETTINGS` in sync manually** — it's now only a bootstrap fallback; the DB is the source of truth.
12. **Admin bundle size** (628 kB) and storefront fast-refresh warnings — code-split later; cosmetic today.
13. **Customer accounts / payments / volume discounts** — still future phases; COD + WhatsApp confirmation remains the shipping architecture.
