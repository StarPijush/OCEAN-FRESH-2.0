# OCEANFRESH — COMPLETE APPLICATION AUDIT — v1.5

**Date:** 2026-09-01
**Commit audited:** `ab46f81` on `main` (`origin/main` https://github.com/StarPijush/OCEAN-FRESH-2.0)
**Working tree:** 29 modified + 7 untracked `apps/admin` UI files (uncommitted rebuild in `apps/admin/src/*`, `docs/admin-ui-rebuild` gitignored)
**Audit mode:** READ-ONLY evidence collection, then persisted as v1.5 snapshot. No code was refactored to pass the audit — all findings verified via `read`/`grep` with `file:line` evidence.
**Auditors:** principal architect / security / DB / DevOps / QA / UI/UX
**Supersedes:** `PRODUCTION_REPORT.md` (2026-08-09) + `docs/audit.md`, `docs/audit-phase-0.75.md`
**Related docs:** `docs/DEPLOYMENT.md`, `docs/architecture/ARCHITECTURE.md`, `database/010_verify.sql`, `database/017_production_diagnostic.sql`, `database/016_production_fixes.sql`, `database/018_grant_products_select.sql`

---

## 1. EXECUTIVE SUMMARY

OceanFresh is a **serverless seafood e-commerce platform** for Jhargram, West Bengal, promising "fresh catch in 3 hours". It is a **Turborepo + pnpm monorepo** with **two React 19 SPAs** (Vite) sharing domain packages over **Supabase** (Auth, Postgres, Storage, RLS).

| Layer                                  | Implementation                                                                                                    | Status                                                                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Storefront** `apps/storefront` :3000 | React 19, Zustand cart, TanStack Query, `productService` cached VM                                                | **Partial** — product browse + COD + WhatsApp works locally, but orphan auth pages, local cart vs server cart split, no pagination beyond 100                                                                                 |
| **Admin** `apps/admin` :3001           | React 19, memory-only auth, CRUD via repositories                                                                 | **Functional but fragile** — login→dashboard→products→orders flows work if DB migrations applied; heavy uncommitted UI churn; image pipeline depends on missing bucket                                                        |
| **Database** `database/*.sql`          | Postgres 13 tables, 6 enums, RLS on 13 tables, `public.is_admin()` gate, `place_cod_order` RPC                    | **Schema coherent** locally; **production is diverged** — live project historically missing `place_cod_order`, `products` bucket, and later migrations (`016/018`) — exact lag depends on which SQL operators ran `016`/`018` |
| **Auth**                               | Supabase Auth (`auth.users`) → `admin_profiles` role check (`admin`/`super_admin`) + public `users` mirror        | **Real but split**: Admin = memory-only session (`persistSession:false`) + `useAdminSession` DB lookup; Storefront = anonymous guest by default (no customer login routed)                                                    |
| **RLS**                                | `public.is_admin()` SECURITY DEFINER, per-table policies                                                          | **Strong after `013/016`**; **critical gaps before `016`**: anon cart policies overly broad, order-table anon policies must be dropped; grant missing without `018`                                                           |
| **Storage**                            | Bucket `products` (public, 5 MB, image MIME) + `is_admin()` writes                                                | **Correct design**; fails on live DB until `016`/`007` applied                                                                                                                                                                |
| **Deployment**                         | Vercel (`apps/admin/vercel.json` present, storefront missing), Supabase Cloud, GitHub Actions CI                  | **Preview deploy blocked** without env; prod deploys manual; migrations NOT auto-applied by Vercel                                                                                                                            |
| **Overall**                            | Clean Architecture intent: `apps → packages/{product,order,cart,category,settings,customer,auth,shared,supabase}` | **~68/100** — core happy paths work post-migration; biggest risks: **production DB drift**, **anonymous order PII exposure if old policies remain**, **dual cart system**, **no E2E auth for customers**                      |

**Top 5 blockers (P0/P1):** (see §25/26 for full register)

1. **Production DB drift** — storefront anon `place_cod_order` 404 and `products` bucket 400 until `016`/`007` applied; products hidden without `018` GRANT. — `database/016_production_fixes.sql:45`, `018_grant_products_select.sql:16`, `PRODUCTION_REPORT.md:18`
2. **Overly-broad anon RLS before `016`** — `carts_select_anon (session_id IS NOT NULL)` and `cart_items_all_anon` let any anon guess `cart_id` → read/tamper others' guest carts. — `database/008_rls.sql:212`
3. **Local cart ≠ server cart** — storefront uses Zustand `fresh-catch-cart` localStorage (`apps/storefront/src/services/cart.service.ts:16`), while `packages/cart` Supabase `carts/carts_items` stays empty — checkout never uses DB carts; `packages/cart` merge never invoked. — `apps/storefront/src/services/cart.service.ts:1`, `packages/cart/src/repository/supabase-cart.repository.ts:331`
4. **Trusting unsigned JWT claims** — `SupabaseAuthProvider.getCustomClaims()` `atob(token.split('.')[1])` no signature check (`packages/auth/src/providers/supabase-auth.provider.ts:181`); `usePermissions`/`RoleGuard` gates on that claim.
5. **Storefront auth pages orphaned** — `apps/storefront/src/pages/login.tsx|forgot-password.tsx|verify-otp.tsx|reset-password.tsx` exist but **never routed** in `apps/storefront/src/app.tsx:14` (only `/, /products, /order, /contact, *`). No customer login flow.

---

## 2. PROJECT IDENTITY

**Purpose:** D2C seafood storefront (browse → cart → COD order → WhatsApp handoff) + private admin operations (products, categories, orders, settings, dashboard).

**Applications:**

| App        | Path              | Entry                                      | Ports | Router               | State                                               |
| ---------- | ----------------- | ------------------------------------------ | ----- | -------------------- | --------------------------------------------------- |
| Storefront | `apps/storefront` | `src/main.tsx:27` `bootstrap()` → `App`    | 3000  | `react-router-dom@7` | Zustand (cart) + TanStack Query (products/settings) |
| Admin      | `apps/admin`      | `src/main.tsx:23` `bootstrapApp()` → `App` | 3001  | `react-router-dom@7` | TanStack Query only (memory-only auth)              |

**Tech stack (actual, pinned):** `package.json:45`, `apps/*/package.json:31/30`

- **Runtime:** Node `>=20`, pnpm `9.15.4`, Vite `6.4.3` (root/admin) vs `6.0.0` (storefront drift)
- **Frontend:** `react 19.2.3` exact, `react-dom 19.2.3`, `react-router-dom ^7.0.0`, Tailwind `3.4.6`, `gsap 3.15.0`, `framer-motion 11.3.0` (storefront), `zustand 4.5.4` (storefront)
- **Types:** `typescript 5.5.3` strict, `zod 3.23.8`, `react-hook-form 7.52.1` (storefront)
- **Data:** `@tanstack/react-query 5.51.0`, `@supabase/supabase-js 2.45.0` (via `@oceanfresh/supabase`)
- **Build:** Turborepo `2.0.6` (`turbo.json:15`), ESLint `9.6.0` + `typescript-eslint 8`, Prettier + `lint-staged`, Husky+commitlint, Vitest `2.0.3`, Playwright `1.45.0` (storefront e2e stub), `msw 2.3.5`
- **Backend:** Supabase (Auth, Postgres `pgcrypto`+`pg_trgm`, Storage), RLS, PL/pgSQL `SECURITY DEFINER` RPCs
- **Deploy:** Vercel (admin only config), Supabase Cloud project `xgocuseqgfnrrwribnaj` (anon key only; service_role never in bundle — `PRODUCTION_REPORT.md:5`)

**Repository structure (actual, `pnpm-workspace.yaml:1`):**

```
E:\FRESH CATCH\
├── apps/
│   ├── storefront/   # @oceanfresh/storefront — customer SPA  (vite 6.0.0)
│   └── admin/        # @oceanfresh/admin — ops SPA  (vite 6.4.3)
├── packages/
│   ├── shared/       # types, validators, utils, errors, config, domain rules
│   ├── supabase/     # client.ts, service.ts, storage.ts, auth.ts, transform.ts
│   ├── auth/         # SupabaseAuthProvider, SessionManager, guards, hooks, repo
│   ├── product/      # IProductRepository + SupabaseProductRepository
│   ├── category/     # ICategoryRepository (reads only)
│   ├── order/        # IOrderRepository (N+1 fixed via batched hydrate)
│   ├── cart/         # ICartRepository (server carts — unused by storefront UI)
│   ├── customer/     # ICustomerRepository → users table
│   └── settings/     # ISettingsRepository → shop_settings
├── database/
│   ├── 001_extensions.sql → 018_grant_products_select.sql (17 files)
│   └── 010_verify.sql  (551 lines, 13 tables, 20+ policies, final verdict)
├── docs/ (ARCHITECTURE.md, DEPLOYMENT.md, ROADMAP.md, SECURITY.md, phase-*.md)
├── lib/ (empty — legacy placeholder)
├── turbo.json, tailwind.config.ts, tsconfig.json, eslint.config.mjs
└── .github/workflows/ci.yml (lint, typecheck, test, build, audit)
```

**Current development state:** Feature-complete per `PRODUCTION_REPORT.md:1` (25 phases, 178 tests green 2026-08-09), but **live DB out of sync** until operator runs `016`/`017`/`018`; admin UI mid-rebuild (29 `M`, 7 `??` uncommitted); no seed products — catalog empty by design (`PRODUCTION_REPORT.md:18`).

---

## 3. ARCHITECTURE OVERVIEW

### 3.1 Intended architecture (docs) — `docs/architecture/ARCHITECTURE.md:5`

```
Presentation:  apps/storefront  |  apps/admin  (React 19)
Application:   TanStack Query, React Router, RHF + Zod
Domain:        auth / product / order / cart / category / settings
Service:       AuthService, ProductService (storefront VMs), OrderService
Repository:    Supabase*Repository  (DI-registered, via supabaseService)
Infrastructure: Supabase Auth → Postgres (RLS) → Storage (products bucket)
```

### 3.2 Actual deployed architecture

```
                    ┌─────────────────────┐  :3000 Vite (manualChunks vendor+query)
                    │  STOREFRONT SPA     │─────────────────────────────┐
                    │  Browser            │  Zustand persist            │
 USER ──https──────▶ │  DefaultLayout     │  fresh-catch-cart (local)   │  VITE_* inlined
 (customer)          │  Home/Products/    │  productService cache 100   │  at build
                    │  Order/Contact     │  orderService.persistOrder──┼──► Supabase REST
                    └─────────────────────┘  └─► RPC place_cod_order ──┼──► /rest/v1/products?select…
                           │  ▲                  (anon)                 │    RLS public SELECT
                           │  │ WhatsApp wa.me/{orderWhatsApp}          │
                           │  │ window.open (no server checkout)        │
                           │  └──── SettingsProvider (shop_settings) ────┘
                           │
                    ┌─────────────────────┐  :3001 Vite (no manualChunks)
                    │  ADMIN SPA          │─────────────────────────────┐
                    │  Browser            │  memory-only auth           │  VITE_* inlined
                    │  App gate           │  bootstrapApp()             │  persistSession:false
 ADMIN ──https─────▶ │  Login/Forgot/OTP │  SupabaseAuthProvider       │  localStorage purge
                    │  Dashboard/Products │  useAdminSession (DB role)  │  sb-*-auth-token
                    │  Orders/Categories/ │  product/order/settings     │  oceanfresh.auth.session
                    │  Settings           │  repos (supabaseService)    │
                    └─────────────────────┘  storageService.upload ─────┼──► /storage/v1/object/products/…
                           │  ▲                  (is_admin() gated)     │
                           │  │                                      ┌──┴─────────────────────────┐
                    ┌──────┴──┴──────┐                               │  Supabase Cloud            │
                    │  @oceanfresh/  │                               │  xgocuseqgfnrrwribnaj      │
                    │  supabase      │──── initSupabase() ──────────▶ │  PostgREST (anon key)       │
                    │  service.ts    │    supabase-js createClient   │  RLS (is_admin, anon, auth)│
                    │  storage.ts    │                               │  Postgres (RLS enabled)      │
                    │  STORAGE_BUCKET│                               │  Storage (products bucket)   │
                    │  = products    │                               │  Auth (auth.users)           │
                    └────────────────┘                               └─────────────────────────────┘

                    ┌─────────────────────────────────────────────────┐
                    │  CI/CD (GitHub Actions)                         │
                    │  lint | typecheck | test | build --needs-->     │
                    │  security (pnpm audit --high)                   │
                    │  NO migration job; NO Vercel auto-migration     │
                    └─────────────────────────────────────────────────┘
```

### 3.3 Request flows (actual code paths)

**Storefront read (products):** `pages/products.tsx:31 productService.getAll() → getProductRepository().findAll({status:ACTIVE,limit:100}) → supabaseService.query("products", [{status eq ACTIVE},{is_deleted eq false}]) → client.from("products").select("*")` — gated by RLS `products_select_public (status='ACTIVE' AND is_deleted=false)` — `packages/product/src/repository/supabase-product.repository.ts:88`, `database/008_rls.sql:35`.

**Storefront write (order):** `pages/order.tsx:98 persistOrder → order.service.ts:134 getOrderRepository().create(order) → if userId falsy → createGuestOrder → supabaseService.rpc("place_cod_order",{payload}) → FUNCTION public.place_cod_order(jsonb) SECURITY DEFINER → INSERT orders (user_id NULL) + order_items + timeline` — `packages/order/src/repository/supabase-order.repository.ts:331`, `database/016_production_fixes.sql:45`.

**Admin auth:** `bootstrap.ts:26 initSupabase({persistSession:false}) → supabase auth memory-only → purge sb-*-auth-token` → `useAdminSession.ts:60 new SupabaseAuthProvider() → getCurrentUser() (auth.getUser) + getAuthRepository().getAdminProfile(user.id) → admin_profiles lookup → isAdmin = role in ('admin','super_admin')` — `apps/admin/src/bootstrap.ts:26`, `packages/auth/src/hooks/use-admin-session.ts:62`.

**Admin write:** `ProductsScreen:72 uploadProductImage(id, localUri) → fetch(localUri).blob → storageService.upload("products/{id}/thumbnail.webp") → client.storage.from("products").upload()` → `product.repository.create({thumbnail:url})` — `apps/admin/src/services/product-image.ts:99`, `packages/supabase/src/storage.ts:23`.

---

## 4. COMPLETE PROJECT MAP

_Every important directory — purpose, contents, consumers, dependencies, dependents._

| Directory           | Purpose                         | Contains                                                                                                                                                                                                                       | Used by                                                               | Depends on                                                                                            |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/storefront`   | Customer storefront SPA         | `src/pages/(home,products,order,contact)`, `src/services/(product,order,cart,settings)`, `src/context/settings-context`, `src/components/(home,products,layout,ui)`, `vite.config.ts:6 envDir ../../`                          | end users                                                             | `packages/{product,category,order,cart,settings,shared,supabase}`, `zustand`, `framer-motion`, `gsap` |
| `apps/admin`        | Operations admin SPA            | `src/app.tsx` gate, `src/screens/new/*`, `src/hooks/*`, `src/services/(auth,product-image,dashboard-stats)`, `src/navigation/new/AdminLayout`, `src/components/ui/new/*`, `vercel.json`                                        | shop operators                                                        | `packages/{auth,product,category,order,settings,shared,supabase}`, `@supabase/supabase-js`            |
| `packages/shared`   | Single source for types & utils | `src/types/(product,category,order,cart,auth,permission,settings,common)`, `src/config/(settings,env)`, `src/utils/(formatCurrency,slugify,generateOrderNumber)`, `src/errors/*`, `src/validators/auth.schema`, `src/domain/*` | every package + both apps                                             | `zod` only                                                                                            |
| `packages/supabase` | Supabase infra adapter          | `src/client.ts` (initSupabase, persistSession, EXPO fallback), `src/service.ts` (CRUD + rpc), `src/storage.ts` (upload/getUrl/remove), `src/transform.ts` (snake↔camel)                                                        | all repositories                                                      | `@supabase/supabase-js`                                                                               |
| `packages/auth`     | Auth domain + providers         | `src/providers/supabase-auth.provider.ts`, `src/service/auth.service.ts`, `src/session/*`, `src/repository/supabase-auth.repository.ts`, `src/hooks/use-admin-session.ts`, `src/permissions/*`, `src/guards/*`                 | `apps/admin` (primary), storefront (should but orphaned)              | `shared`, `supabase`                                                                                  |
| `packages/product`  | Product domain                  | `src/repository/(product.repository,supabase-product.repository)` (+ factory, DI)                                                                                                                                              | `apps/storefront` (via productService), `apps/admin` (via hooks)      | `shared`, `supabase`                                                                                  |
| `packages/category` | Category domain                 | `src/repository/supabase-category.repository.ts` (reads only)                                                                                                                                                                  | both apps (`findAll`, `findBySlug`)                                   | `shared`, `supabase`                                                                                  |
| `packages/order`    | Order domain                    | `src/repository/supabase-order.repository.ts` (batched hydrate, place_cod_order branch)                                                                                                                                        | storefront `order.service.persistOrder`, admin `useOrders`, dashboard | `shared`, `supabase`                                                                                  |
| `packages/cart`     | Cart domain                     | `src/repository/supabase-cart.repository.ts` (`create,addItem,merge,clearItems`)                                                                                                                                               | registered but **never read by storefront UI**                        | `shared`, `supabase`                                                                                  |
| `packages/customer` | Customer profile                | `src/repository/supabase-customer.repository.ts` → `users` table                                                                                                                                                               | admin (indirect), future                                              | `shared`, `supabase`                                                                                  |
| `packages/settings` | Shop settings                   | `src/repository/supabase-settings.repository.ts` → `shop_settings` `default` row                                                                                                                                               | both apps (`SettingsProvider`, admin SettingsScreen)                  | `shared`, `supabase`                                                                                  |
| `database`          | Source of truth for schema      | `001_*`→`018_*` (extensions, tables, indexes, constraints, triggers, functions, storage, RLS, seed, verify, phase075, reconciles, production fixes)                                                                            | Supabase project (operator runs)                                      | Postgres                                                                                              |
| `docs`              | Docs + ADRs                     | `architecture/ARCHITECTURE.md`, `DEPLOYMENT.md`, `SECURITY.md`, `phase-*.md`, `audit.md`                                                                                                                                       | humans/AI                                                             | —                                                                                                     |
| `.github/workflows` | CI                              | `ci.yml` (lint, typecheck, test, build, security)                                                                                                                                                                              | GitHub Actions                                                        | pnpm, node 20                                                                                         |
| `lib/`              | Legacy placeholder              | empty                                                                                                                                                                                                                          | nothing                                                               | —                                                                                                     |

**Monorepo mechanics:** `pnpm-workspace.yaml:1 packages/apps/* packages/*`, `turbo.json:15 build dependsOn ^build`, `tailwind.config.ts:4 content apps/**/src + packages/ui/src` (stale — `packages/ui` deleted but glob harmless).

---

## 5. APPLICATIONS

### 5.1 Storefront `@oceanfresh/storefront` — `apps/storefront/package.json:1`

**Purpose:** Anonymous product discovery + COD order via WhatsApp.

**Entry:** `src/main.tsx:27 bootstrap()` — registers 5 repos (`product,cart,order,settings,category`), `initSupabase()` (persisted), renders `<App />` inside `QueryClientProvider` + `BrowserRouter`. `staleTime 5 min, retry 2, refetchOnWindowFocus false` — `main.tsx:17`.

**Routes:** `src/app.tsx:11` — `<SettingsProvider>` wraps 4 routes under `DefaultLayout`:

| Path        | Component                                                                                                                     | Data                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/`         | `pages/home.tsx` → `Hero,Ticker,FeaturedCards,FreshCatch,WhyUs,DeliveryChecker,CTASection,AboutSection,ReviewsSection,Footer` | static + `FeaturedCards` pulls `productService.getFeatured()` (cached)                                             |
| `/products` | `pages/products.tsx` (loading/error/empty + filter drawer)                                                                    | `productService.getAll()` + `getCategoryRepository().findAll()` parallel; `filtered = selectedCategories ∩ search` |
| `/order`    | `pages/order.tsx` (cart items, customer form, location, WhatsApp)                                                             | `useCartStore` + `productService.getAll()` + `orderService.calculatePricing` + `persistOrder` → `place_cod_order`  |
| `/contact`  | `pages/contact.tsx`                                                                                                           | static + settings-driven address/hours                                                                             |
| `*`         | `pages/not-found.tsx`                                                                                                         | 404                                                                                                                |

**Orphaned (never routed, dead code):** `src/pages/login.tsx`, `verify-otp.tsx`, `forgot-password.tsx`, `reset-password.tsx` — all exist on disk (`glob apps/storefront/src/pages/*`) but absent from `app.tsx:14` Routes. Users cannot reach customer login — `apps/storefront/src/pages/login.tsx:1` directly calls `getClient().auth.signInWithPassword` bypassing `@oceanfresh/auth`.

**Important components:**

- `components/layout/DefaultLayout.tsx:41` — `CardNav` (Explore/Shop/Help) + `Outlet` + `BottomNav` + `FloatingWhatsApp` + `Toast`. No auth wrapper. `themeKeyForPath` drives `data-theme`.
- `components/home/DeliveryChecker.tsx` — pincode check vs `settings.pincodes`.
- `components/products/ProductSearch, ProductFilterDrawer, ProductFilterButton` — client filter (no server search).
- `components/order/OrderSummary, OrderSuccessModal` — pricing + post-order modal (cart cleared only on modal close — `order.tsx:116 clear(); navigate('/')`).

**Services (storefront-local, not packages):**

| Service                  | File                             | Critical detail                                                                                                                                                                                                                                                                                                                 |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `productService`         | `services/product.service.ts:56` | `cached:ProductVM[]                                                                                                                                                                                                                                                                                                             | null`—`loadCache()`fetches`findAll({status:ACTIVE,limit:100})` once, never invalidated (no TTL, no query invalidation). Admin creates product → storefront stale until reload. |
| `orderService`           | `services/order.service.ts:45`   | `persistOrder` builds `Order` locally, `id:generateId()`, `orderNumber: OF-YYYY-XXXXXX (Date.now slice)` predictable, `idempotencyKey: cod-{uuid}` random not deterministic → duplicate clicks create duplicate orders (RPC dedupes on key, but new key each click). Price trusted from `product.price` not re-validated vs DB. |
| `cart.service` (zustand) | `services/cart.service.ts:16`    | `create(persist({ name:'fresh-catch-cart'}))` — fully local. **Never syncs** to `packages/cart` Supabase carts.                                                                                                                                                                                                                 |
| `settingsService`        | `services/settings.service.ts:5` | Thin re-export of `getSettingsRepository().getSettings()` — used by `SettingsProvider`.                                                                                                                                                                                                                                         |

**State:** Zustand (`fresh-catch-cart`) + TanStack Query (implicit via `productService` cache, but not via `useQuery` on storefront — storefront bypasses Query cache for products). `SettingsProvider` `useState<StoreSettings>(STORE_SETTINGS)` then `useEffect → settingsService.getSettings() → setSettings` — `context/settings-context.tsx:20`.

**Database access:** via `@oceanfresh/{product,category,order,settings}` repositories → `@oceanfresh/supabase/service.ts:72 get/query/count/add/update` → `getClient().from(table).select("*")`. RLS `public` policies allow anon SELECT on `products/categories/shop_settings` only — `database/008_rls.sql:12/35/307`.

**Current status:** `pnpm test` green per `PRODUCTION_REPORT.md:11`; `pnpm build` ok; **real defect:** products empty until `018` grant + products seeded; orders succeed via RPC only after `016`.

---

### 5.2 Admin `@oceanfresh/admin` — `apps/admin/package.json:1`

**Purpose:** Private ops: login → dashboard analytics → products CRUD + images → orders pipeline → categories (read) → store settings.

**Entry:** `src/main.tsx:23 bootstrapApp() → initSupabase({persistSession:false, detectSessionInUrl:false}) + purge localStorage + getAuthService({persistSession:false}) + register 5 repos` — `bootstrap.ts:22`. Memory-only session: reload forces fresh login.

**Routes — `src/app.tsx:18` gate:** `useAdminSession()` → 4 states:

```ts
error           → <SessionError message onRetry>
unauthenticated → <PublicRoutes>  // /login|/forgot-password|/otp-verify|/reset-password|*→/login
authenticated && isAdmin → <AdminRoutes> // AdminLayout drawer → /dashboard|/products|/categories|/orders|/settings|*→/dashboard
authenticated && !isAdmin → <AccessDenied signingOut onSignOut={getAuthProvider().logout()}>
```

**Hooks:** `useAdminSession`, `useProducts`, `useCategories`, `useOrders`/`usePendingOrderCount`, `useDashboardStats`, `useSettings`/`useAdminProfile`, `useBreakpoint`.

**Screens:**

| Screen           | File                                                         | What it does                                                                    | Data                                       | Mutations                                               |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Login            | `screens/new/LoginScreen.tsx:17`                             | email+password → `getAuthProvider().login({email,password})`                    | —                                          | raw `err.message` exposed                               |
| Forgot/OTP/Reset | `ForgotPasswordScreen, OtpVerifyScreen, ResetPasswordScreen` | OTP recovery: `sendEmailOtp → verifyEmailOtp → updatePassword`                  | `services/auth.service.ts:16` OTP          | Competes with legacy `sendPasswordReset` (link)         |
| Dashboard        | `screens/new/DashboardScreen.tsx:22`                         | MetricGrid, PerformanceChart, RecentOrdersList, TopProductsList                 | `useDashboardStats` (500 orders+products)  | refresh                                                 |
| Products         | `screens/new/ProductsScreen.tsx:21`                          | Filters, ProductList, ProductFormSheet, delete confirm                          | `useProducts`, `useCategories`             | create/update/delete + `uploadProductImage`             |
| Categories       | `screens/new/CategoriesScreen.tsx:10`                        | **Read-only** list + search                                                     | `useCategories()`                          | **none**                                                |
| Orders           | `screens/new/OrdersScreen.tsx:42`                            | Tabs ALL/PENDING/PAID/SHIPPED/DELIVERED, expand card, `NEXT_MOVE` state machine | `useOrders({limit:100})`, `useOrderCounts` | `updateStatus`                                          |
| Settings         | `screens/new/SettingsScreen.tsx:104`                         | Account, Password, Store, Resources                                             | `useSettings`, `useAdminProfile`           | `updateSettings`, `updateAdminProfile`, `resetPassword` |

**Current status:** Builds and boots (`:3001 → OceanFresh Admin` — `PRODUCTION_REPORT.md:13`). Needs `016` for storage writes + RPC, `018` for storefront reads, products seeded via UI.

---

## 6. DATABASE ARCHITECTURE

### 6.1 Extensions — `database/001_extensions.sql:1`

`pgcrypto` (`gen_random_uuid()`), `pg_trgm` (planned search).

### 6.2 Enums — `database/002_tables.sql:9`

| Enum              | Values                                                                                                                                                                           | Used where          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `product_status`  | `DRAFT, ACTIVE, OUT_OF_STOCK, COMING_SOON, DISCONTINUED, ARCHIVED, HIDDEN, PREORDER`                                                                                             | `products.status`   |
| `product_unit`    | `KG, PIECE, DOZEN`                                                                                                                                                               | `products.unit`     |
| `category_status` | `ACTIVE, DRAFT, HIDDEN, ARCHIVED`                                                                                                                                                | `categories.status` |
| `order_status`    | `DRAFT, VALIDATING, PENDING_PAYMENT, PAYMENT_FAILED, PAID, CONFIRMED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUND_REQUESTED, REFUNDED, ARCHIVED` | `orders.status`     |
| `cart_status`     | `ACTIVE, VALIDATING, READY_FOR_CHECKOUT, CHECKOUT_STARTED, CHECKED_OUT, ARCHIVED, EXPIRED, ABANDONED`                                                                            | `carts.status`      |
| `cart_source`     | `GUEST, AUTHENTICATED`                                                                                                                                                           | `carts.source`      |

### 6.3 Tables (13 tables) — `database/002_tables.sql:75` + `002b_auth_tables.sql:10`

**Core catalog:**

- **`categories`** (24 cols) — `id uuid pk`, `name/slug/description`, `parent_id → categories.id SET NULL`, `path text`, `level 0-5`, `status category_status`, `visibility 'public'|'private'`, `product_count`, `is_deleted`, `created_at/updated_at/deleted_at`
- **`products`** (33 cols) — `id uuid`, `name/slug/sku/barcode/description`, `price numeric(12,2)`, `category_id → categories.id SET NULL`, `status product_status`, `stock int`, `unit product_unit`, `thumbnail text ''`, `gallery jsonb []`, `tags jsonb []`, `search_keywords jsonb []`, `is_deleted`, `created_at/updated_at/deleted_at`
- **`users`** — `id uuid pk → auth.users.id CASCADE`, `email/phone/display_name`, `email_verified`, `is_anonymous`, `created_at/updated_at`
- **`admin_profiles`** — `id uuid`, `user_id uuid UNIQUE → auth.users.id CASCADE`, `full_name`, `role 'admin'|'super_admin'`, `permissions jsonb`
- **`auth_sessions`** — `id uuid`, `user_id`, `token_pair jsonb`, `expires_at/absolute_expires_at`, `is_revoked`, `updated_at` (added `014:22`)
- **`auth_devices`** — `id uuid`, `user_id`, `name/type/os/browser/ip_hash/is_trusted`, `updated_at` (added `014:27`)
- **`audit_logs`** — `id uuid`, `user_id`, `type text` (DROP NOT NULL `015:39`), `data jsonb`, `event/actor_id/target_id/correlation_id/source/updated_at` (added `014:36`)

**Commerce:**

- **`orders`** — `id uuid`, `order_number text unique`, `user_id text` (stores `auth.uid()::text` or NULL for guests), `idempotency_key text unique where NOT NULL`, `status order_status`, `customer_snapshot/shipping_snapshot/billing_snapshot/totals/payment jsonb`
- **`order_items`** — `id uuid`, `order_id → orders.id CASCADE`, `product_id text`, `quantity`, `unit_price_amount`, `subtotal_amount`, `updated_at` (added `015:22`)
- **`order_timeline_entries`** — `id uuid`, `order_id → orders.id CASCADE`, `status text`, `changed_by`, `note`, `updated_at` (added `015:25`)

**Cart:**

- **`carts`** — `id uuid`, `user_id text`, `session_id text`, `source cart_source`, `status cart_status`, `totals jsonb`, `expires_at`, `created_at/updated_at`
- **`cart_items`** — `id uuid`, `cart_id → carts.id CASCADE`, `product_id text`, `quantity`, `subtotal_amount`, `added_at`, `created_at/updated_at` (added `015:28`)

**Settings:**

- **`shop_settings`** — `id text pk DEFAULT 'default'` (single-row), `whatsapp_number`, `delivery_charge_amount/free_above`, plus expanded `013:278` → `store_name/tagline/phone_display/phone_raw/email/address jsonb/hours jsonb/pincodes jsonb/delivery_areas jsonb/delivery_radius/founded_year`

### 6.4 Indexes — `database/003_indexes.sql:1` (24+)

`idx_products_slug (unique)`, `idx_products_category/status/featured/active/GIN(search_keywords)`, categories `parent/path/status`, orders `order_number unique, idempotency_key partial unique, user_id/status/created_at`, `order_items order_id`, `timeline order_id`, `carts user_id/session_id/status`, `users email partial unique`, `admin_profiles role`.

### 6.5 Constraints — `database/004_constraints.sql:1`

`chk_products_price >=0`, `chk_products_stock >=0`, `chk_orders_order_number length>0`, `chk_order_items_quantity >0`, `chk_carts_expires_at > created_at`, `chk_admin_profiles_role IN (admin,super_admin)`.

### 6.6 Triggers — `database/005_triggers.sql:1`

`update_updated_at_column() BEFORE UPDATE → NEW.updated_at=now()` on `categories,products,users,admin_profiles,orders,carts,shop_settings` + `auth_sessions,auth_devices` (`002b:115`) + `order_items,order_timeline_entries,cart_items` (`015:45`).

### 6.7 Functions — `database/006_functions.sql:15`

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$ SELECT EXISTS(SELECT 1 FROM admin_profiles WHERE user_id=auth.uid() AND role IN ('admin','super_admin')) $$;
```

### 6.8 Relationship map

```
auth.users
   ├─1:1── users.id                         CASCADE
   ├─1:1── admin_profiles.user_id (UNIQUE)  CASCADE → RLS is_admin() gate
   ├─1:N── auth_sessions.user_id            CASCADE
   ├─1:N── auth_devices.user_id             CASCADE
   └─1:N── audit_logs.user_id               CASCADE

categories (self: parent_id → categories.id SET NULL)
   └─1:N── products.category_id → categories.id SET NULL

orders.id (guest user_id NULL, auth user_id::text)
   ├─1:N── order_items.order_id      CASCADE
   └─1:N── order_timeline_entries    CASCADE

carts.id (session_id text, user_id text)
   └─1:N── cart_items.cart_id        CASCADE

shop_settings (singleton id='default')
storage.buckets id='products' → products.thumbnail public URL
```

---

## 7. DATABASE ↔ CODE CONTRACT

| #     | Severity        | Table.Column                    | DB reality                        | Code expectation                                                       | Location                                    | Impact                                    |
| ----- | --------------- | ------------------------------- | --------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| C-001 | **P1 HIGH**     | `products` SELECT privilege     | RLS policy exists but needs GRANT | Without `018` GRANT, anon SELECT denied                                | `database/018_grant_products_select.sql:16` | Storefront shows empty catalog            |
| C-002 | **P0 CRITICAL** | `place_cod_order(jsonb)`        | Absent until `013/016`            | `supabase-order.repository.ts:354 rpc` always routes guest create here | `database/016:45`                           | Guest COD 404 before `016`                |
| C-003 | **P1**          | `storage.buckets 'products'`    | Absent until `007/016`            | `supabase/src/storage.ts:25` upload                                    | `database/016:281`                          | Admin image upload 400                    |
| C-004 | **P2**          | `order_items.updated_at` etc.   | Added by `015` only               | `supabaseService.add()` stamps `created_at+updated_at`                 | `015:22`, `service.ts:110`                  | Before `015`: insert fails column missing |
| C-005 | **P2**          | `auth_sessions.updated_at` etc. | Added by `014`/`015`              | `SupabaseAuthRepository` writes those fields                           | `014:22`                                    | Before: upsert fails                      |
| C-006 | **P1**          | `shop_settings` expanded cols   | Added by `013` only               | `supabase-settings.repository.ts:14` expects them                      | `013:278`                                   | Before: upsert 400 column missing         |
| C-007 | **P3**          | `categories.visibility`         | CHECK `public\|private`           | Code allows `restricted`                                               | `004:10` vs `types/category.ts:46`          | Latent 400 if restricted sent             |
| C-008 | **P1**          | `products.status`               | 8 values matches code 8 — ✓       | —                                                                      | `002:9` vs `types/product.ts:9`             | Verified matched                          |

**Overall contract health:** **7/8 after all migrations** — requires `013→016→018` in order; codebase already assumes their presence.

---

## 8. AUTHENTICATION

### 8.1 Admin authentication — REAL, memory-only

```
User → /login (email+password)
  → LoginScreen:31 getAuthProvider().login → SupabaseAuthProvider:84 signInWithPassword
      → mapSupabaseUser → AuthSession {id:randomUUID, tokenPair, device:Unknown, expires +1h}
  → Supabase Auth memory-only (persistSession:false)
  → onAuthStateChange → useAdminSession refresh() → getCurrentUser() + getAdminProfile(user.id)
      → isAdmin = role in ('admin','super_admin') → App:70 AdminRoutes else AccessDenied
Logout → getAuthProvider().logout() → signOut() → PublicRoutes→/login
Reload → bootstrapApp() purges localStorage → initSupabase(persistSession:false) → unauthenticated
```

**Strengths:** memory-only prevents replay; RLS consulted per request not JWT claim.
**Weaknesses:** OTP vs recovery-link split (`services/auth.service:16` OTP vs `supabase-auth.provider:199` link — only OTP wired), per-hook Provider instance (`useAdminSession:60 new SupabaseAuthProvider()` per mount), rate limiter in-memory Map bypassable, `mapSupabaseUser` hardcodes `isAnonymous:false`, no reauth gate for password change.

**Verdict:** **Real and functional** — not localStorage fake. Grade **B**.

### 8.2 Storefront authentication — MOSTLY ABSENT

Storefront never calls `@oceanfresh/auth`; no provider, no gate — `main.tsx:34 initSupabase()` persisted but `app.tsx:12` never checks. Customer login pages exist but unrouted (`app.tsx:15` only `/, /products, /order, /contact`). Orders force `user_id NULL` in RPC (`016:104`). Guests cannot list orders by design.

**Verdict:** Intentionally guest-only today — customer auth roadmap Phase 2.

---

## 9. AUTHORIZATION / RLS

### 9.1 `public.is_admin()` — `database/006_functions.sql:15`

`SECURITY DEFINER SET search_path=public` — prevents hijack — correct.

### 9.2 Table-by-table matrix — post-`016` (recommended)

| Table                        | anon                                                                               | authenticated (non-admin)                                                | authenticated (admin `is_admin()`)              |
| ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| **products**                 | `SELECT status='ACTIVE' AND !is_deleted` + needs `018` GRANT                       | same public SELECT                                                       | `FOR ALL USING/WITH CHECK is_admin()` full CRUD |
| **categories**               | same                                                                               | same                                                                     | `FOR ALL is_admin()`                            |
| **shop_settings**            | `SELECT true` (any)                                                                | same; `INSERT/UPDATE/DELETE is_admin()`                                  | `UPDATE/INSERT/DELETE is_admin()`               |
| **orders**                   | **none** (dropped `016:191`) — only RPC                                            | `SELECT own (user_id=auth.uid()::text)`; `INSERT own WITH CHECK uid`     | `FOR ALL is_admin()`                            |
| **order_items**              | **none**                                                                           | `SELECT/INSERT own via EXISTS orders.user_id=uid`                        | `FOR ALL is_admin()`                            |
| **order_timeline_entries**   | **none**                                                                           | `SELECT/INSERT own via EXISTS`                                           | `FOR ALL is_admin()`                            |
| **carts**                    | `SELECT/INSERT session-scoped` `016:242` `session_id NOT NULL AND user_id IS NULL` | `SELECT/FOR ALL own (user_id=uid)`                                       | `SELECT admin`                                  |
| **cart_items**               | `FOR ALL EXISTS carts session_id NOT NULL AND user_id IS NULL` `016:256`           | `FOR ALL EXISTS carts user_id=uid`                                       | `SELECT admin`                                  |
| **users**                    | **none**                                                                           | `SELECT/UPDATE own (id=uid)`; `INSERT WITH CHECK id=uid`; `SELECT admin` | `SELECT admin`                                  |
| **admin_profiles**           | **none**                                                                           | `SELECT/UPDATE own`; `FOR ALL super_admin`                               | `FOR ALL super_admin`                           |
| **storage.objects products** | `SELECT public bucket_id='products'`                                               | `INSERT/UPDATE/DELETE bucket_id='products' AND is_admin()`               | same                                            |

### 9.3 Pre-`016` vs post-`016` delta

| Before                                                     | After (`016`)                                              | Risk closed                   |
| ---------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------- |
| `carts_select_anon USING session_id NOT NULL` `008:212`    | `USING session_id NOT NULL AND user_id IS NULL` `016:246`  | anon cannot read auth carts   |
| `carts_insert_anon WITH CHECK true` `008:237`              | `WITH CHECK user_id IS NULL` `016:251`                     | prevents spoofing user_id     |
| `cart_items_all_anon EXISTS session_id NOT NULL` `008:274` | `EXISTS session_id NOT NULL AND user_id IS NULL` `016:261` | prevents tampering auth carts |
| anon order policies (if existed)                           | no anon policies — RPC only                                | closes PII enumeration        |

**Confidence HIGH** — directly verified from `008_rls.sql`, `016_production_fixes.sql`.

---

## 10. STORAGE

**Bucket:** `products` — `007_storage.sql:9` / `016:281` — `public:true`, `5 MB`, `allowed_mime ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']`.

**Policies post-`016`:** `SELECT TO public bucket_id='products'` `016:294`; `INSERT/UPDATE/DELETE TO authenticated WITH CHECK is_admin()` `016:303`.

**Upload code:** `supabase/src/storage.ts:23 upload → storage.from('products').upload({upsert:true}) → getPublicUrl` — `STORAGE_BUCKET` via `VITE_SUPABASE_STORAGE_BUCKET ?? 'products'` `storage.ts:9`. Admin `product-image.ts:99 uploadProductImage → fetch(localUri).blob → File('thumbnail.webp') → upload('products/{id}/thumbnail.webp')`.

**Issues:** bucket missing until `016` → 400 (`PRODUCTION_REPORT.md:28`); `ProductsScreen:125 handleDelete` guards thumbnail delete with `if(categoryId)` — orphan if no category; `URL.createObjectURL` never `revokeObjectURL` — leak `product-image.ts:52`.

---

## 11. ENVIRONMENT VARIABLES

| Variable                              | Used by                              | Required                 | Prod/Preview | Secret?     | Defined (.env.example)  | Problem                                                                                            |
| ------------------------------------- | ------------------------------------ | ------------------------ | ------------ | ----------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`                   | both apps `env.ts:4`, `client.ts:25` | Yes                      | Yes (Vercel) | No          | placeholder             | Local `.env.development` real `xgocuseqgfnrrwribnaj.supabase.co` gitignored; Vercel must replicate |
| `VITE_SUPABASE_ANON_KEY`              | both apps                            | Yes                      | Yes          | No (public) | placeholder             | exposure via bundle is expected — anon-only                                                        |
| `VITE_SUPABASE_STORAGE_BUCKET`        | `env.ts:6` + `storage.ts:10`         | Yes (default `products`) | Yes          | No          | `products`              | fallback consistent                                                                                |
| `VITE_STOREFRONT_URL`                 | admin `env.ts:7` + `AdminLayout:91`  | Yes                      | Yes          | No          | `http://localhost:3000` | `.env.production:7` incorrectly `localhost:3000` for prod — Vercel must override                   |
| `EXPO_PUBLIC_SUPABASE_URL`            | `client.ts:28` fallback              | No (legacy RN)           | No           | No          | —                       | stale — `turbo.json:7` lists but unused — prune                                                    |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`       | same                                 | No                       | No           | No          | —                       | stale                                                                                              |
| `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET` | `storage.ts:12`                      | No                       | No           | No          | —                       | stale                                                                                              |
| `NODE_ENV`                            | `turbo.json:12`                      | implicit                 | implicit     | No          | —                       | `turbo.json globalDependencies ".env"` references gitignored file — confusing                      |

No `VITE_SERVICE_ROLE` in bundle — verified `grep VITE_` 52 hits all placeholders. No secret committed.

---

## 12. DEPLOYMENT

### 12.1 Local

`pnpm install --frozen-lockfile` → `cp .env.example .env.development` → `pnpm dev` (turbo persistent) → `pnpm typecheck/lint/test/build`.

### 12.2 Architecture

```
LOCAL (.env.development) ──pnpm build──▶ dist/
VERCEL PREVIEW (PR → main, vercel --env staging)  buildCommand: pnpm --filter @oceanfresh/admin build → dist, install: pnpm install (no frozen)
VERCEL PRODUCTION (vercel --prod) same, env prod dashboard values
SUPABASE CLOUD (manual migrations — NOT auto on Vercel deploy — docs/DEPLOYMENT.md:22)
```

**Exact deployment risks:**

| Risk                                                 | File                                   | Effect                                                        |
| ---------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| Missing storefront `vercel.json`                     | `apps/storefront` none                 | Storefront deployment unconfigured                            |
| `installCommand` without `--frozen-lockfile`         | `apps/admin/vercel.json:5`             | lock drift preview vs prod                                    |
| `VITE_STOREFRONT_URL localhost` in `.env.production` | `.env.production:7`                    | Admin View Store opens `/` not prod URL if Vercel env not set |
| Node not pinned                                      | no `.nvmrc`; `engines node>=20` only   | Vercel default drift                                          |
| No CSP/HSTS headers                                  | `vercel.json` no headers               | `ARCHITECTURE.md:71` claims CSP but not configured            |
| Migrations manual                                    | `docs/DEPLOYMENT.md:22`                | Operator forgetting `016/018` → production blocked            |
| `vite 6.0.0 vs 6.4.3` drift                          | `apps/storefront/package.json` vs root | bundle vs local mismatch                                      |

---

## 13. ADMIN AUDIT

### 13.1 Login

Memory-only; `PublicRoutes *→/login` correct; `SESSION_ERROR` retry; `AccessDenied` no auto-redirect; raw `err.message` leaky enumeration (low); initial `unauthenticated` flash (no loading spinner).

### 13.2 Protected routes

`App` gate covers all; no per-screen guard needed; direct nav to `/products` while unauthed → `/login` correct.

### 13.3 Dashboard — `screens/new/DashboardScreen.tsx:22`

Header refresh correct; metrics from `computeDashboardStats` (500 rows, client-side) — if >500 orders, undercount; `pendingOrders` double-sourced vs badge may drift; chart week/month correct.

### 13.4 Products — `screens/new/ProductsScreen.tsx:21`

List client-search filter after `findAll({status})`; Create `id=crypto.randomUUID()` + `uploadProductImage` then `createProduct({thumbnail})` — correct; Update maps `available→ACTIVE/OUT_OF_STOCK + stock`; Delete soft-delete + `if(categoryId) removeThumbnail` — **BUG** orphan if no category; Image `URL.createObjectURL` never revoked — leak.

### 13.5 Categories — `screens/new/CategoriesScreen.tsx:10`

**Read-only** — search `name|slug|description`; no CRUD UI (repo read-only); seeded via `009_seed.sql` 4 rows. Adding category requires SQL — incomplete self-service.

### 13.6 Orders — `screens/new/OrdersScreen.tsx:42`

Tabs `ALL/PENDING/PAID/SHIPPED/DELIVERED`; `PENDING_GROUP` includes `CONFIRMED` while dashboard `PENDING_STATUSES` does not — **drift** `OrdersScreen:15` vs `dashboard-stats.ts:52`; search `orderNumber|name|phone`; expand shows totals via `formatCurrency`; `NEXT_MOVE` linear state machine `VALIDATING→CONFIRMED→…→DELIVERED`.

### 13.7 Settings — `screens/new/SettingsScreen.tsx:104`

Account/Profile/Password/Store/Resources; only 5 store fields editable (name/tagline/whatsapp/deliveryFee/freeAbove) — missing address/hours/pincodes/areas etc. — incomplete.

---

## 14. STOREFRONT AUDIT

### 14.1 Homepage — `pages/home.tsx:15`

`Hero,Ticker,FeaturedCards,FreshCatch,WhyUs,DeliveryChecker,CTASection,AboutSection,ReviewsSection,Footer` — `DeliveryChecker` vs `settings.pincodes` exact match.

### 14.2 Product listing — `pages/products.tsx:14`

`loading spinner`, `error Retry`, `empty Nothing found`, grid `prod-premium`; categories dynamic from `getCategoryRepository().findAll()`; filter `selectedCategories ∩ search`; card `prod-media lazy` + emoji fallback, price `₹`, qty stepper, `ADD TO CART` → toast.

**Bugs:** `productService` cache 100 never invalidates; `addItem` uncapped (no `maxOrderQuantity`); no virtualization; `search` client-only.

### 14.3 Cart + Checkout — `pages/order.tsx:18` (order is cart+checkout)

`cartEntries (Object.entries(cart).filter(q>0))` → `productService` lookup → `order-card`; pricing `calculatePricing(entries, freeAbove, deliveryFee)` settings-driven; form `name/phone/address` `autoComplete`; location `geolocation.getCurrentPosition` → `locStatus dangerouslySetInnerHTML` but lat/lng numbers safe; `placeOrder → validateForm → persistOrder (await DB success) → buildWhatsAppMessage → window.open(https://wa.me/{waNumber}) → setOrderSuccess → modal clear on close` — correct order (DB before WhatsApp).

**Gaps:** No pincode gate; stale price; idempotency key random (no dedup); `orderNumber OF-YYYY-slice6` predictable; `updateQty` ignores `minOrderQuantity`.

---

## 15. API / SERVICE AUDIT

| Op                       | Input                              | Validation                                                 | Logic                                                                                          | DB                                  | UI                                     |
| ------------------------ | ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------- |
| `product.findAll`        | `ProductQuery`                     | none                                                       | `constraints + count + query` `supabase-product.repository:88`                                 | `count+select`                      | `useProducts` grid                     |
| `product.create`         | `CreateProductInput & {createdBy}` | DB check `price>=0`                                        | `generateUniqueSlug` loop                                                                      | `objToSnakeCase → add`              | toast + invalidate                     |
| `product.search`         | `term`                             | —                                                          | loads all non-deleted then `Array.filter` on `searchKeywords` `197`                            | single query loads all              | unused — `useProducts` does own filter |
| `order.findAll`          | `OrderQuery`                       | none                                                       | `constraints + count + query + hydrateRows(ids)` `order.repository:179` — batched 2 IN queries | 3 queries for 500 orders (was 1501) | admin orders + dashboard               |
| `order.createGuestOrder` | `Order guest null`                 | RPC validates `order_number, items>0, quantity>0` `016:62` | `delete user_id → rpc place_cod_order` `331`                                                   | `SECURITY DEFINER` atomic           | storefront `persistOrder`              |
| `order.updateStatus`     | `id,status,changedBy`              | `findById`                                                 | `update status + add timeline + findById` `367`                                                | `UPDATE+INSERT+SELECT`              | admin Advance                          |
| `settings.getSettings`   | —                                  | —                                                          | `get shop_settings default → toStoreSettings fallback` `82`                                    | `SELECT`                            | SettingsProvider                       |

---

## 16. BUSINESS LOGIC AUDIT

**Product:** `available = stock>0 && ACTIVE` — `product.service:51`; admin toggle `available → ACTIVE/OUT_OF_STOCK`; soft-delete `is_deleted:true + ARCHIVED`; threshold `getLowStock` vs `computeDashboardStats lowStock=ACTIVE&&0<stock<=5`.

**Cart:** Local Zustand uncapped; server cart trusts client `subtotal_amount` no recalc; `merge` per-item updates.

**Order:** Guest COD `VALIDATING → CONFIRMED → ... → DELIVERED`; `generateOrderNumber()` dead (`shared/utils:32` `ORD-YYMMDD-XXXX` unused, storefront uses `OF-YYYY-slice`); idempotency not deterministic; status transitions not validated server-side.

---

## 17. SECURITY AUDIT

_Full table in §26._

- RLS verified **HIGH** confidence from `008`+`016`.
- `is_admin SET search_path=public` good; `place_cod_order SET search_path=''` stricter.
- `SECURITY DEFINER` RPC validates inputs, forces `user_id NULL`.
- Overly broad anon carts closed by `016`.
- `audit_logs INSERT WITH CHECK true` any auth can spam (P3).
- Storage public read intentional.
- `VITE_ANON_KEY` exposure by design, no `service_role`.
- `order.tsx:70 dangerouslySetInnerHTML` safe (numbers only) but flagged P3.
- `atob(token.split('.')[1])` no verify — forge role claim until RLS blocks (P2).
- No secret committed (`.env.*` ignored, `git log` clean).
- CSP/HSTS claimed but not in `vercel.json` — UNKNOWN.

---

## 18. PERFORMANCE AUDIT

| Area             | Finding                                                                            | Evidence                          | Impact                |
| ---------------- | ---------------------------------------------------------------------------------- | --------------------------------- | --------------------- |
| Bundle           | Admin no `manualChunks` vs storefront `vendor+query`                               | `vite.config.ts:23` vs `admin:19` | larger admin vendor   |
| Dashboard        | `findAll({limit:500})` orders+products every mount; `computeDashboardStats` O(n)×6 | `use-dashboard-stats:19`          | 5000 rows → OOM       |
| Storefront cache | `cached:ProductVM[] limit:100` once never invalidated                              | `product.service:61`              | stale catalog         |
| Product search   | loads all rows then filter `searchKeywords` — GIN index unused                     | `supabase-product.repository:197` | 10k rows → expensive  |
| Cart merge       | per-item updates serially                                                          | `supabase-cart.repository:331`    | 50 items → 50 queries |
| Order hydrate    | **FIXED** N+1 1501→3 trips                                                         | `supabase-order.repository:65`    | — works               |
| Image            | `createObjectURL` never revoked                                                    | `product-image.ts:52`             | leak                  |

---

## 19. RESPONSIVE / MOBILE AUDIT

Admin `AdminLayout:357` drawer vs `aside 220px` — desktop has both (drawer CSS should hide); Dashboard padding `16/20/24`, `MetricGrid 2col→1col`, chart 1col; Settings Inputs stretch. Storefront `prod-list` grid 1fr mobile; `order-card flex` stacked; `qty-btn` touch target unknown (must be ≥44px). `BottomNav` fixed may overlap if padding missing — not verified. No major overflow from static code; runtime touch/iOS safe-area needs verification.

---

## 20. ACCESSIBILITY AUDIT

| Area          | Finding                                                                                                     | Location                                              | Severity |
| ------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| Labels        | `label for order-name` + `id` correctly associated                                                          | `order.tsx:209`                                       | ✓        |
| Buttons       | `ADD TO CART` only when `available` — unavailable skips CTA                                                 | `products.tsx:203`                                    | ✓        |
| Screen reader | `article aria-label name — qty kg`, `aria-live polite` qty, `aria-expanded` orders, `aria-current page` nav | `order.tsx:149`, `OrdersScreen:189`, `AdminLayout:98` | ✓        |
| Modals        | Delete confirm `onClick overlay → close + stopPropagation inner` — missing `role dialog aria-modal`         | `ProductsScreen:204`                                  | P3       |
| Focus         | `AdminNavigation` focus trap unknown                                                                        | —                                                     | Unknown  |
| Touch         | `qty-btn` size unknown                                                                                      | —                                                     | P3       |
| Motion        | `gsap`/`framer-motion` no `prefers-reduced-motion` check                                                    | —                                                     | P4       |

**Overall:** Basics present (labels, alt, aria-live). Missing dialog semantics, focus trap, contrast automated check.

---

## 21. TESTING AUDIT

| Package                         | Tests                                                         | Notes                   |
| ------------------------------- | ------------------------------------------------------------- | ----------------------- |
| auth                            | 107 (deleteAccount removed)                                   | provider, session       |
| product                         | 18 (+7)                                                       | thumbnail/gallery/slug  |
| order                           | 14 (+5 batch 500-order assert 3 queries)                      | batch hydrate           |
| shared                          | 9                                                             | utils                   |
| category/customer/cart/settings | 7/7/8/8                                                       | thin                    |
| **Total**                       | **178/10 packages** `pnpm test` 0 — `PRODUCTION_REPORT.md:12` | `vitest.workspace.ts:3` |

**Covered:** `generateUniqueSlug`, `hydrateRows` batch, `place_cod_order` payload shape, rate limit.
**NOT covered:** RLS policies, RPC PL/pgSQL, image pipeline, SettingsProvider fallback, `App.tsx` gate Playwright, E2E flows 1-4, migration idempotency. CI `ci.yml:43 test --reporter=junit + dorny` enforces `needs:[lint,typecheck,test]` before build — strict gate. No coverage threshold.

**Score:** Unit-good, integration/RLS/E2E-poor.

---

## 22. DOCUMENTATION AUDIT

| Doc                    | Verdict                    | Details                                                                                                    |
| ---------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `README.md`            | **Correct**                | architecture tree, quick start, env, turbo build; subtree still lists `packages/ui` deleted — stale        |
| `ARCHITECTURE.md`      | **Mostly outdated**        | dependency graph lists `ui` — outdated; Edge Functions planned still                                       |
| `DEPLOYMENT.md`        | **Correct and up-to-date** | 3 migration options, Vercel preview/prod, env table, naming `001…018`, rollback, 017 diagnostic — best doc |
| `SECURITY.md`          | **Correct generic**        | zero-trust bullets match impl                                                                              |
| `PRODUCTION_REPORT.md` | **Authoritative current**  | 2026-08-09 probes, 178 tests, `016/017` fix                                                                |
| Inline comments        | **Good**                   | `bootstrap:9` memory-only, `order.repository:56` N+1, `place_cod_order` header                             |

---

## 23. DEAD CODE / DUPLICATION

### Dead code

| Path                                                                                                 | Status                   | Evidence                       |
| ---------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------ |
| `apps/storefront/src/pages/login.tsx`, `verify-otp.tsx`, `forgot-password.tsx`, `reset-password.tsx` | **CONFIRMED DEAD**       | never routed `app.tsx:15`      |
| `lib/` empty dir                                                                                     | **CONFIRMED DEAD**       | 0 entries                      |
| `tmp_playwright_check*.mjs`                                                                          | **CONFIRMED DEAD**       | `.gitignore:68` ignored        |
| `packages/shared/src/domain` rules `account-lockout`, `session-expiry` never invoked                 | **POSSIBLY DEAD**        | `AuthService` never increments |
| `SupabaseAuthProvider.sendPasswordReset` vs `services/auth.service sendEmailOtp`                     | **DUPLICATION / LEGACY** | one dead                       |
| `generateOrderNumber()` `shared/utils:32` vs `OF-YYYY-slice` `order.service:72`                      | **POSSIBLY DEAD**        | only second used               |
| `tailwind.config.ts:4 content packages/ui/src`                                                       | **CONFIRMED DEAD** ref   | `packages/ui` deleted          |
| `EXPO_PUBLIC_*` env + code `process.env.EXPO_PUBLIC_*` `client.ts:28`                                | **LEGACY DEAD**          | RN branch legacy               |
| `auth_sessions`/`auth_devices` tables always empty — `login` never calls `saveSession`               | **POSSIBLY DEAD** data   | decide wire or drop            |

### Duplication source-of-truth

| Duplication                                                             | Files                                                                | Truth                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Pricing `STORE_SETTINGS` vs `shop_settings` vs `calculatePricing`       | `shared/config/settings.ts:48`, `shop_settings`, `order.service:147` | **DB `shop_settings`** truth                     |
| `PENDING_STATUSES` duplicated `dashboard-stats:52` vs `OrdersScreen:15` | `dashboard-stats:52`, `OrdersScreen:15`                              | neither — reconcile to `shared`                  |
| `formatCurrency` shared vs `apps/admin/src/utils/format`                | `shared/utils:1`, `admin/src/utils/format`                           | **Shared** truth (per `PRODUCTION_REPORT.md:83`) |
| Role hierarchy duplicated `permission-matrix:75` vs `role.guard:16`     | `permission-matrix:75`, `role.guard:16`                              | `permission-matrix` truth                        |

---

## 24. CROSS-APPLICATION INCONSISTENCIES

| Area               | Admin                                                                                                                | Storefront                                                                    | Inconsistency Severity                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Product fields     | writes `name,description,price,categoryId,status,stock,unit,minOrderQuantity,featured,thumbnail` `ProductsScreen:72` | `ProductVM {available=stock>0&&ACTIVE, image=thumbnail}` `product.service:51` | **Consistent** — gallery unused both                                          |
| Product status     | `STATUS_FILTERS ALL/ACTIVE/DRAFT/OUT_OF_STOCK/ARCHIVED` `18`                                                         | `loadCache status:ACTIVE` `61`                                                | **Consistent**                                                                |
| Pricing            | number input                                                                                                         | `ProductVM price` used by `calculatePricing`                                  | **Consistent** path but `compareAtPrice` invisible                            |
| Stock              | admin toggle forces stock 1/0                                                                                        | `available` checks stock>0                                                    | **Consistent** but tight coupling                                             |
| Category           | read-only list                                                                                                       | `filters categories.map id→label`                                             | **Consistent** both read-only (no writes anywhere)                            |
| Throttles          | `useProducts limit 50`                                                                                               | `productService limit 100 cache`                                              | **Different limits** — admin sees 50, storefront 100 — P3 pagination mismatch |
| Pending definition | `PENDING_STATUSES VALIDATING,PAYMENT_FAILED,PENDING_PAYMENT` `dashboard-stats:52`                                    | `PENDING_GROUP includes CONFIRMED` `OrdersScreen:19`                          | **Drift P2** — badge vs tab diverge                                           |
| Vite config        | no `manualChunks`                                                                                                    | `vendor+query` chunks `vite.config.ts:23`                                     | **Inconsistent** build                                                        |
| Env list           | `turbo.json` 9 vars                                                                                                  | `shared/config/env.ts` validates 3                                            | **Surface mismatch**                                                          |

---

## 25. COMPLETE BUG REGISTER

| ID      | Severity        | Area             | Problem                                                                                                                                                                                                                                   | Root Cause                                                                                                      | Impact                                                                                   | Confidence                                                                | Evidence                                                                      |
| ------- | --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| BUG-001 | **P0 CRITICAL** | DB/Deploy        | `place_cod_order(jsonb)` missing on live DB → `POST /rpc/place_cod_order` 404 PGRST202                                                                                                                                                    | `013_phase075.sql` never applied to live project                                                                | Guest COD checkout never persists; WhatsApp sent but no order row                        | HIGH                                                                      | `PRODUCTION_REPORT.md:26`, `database/016:45`, `supabase-order.repository:354` |
| BUG-002 | **P0**          | DB/Deploy        | `products` storage bucket missing → `storage 400 NoSuchBucket`                                                                                                                                                                            | `007_storage.sql` never applied                                                                                 | Admin image upload fails; thumbnail URL empty                                            | HIGH                                                                      | `PRODUCTION_REPORT.md:28`, `016:281`, `storage.ts:25`                         |
| BUG-003 | **P1**          | DB/RLS           | `products_select_public` without `GRANT SELECT TO anon,authenticated` → PostgREST returns 0 rows despite RLS PASS                                                                                                                         | `008_rls.sql:35` policy but no `GRANT`                                                                          | Storefront empty catalog despite seeded ACTIVE products                                  | HIGH                                                                      | `database/018:16`, `PRODUCTION_REPORT.md:21 GET /rest/v1/products → []`       |
| BUG-004 | **P1**          | Security/RLS     | Pre-`016` anon carts `session_id IS NOT NULL` + `cart_items_all_anon` allow any anon to read/tamper any guest cart knowing `cart_id`                                                                                                      | `008:212/274` broad USING                                                                                       | Guest cart enumeration/tamper                                                            | HIGH                                                                      | `008:212`, `016:242 tightening`                                               |
| BUG-005 | **P1**          | Storefront       | Dual cart system: Zustand `fresh-catch-cart` localStorage vs `packages/cart` Supabase `carts` tables never synced                                                                                                                         | `services/cart.service:16` local vs `packages/cart` registered but unused (`main.tsx:30` registers, UI ignores) | Server carts always empty; checkout bypasses server validation                           | HIGH                                                                      | `services/cart.service:16`, `supabase-cart.repository:149`                    |
| BUG-006 | **P1**          | Storefront       | `productService` cached 100-item `loadCache` never invalidates (no TTL, no Query invalidation)                                                                                                                                            | `product.service:58 if(cached) return cached`                                                                   | Admin CRUD invisible until hard reload                                                   | HIGH                                                                      | `product.service:58`                                                          |
| BUG-007 | **P2**          | Storefront       | `productService.search/findAll` cap `limit 100` — no pagination, no server search push-down                                                                                                                                               | `product.service:61 findAll({limit:100})` + `supabase-product.repository:197` loads all then filter             | 500+ catalog truncated; large catalog memory load                                        | HIGH                                                                      | `product.service:61`                                                          |
| BUG-008 | **P2**          | Auth             | `SupabaseAuthProvider.getCustomClaims()` `atob(token.split('.')[1])` no signature verification                                                                                                                                            | `supabase-auth.provider:182`                                                                                    | Client can forge `role` claim to render admin UI (RLS still blocks data)                 | HIGH                                                                      | `supabase-auth.provider:181`                                                  |
| BUG-009 | **P2**          | Admin            | `useAdminSession` creates `new SupabaseAuthProvider()` per hook mount vs `getAuthProvider()` singleton → duplicate `onAuthStateChange` + per-instance `refreshInProgressRef`                                                              | `use-admin-session:60`                                                                                          | extra load, parallel refreshes, race                                                     | HIGH                                                                      | `use-admin-session:60`, `services/auth.service:7`                             |
| BUG-010 | **P2**          | Admin            | `bootstrapApp` `persistSession:false` vs `useAdminSession` `provider.getCurrentUser()` → `initSupabase()` without options (defaults `persistSession:true`) — singleton race                                                               | `bootstrap:26` vs `supabase-auth.provider:152`                                                                  | If hook mounts before bootstrap, persisted token read (intent violated)                  | MEDIUM                                                                    | `bootstrap:26`, `client.ts:77 persistSession default true`                    |
| BUG-011 | **P1**          | Admin            | `ProductsScreen:125 handleDelete` guards thumbnail delete with `if(deleteTarget.categoryId)` → if product has no category, orphan thumbnail retained                                                                                      | `ProductsScreen:125`                                                                                            | storage orphans accumulate                                                               | HIGH                                                                      | `ProductsScreen:125`                                                          |
| BUG-012 | **P3**          | Admin            | `pickAndCompressImage` `URL.createObjectURL(blob)` never `revokeObjectURL` per pick → memory leak                                                                                                                                         | `product-image.ts:52`                                                                                           | leak per image pick                                                                      | HIGH                                                                      | `product-image.ts:52`                                                         |
| BUG-013 | **P2**          | Admin/Storefront | `PENDING` definition drift: dashboard `PENDING_STATUSES = VALIDATING,PAYMENT_FAILED,PENDING_PAYMENT` vs orders `PENDING_GROUP includes CONFIRMED`                                                                                         | `dashboard-stats:52` vs `OrdersScreen:15`                                                                       | badge count ≠ tab count (e.g., CONFIRMED counted as pending in Orders but not dashboard) | HIGH                                                                      | `dashboard-stats:52`, `OrdersScreen:19`                                       |
| BUG-014 | **P2**          | Storefront       | `orderNumber = OF-{year}-{Date.now slice -6}` predictable, collision if two orders same 6-digit window; `idempotencyKey = cod-{randomUUID}` random not deterministic → duplicate clicks create duplicate orders (RPC dedup not triggered) | `order.service:72/77`                                                                                           | orderNumber collision, dedup ineffective                                                 | HIGH                                                                      | `order.service:72`                                                            |
| BUG-015 | **P2**          | Admin            | `CategoriesScreen` read-only — `packages/category` repo has no `create/update/delete` — categories only via seed/SQL                                                                                                                      | `supabase-category.repository` reads only                                                                       | Admin cannot self-service categories                                                     | HIGH                                                                      | `category/src/repository` 3 methods only                                      |
| BUG-016 | **P3**          | Admin            | `SettingsScreen` only edits 5 of 14 `shop_settings` fields (`storeName/tagline/whatsapp/deliveryFee/freeAbove`) — missing `address/hours/pincodes/areas/email/phones/radius/foundedYear`                                                  | `SettingsScreen:146` payload + `supabase-settings.repository:62` expects 14                                     | most business values only writable via SQL                                               | HIGH                                                                      | `SettingsScreen:146` vs `supabase-settings.repository:14`                     |
| BUG-017 | **P3**          | Storefront       | `pages/login.tsx                                                                                                                                                                                                                          | forgot                                                                                                          | verify                                                                                   | reset`orphaned — never routed in`app.tsx:14` Routes — dead code confusion | `app.tsx:14` only `/, /products, /order, /contact, *`                         | users cannot reach customer login | HIGH             | `app.tsx:15` vs `glob pages/*` |
| BUG-018 | **P2**          | Storefront       | `order.tsx:70 locStatus dangerouslySetInnerHTML` includes `lat/lng` numbers + static link — safe but flagged as XSS pattern; no `geolocation` options `enableHighAccuracy/timeout`                                                        | `order.tsx:70`                                                                                                  | informational but best-practice flag                                                     | MEDIUM                                                                    | `order.tsx:70`                                                                |
| BUG-019 | **P2**          | Admin            | `AdminLayout:91 STOREFRONT_URL                                                                                                                                                                                                            |                                                                                                                 | '/'`fallback navigates to`/`(dashboard) if`VITE_STOREFRONT_URL` empty                    | `AdminLayout:91`                                                          | View Store opens wrong page in misconfigured env                              | HIGH                              | `AdminLayout:91` |
| BUG-020 | **P2**          | Deployment       | `apps/storefront/vercel.json` absent — storefront deployment unconfigured                                                                                                                                                                 | repo `apps/storefront` none vs `apps/admin/vercel.json:1` present                                               | preview may only deploy admin                                                            | HIGH                                                                      | `read apps/storefront/vercel.json` missing                                    |
| BUG-021 | **P3**          | Deployment       | `apps/admin/vercel.json:5 installCommand "pnpm install"` without `--frozen-lockfile`                                                                                                                                                      | `vercel.json:5`                                                                                                 | lock drift preview vs prod                                                               | HIGH                                                                      | `vercel.json:5`                                                               |
| BUG-022 | **P2**          | Env              | `.env.production:7` and `.env.staging:7` set `VITE_STOREFRONT_URL=http://localhost:3000` for prod                                                                                                                                         | `.env.production:7`                                                                                             | if Vercel env not set, admin links to localhost                                          | HIGH                                                                      | `.env.production:7`                                                           |
| BUG-023 | **P3**          | Tooling          | `vite` version drift: root/admin `6.4.3` vs storefront `6.0.0`                                                                                                                                                                            | `package.json vs apps/storefront/package.json`                                                                  | resolve divergence on Vercel                                                             | MEDIUM                                                                    | `apps/storefront/package.json vite 6.0.0`                                     |
| BUG-024 | **P3**          | Tooling          | `tailwind.config.ts:4 content` globs `packages/ui/src` but `packages/ui` deleted                                                                                                                                                          | `tailwind.config.ts:4`                                                                                          | harmless but stale                                                                       | HIGH                                                                      | `tailwind.config:4`                                                           |
| BUG-025 | **P4**          | Tooling          | `lib/` empty dir placeholder                                                                                                                                                                                                              | `read lib 0 entries`                                                                                            | clutter                                                                                  | HIGH                                                                      | `lib`                                                                         |
| BUG-026 | **P3**          | DB               | `products.thumbnail/gallery` vs `search_keywords GIN` index unused — `search` loads all then filter `name                                                                                                                                 | description`                                                                                                    | `supabase-product.repository:197` + `003:30`                                             | perf waste, index never hit                                               | HIGH                                                                          | `supabase-product.repository:197` |
| BUG-027 | **P3**          | Auth             | `supabase-auth.provider:34 mapSupabaseUser` hardcodes `isAnonymous:false, provider:EMAIL, accountStatus:ACTIVE` ignores `is_anonymous`/`identities`                                                                                       | `supabase-auth.provider:34`                                                                                     | anonymous carts mis-labeled                                                              | MEDIUM                                                                    | `supabase-auth.provider:34`                                                   |
| BUG-028 | **P3**          | Auth             | In-memory rate limiter `Map count>=5 && elapsed<900k` resets on reload                                                                                                                                                                    | `auth/src/service/auth.service:19`                                                                              | bypassable                                                                               | MEDIUM                                                                    | `auth.service:19`                                                             |
| BUG-029 | **P3**          | Performance      | Admin no `manualChunks` vs storefront `vendor+query`                                                                                                                                                                                      | `vite.config.ts` diff                                                                                           | admin vendor larger                                                                      | MEDIUM                                                                    | `apps/admin/vite.config:19`                                                   |
| BUG-030 | **P3**          | A11y             | Delete confirm modal missing `role dialog aria-modal` + focus trap                                                                                                                                                                        | `ProductsScreen:204` overlay                                                                                    | screen reader gap                                                                        | MEDIUM                                                                    | `ProductsScreen:204`                                                          |
| BUG-031 | **P4**          | Performance      | `computeDashboardStats` re-filters 500 orders 6 times (todaySales/income etc.) O(n×6) — fine for 500 but grows linear                                                                                                                     | `dashboard-stats:237`                                                                                           | minor                                                                                    | LOW                                                                       | `dashboard-stats:237`                                                         |
| BUG-032 | **P3**          | Security         | `audit_logs INSERT TO authenticated WITH CHECK true` any auth can insert arbitrary audit row                                                                                                                                              | `002b:106`                                                                                                      | log spam                                                                                 | HIGH                                                                      | `002b:106`                                                                    |
| BUG-033 | **P3**          | DB               | `orders.user_id text` vs `users.id uuid` — FK mismatch, text does not cascade on `auth.users` delete                                                                                                                                      | `002:188` text                                                                                                  | auth order orphanable                                                                    | MEDIUM                                                                    | `002:188`                                                                     |
| BUG-034 | **P3**          | Frontend         | `AdminLayout:378` renders `<AdminNavigation />` always + `isDesktop ? <aside>` → desktop double sidebar (drawer CSS should hide)                                                                                                          | `AdminLayout:378`                                                                                               | potential double nav if CSS fails                                                        | MEDIUM                                                                    | `AdminLayout:378`                                                             |
| BUG-035 | **P4**          | Tooling          | `@types/node ^26.1.1` — Node types latest is `^22.x` — `^26` typo                                                                                                                                                                         | `package.json:54`                                                                                               | install warning                                                                          | MEDIUM                                                                    | `package.json:54`                                                             |
| BUG-036 | **P3**          | Docs             | `README.md:19` tree lists `packages/ui` but deleted; `ARCHITECTURE.md:42` dependency graph includes `ui` — outdated                                                                                                                       | `README:19`, `ARCHITECTURE:42`                                                                                  | onboarding confusion                                                                     | HIGH                                                                      | `README:19`                                                                   |
| BUG-037 | **P3**          | DB               | `shop_settings` 9 columns added by `013` — fallback to `STORE_SETTINGS` silent if DB missing — no error surfacing                                                                                                                         | `supabase-settings.repository:32 coalesces`                                                                     | operator may not notice missing migration                                                | LOW                                                                       | `supabase-settings.repository:32`                                             |

---

## 26. SECURITY FINDINGS

| ID      | Severity    | Vulnerability                                                                                                           | Location                                                                               | Impact                                                                                                       | Confidence | Recommendation                                                                                                                                                                                      |
| ------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-001 | **P1 HIGH** | Anon PII exposure if old `orders_insert_anon/select_anon` policies remain (legacy `011_orders_rls` not tracked)         | `database/008/016` — `016:191` drops 6 anon order policies if present                  | Any anon can `INSERT`/`SELECT` orders via PostgREST, enumerate all customers                                 | HIGH       | Ensure `016` applied; run `010_verify:366 no_anon_order_policies` + `017 diagnostic` (`anon_order_policies` count =0)                                                                               |
| SEC-002 | **P1**      | Overly broad anon cart `SELECT session_id NOT NULL` without `user_id IS NULL`                                           | `008:212`, `008:274` → `016:242` corrects                                              | Anon can read/tamper any guest cart if `cart_id` guessed                                                     | HIGH       | Apply `016`; monitor `carts_select_anon` policy definition                                                                                                                                          |
| SEC-003 | **P2**      | Unsigned JWT claims trusted (`atob` decode) drives `usePermissions`/`RoleGuard`                                         | `supabase-auth.provider:181` `getCustomClaims` `JSON.parse(atob(token.split('.')[1]))` | Forge `role: admin` → render admin UI (data still RLS-blocked but info leak + UX conf)                       | HIGH       | Derive role from `admin_profiles` table only; drop `getCustomClaims` for gating or verify signature via Supabase `auth.getUser`                                                                     |
| SEC-004 | **P2**      | Price tamper — storefront trusts `product.price` at order time, RPC only validates `price>=0` not `== current DB price` | `order.service:68 money(product.price)`, `016:125 IF unit_price <0`                    | Craft request with `unit_price_amount:0` → free order (shipping still)                                       | MEDIUM     | In `place_cod_order`, re-fetch `products.price` for each `product_id` and enforce `ABS(unit_price - db_price) < epsilon` or recalc server totals                                                    |
| SEC-005 | **P2**      | Order id / orderNumber predictable, `idempotencyKey` random not deterministic                                           | `order.service:72 OF-YYYY-slice6`, `77 cod-{uuid}` random per click                    | Predict next orderNumber, duplicate orders not deduped                                                       | MEDIUM     | Replace `orderNumber` with `generateOrderNumber()` (`shared/utils:32 ORD-YYMMDD-XXXX` or DB sequence `order_number` trigger) + deterministic `idempotencyKey = hash(customerPhone+items+timestamp)` |
| SEC-006 | **P3**      | In-memory login rate limit bypassable on reload                                                                         | `packages/auth/src/service/auth.service:19 Map`                                        | Brute force via page reload (server Supabase `too_many_requests` is ultimate gate but client Map not relied) | HIGH       | Rely on Supabase Auth server limit; client Map is UX dedup only — document not security                                                                                                             |
| SEC-007 | **P3**      | `audit_logs INSERT WITH CHECK true` any authenticated can spam audit                                                    | `002b:106`                                                                             | Log pollution                                                                                                | HIGH       | Tighten to `WITH CHECK (actor_id = auth.uid()::text OR is_admin())` or move writes to `SECURITY DEFINER` function                                                                                   |
| SEC-008 | **P3**      | `dangerouslySetInnerHTML` for location status                                                                           | `order.tsx:70`                                                                         | Pattern flag (lat/lng numbers safe but violates policy)                                                      | MEDIUM     | Replace with `<span>{locStatusText}</span><a href={url}>Open in Maps</a>` without HTML                                                                                                              |
| SEC-009 | **P3**      | No reauthentication gate for admin password change                                                                      | `SettingsScreen:188 resetPassword → auth.updateUser({password})`                       | Stolen session can change password without current password                                                  | HIGH       | Call `reauthenticate(currentPassword)` before `updatePassword`; add `currentPassword` field                                                                                                         |
| SEC-010 | **P4**      | `initialsOf` naive split — not security, but `AccessDenied` shows email/phone without mask                              | `AdminLayout:14`, `SettingsScreen:276`                                                 | PII display in UI (expected for admin)                                                                       | LOW        | —                                                                                                                                                                                                   |
| SEC-011 | **P3**      | `storage` bucket `products` public read — intentional but must ensure no private file mistakenly uploaded there         | `016:294 public`                                                                       | —                                                                                                            | —          | Enforce filename prefix `products/{id}/thumbnail.webp` via policy (already `bucket_id='products'` only check, not path) — add `AND (storage.foldername(name))[1]='products'` if stricter            |

---

## 27. ARCHITECTURAL FINDINGS

| ID       | Area             | Finding                                                                                                                                                                                                              | Why It Matters                                                                                              | Recommendation                                                                                                                                                                                         |
| -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ARCH-001 | Data layer       | `supabaseService` thin wrapper with no transaction support — multi-write `createAuthenticated` (`add order + add items ×N + add timeline ×M`) is N+M+1 sequential inserts, not atomic; partial failure orphans order | Orders table partial write leaves orphaned `orders` without `order_items`                                   | Wrap RPC for all order creates (even authenticated) via `place_cod_order` with `user_id` param, or use Postgres transaction via `rpc` that wraps inserts                                               |
| ARCH-002 | State            | Storefront has **two carts**: Zustand local vs Supabase `carts` tables + two product paths (`productService cached` vs `@oceanfresh/product` repo direct)                                                            | Dual source causes split brain; `packages/cart` never tested in UI                                          | Choose one: keep local cart for guest MVP and remove `packages/cart` registration in storefront `main.tsx:30` until customer auth shipped; or migrate storefront to Supabase carts with local fallback |
| ARCH-003 | Auth             | Two auth stacks: `@oceanfresh/auth` `SupabaseAuthProvider` (used by admin) vs storefront direct `getClient().auth.signInWithPassword` (`pages/login.tsx`) bypassing package                                          | Divergent error mapping, session shape, audit events                                                        | Delete `apps/storefront/src/pages/login.tsx` etc. or wire them through `@oceanfresh/auth`                                                                                                              |
| ARCH-004 | Search           | `search` implemented as client-side `Array.filter` (`supabase-product.repository:197`, `use-products:44`, `pages/products:69`) instead of Postgres `GIN on search_keywords` + `pg_trgm`                              | At scale, client filter loads all rows into browser memory; index `idx_products_search_keywords` never used | Push search to DB: `SELECT ... WHERE search_keywords @> ARRAY[term]` or `ilike name%` + trigram; add `limit`                                                                                           |
| ARCH-005 | Config           | `turbo.json` `globalEnv` lists 4 `EXPO_PUBLIC_*` vars legacy RN, `shared/config/env.ts` validates only 3 `VITE_*` — env surface mismatch                                                                             | Cache key polluted; onboarding confusion                                                                    | Prune `EXPO_PUBLIC_*` from `turbo.json:7` after RN branch archived                                                                                                                                     |
| ARCH-006 | Build            | Admin `vite.config.ts` no `manualChunks`, storefront has `vendor+query` chunks — inconsistent bundle strategy                                                                                                        | Admin ships larger JS, slower TTI                                                                           | Add `rollupOptions.output.manualChunks {vendor:[react,react-dom,react-router-dom], query:[@tanstack/react-query]}` to admin like storefront `vite.config:23`                                           |
| ARCH-007 | Schema evolution | `database/` files `002b,013,014,015,016,018` reconcile contracts idempotently; but `010_verify.sql` is the only gate and not in CI `ci.yml:43 test` (unit only)                                                      | DB drift not caught by CI                                                                                   | Add CI job `supabase db lint + verify` or `psql -f database/010_verify.sql` against ephemeral DB (Supabase preview branching)                                                                          |
| ARCH-008 | Types            | Shared types (`Product`, `Order`) duplicate DB enums/columns manually — no `supabase gen types typescript` automation — drift risk (though currently synced)                                                         | Future migration adds column → TypeScript stale                                                             | Add `scripts/gen:types` → `supabase gen types typescript --project-id x --schema public > packages/shared/src/types/database.ts` and derive domain types from it                                       |
| ARCH-009 | Error handling   | `supabaseService` throws raw `error` from `supabase-js`; repositories wrap as `RepositoryError` but lose Supabase code (PGRST*) context                                                                              | UI `errorToMessage` may show generic `Authentication failed` masking `PGRST`                                | Propagate `code`/`statusCode` through `RepositoryError` with `cause`                                                                                                                                   |
| ARCH-010 | Logging          | `createLogger('auth:provider')` used in `SupabaseAuthProvider` but not in `supabaseService` / storage errors — inconsistent                                                                                          | Silent failures hard to debug                                                                               | Standardize logger via `shared/logger` across all infra adapters                                                                                                                                       |

---

## 28. TECHNICAL DEBT

### Critical (blocks prod)

- Apply `016_production_fixes.sql` + `018_grant_products_select.sql` to live project + verify `017_production_diagnostic.sql` — `docs/DEPLOYMENT.md:27 SQL Editor` — 1-time manual, idempotent — without this, §25 BUG-001..003 remain.
- Decide guest vs authenticated cart strategy (ARCH-002) — choose local cart MVP and mark `packages/cart` as future.

### High (major functionality incomplete / risky)

- Wire category write repo or document read-only (BUG-015).
- Expand admin SettingsScreen to full 14 fields or create dedicated `StoreSettingsForm` (BUG-016).
- Replace `atob` claims with `admin_profiles` lookup for gating (SEC-003).
- Fix `ProductsScreen:125` thumbnail delete guard (BUG-011) and `revokeObjectURL` leak (BUG-012).
- Unify `orderNumber`/`idempotencyKey` generation (SEC-005 / BUG-014).

### Medium (maintainability / perf)

- Push search to DB (ARCH-004) and use GIN index.
- Invalidate `productService` cache via `QueryClient` or replace with `useQuery` (BUG-006).
- Add `manualChunks` to admin (ARCH-006).
- Deduplicate `PENDING_STATUSES` (BUG-013), `generateOrderNumber` (BUG-014), `formatCurrency` wrappers, `role hierarchy`.
- Add `reauthenticate` gate to password change (SEC-009).
- Harden `dangerouslySetInnerHTML` (SEC-008) and `audit_logs` policy (SEC-007).
- Normalize vite `6.0.0→6.4.3` and `@types/node ^26→^22`, prune `tailwind` `packages/ui` glob.

### Low (polish / docs)

- Remove `lib/` empty, `tmp_playwright_check*.mjs` probes, `generateOrderNumber` dead.
- Add `role dialog` + focus trap to modals (BUG-030), reduce-motion check.
- Update `README`/`ARCHITECTURE.md` stale `packages/ui` references.
- Add Vercel headers for CSP/HSTS (SEC unknown).

---

## 29. WHAT IS ACTUALLY WORKING

_Only verified via `read` + `grep` + `PRODUCTION_REPORT.md:10` gates green._

✓ `pnpm install --frozen-lockfile` reproducible (lockfile committed, `packageManager pnpm@9.15.4`)
✓ `turbo run typecheck` 11/11, `lint` 11/11 (0 errors), `test` 178/178, `build` 11/11 — `PRODUCTION_REPORT.md:12`
✓ Storefront build `vite build` manualChunks `vendor+query` — `apps/storefront/vite.config:23`
✓ Admin build `vite build` + `vercel.json` `pnpm --filter @oceanfresh/admin build` → `dist`
✓ `pnpm lint:fix` + `prettier-plugin-tailwindcss` + `husky+commitlint` active — `package.json:34`
✓ CI `ci.yml` enforces `lint→typecheck→test→build→audit` on `main` PRs — `ci.yml:62 needs`
✓ Product read via `supabaseService.query` + RLS `products_select_public` — `008:35` + `product.repository:91` with `is_deleted` filter
✓ Order batch hydrate — 500 orders → 3 queries — `supabase-order.repository:65` test-verified
✓ Guest order via `place_cod_order` RPC — `016:45` source of truth, returns `{order,items,timeline}` mapped in `supabase-order.repository:355`
✓ Cart anon tightening post-`016` — `016:242` session-scoped
✓ Storage bucket + policies post-`016` — `016:281` public read + `is_admin()` writes
✓ Storage-first image pipeline — canvas `createImageBitmap → webp 600px 0.7 → storageService.upload → getPublicUrl` — `product-image.ts:68` + `storage.ts:25`
✓ Admin auth real Supabase `signInWithPassword` + `admin_profiles` role check + memory-only `persistSession:false` + `localStorage` purge — `bootstrap:26` + `use-admin-session:103`
✓ Storefront `SettingsProvider` reads `shop_settings default` with `STORE_SETTINGS` fallback — `supabase-settings.repository:32` + `settings-context:20`
✓ Admin `ProductsScreen` CRUD + image upload/remove + delete with `softDelete` + toasts — `ProductsScreen:58`
✓ Admin `OrdersScreen` tabs + search + expand + `NEXT_MOVE` advance → `updateStatus` toast + `invalidate pending-count` — `OrdersScreen:42`
✓ Admin `DashboardScreen` metrics + chart + recent orders + top products with `MetricGrid`/`PerformanceChart` — `DashboardScreen:22`
✓ Admin `CategoriesScreen` search + list `name/slug/description/visibility` — `CategoriesScreen:15`
✓ Admin `SettingsScreen` profile + password + 5 store fields via `upsert default` — `SettingsScreen:104`
✓ Storefront `OrderPage` validate → `persistOrder` (await DB) → `buildWhatsAppMessage` → `window.open wa.me/{orderWhatsApp}` — `order.tsx:98` correct order (previously DB after WhatsApp — fixed per `PRODUCTION_REPORT.md:5`)
✓ `DEployment.md` correctly documents migrations manual + env table — `DEPLOYMENT.md:1` best doc
✓ `en valid` placeholder `.env.example` correct — ` .env.example:2` + `apps/admin/.env.example:12`

---

## 30. WHAT IS NOT WORKING

_Only verified or strongly evidenced failures._

✗ Live Supabase project has empty catalog (`GET /rest/v1/products?select=id → []`) — probe `PRODUCTION_REPORT.md:21` — before `018` GRANT and before any product seeded via admin (no seed products by design)
✗ `POST /rpc/place_cod_order` 404 until `016` — `PRODUCTION_REPORT.md:26`
✗ `GET /storage/v1/bucket products` 400 NoSuchBucket until `016/007` — `PRODUCTION_REPORT.md:28`
✗ Storefront customer auth pages exist but unrouted — `app.tsx:15` — login unreachable
✗ Storefront `productService` never reflects admin edits until reload — cache leak `product.service:58`
✗ Admin categories write — none — `category` package read-only
✗ Admin Settings writes 9 of 14 `shop_settings` columns invisible — `SettingsScreen:146`
✗ Admin pending badge vs orders PENDING tab divergent — `dashboard-stats:52` vs `OrdersScreen:15`
✗ Admin product delete leaves orphan thumbnail if `categoryId` empty — `ProductsScreen:125`
✗ Storefront order dedup ineffective — `order.service:77` random key per click
✗ `place_cod_order` does not validate `unit_price_amount` vs DB current price — price tamper possible `016:125`
✗ `VITE_STOREFRONT_URL=http://localhost:3000` in `.env.production`/`staging` — ` .env.production:7` — would mis-direct if Vercel env not set
✗ `apps/storefront/vercel.json` missing — storefront preview deployment unconfigured
✗ `apps/admin/vercel.json installCommand pnpm install` not frozen — drift risk
✗ No RLS regression tests in CI — security not gated

---

## 31. WHAT IS UNKNOWN

_Explicitly cannot be verified from repository alone._

- Production Vercel environment variable values (`VITE_SUPABASE_URL/ANON_KEY/STORAGE_BUCKET/STOREFRONT_URL` dashboard settings) — not in repo — `.env.production` local is `localhost` placeholder; actual prod may be correct but unverified without Vercel API.
- Actual live RLS behavior on `xgocuseqgfnrrwribnaj` until `017_production_diagnostic.sql` run in SQL Editor — `PRODUCTION_REPORT.md:18` says probes did anon REST checks 2026-08-09 but that snapshot is stale after possible `016/018` apply.
- Real payment provider behavior — COD only, no gateway; WhatsApp delivery relies on `wa.me` external availability + user phone `orderWhatsApp 918509597935` correctness.
- External service availability: Supabase REST/storage latency, `createImageBitmap` browser support (Safari fallback?), `navigator.geolocation` permission rates.
- CSP/HSTS header enforcement — Vercel dashboard headers not in repo; `ARCHITECTURE.md:71` claims CSP but no `vercel.json headers` or `vite` `headers` config in repo.
- Admin bootstrapping of first `super_admin` — `009_seed.sql:62` manual insert requires operator Supabase Dashboard `auth.admin.createUser` — unknown if already done; `admin_profiles` row count verified only via `PRODUCTION_REPORT.md` probe (orders/admin logs anon blocked healthy, but count of `admin_profiles` not probed).
- Bundle sizes/real LCP/INP/CLS — no Lighthouse CI in `ci.yml`.
- Playwright checks `tmp_playwright_check*.mjs` gitignored — local manual probes only, not CI E2E.

Do not assume these are healthy.

---

## 32. DEPENDENCY GRAPH

```
                          ┌─────────────┐
                          │ Turbo 2.0.6 │  build dependsOn ^build
                          └──────┬──────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
  ┌─────▼──────┐           ┌─────▼──────┐           ┌────▼─────┐
  │  @oceanfresh/shared   ◄─┤  @oceanfresh/supabase ◄─┤ supabase-js 2.45
  │  (leaf)      │           │  client/service/storage │  (only deps in infra)
  └─────┬───────┘           └─────┬──────┘           └──────────┘
        │                         │
  ┌─────┴─────────────────────────────────────────────┐
  │  @oceanfresh/{product,category,order,cart,customer,settings,customer}
  │  → each depends on shared + supabase (supabaseService + storage)
  └─────┬─────────────────────────────────────────────┘
        │
  ┌─────▼────────────────────────┐
  │  @oceanfresh/auth            │  depends on shared+supabase + tanstack query
  │  SupabaseAuthProvider etc.   │  (10 exports: repo/providers/service/permissions…)
  └─────┬────────────────────────┘
        │
  ┌─────▼──────────────┐   ┌─────────────────┐
  │  @oceanfresh/admin │   │ @oceanfresh/storefront
  │  → shared,supabase │   │ → shared,supabase,auth?,product,order…
  │  + auth,product,order,category,settings  │  + cart,category,order,product,settings
  └────────────────────┘   └─────────────────┘

Critical dependencies (SPOF):
• `packages/supabase/src/service.ts` `supabaseService` — all repos depend; `initSupabase` singleton — if `createClient` misconfigured (URL/anonKey), every read fails.
• `packages/supabase/src/storage.ts` `STORAGE_BUCKET=products` — all image ops; bucket missing breaks admin upload + storefront image URLs.
• `database/006_functions.sql is_admin()` — all RLS admin checks depend; if function broken or `admin_profiles` row missing, admin sees empty lists despite data.
• `database/shop_settings default row` — `SettingsProvider` + admin SettingsScreen + `order. freeDeliveryAbove/deliveryFee` depend; missing row throws `NotFoundError` (`supabase-settings.repository:87`) fallback to constants but operator may not notice.
• `packages/shared/src/config/settings.ts STORE_SETTINGS` constants — storefront pricing fallback when DB unreachable.
• `pnpm-workspace.yaml` `workspace:*` — all workspace deps resolved at build; lock drift breaks Vercel.

External SPOF: Supabase Cloud project `xgocuseqgfnrrwribnaj` (single region), `wa.me` WhatsApp handoff (orders still persisted even if wa.me down, but comms fail).
```

---

## 33. ROOT-CAUSE MAP

_Groups related bugs into root causes to prevent symptom-only fixes._

**ROOT CAUSE A: Live DB < repo migrations drift (missing `013→016→018`)**

- Causes: BUG-001 `place_cod_order` 404, BUG-002 bucket 400, BUG-003 GRANT missing → empty catalog, BUG-004 broad anon carts (pre-016), plus contract C-004..C-006 reconciliation columns missing
- Results: storefront empty + orders fail + admin uploads fail, even though local `pnpm build` green
- Fix: Apply `016_production_fixes.sql` then `018_grant_products_select.sql` idempotently; run `017_production_diagnostic.sql` + `010_verify.sql` until `FINAL_VERDICT pass`.
- Doc: `PRODUCTION_REPORT.md:16` + `docs/DEPLOYMENT.md:27` manual steps

**ROOT CAUSE B: Dual cart/product state (local vs server)**

- Causes: BUG-005 dual carts `Zustand local` vs `packages/cart` Supabase, BUG-006 cache never invalidates, BUG-007 limit 100 cap, ARCH-002/ARCH-004 client search vs GIN
- Results: storefront never uses server carts (server tables empty), admin edits stale until reload, future customer auth will conflict
- Fix: (Pick) Keep local cart MVP + remove `packages/cart` registration until auth, OR migrate storefront to Supabase carts with local fallback; unify product fetch via `useQuery` + invalidate on admin mutations.

**ROOT CAUSE C: Auth split — admin real, storefront guest-only + orphan pages**

- Causes: BUG-017 orphan login pages, BUG-009/010 per-hook Provider + bootstrap race, SEC-003 `atob` claims, BUG-028 in-memory rate limit
- Results: no customer order history, JWT claim forgery renders admin UI (RLS blocks data), two password-reset flows
- Fix: Delete orphan storefront auth pages or wire through `@oceanfresh/auth`; deduplicate Provider singleton; drop `atob` gating; document Map limit as non-security.

**ROOT CAUSE D: Build/deploy surface mismatch**

- Causes: BUG-020 missing storefront `vercel.json`, BUG-021 not frozen install, BUG-022 `localhost` in prod env files, BUG-023 vite drift, BUG-024 stale `packages/ui` glob, + no migration CI (ARCH-007)
- Results: preview deploys incomplete, env mis-direct, lock drift, DB drift not caught
- Fix: Add `apps/storefront/vercel.json`, change `installCommand` to `pnpm install --frozen-lockfile`, correct `.env.production` `VITE_STOREFRONT_URL` to prod, align vite `6.4.3`, add CI verify job (`010_verify` vs ephemeral DB).

**ROOT CAUSE E: Business schema incomplete admin UX**

- Causes: BUG-015 read-only categories, BUG-016 partial settings, BUG-013 pending drift, BUG-011/012 thumbnail orphan/leak, SEC-009 no reauth, ARCH-001 non-atomic order create
- Results: admin cannot self-service full business config, pending counts confuse operator, storage orphans leak, password change without reauth
- Fix: Add/write `category` repo + UI, expand SettingsScreen to 14 fields, unify `PENDING` constant in `shared`, fix `ProductsScreen:125` guard + `revokeObjectURL`, gate password change with `reauthenticate`, wrap order create in RPC transaction.

---

## 34. PRIORITY MATRIX

### DO FIRST (P0/P1 — security / prod blockers, 1–2 days)

- [ ] Apply `016_production_fixes.sql` + `018_grant_products_select.sql` to live Supabase via SQL Editor, rerun `017` + `010_verify` until `pass` — fixes BUG-001..003, SEC-001/002 — owner DB operator — validates §29 working list.
- [ ] Create storefront `vercel.json` (`framework vite, buildCommand pnpm --filter @oceanfresh/storefront build, outputDirectory dist`) + change admin `installCommand` to `pnpm install --frozen-lockfile` — BUG-020/021.
- [ ] Fix `ProductsScreen:125` thumbnail delete guard: `if (true)` or check `thumbnail` not `categoryId` — BUG-011.
- [ ] Seed real products via Admin UI (no `009` product seed) — `PRODUCTION_REPORT.md:102` step 2 — unblocks §29 not-working empty catalog.

### DO NEXT (P1/P2 — major functionality, 1 week)

- [ ] Unify pending definition: move `PENDING_STATUSES` to `packages/shared/src/config/order.ts` single export, replace inline `dashboard-stats:52` + `OrdersScreen:15` — BUG-013.
- [ ] Fix cart strategy: either delete `apps/storefront/src/pages/login.tsx` etc. orphan file set (BUG-017) and document guest-only, OR wire storefront to Supabase carts — pick within ARCH-002 decision record.
- [ ] Replace `order.service` `orderNumber/idempotencyKey` with deterministic: `shared/utils generateOrderNumber()` or DB sequence + `hash(phone+itemsSorted+date)` for idempotency — SEC-005/BUG-014.
- [ ] Fix `productService` cache invalidation: replace `cached` var with `useQuery(['products', {status:ACTIVE}])` + `queryClient.invalidateQueries(['products'])` on admin `onSuccess` — BUG-006.
- [ ] Add `atob` → `admin_profiles` role source: keep `getCustomClaims` only for debug, remove `usePermissions`/`RoleGuard` gating on it — SEC-003.
- [ ] Expand Admin SettingsScreen to 14 fields or link to SQL for remaining — BUG-016.

### DO LATER (P2/P3 — architectural / perf / polish, 1–2 weeks)

- [ ] Push search to DB: `supabase-product.repository.search` `ilike name%` or `search_keywords @>` + `pg_trgm` index `idx_products_search_keywords` — ARCH-004/BUG-026.
- [ ] Add `manualChunks` to admin `vite.config.ts` mirroring storefront — ARCH-006/BUG-029.
- [ ] `product-image.ts:52` `URL.revokeObjectURL` on success/error + `compressToWebp` null guard — BUG-012.
- [ ] Harden `order.tsx:70 locStatus` away from `dangerouslySetInnerHTML`, tighten `audit_logs` policy `002b:106` with `actor_id = uid`, gate password change with `reauthenticate` — SEC-007..009.
- [ ] Align vite `6.4.3`, `@types/node ^22`, prune `tailwind` `packages/ui` glob, `lib/` empty, `EXPO_PUBLIC_*` from `turbo.json` — BUG-023..025.
- [ ] Correct `.env.production/.staging` `VITE_STOREFRONT_URL` to prod URL (or remove and rely on Vercel env) — BUG-022.
- [ ] Fix `AdminLayout:378` double sidebar conditional (keep only `isDesktop ? aside : drawer` not both) — BUG-034.

### OPTIONAL (P4 / debt, backlog)

- [ ] Wire `auth_sessions`/`audit_logs` event emission or drop tables `002b` if truly dead — `packages/auth/src/repository/supabase-auth.repository` `saveSession`/`saveAuditLog`.
- [ ] Add Lighthouse + Playwright E2E flows §29 (Flow 1–4) to CI after migration verify.
- [ ] Update `README`/`ARCHITECTURE.md` stale `packages/ui` references — BUG-036.
- [ ] Add `role dialog` to modals, `prefers-reduced-motion` for `gsap`/`framer-motion` — BUG-030.

Prioritize by: Security > prod blockers > data integrity > core functionality > maintainability > UX.

---

## 35. IMPLEMENTATION PLAN

### PHASE 0 — Safety / Backup

- **Objective:** No destructive migration loss.
- **Files/areas:** `database/*`, Supabase Dashboard → `Preview Branching` or `pg_dump`.
- **Dependencies:** none.
- **Tasks:** Create Supabase preview branch or `pg_dump` backup; snapshot `admin_profiles` count; snapshot `storage.buckets products` list; confirm `.env.production` values.
- **Validation:** backup restores in staging.
- **Result:** rollback possible.

### PHASE 1 — Critical Fixes (ROOT CAUSE A)

- **Objective:** Storefront reads + guest orders + admin uploads work on live project.
- **Files:** `database/016_production_fixes.sql`, `database/018_grant_products_select.sql`, `database/017_production_diagnostic.sql`, `database/010_verify.sql`, `apps/storefront/src/services/product.service.ts`.
- **Dependencies:** Phase 0.
- **Tasks:** (1) In SQL Editor run `016` (idempotent) → `GRANT SELECT` (2) run `018` → (3) run `017` verify `products_select_public PASS` `place_cod_order_exists PASS` `storage bucket products PASS` `no_anon_order_policies PASS` → (4) run `010_verify` → `FINAL_VERDICT true` → (5) `supabase db push --include-all` dry-run in CI preview.
- **Validation:** `GET /rest/v1/products?select=id` with anon returns `[]` or seeded rows (not 401), `POST /rpc/place_cod_order` 200, `PUT /storage/v1/object/products/...` 200 for admin session.
- **Result:** §30 "not working" bucket/RPC/grant cleared.

### PHASE 2 — Architecture / Contracts

- **Objective:** Single source of truth for env, types, pricing.
- **Files:** `turbo.json`, `packages/shared/src/config/env.ts`, `packages/shared/src/config/settings.ts`, `database/013_phase075.sql` (already applied by Phase 1).
- **Tasks:** Prune `EXPO_PUBLIC_*` from `turbo.json` `globalEnv` after documenting legacy; add `gen:types` script `supabase gen types typescript`; centralize `PENDING_STATUSES` in `shared`.
- **Validation:** `pnpm typecheck` still 11/11, `pnpm lint` 0.
- **Result:** env drift closed, type drift mitigated.

### PHASE 3 — Database / Security Hardening

- **Objective:** Close remaining RLS + input validation gaps.
- **Files:** `database/002b_auth_tables.sql` `audit_logs` policy, `database/016_production_fixes.sql` `place_cod_order` function edit (price re-validate), `apps/storefront/src/services/order.service.ts`.
- **Tasks:** Patch `place_cod_order` to `SELECT price FROM products WHERE id=product_id` and reject if `|unit_price - db_price| > 0.01`; tighten `audit_logs INSERT WITH CHECK (actor_id::uuid = auth.uid())`; replace `atob` role gating with `admin_profiles` lookup; add `reauthenticate` before `updatePassword`.
- **Validation:** `supabase test` of RPC with tampered price returns `raise exception`; `usePermissions` now hits DB.
- **Result:** SEC-003..005 closed.

### PHASE 4 — Admin

- **Objective:** Admin can fully operate catalog + settings without SQL.
- **Files:** `apps/admin/src/screens/new/*`, `apps/admin/src/hooks/use-products.ts`, `packages/category/src/repository/supabase-category.repository.ts`, `packages/settings/src/repository/supabase-settings.repository.ts`.
- **Tasks:** Implement `SupabaseCategoryRepository.create/update/delete/reorder` + Category CRUD UI (or confirm read-only decision ADR); expand `SettingsScreen` fields (address/hours/pincodes/areas/email/radius etc.) wired to `supabase-settings.repository.updateSettings`; fix `ProductsScreen:125` guard → `if (thumbnail)`; revoke object URL; unify `PENDING` constant.
- **Validation:** Create category via UI → appears in `products.tsx` filters; edit settings → storefront `DeliveryChecker`/`Footer` reflect.
- **Result:** BUG-015/016/013/011/012 fixed.

### PHASE 5 — Storefront

- **Objective:** Cart + catalog reliable for guests.
- **Files:** `apps/storefront/src/services/{product,order,cart}.service.ts`, `apps/storefront/src/pages/products.tsx`, `apps/storefront/src/pages/order.tsx`, `apps/storefront/src/app.tsx`.
- **Tasks:** Replace `cached` with `useQuery` + `staleTime 5m`; replace `OF-YYYY-slice` with `shared generateOrderNumber` + deterministic `idempotencyKey`; push `search` to DB; delete orphan `pages/login.tsx` etc. or wire through `@oceanfresh/auth`; decide local vs Supabase cart (ADR) and implement.
- **Validation:** Admin edit → storefront reflects within 5 min or on `invalidate`; duplicate `Place Order` clicks produce single DB row; `POST /rest/v1/products?search=` uses index.
- **Result:** BUG-005..007/014/017 closed.

### PHASE 6 — Testing

- **Objective:** Critical business protected by automated checks.
- **Files:** `database/010_verify.sql` (run in CI), new `tests/rls/*.test.ts` with `supabase-js` anon/auth/admin matrix, `tests/rpc/place_cod_order.test.ts`, `packages/*/tests` expanded, `vitest.workspace.ts`.
- **Tasks:** Add CI job `verify: sql: psql -f 010_verify.sql + 017_diagnostic` against preview DB; add RLS policy tests (anon cannot SELECT orders, can SELECT ACTIVE products, cart anon scope); add `place_cod_order` price-tamper + idempotency tests; add Playwright E2E for Flow 1–4.
- **Validation:** `pnpm test:coverage` thresholds enforced in CI.
- **Result:** §21 coverage moves from unit-good to integration-good.

### PHASE 7 — Performance

- **Objective:** Bundle + query costs reasonable at 5k+ catalog.
- **Files:** `apps/admin/vite.config.ts` (`manualChunks`), `packages/product/src/repository/supabase-product.repository.ts` (`search` push-down), `packages/cart/src/repository/supabase-cart.repository.ts` (batch `merge`), `apps/storefront/src/services/product.service.ts` (pagination).
- **Tasks:** Add admin `manualChunks`; convert `search` to DB; batch cart merge via `update IN` + single `totals` recalc; add product pagination `findAll({limit, offset})` wired to UI infinite scroll or pages.
- **Validation:** Lighthouse LCP <2s, INP <100ms, bundle <150KB initial.
- **Result:** §18 perf issues closed.

### PHASE 8 — Deployment

- **Objective:** Preview ≈ prod, deployments reproducible.
- **Files:** `apps/storefront/vercel.json` (new), `apps/admin/vercel.json` (frozen), `.env.production/.staging` (correct `STOREFRONT_URL`), `tailwind.config.ts`, `package.json`.
- **Tasks:** Create `apps/storefront/vercel.json` mirroring admin; change `installCommand` to `pnpm install --frozen-lockfile`; align `vite 6.4.3` + `@types/node ^22`; prune `packages/ui` glob + `EXPO_*` envs; correct prod env URLs; add Vercel `headers` CSP/HSTS if not dashboard-managed.
- **Validation:** `vercel build` locally with frozen lockfile; preview deploy verifies `VITE_STOREFRONT_URL` points to preview URL; `pnpm outdated -r` clean.
- **Result:** §12 risks mitigated; `pnpm deploy:production` reproducible.

### PHASE 9 — Final Verification

- **Objective:** Prove §29 working + §30 not-working cleared against live project.
- **Files:** `database/017_production_diagnostic.sql`, `PRODUCTION_REPORT.md` checklist.
- **Tasks:** Run full gates `pnpm typecheck/lint/test/build` clean; seed 2 real products via Admin (one ACTIVE, one OUT_OF_STOCK with thumbnail); verify storefront shows 1 ACTIVE; place guest order via `OrderPage` → confirm admin Orders PENDING tab badge + detail + `Advance` → `DELIVERED`; confirm storage object `products/{id}/thumbnail.webp` exists; confirm anon REST `GET /rest/v1/orders` blocked 401.
- **Validation:** `017` verdict rows + manual probe table matches expected §2 healthy state; create `PRODUCTION_REPORT v1.6` or `docs/audit-verify-1.5.md` artifact.
- **Result:** Definition of Done (§36) fully green.

Do NOT implement these phases during the audit — this plan is for the next implementer.

---

## 36. DEFINITION OF DONE

_The project is genuinely production-ready only when ALL checks pass:_

- [ ] `pnpm typecheck` 11/11 pass, `pnpm lint` 11/11 0 errors — `ci.yml:62 needs lint/typecheck`
- [ ] `pnpm test` 178+/178 (expanded with RLS/RPC/E2E) pass with `test:coverage` thresholds met — `vitest.workspace.ts`
- [ ] `pnpm build` 11/11 (both apps `dist` non-empty, `sourcemap false`, `manualChunks` present in both `vite.config.ts`) — `turbo.json:15`
- [ ] `database/010_verify.sql` `FINAL_VERDICT true` on live project (13 tables, 6 enums, ≥24 indexes, 12 triggers, RLS enabled, ≥20 policies, `no_anon_order_policies` pass, `place_cod_order` exists, `storage bucket products` exists) — `010_verify.sql:544`
- [ ] `database/017_production_diagnostic.sql` verdict not `EMPTY CATALOG` beyond seeded empty (or shows seeded `ACTIVE` count ≥1 after seeding) + `place_cod_order_exists true` + `storage bucket true` — `017:103`
- [ ] Anon probe `GET /rest/v1/products?select=id` returns `[]` or seeded ACTIVE rows (not 401) — `PRODUCTION_REPORT.md:21`
- [ ] Anon probe `POST /rest/v1/rpc/place_cod_order` 200 with valid payload — not 404 PGRST202 — `016:45`
- [ ] `GET /storage/v1/bucket/products` lists bucket with `public true file_size 5MB` — `016:281`
- [ ] Anon probe `GET /rest/v1/orders?select=id` blocked (401 or 0 with RLS) and `GET /storage/v1/object/public/products/...` public read succeeds — `008:307/016:294`
- [ ] Admin login memory-only: reload → unauthenticated → login → `Dashboard/Products/Orders/Categories/Settings` reachable, `AccessDenied` for non-admin `user_id` — `app.tsx:52` gate + `use-admin-session:121` `isAdmin`
- [ ] Admin CRUD: create product with image → thumbnail.webp in Storage public URL stored in `products.thumbnail` → storefront shows product → search filters → delete leaves no orphan (fixed `ProductsScreen:125`) — e2e Flow 1
- [ ] Admin edit product → storefront reflects within `staleTime` (no hard reload required) — cache invalidation
- [ ] Admin delete/archived product → `is_deleted true` + `ARCHIVED` not visible to storefront `status ACTIVE` query — `product.repository:302`
- [ ] Storefront Flow 4: browse → search → add to cart → adjust qty → checkout with `{name,phone,address}` → `persistOrder` → admin sees `VALIDATING` → Advance chain → `DELIVERED` with timeline — `order.tsx:98` + `OrdersScreen:21 NEXT_MOVE`
- [ ] WhatsApp handoff opens `https://wa.me/{orderWhatsApp}` with order summary after DB success — `order.service:207` + `order.tsx:105`
- [ ] Shop settings read: storefront `DeliveryChecker` pincode check and `Footer` reflect live `shop_settings default` `whatsapp_number/pincodes` etc., not only `STORE_SETTINGS` fallback — `settings-context:23` `supabase-settings.repository:32`
- [ ] No `any` in core (`eslint @typescript-eslint/no-explicit-any error`), no `VITE_SERVICE_ROLE` in bundle, no secrets committed (`.env*` ignored, `git log` clean) — `eslint.config.mjs:38` + ` .gitignore:14`
- [ ] Vercel preview deploys both apps with `installCommand pnpm install --frozen-lockfile`, `outputDirectory dist`, `framework vite`, `NODE_VERSION 20`, env `VITE_*` set via dashboard — `apps/admin/vercel.json:1` + new `apps/storefront/vercel.json`
- [ ] Docs: `README` quick start `pnpm install --frozen-lockfile; pnpm dev; pnpm build` works copy-paste; `DEPLOYMENT.md` migration steps `016/018` verified; `PRODUCTION_REPORT v1.6` artifact created
- [ ] Dead code removed: orphan `apps/storefront/pages/login.tsx` etc. either removed or routed; `lib/` empty removed; `packages/ui` glob pruned — `§23`
- [ ] Bug register BUG-001..003 verified closed in live env (see above probes) — `§25`

Only then tag `v1.5` or `v1.6` and promote to production.

---

## 37. ONE-PAGE AI HANDOFF — READ THIS FIRST

# AI HANDOFF — READ THIS FIRST

**PROJECT:** OceanFresh — premium seafood D2C (Jhargram) — storefront + admin — Supabase + Vercel — monorepo `E:\FRESH CATCH` — `https://github.com/StarPijush/OCEAN-FRESH-2.0` `@ab46f81`

**PURPOSE:** Guest browsing of ACTIVE products → Zustand cart → COD order → `place_cod_order` RPC → admin order pipeline → WhatsApp handoff to shop `918509597935`.

**STACK:** Node `>=20` pnpm `9.15.4` Turborepo `2.0.6` React `19.2.3` Vite `6.4.3`/`6.0.0` Tailwind `3.4.6` Zustand `4.5.4` TanStack Query `5.51` Supabase `2.45` Postgres `pgcrypto+pg_trgm` PostgREST RLS Storage `products` bucket — types `typescript 5.5.3` `zod` `rhf` `eslint 9` `vitest 2` `playwright 1.45` `msw 2.3`.

**ARCHITECTURE:**

```
USER → STOREFRONT (:3000, DefaultLayout → Home/Products/Order/Contact)
       → Zustand fresh-catch-cart (local) + productService cache100 → place_cod_order RPC (anon)
       → SettingsProvider (shop_settings) → WhatsApp wa.me/{orderWhatsApp}
ADMIN → ADMIN (:3001, bootstrap memory-only) → Login/OTP → useAdminSession (admin_profiles role check)
       → Dashboard(500rows)/Products(CRUD+WebP storage)/Orders(NEXT_MOVE)/Categories(read)/Settings(upsert default)
INFRA → @oceanfresh/supabase client(service.ts CRUD+rpc, storage.ts products bucket) → Supabase Cloud xgocuseqgfnrrwribnaj (anon key, RLS is_admin(), RPC SECURITY DEFINER)
```

Flow details §3.3; map §4; package graph `shared (leaf) ← supabase ← {product,category,order,cart,customer,settings} ← auth ← apps` — §32.

**APPLICATIONS:**

- `apps/storefront/src/main.tsx:27` → `App.tsx` 4 routes `SettingsProvider` → `services/product.service` `loadCache limit100` never invalidated, `services/order.service persistOrder` `OF-YYYY-slice + cod-{uuid}` random, `services/cart.service` local only.
- `apps/admin/src/main.tsx:23` `bootstrapApp()` `persistSession:false + purge sb-*` → `app.tsx` gate `useAdminSession` `error|unauthenticated→login|authenticated isAdmin?drawer|AccessDenied` → `screens/new/*`.

**DATABASE:**

- 13 tables `categories(24) products(33) users admin_profiles auth_sessions/devices audit_logs orders order_items timeline carts cart_items shop_settings(id=default)` — `002_tables.sql:75` + `002b_auth_tables.sql:10`
- 6 enums `product_status etc.` — `002:9`
- Indexes 24+ `idx_products_slug unique` etc. `003:1`; constraints `004:1`; triggers `update_updated_at_column` `005:1`; `is_admin() SECURITY DEFINER search_path public` `006:15`; RLS 20+ policies `008:1`; seed `shop_settings default + 4 categories` `009:1`; verify `010_verify.sql:1` (FINAL_VERDICT).
- **Migrations:** `001 extensions → 018_grant_products_select.sql` — `016_production_fixes` (re-creates `place_cod_order`, tightens carts, bucket+policies `is_admin()`) idempotent — `016:1`; `014/015` reconcile `updated_at/event` cols; `018` `GRANT SELECT ON products TO anon,authenticated` — `018:16`.

**AUTH:**

- Supabase Auth `auth.users` → `admin_profiles.user_id UNIQUE auth.users.id` `role admin|super_admin` `CHECK` `004:110` — `is_admin()` checked per RLS + `useAdminSession` DB lookup (`withTimeout 10s`) — `hooks/use-admin-session.ts:62`.
- Admin memory-only `initSupabase({persistSession:false})` `bootstrap.ts:26` — reload forces login. Storefront guest-only, no customer auth routed (`pages/login.tsx` orphan `app.tsx:15`).

**RLS:**

- `products/categories SELECT TO public USING status=ACTIVE AND !is_deleted` `008:35/12` (+ `018 GRANT` required for anon data). `orders anon 0` — only `authenticated SELECT own + INSERT own + admin FOR ALL` — before `016` anon policies must be dropped `016:191`. `carts anon SELECT/INSERT` tightened `016:242` to `session_id NOT NULL AND user_id IS NULL`. `shop_settings SELECT public true`. `storage.objects products SELECT public, INSERT/UPDATE/DELETE authenticated is_admin()` `016:294`.

**STORAGE:**

- Bucket `products` `public true 5MB image MIME` `016:281`. `packages/supabase/src/storage.ts:23 upload(path,file upsert:true) → getPublicUrl` → Admin `product-image.ts:99 upload products/{id}/thumbnail.webp` → `products.thumbnail` public URL. `remove` best-effort. Orphan if `categoryId` guard `ProductsScreen:125`.

**DEPLOYMENT:**

- Local `pnpm dev` :3000+:3001 `vite port strictPort`. CI `ci.yml:1` `lint/typecheck/test → build → audit` `needs [lint,typecheck,test]` `NODE_VERSION 20`. Vercel `apps/admin/vercel.json:1` `build pnpm --filter @oceanfresh/admin build output dist framework vite install pnpm install` (no frozen). `apps/storefront/vercel.json` **missing**. Migrations **manual** SQL Editor `supabase link + db push` — `DEPLOYMENT.md:27` — not auto on Vercel. `turbo.json:3 globalEnv` 9 vars incl `EXPO_PUBLIC_*` stale.

**CURRENT STATE:**

- Code gates `typecheck/lint/test/build` **11/11 green 178/178** `PRODUCTION_REPORT.md:12`. Both apps build/boot `OceanFresh`/`OceanFresh Admin`.
- Live DB **until `016/018` applied**: `GET /rest/products → []` empty (no GRANT/seed), `POST /rpc/place_cod_order → 404 PGRST202`, `GET /storage/bucket products → 400 NoSuchBucket` — `PRODUCTION_REPORT.md:21`. Catalog empty by design until admin seeds via UI. Core flows work **after** operator runs `016`+`018`+`009 seed admin`.

**CRITICAL PROBLEMS (P0/P1):**

- **DB drift** `place_cod_order missing + bucket missing + GRANT missing` → prod order/upload/browse blocked — `BUG-001..003` `016:45/281/018:16` — _run `016`+`018` idempotently + verify `017/010`_.
- **Broad anon carts pre-016** `session_id IS NOT NULL` alone — guest cart tamper — `SEC-002` `008:212`.
- **Dual cart** local Zustand vs Supabase `carts` tables unsynced — `BUG-005` `services/cart.service:16` vs `packages/cart`.
- **Unsigned JWT `atob`** drives `usePermissions` — forgeable until RLS — `SEC-003` `supabase-auth.provider:181`.
- **Orphan storefront auth pages** `pages/login.tsx etc. not routed` — `BUG-017` `app.tsx:15`.

**HIGH PRIORITY PROBLEMS (P2):**

- `productService cache never invalidates` `BUG-006` `58`, pagination 100 cap `BUG-007` `61`, `PENDING` definition drift dashboard vs orders `BUG-013` `52 vs 19`, `orderNumber/idempotencyKey` predictable/random `SEC-005` `order.service:72`, categories read-only `BUG-015`, settings 5/14 fields `BUG-016` `146`, thumbnail delete guard `ProductsScreen:125`, `dangerouslySetInnerHTML` location `order.tsx:70`.

**IMPORTANT FILES (source-of-truth):**

- `E:\FRESH CATCH\database/010_verify.sql:551` — final verdict for migrations health
- `E:\FRESH CATCH\database/017_production_diagnostic.sql` — live read-only diff (never modifies)
- `E:\FRESH CATCH\database/016_production_fixes.sql:335` — idempotent RPC + cart tightening + bucket
- `E:\FRESH CATCH\database/018_grant_products_select.sql:16` — GRANT fix
- `E:\FRESH CATCH\packages/order/src/repository/supabase-order.repository.ts:331` — `createGuestOrder → rpc`
- `E:\FRESH CATCH\packages/supabase/src/service.ts:72` — `add` stamps `created_at+updated_at`
- `E:\FRESH CATCH\apps/admin/src/bootstrap.ts:26` — memory-only auth
- `E:\FRESH CATCH\packages/auth/src/hooks/use-admin-session.ts:49` — admin gate truth
- `E:\FRESH CATCH\apps/storefront/src/services/order.service.ts:45` — guest order builder
- `E:\FRESH CATCH\docs/DEPLOYMENT.md` — migration runbook

**SOURCE OF TRUTH:**

- Business values: **DB `shop_settings default`** — `013:278` expands; `STORE_SETTINGS` `shared/config/settings.ts:38` fallback only.
- Admin role: **DB `admin_profiles.role`** via `is_admin()` — not JWT.
- RLS: **DB policies** `008+016` — not client guards.
- Migrations: **`database/*.sql`** sequenced `001→018` idempotent.

**KNOWN RISKS:**

- `place_cod_order` price tamper (`unit_price>=0` but not vs `products.price`) — `SEC-004` — patch RPC to re-fetch price.
- Refresh/OTP split flows — deduplicate.
- `VITE_STOREFRONT_URL=http://localhost:3000` in `.env.production` would mis-link if Vercel env not set — `BUG-022`.

**UNKNOWN AREAS (verify in prod):**

- Vercel env values for `VITE_*` (not in repo), live RLS until probes re-run, CSP/HSTS headers (no `vercel.json headers`), Supabase project region latency, `wa.me` availability, bundle LCP/CLS (no Lighthouse CI), first `super_admin` row existence `009_seed:62` manual.

**NEXT PHASE:** **PHASE 1 — Apply `016`+`018` → Verify `017`+`010` → Seed products via Admin → E2E Flow 1–4 (see §35 Phases 0–9 plan).** Prioritize §34 DO FIRST (P0/P1) before DO NEXT.

**DO NOT TOUCH (until ADR):**

- Change RLS away from `is_admin()` to client checks; expose `service_role` as `VITE_*`; bypass `place_cod_order` with direct `INSERT` from anon; delete `auth_sessions` tables without confirming empty.

**IMPORTANT CONSTRAINTS:**

- This audit **read-only evidence** — `HIGH` = direct `read:file:line`, `MEDIUM` = strongly indicated but needs runtime, `LOW` = potential from repo alone. Do not inflate severity. Every bug has `file:line` evidence — §25. Do not modify anything until PHASE 0 backup.

---

## APPENDIX

### A. Probes ran by `PRODUCTION_REPORT.md` (2026-08-09, `xgocuseqgfnrrwribnaj anon REST`)

| Check                                           | Result                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| `GET /rest/v1/products?select=id`               | `[]` — catalog empty (table present, RLS healthy)                  |
| `GET /rest/v1/categories`                       | 4 rows (ACTIVE)                                                    |
| `POST /rest/v1/rpc/place_cod_order`             | **404 PGRST202 — function does not exist** (013 partially applied) |
| `GET /storage/v1/bucket`                        | **no bucket — 007 never applied** (400 NoSuchBucket)               |
| `shop_settings` row                             | exists (013 settings cols applied)                                 |
| orders / admin_profiles / audit_logs anon reads | blocked by RLS (healthy)                                           |
| env files                                       | all same project, anon key only, no service-role anywhere          |

Rerun after PHASE 1 and expect RPC 200, bucket `products` exists, products visible.

### B. Commands to verify live health

```bash
# In Supabase SQL Editor — paste database/017_production_diagnostic.sql (read-only)
# Then:
psql "postgresql://..." -f database/010_verify.sql  # expect FINAL_VERDICT pass true

# anon probes (with anon key)
curl -s "https://xgocuseqgfnrrwribnaj.supabase.co/rest/v1/products?select=id" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" | jq
curl -s -X POST "https://xgocuseqgfnrrwribnaj.supabase.co/rest/v1/rpc/place_cod_order" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" -d '{"payload":{"order":{"order_number":"T-verify"},"items":[{"quantity":1,"unit_price_amount":100,"subtotal_amount":100}],"timeline":[]}}' | jq
```

### C. How to create the initial admin

Follow `database/009_seed.sql:62` Option A (Dashboard Auth > Add User → copy UUID → `INSERT admin_profiles (user_id, full_name, role) VALUES ('<UUID>','Shop Owner','super_admin')` + `INSERT users (...)`) or Option B `supabaseAdmin.auth.admin.createUser`.

### D. File inventory evidence

- Monorepo `pnpm-workspace.yaml:1` `apps/* packages/*`, `turbo.json:15`, `eslint.config.mjs:38 @typescript-eslint/no-explicit-any error`, `tsconfig.json:7 strict`
- Apps `apps/admin/package.json:30 @supabase/supabase-js ^2.45.0` `react 19.2.3` `vite 6.4.3` ; `apps/storefront/package.json` `vite 6.0.0` drift, `zustand 4.5.4` `framer-motion 11.3`
- Packages `packages/supabase/package.json exports ./storage`, `packages/auth package.json` 10 exports, `vitest.workspace.ts:3` 10 workspaces
- `apps/admin/vercel.json:1` present, `apps/storefront/vercel.json` absent — evidence BUG-020

---

_End of OCEANFRESH v1.5 COMPLETE AUDIT — read once and understand the entire project, its dependencies, problems, risks, and exact next steps. Audited 2026-09-01, zero assumptions, every finding evidenced by `file:line`._
