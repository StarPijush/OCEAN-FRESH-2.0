# Phase 0.5 Audit — Production-Readiness Review

**Scope:** Full monorepo (storefront + admin + 6 shared packages) runtime-stability pass against the live Supabase database.
**Mode:** code-only changes; no DB migrations applied to live (optional SQL files generated).
**Result:** `pnpm install --frozen-lockfile`, `typecheck`, `lint`, `build`, `test` — all gr# ROLE

You are a Principal Software Engineer, Staff Software Architect, Supabase Expert, TypeScript Expert, Security Engineer, DevOps Engineer, and Production Readiness Reviewer.

You are responsible for completing Phase 0.75 of the OceanFresh project.

This project has already completed:

✅ Phase 0 — Build Recovery

- Install passes
- TypeScript passes
- ESLint passes
- Turbo build passes

✅ Phase 0.5 — Runtime Stabilization

- Database enums aligned
- Order persistence implemented
- COD-only architecture
- Settings provider added
- Dead code removed
- Environment cleaned

Your ONLY responsibility is to finish the remaining production blockers.

DO NOT redesign the architecture.

DO NOT improve UI.

DO NOT optimize performance.

DO NOT introduce new features.

DO NOT rewrite working code.

Only finish the missing production foundation.

---

PROJECT

OceanFresh Premium Seafood Platform

Architecture

• Turborepo
• React
• TypeScript
• Vite
• Supabase
• Repository Pattern
• Dependency Injection

Business

Cash On Delivery ONLY

There are NO online payments.

Never introduce:

❌ Razorpay

❌ Stripe

❌ PayPal

❌ Payment Gateway

❌ Payment Verification

❌ Payment Webhooks

❌ Refund APIs

❌ Payment SDKs

❌ Payment Sessions

Order Flow

Customer

↓

Add to Cart

↓

Checkout

↓

Place COD Order

↓

Order saved in Supabase

↓

WhatsApp notification

↓

Admin receives order

↓

Admin confirms

↓

Preparing

↓

Out For Delivery

↓

Delivered

---

MISSION

Complete Phase 0.75.

Do not stop until every production blocker has been solved.

---

STEP 1

Audit Everything First

Before changing anything,

scan the complete project.

Verify

• Authentication
• Authorization
• Supabase
• RLS
• Repository Registration
• Settings
• Order Flow
• Environment
• Admin Dashboard

Produce a report.

Then begin fixing issues.

---

STEP 2

Replace Fake Admin Authentication

Current implementation is NOT production ready.

Remove

localStorage login

hardcoded users

fake sessions

plaintext passwords

legacy auth service

Replace everything with

Supabase Auth

Requirements

Secure login

Secure logout

Persistent session

Session refresh

Protected routes

Role validation

Admin profile lookup

Only authenticated admins may access the dashboard.

Never duplicate authentication logic.

Use only @oceanfresh/auth.

---

STEP 3

Authorization

Every admin action must be protected.

Products

Orders

Categories

Settings

Dashboard

Analytics

All require authenticated admin users.

Never trust the client.

Authorization must use the authenticated session.

---

STEP 4

Row Level Security

Inspect every table.

Verify

orders

products

categories

shop_settings

profiles

admin_profiles

cart

customers

Ensure policies are correct.

Apply missing SQL migrations when required.

Especially verify

Guest users

↓

Can place COD orders

Authenticated admins

↓

Can manage orders

Authenticated admins

↓

Can update settings

Customers

↓

Cannot access admin data

No table should accidentally expose sensitive data.

---

STEP 5

Complete Order Pipeline

Verify the entire flow.

Customer

↓

Checkout

↓

Validation

↓

Order Repository

↓

Supabase

↓

Order Stored

↓

Admin Dashboard

↓

Admin Updates Status

↓

Customer Tracking

Every step must work.

Never allow silent failures.

Generate meaningful errors.

---

STEP 6

Settings System

Remove every remaining hardcoded value.

The database becomes the single source of truth.

Store

Store Name

Store Address

Business Hours

WhatsApp Number

Delivery Charge

Free Delivery Limit

Support Email

Delivery Radius

Pincodes

Areas

Storefront

↓

Reads database

Admin

↓

Updates database

↓

