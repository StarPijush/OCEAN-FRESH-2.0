# OceanFresh Deployment & Migration Guide

## Database Migrations

### Local Development

If using Supabase local development:

```bash
# Start local Supabase stack
supabase start

# Apply all migrations (resets database)
supabase db reset

# Or apply migrations incrementally
supabase migration up --include-all
```

### Production (Supabase Cloud)

**Migrations are NOT auto-applied on Vercel deploy.** They must be executed manually against the live Supabase project.

#### Option 1: Supabase Dashboard → SQL Editor (Recommended for single migrations)

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of the migration file (e.g., `database/018_grant_products_select.sql`)
3. Paste and click "Run"

#### Option 2: Supabase CLI (For batch migrations)

```bash
# One-time setup: link to your project
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push

# Check migration status
supabase migration list
```

#### Option 3: Supabase CLI with CI/CD (Advanced)

For automated migration in CI/CD pipelines:

```yaml
# .github/workflows/deploy.yml (example)
- name: Apply Supabase migrations
  run: |
    supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
    supabase db push
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Vercel Deployment

### Preview Deployments (Auto on PR)

```bash
pnpm deploy:staging
# Or: vercel --env staging
```

### Production Deployment

```bash
pnpm deploy:production
# Or: vercel --prod
```

### Environment Variables (Set in Vercel Project Settings)

| Variable                       | Description                               | Required |
| ------------------------------ | ----------------------------------------- | -------- |
| `VITE_SUPABASE_URL`            | Supabase project URL                      | Yes      |
| `VITE_SUPABASE_ANON_KEY`       | Supabase anon/public key                  | Yes      |
| `VITE_SUPABASE_STORAGE_BUCKET` | Storage bucket name (default: `products`) | Yes      |
| `VITE_STOREFRONT_URL`          | Storefront URL for admin "View Store"     | Yes      |

---

## Local Environment Setup

```bash
# 1. Install dependencies (frozen lockfile)
pnpm install --frozen-lockfile

# 2. Configure environment
cp .env.example .env.development
cp apps/admin/.env.example apps/admin/.env
# Edit .env.development with your Supabase credentials

# 3. Run development servers
pnpm dev                    # Both apps (storefront:3000, admin:3001)
# Or individually:
pnpm --filter @oceanfresh/storefront dev
pnpm --filter @oceanfresh/admin dev
```

**Never commit real `.env*` files** — they are git-ignored.

---

## Quality Gates (Run Before Deploy)

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Tests
pnpm test

# Build
pnpm build
```

All must pass before merging to main or deploying.

---

## Migration Naming Convention

Migrations in `database/` follow sequential numbering:

```
001_extensions.sql
002_tables.sql
002b_auth_tables.sql
003_indexes.sql
004_constraints.sql
005_triggers.sql
006_functions.sql
007_storage.sql
008_rls.sql
009_seed.sql
010_verify.sql
013_phase075.sql
014_reconcile_auth_tables.sql
015_reconcile_application_contract.sql
016_production_fixes.sql
017_production_diagnostic.sql
018_grant_products_select.sql   ← NEW
```

### Migration File Template

```sql
-- NNN_short_description.sql
-- OceanFresh: Brief purpose statement
--
-- Context: Why this migration exists
-- Safety: Additive / re-runnable / no RLS weakening

-- ============================================================
-- SECTION NAME
-- ============================================================

-- SQL statements here
```

---

## Rollback Procedure

Supabase migrations are forward-only. To rollback:

1. Create a new migration that reverses the change
2. Apply it via SQL Editor or CLI
3. Deploy new code if needed

Example rollback for `018_grant_products_select.sql`:

```sql
-- 019_revoke_products_select.sql
REVOKE SELECT ON public.products FROM anon, authenticated;
```

---

## Verification After Migration

After applying any migration, run diagnostics:

```sql
-- In Supabase SQL Editor
\i database/017_production_diagnostic.sql
```

Or run specific checks:

```sql
-- Verify GRANT
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- Verify RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'categories', 'orders');
```

---

## Emergency Contacts

- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: Check CI status on PRs
