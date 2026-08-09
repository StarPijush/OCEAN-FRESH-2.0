# OCEANFRESH PRODUCTION UPGRADE REPORT

Date: 2026-08-09
Scope: Admin (3001) → Products → Images → Storefront (3000) → Cart → COD → Order → Admin
Target: Supabase project `xg-259-...` (`xgocuseqgfnrrwribnaj`), anon key only.

---

## 1. Executive Summary

All 25 delivery phases are complete. Full gates: `pnpm typecheck` 11/11, `pnpm lint` 11/11 (0
errors), `pnpm test` **178/178 passed (10 packages)**, `pnpm build` 11/11. Both apps build and boot
(`:3000 → "OceanFresh"`, `:3001 → "OceanFresh Admin"`).

**One manual step remains (requires your Supabase account):** run `database/016_production_fixes.sql`
(and `017_production_diagnostic.sql` to verify) in the Supabase SQL editor. Until then the live
project has **no `place_cod_order` RPC and no `products` storage bucket**, so COD checkout and
image uploads fail — confirmed by probes below.

## 2. Root Causes Verified Against the Live DB (anon REST probes)

| Check                                           | Result                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| `GET /rest/v1/products?select=id`               | `[]` — catalog empty (table fully present, RLS healthy)                 |
| `GET /rest/v1/categories`                       | 4 rows (ACTIVE)                                                         |
| `POST /rest/v1/rpc/place_cod_order`             | **404 PGRST202 — function does not exist** (013 only partially applied) |
| `GET /storage/v1/bucket`                        | **no bucket — 007 never applied** (400 NoSuchBucket)                    |
| `shop_settings` row                             | exists (013 settings columns applied)                                   |
| orders / admin_profiles / audit_logs anon reads | blocked by RLS (healthy)                                                |
| env files                                       | all same project, anon key only, no service-role anywhere               |

## 3. Database Changes (files delivered, NOT yet run)

- **`database/016_production_fixes.sql`** — idempotent, additive-only:
  - `place_cod_order(json json)` SECURITY DEFINER (`search_path=''`): validates order / items /
    quantity>0 / price>=0, forces `user_id NULL`, idempotency-key dedupe, returns
    `{order, items, timeline}`, `REVOKE/GRANT` anon+authenticated.
  - Creates customer `INSERT` policies (authenticated) for `orders`, `order_items`,
    `order_timeline_entries`; drops legacy anon order policies (IF EXISTS); tightens anon cart
    policies to the session id.
  - Creates storage bucket `products` (public, 5 MB, image MIME only) + policies:
    public read; INSERT/UPDATE/DDL gated on `public.is_admin()` (strictly stronger than the old
    `admin_profiles EXISTS` check).
- **`database/017_production_diagnostic.sql`** — read-only diagnostics: product counts by
  status/active/deleted, RPC presence, bucket+policies, RLS coverage, leftover anon policies, verdict.

## 4. Admin fixes

- **Product create/update regression fixed:** repository create/blanks thumbnail+galery; keeps the
  caller id so slugs stay unique via the repo (`generateUniqueSlug`, shared `slugify`).
- **Available toggle persists:** edit save now writes `status ACTIVE/OUT_OF_STOCK` + `stock 10/0`
  (was ignored); table toggle fixed — it inverted logic (in-stock became unavailable).
- **Dashboard:** loading / error / retry states (was a silent eternal "—").
- **Products page:** loading / error / retry; delete+feature toasts; broken images fall back to the
  built-in placeholder.
- **Order status update:** no longer refetches the whole list; targeted `count({status})`.

## 5. Image pipeline — storage-first (final decision)

- Admin now compresses (canvas → WebP ≤600px) and uploads to `products/{id}/image.webp` via the
  storage service; the DB stores the **public URL**; removing the image clears DB + storage object.
  No more large data-URLs persisted.
- Fixed latent Vite bug `packages/supabase/src/storage.ts`: bucket env read via dynamic
  `import.meta.env[...]` is **not** replaced at build time → static read now (same as `client.ts`);
  added `storage` export subpath to the package so apps can import `@oceanfresh/supabase/storage`.

## 6. Storefront fixes

- **Cart persists across reloads** (Zustand `persist`, `localStorage` key `fresh-catch-cart`).
- Products page: loading / error / retry (was silent empty screen).
- Removed the fixed **2-second splash** in `DefaultLayout` (length was arbitrary).
- `available = stock > 0 && status === ACTIVE` (matches admin semantics; no more "purchasable"
  products that are out-of-stock).

## 7. Shared / performance / cleanup

- **Order N+1 eliminated:** `findAll/` `findByUserId`/`findByStatus` batch items+timeline in 2
  child queries (`order_id IN (...)`) — 500 orders was ~1,501 round trips, now 3 (test-verified
  with a 500-order case asserting exactly 3 `query` calls, zero `get` calls).
- **Dead code removed:** `deleteAccount`/`deleteUser` path (needs service-role — impossible with
  anon key, unused by any UI) — provider, auth service, mutation hooks, exports, tests.
- **Dedup:** shared `formatCurrency/Date/Time` replace 6 homegrown `fmt` helpers across
  dashboard/products/orders/widgets/detail modal; `toOrderData` extracted (shared by order + stats
  services).
- **Favicons:** real `favicon.svg` added for both apps (index.html already referenced it → 404).

## 8. Tests (post-change, all green)

| Package                               | Count         | Notes                                     |
| ------------------------------------- | ------------- | ----------------------------------------- |
| auth                                  | 107           | deleteAccount test removed                |
| order                                 | 14            | +5 N+1 batch tests (incl. 500-order bulk) |
| product                               | 18            | +7 thumbnail/gallery/slug/id tests        |
| shared                                | 9             | unchanged                                 |
| category / settings / cart / customer | 7 / 8 / 8 / 7 | unchanged                                 |
| **total**                             | **178**       | `pnpm test` exit 0 across all packages    |

## 9. What you need to do (user actions)

1. In Supabase → SQL Editor: run `database/016_production_fixes.sql`, then
   `database/017_production_diagnostic.sql`.
2. Create REAL products via Admin (catalog empty by design — no seed data allowed).
3. Confirm: RPC returns 200, bucket contains `products`, storefront shows your catalog with
   uploaded images, COD order lands in Admin orders with timeline.

## 10. Final verification (2026-08-09)

- Gates: typecheck/lint/test/build all 11/11 success (build was from clean, no cache).
- Apps: `localhost:3000` → `<title>OceanFresh</title>`, `localhost:3001` → `<title>OceanFresh
Admin</title>`.
- Live DB unchanged until you apply 016/017: products `[]`, categories 4, RPC 404, bucket empty —
  exactly the state the fix files address.