Storefront automatically reflects changes.

No duplicated settings.

---

STEP 7

Resolve Data Drift

Search for conflicting values.

Examples

WhatsApp Number

Store Address

Business Hours

Delivery Charge

Delivery Radius

Free Delivery Threshold

Store Name

Every value must exist in exactly one place.

If duplicates exist,

remove them.

---

STEP 8

Repository Validation

Verify every repository.

ProductRepository

OrderRepository

SettingsRepository

CategoryRepository

CartRepository

CustomerRepository

AuthRepository

Ensure

Registered

Injected

Resolved

Typed

Working

No stubs.

No fallbacks.

---

STEP 9

Error Handling

Every API call must

Return typed results

Handle Supabase errors

Handle network errors

Handle authorization failures

Handle validation failures

Never swallow exceptions.

Never fail silently.

---

STEP 10

Environment Audit

Validate

.env.example

.env.local

production variables

Supabase URLs

Anon Key

Service Key

Missing variables

Unused variables

Incorrect variables

Generate a report.

---

STEP 11

Production Verification

Mentally verify

Storefront

Browse products

Search

Categories

Cart

Checkout

Place COD Order

Admin

Login

Dashboard

Orders

Products

Settings

Logout

Database

Orders saved

Settings saved

Status updated

Everything must function correctly.

---

STEP 12

Testing

Create or update tests for

Authentication

Order creation

Settings update

Repository methods

Critical business logic

Do not reduce existing coverage.

---

STEP 13

Final Production Audit

Generate a complete report.

Remaining Issues

Security Risks

Database Risks

Architecture Risks

Performance Risks

Operational Risks

Technical Debt

Deployment Risks

Every issue must include

Severity

Location

Reason

Recommendation

---

STRICT RULES

Never use

as any

ts-ignore

eslint-disable

temporary fixes

mock authentication

hardcoded users

hardcoded settings

duplicate repositories

duplicate business logic

Never redesign architecture.

Never change UI.

Never optimize performance.

Never introduce payment gateways.

Never add features unrelated to production readiness.

---

SUCCESS CRITERIA

This phase is complete ONLY IF

✓ Real Supabase authentication is implemented

✓ Admin authorization is secure

✓ Orders persist correctly

✓ RLS policies work correctly

✓ Settings save to the database

✓ Storefront reflects settings changes

✓ No hardcoded business values remain

✓ All repositories work

✓ No silent runtime failures exist

✓ Critical tests pass

✓ Production audit completed

Finally perform a full end-to-end verification.

Customer places a COD order.

↓

Order appears in Supabase.

↓

Admin logs in securely.

↓

Admin sees the order.

↓

Admin updates the status.

↓

Settings changes immediately affect the storefront.

If any step fails,

stop,

identify the root cause,

fix it,

re-test,

and continue until every step succeeds.

Only then declare:

"PHASE 0.75 COMPLETE — PRODUCTION FOUNDATION READY"

Do not stop early.

Do not skip verification.een (8/8 workspace projects).

---

## 1. Problems found

### 1.1 Enum mismatch — TypeScript vs live DB

| Problem                                                                                                                                                | Severity                                                                                      | Location                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| TS enums were lowercase/mixed (e.g. `confirmed`, `out_for_delivery`) while the live DB enums are UPPERCASE (`VALIDATING`, `CONFIRMED`, `DELIVERED`, …) | **High** — any repository write/read of `status`/`unit` would silently violate DB constraints | `packages/shared/src/types/{order,product,category,cart}.ts`                                                            |
| Admin UI compared statuses against legacy strings (`'pending'`, `'processing'`) that had no overlap with the enum                                      | **High** — filters, counts, badges broken                                                     | `apps/admin/src/services/order.service.ts`, `stats.service.ts`, `pages/orders.tsx`, `OrderDetailModal.tsx`, `Badge.tsx` |
| Storefront new orders would be built with invalid statuses                                                                                             | **High** "Run `order -> status` has no overlap"                                               | `order.service.ts`, `order.tsx`                                                                                         |

### 1.2 Storefront orders were not persisted

| Problem                                                                             | Severity                                                           | Location                                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| Order flow was WhatsApp-only stub; no DB record of a placed order                   | **High** — no fulfilment data in admin                             | `apps/storefront/src/pages/order.tsx`, `order.service.ts` |
| `useCreateOrder` was a broken stub (`create({} as Order)`)                          | **Medium** — creates garbage rows if called                        | `packages/order/src/queries/order.mutations.ts`           |
| Live `orders` RLS has **no anonymous INSERT policy** — guest COD orders are blocked | **High (gated)** — persistence best-effort until migration applied | `database/008_rls.sql`                                    |

### 1.3 Payments scaffolding — dead but present

| Problem                                                                                                                                                | Severity                                      | Location                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------- |
| `updatePayment` in order repository/service                                                                                                            | **Low** (never called) but added surface area | `packages/order/src/repository/*`, `service/*` |
| `PaymentStatus` / `PaymentMethod` / `IPaymentGateway` domain boilerplate, `FeatureFlag.PAYMENTS`, `VITE_FEATURE_PAYMENTS`, `checkout-button` component | **Low**                                       | various                                        |
| No payment gateway exists — WhatsApp/COD only (correct, but scaffolding implied otherwise)                                                             | —                                             | —                                              |

### 1.4 Business settings scattered as magic numbers/strings

| Problem                                                                             | Severity                                                  | Location                                                                             |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| WhatsApp number `919876543210` hardcoded in ~5 files                                | **Medium** — one source to update every store rename/move | `FloatingWhatsApp.tsx`, `Footer.tsx`, `contact.tsx`, `order.tsx`, `order.service.ts` |
| Delivery fee `40` / free-above `500` hardcoded                                      | **Medium**                                                | `order.tsx`, `order.service.ts`, admin settings defaults                             |
| Two **conflicting** store addresses ("Fish Market" vs "Main Market")                | **Low**                                                   | `Footer.tsx` vs `contact.tsx`                                                        |
| Hours, email, pincodes, delivery areas hardcoded                                    | **Low/Medium**                                            | `contact.tsx`, `pincode.service.ts`                                                  |
| Admin Settings page localStorage-only with magic defaults; **does not write to DB** | **Medium**                                                | `apps/admin/src/services/settings.service.ts`                                        |

### 1.5 Admin authentication is fake

| Problem                                                                                                                                                       | Severity                    | Location                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| Admin login is a localStorage simulation: plaintext `admin_profile` password, `admin_logged_in` flag, fake OTP via `alert()` (OTP surface removed in Phase 0) | **Critical** for production | `apps/admin/src/services/auth.service.ts`, `hooks/useAdminAuth.ts` |
| `@oceanfresh/auth` is a dependency but wired nowhere                                                                                                          | **—**                       | `apps/admin/package.json`                                          |
| Because admin auth is fake, admin **cannot** satisfy `is_admin()` RLS → cannot write `shop_settings`                                                          | **High (gated)**            | `apps/admin`                                                       |

### 1.6 Environment/config sprawl

| Problem                                                                                                                | Severity                     | Location                                                    |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------- |
| 11 unneeded `VITE_*` vars (`VITE_ENVIRONMENT`, `VITE_FEATURE_*`, `VITE_SENTRY_DSN`, …) referenced nowhere but `env.ts` | **Low** — misleading surface | `packages/shared/src/config/env.ts`, `.env.*`, `turbo.json` |

### 1.7 Dead packages / layers / scripts

| Problem                                                                                                                         | Severity | Location                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- |
| `packages/ui`, `packages/settings` unused by any app                                                                            | **Low**  | `packages/ui`, `packages/settings`           |
| Full domain/service/components/queries/hooks/events/stores layers in cart/order/product unused (apps only import `/repository`) | **Low**  | `packages/{cart,order,product}/src`          |
| `features` + `monitoring` + extra `validators` in shared unused                                                                 | **Low**  | `packages/shared/src`                        |
| MFA stubs + test, `geolocation.service`, unused `cartService`                                                                   | **Low**  | `packages/auth/src/mfa`, storefront services |
| Legacy `scripts/migrations/001_initial_schema.sql` superseded by `database/*.sql`                                               | **Low**  | `scripts/`                                   |
| Broken root scripts (`circular`, `lighthouse`, `analyze`, `test:e2e`) — tools not installed / no config                         | **Low**  | root `package.json`                          |

### 1.8 Data drift discovered

| Problem                                                                      | Severity                                                    | Location                                                            |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| DB seed WhatsApp `918509597935` **differs** from code default `919876543210` | **High if DB wins** — orders/support go to the wrong number | `database/009_seed.sql` vs `packages/shared/src/config/settings.ts` |

---

## 2. How each was fixed

1. **Enums** — aligned all TS enums to the DB's UPPERCASE values in `packages/shared/src/types/{order,product,category,cart}.ts`. Rebuilt the admin status layer on the real enum: `STATUS_LABELS` (all 15 statuses), `NEXT_STATUS` chain `VALIDATING→CONFIRMED→PROCESSING→OUT_FOR_DELIVERY→DELIVERED`, `getNextStatus`, `isCancellable`, `PENDING_STATUSES`, and typed `Badge`/filters/stats. `DELIVERED` is terminal (no `CASH_COLLECTED`).
2. **Order persistence** — added `persistOrder(data, entries, pricing, location)` building a complete `Order` (source `CHECKOUT`, status `VALIDATING`, COD payment summary, item + customer/shipping/billing snapshots, timeline # ROLE

You are a Principal Software Engineer, Staff Software Architect, Supabase Expert, TypeScript Expert, Security Engineer, DevOps Engineer, and Production Readiness Reviewer.

You are responsible for completing Phase 0.75 of the OceanFresh project.

This project has already completed:

✅ Phase 0 — Build Recovery

- Install passes
- TypeScript passes
- ESLint passes
- Turbo build passes

✅ Phase 0.5 — Runtime Stabilization

- Database enums aligned
- Order persistence implemented
- COD-only architecture
- Settings provider added
- Dead code removed
- Environment cleaned

Your ONLY responsibility is to finish the remaining production blockers.

DO NOT redesign the architecture.

DO NOT improve UI.

DO NOT optimize performance.

DO NOT introduce new features.

DO NOT rewrite working code.

Only finish the missing production foundation.

---

PROJECT

OceanFresh Premium Seafood Platform

Architecture

• Turborepo
• React
• TypeScript
• Vite
• Supabase
• Repository Pattern
• Dependency Injection

Business

Cash On Delivery ONLY

There are NO online payments.

Never introduce:

❌ Razorpay

❌ Stripe

❌ PayPal

❌ Payment Gateway

❌ Payment Verification

❌ Payment Webhooks

❌ Refund APIs

❌ Payment SDKs

❌ Payment Sessions

Order Flow

Customer

↓

Add to Cart

↓

Checkout

↓

Place COD Order

↓

Order saved in Supabase

↓

WhatsApp notification

↓

Admin receives order

↓

Admin confirms

↓

Preparing

↓

Out For Delivery

↓

Delivered

---

MISSION

Complete Phase 0.75.

Do not stop until every production blocker has been solved.

---

STEP 1

Audit Everything First

Before changing anything,

scan the complete project.

Verify

• Authentication
• Authorization
• Supabase
• RLS
• Repository Registration
• Settings
• Order Flow
• Environment
• Admin Dashboard

Produce a report.

Then begin fixing issues.

---

STEP 2

Replace Fake Admin Authentication

Current implementation is NOT production ready.

Remove

localStorage login

hardcoded users

fake sessions

plaintext passwords

legacy auth service

Replace everything with

Supabase Auth

Requirements

Secure login

Secure logout

Persistent session

Session refresh

Protected routes

Role validation

Admin profile lookup

Only authenticated admins may access the dashboard.

Never duplicate authentication logic.

Use only @oceanfresh/auth.

---

STEP 3

Authorization

Every admin action must be protected.

Products

Orders

Categories

Settings

Dashboard

Analytics

All require authenticated admin users.

Never trust the client.

Authorization must use the authenticated session.

---

STEP 4

Row Level Security

Inspect every table.

Verify

orders

products

categories

shop_settings

profiles

admin_profiles

cart

customers

Ensure policies are correct.

Apply missing SQL migrations when required.

Especially verify

Guest users

↓

Can place COD orders

Authenticated admins

↓

Can manage orders

Authenticated admins

↓

Can update settings

Customers

↓

Cannot access admin data

No table should accidentally expose sensitive data.

---

STEP 5

Complete Order Pipeline

Verify the entire flow.

Customer

↓

Checkout

↓

Validation

↓

Order Repository

↓

Supabase

↓

Order Stored

↓

Admin Dashboard

↓

Admin Updates Status

↓

Customer Tracking

Every step must work.

Never allow silent failures.

Generate meaningful errors.

---

STEP 6

Settings System

Remove every remaining hardcoded value.

The database becomes the single source of truth.

Store

Store Name

Store Address

Business Hours

WhatsApp Number

Delivery Charge

Free Delivery Limit

Support Email

Delivery Radius

Pincodes

Areas

Storefront

↓

Reads database

Admin

↓

Updates database

↓

Storefront automatically reflects changes.

No duplicated settings.

---

STEP 7

Resolve Data Drift

Search for conflicting values.

Examples

WhatsApp Number

Store Address

Business Hours

Delivery Charge

Delivery Radius

Free Delivery Threshold

Store Name

Every value must exist in exactly one place.

If duplicates exist,

remove them.

---

STEP 8

Repository Validation

Verify every repository.

ProductRepository

OrderRepository

SettingsRepository

CategoryRepository

CartRepository

CustomerRepository

AuthRepository

Ensure

Registered

Injected

Resolved

Typed

Working

No stubs.

No fallbacks.

---

STEP 9

Error Handling

Every API call must

Return typed results

Handle Supabase errors

Handle network errors

Handle authorization failures

Handle validation failures

Never swallow exceptions.

Never fail silently.

---

STEP 10

Environment Audit

Validate

.env.example

.env.local

production variables

Supabase URLs

Anon Key

Service Key

Missing variables

Unused variables

Incorrect variables

Generate a report.

---

STEP 11

Production Verification

Mentally verify

Storefront

Browse products

Search

Categories

Cart

Checkout

Place COD Order

Admin

Login

Dashboard

Orders

Products

Settings

Logout

Database

Orders saved

Settings saved

Status updated

Everything must function correctly.

---

STEP 12

Testing

Create or update tests for

Authentication

Order creation

Settings update

Repository methods

Critical business logic

Do not reduce existing coverage.

---

STEP 13

Final Production Audit

Generate a complete report.

Remaining Issues

Security Risks

Database Risks

Architecture Risks

Performance Risks

Operational Risks

Technical Debt

Deployment Risks

Every issue must include

Severity

Location

Reason

Recommendation

---

STRICT RULES

Never use

as any

ts-ignore

eslint-disable

temporary fixes

mock authentication

hardcoded users

hardcoded settings

duplicate repositories

duplicate business logic

Never redesign architecture.

Never change UI.

Never optimize performance.

Never introduce payment gateways.

Never add features unrelated to production readiness.

---

SUCCESS CRITERIA

This phase is complete ONLY IF

✓ Real Supabase authentication is implemented

✓ Admin authorization is secure

✓ Orders persist correctly

✓ RLS policies work correctly

✓ Settings save to the database

✓ Storefront reflects settings changes

✓ No hardcoded business values remain

✓ All repositories work

✓ No silent runtime failures exist

✓ Critical tests pass

✓ Production audit completed

Finally perform a full end-to-end verification.

Customer places a COD order.

↓

Order appears in Supabase.

↓

Admin logs in securely.

↓

Admin sees the order.

↓

Admin updates the status.

↓

Settings changes immediately affect the storefront.

If any step fails,

stop,

identify the root cause,

fix it,

re-test,

and continue until every step succeeds.

Only then declare:

"PHASE 0.75 COMPLETE — PRODU# ROLE

You are a Principal Software Engineer, Staff Software Architect, Supabase Expert, TypeScript Expert, Security Engineer, DevOps Engineer, and Production Readiness Reviewer.

You are responsible for completing Phase 0.75 of the OceanFresh project.

This project has already completed:

✅ Phase 0 — Build Recovery

- Install passes
- TypeScript passes
- ESLint passes
- Turbo build passes

✅ Phase 0.5 — Runtime Stabilization

- Database enums aligned
- Order persistence implemented
- COD-only architecture
- Settings provider added
- Dead code removed
- Environment cleaned

Your ONLY responsibility is to finish the remaining production blockers.

DO NOT redesign the architecture.

DO NOT improve UI.

DO NOT optimize performance.

DO NOT introduce new features.

DO NOT rewrite working code.

Only finish the missing production foundation.

---

PROJECT

OceanFresh Premium Seafood Platform

Architecture

• Turborepo
• React
• TypeScript
• Vite
• Supabase
• Repository Pattern
• Dependency Injection

Business

Cash On Delivery ONLY

There are NO online payments.

Never introduce:

❌ Razorpay

❌ Stripe

❌ PayPal

❌ Payment Gateway

❌ Payment Verification

❌ Payment Webhooks

❌ Refund APIs

❌ Payment SDKs

❌ Payment Sessions

Order Flow

Customer

↓

Add to Cart

↓

Checkout

↓

Place COD Order

↓

Order saved in Supabase

↓

WhatsApp notification

↓

Admin receives order

↓

Admin confirms

↓

Preparing

↓

Out For Delivery

↓

Delivered

---

MISSION

Complete Phase 0.75.

Do not stop until every production blocker has been solved.

---

STEP 1

Audit Everything First

Before changing anything,

scan the complete project.

Verify

• Authentication
• Authorization
• Supabase
• RLS
• Repository Registration
• Settings
• Order Flow
• Environment
• Admin Dashboard

Produce a report.

Then begin fixing issues.

---

STEP 2

Replace Fake Admin Authentication

Current implementation is NOT production ready.

Remove

localStorage login

hardcoded users

fake sessions

plaintext passwords

legacy auth service

Replace everything with

Supabase Auth

Requirements

Secure login

Secure logout

Persistent session

Session refresh

Protected routes

Role validation

Admin profile lookup

Only authenticated admins may access the dashboard.

Never duplicate authentication logic.

Use only @oceanfresh/auth.

---

STEP 3

Authorization

Every admin action must be protected.

Products

Orders

Categories

Settings

Dashboard

Analytics

All require authenticated admin users.

Never trust the client.

Authorization must use the authenticated session.

---

STEP 4

Row Level Security

Inspect every table.

Verify

orders

products

categories

shop_settings

profiles

admin_profiles

cart

customers

Ensure policies are correct.

Apply missing SQL migrations when required.

Especially verify

Guest users

↓

Can place COD orders

Authenticated admins

↓

Can manage orders

Authenticated admins

↓

Can update settings

Customers

↓

Cannot access admin data

No table should accidentally expose sensitive data.

---

STEP 5

Complete Order Pipeline

Verify the entire flow.

Customer

↓

Checkout

↓

Validation

↓

Order Repository

↓

Supabase

↓

Order Stored

↓

Admin Dashboard

↓

Admin Updates Status

↓

Customer Tracking

Every step must work.

Never allow silent failures.

Generate meaningful errors.

---

STEP 6

Settings System

Remove every remaining hardcoded value.

The database becomes the single source of truth.

Store

Store Name

Store Address

Business Hours

WhatsApp Number

Delivery Charge

Free Delivery Limit

Support Email

Delivery Radius

Pincodes

Areas

Storefront

↓

Reads database

Admin

↓

Updates database

↓

Storefront automatically reflects changes.

No duplicated settings.

---

STEP 7

Resolve Data Drift

Search for conflicting values.

Examples

WhatsApp Number

Store Address

Business Hours

Delivery Charge

Delivery Radius

Free Delivery Threshold

Store Name

Every value must exist in exactly one place.

If duplicates exist,

remove them.

---

STEP 8

Repository Validation

Verify every repository.

ProductRepository

OrderRepository

SettingsRepository

CategoryRepository

CartRepository

CustomerRepository

AuthRepository

Ensure

Registered

Injected

Resolved

Typed

Working

No stubs.

No fallbacks.

---

STEP 9

Error Handling

Every API call must

Return typed results

Handle Supabase errors

Handle network errors

Handle authorization failures

Handle validation failures

Never swallow exceptions.

Never fail silently.

---

STEP 10

Environment Audit

Validate

.env.example

.env.local

production variables

Supabase URLs

Anon Key

Service Key

Missing variables

Unused variables

Incorrect variables

Generate a report.

---

STEP 11

Production Verification

Mentally verify

Storefront

Browse products

Search

Categories

Cart

Checkout

Place COD Order

Admin

Login

Dashboard

Orders

Products

Settings

Logout

Database

Orders saved

Settings saved

Status updated

Everything must function correctly.

---

STEP 12

Testing

Create or update tests for

Authentication

Order creation

Settings update

Repository methods

Critical business logic

Do not reduce existing coverage.

---

STEP 13

Final Production Audit

Generate a complete report.

Remaining Issues

Security Risks

Database Risks

Architecture Risks

Performance Risks

Operational Risks

Technical Debt

Deployment Risks

Every issue must include

Severity

Location

Reason

Recommendation

---

STRICT RULES

Never use

as any

ts-ignore

eslint-disable

temporary fixes

mock authentication

hardcoded users

hardcoded settings

duplicate repositories

duplicate business logic

Never redesign architecture.

Never change UI.

Never optimize performance.

Never introduce payment gateways.

Never add features unrelated to production readiness.

---

SUCCESS CRITERIA

This phase is complete ONLY IF

✓ Real Supabase authentication is implemented

✓ Admin authorization is secure

✓ Orders persist correctly

✓ RLS policies work correctly

✓ Settings save to the database

✓ Storefront reflects settings changes

✓ No hardcoded business values remain

✓ All repositories work

✓ No silent runtime failures exist

✓ Critical tests pass

✓ Production audit completed

Finally perform a full end-to-end verification.

Customer places a COD order.

↓

Order appears in Supabase.

↓

Admin logs in securely.

↓

Admin sees the order.

↓

Admin updates the status.

↓

Settings changes immediately affect the storefront.

If any step fails,

stop,

identify the root cause,

fix it,

re-test,

and continue until every step succeeds.

Only then declare:

"PHASE 0.75 COMPLETE — PRODUCTION FOUNDATION READY"

Do not stop early.

Do not skip verification.CTION FOUNDATION READY"

Do not stop early.

Do not skip verification.entry, location URL in notes, `cod-<uuid>` idempotency key) persisted via `getOrderRepository().create(order)`. `order.tsx` now validates (shared `validateForm`), prices (shared `calculatePricing`), persists, then sends WhatsApp. Errors degrade gracefully (WhatsApp still sent). Deleted the `useCreateOrder` stub. Generated `database/011_orders_rls.sql` (optional, anon INSERT/SELECT) to close the RLS gap. 3. **Payments removal** — removed `updatePayment` from repo interface/impl/service/test; removed `FeatureFlag.PAYMENTS` (whole features module), `VITE_FEATURE_PAYMENTS` (whole env feature set), `checkout-button`; the `PaymentStatus`/`PaymentMethod`/`IPaymentGateway` files went away with the dead-layer removal. `PaymentSummary` + `order.payment` are kept (they carry `method: 'COD'` in persisted orders). Payment statuses remain in the `OrderStatus` enum because the DB enum includes them. 4. **Settings** — created `packages/shared/src/config/settings.ts` (`STORE_SETTINGS`: WhatsApp, delivery, name/address/hours/email/pincodes/areas) as the single source of defaults. Storefront reads the live `shop_settings` row via Supabase (`settingsService.getSettings()`) with fallback to `STORE_SETTINGS` on any error; provides them app-wide via `SettingsProvider`/`useSettings()`. Replaced all hardcodes (FloatingWhatsApp, Footer, contact, order, pincode, admin settings defaults). Generated `database/012_settings.sql` (optional key-value model) as the future replacement. 5. **Auth** — **NOT fixed this phase** (see §3). Kept the UI; documented as next-phase work. 6. **Env trim** — `env.ts` reduced to the 3 Supabase vars; `.env*`, `.env.example`, and `turbo.json` env lists cleaned. 7. **Dead-code removal** — deleted `packages/ui`, `packages/settings`, the unused layers in `packages/{cart,order,product}`, `shared/features`, `shared/monitoring`, unused `shared/validators` (kept only `loginSchema`/`registerSchema`/`resetPasswordSchema` used by retained auth package), `geolocation.service`, unused `cartService`, auth `mfa/` + `mfa.test`, `scripts/`, and the broken root scripts. Kept the self-contained repository tests. Updated `vitest.workspace.ts`, `eslint.config.mjs`, package exports/deps, and the lockfile. 8. **Data drift** — not resolved by code (it is a data question, see §3.4).

---

## 3. What to change in the future (ordered by impact)

### 3.1 Critical

1. **Real admin authentication** — wire `apps/admin` login to Supabase Auth + `admin_profiles` / `is_admin()`, remove plaintext `admin_profile` password storage, replace `admin_logged_in` with a real session. This unblocks orders/settings admin operations behind RLS.
2. **Apply `database/011_orders_rls.sql`** so guest COD orders persist (currently best-effort). Without it the admin Orders page has no data source beyond WhatsApp messages.
3. **Admin writes to `shop_settings`** — once real auth exists, make the Settings page write `whatsapp_number`/`delivery_charge_amount`/`delivery_free_above` to the DB so changes reach the storefront (today admin overrides stay in the browser).

### 3.2 High

4. **Resolve the WhatsApp-number drift** (`919876543210` code vs `918509597935` DB seed). Confirm which is the real shop number and make `STORE_SETTINGS`/seed agree; otherwise orders/support silently go to the wrong number.
5. **Error monitoring + alerting** — the `monitoring` module was removed as dead code; there is no Sentry/error tracking in production. Add an error tracker if the shop goes live.
6. **Test coverage for the new logic** — `persistOrder`, `settingsService.getSettings()` fallback, and admin status transitions have no unit tests.

### 3.3 Medium

7. **Storefront settings behind an order** — reconcile `shop_settings` (delivery/WhatsApp only) with the rest of `STORE_SETTINGS` (address/hours/pincodes) — either migrate to `012_settings.sql` or widen `shop_settings`.
8. **CI hardening** — verify the `--reporter=junit` step works in CI (needs the junit reporter installed); add a deployed-environment smoke test.
9. **De-duplicate storefront pricing** — `order.tsx` still computes line subtotals for display separately from `calculatePricing`; route everything through one path.

### 3.4 Low / cleanup

10. Remove the react-refresh warning in `settings-context.tsx` (split hook from component) once zero-warning CI is required.
11. Delete `.env.development`/`.env.staging`/`.env.production` copies if commits are not the deployment mechanism (leakage risk); document values in the deploy pipeline secrets instead.

---

## 4. Production-readiness assessment (after this phase)

Scored 0–100% per area. **This is a runtime/architectural assessment, not a security audit.**

| Area                        | Score                          | Notes                                                                                                                                            |
| --------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build + CI pipeline         | 85%                            | typecheck/lint/build/test green; CI runs all incl. frozen install. JUnit reporter unverified.                                                    |
| Config/environment hygiene  | 80%                            | 3 real vars; clean turbo/env files. Secrets live in committed `.env.*` — tighten before launch.                                                  |
| Data model ↔ code alignment | 90%                            | enums match DB; order + settings repositories read live tables.                                                                                  |
| Storefront order flow       | 60%                            | WhatsApp + best-effort DB persist. Blocked on `011_orders_rls.sql` for durable data; no unit tests.                                              |
| Admin experience            | 45%                            | UI complete, but auth is fake (localStorage), settings writes don't reach DB, orders list depends on un-applied RLS fix.                         |
| Security                    | 40%                            | Client-side anon pattern is normal, but admin password plaintext + no real sessions + public anon SELECT on `shop_settings` are the weak points. |
| Observability               | 20%                            | no error tracking, no logging to a persistent store, no metrics.                                                                                 |
| Payments                    | 90% (COD-only business intent) | intentional — COD via WhatsApp + persisted order; no gateway.                                                                                    |
| Performance                 | 60%                            | not profiled; no bundle analysis committed; storefront loads all products via `getAll()`.                                                        |

**Overall production readiness: ~60%**

**One-line verdict:** The skeleton is production-shaped — builds cleanly, aligned with the DB, orders and settings are DB-backed where policies allow — but it is **not release-ready** until (1) admin auth moves to Supabase sessions, (2) `011_orders_rls.sql` is applied so orders actually land, and (3) monitoring/alerting + the WhatsApp-number drift are resolved. Those three items lift readiness from ~60% to ~85%+.

---

_Generated after Phase 0.5 changes. Previous recovery work: `docs/phase-0.md`._
