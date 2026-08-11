-- 017_production_diagnostic.sql
-- OceanFresh Read-Only Production Diagnostics
--
-- Run AFTER applying 016_production_fixes.sql (and at any later time).
-- This file NEVER modifies the database: SELECT / to_regprocedure /
-- catalog reads only.
--
-- Purpose:
--   1. Confirm whether the catalog is empty vs populated-but-hidden
--      (root-cause the storefront's "0 products").
--   2. Confirm the fixed blockers: place_cod_order RPC + products bucket.
--   3. Confirm RLS remains enabled on every table and no anon order leak.

-- ============================================================
-- 1. PRODUCTS — catalog truth
-- ============================================================

SELECT 'products_total'      AS check_name, COUNT(*)                                            AS value FROM public.products;
SELECT 'products_by_status'  AS check_name, status, COUNT(*) AS value
  FROM public.products GROUP BY status ORDER BY status;
SELECT 'products_active'     AS check_name, COUNT(*) AS value
  FROM public.products WHERE status = 'ACTIVE' AND is_deleted = false;
SELECT 'products_deleted'    AS check_name, COUNT(*) AS value
  FROM public.products WHERE is_deleted = true;
-- ============================================================
-- 2. RPC PRESENCE
-- ============================================================

SELECT
  'place_cod_order_exists' AS check_name,
  to_regprocedure('public.place_cod_order(jsonb)') IS NOT NULL AS value;

-- ============================================================
-- 3. STORAGE
-- ============================================================

SELECT 'storage_bucket_products' AS check_name, count(*) AS value
  FROM storage.buckets WHERE id = 'products';

SELECT 'storage_policy_count' AS check_name, count(*) AS value
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND policyname IN ('products_select_public','products_insert_admin','products_update_admin','products_delete_admin');

-- ============================================================
-- 4. RLS STATE (every public application table)
-- ============================================================

WITH required AS (
  SELECT unnest(ARRAY[
    'admin_profiles', 'audit_logs', 'auth_devices', 'auth_sessions',
    'cart_items', 'carts', 'categories',
    'order_items', 'order_timeline_entries', 'orders',
    'products', 'shop_settings', 'users'
  ]) AS table_name
)
SELECT 'rls_enabled' AS check_name, r.table_name,
  CASE
    WHEN p.tablename IS NULL THEN 'MISSING TABLE'
    WHEN p.rowsecurity THEN 'rls enabled'
    ELSE 'RLS DISABLED ***'
  END AS state
FROM required r
LEFT JOIN pg_tables p
  ON p.schemaname = 'public' AND p.tablename = r.table_name
ORDER BY r.table_name;

-- ============================================================
-- 5. NO ANONYMOUS ORDER/PROFILE/LOG ACCESS
-- ============================================================

SELECT 'anon_order_policies' AS check_name, policyname, tablename
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('orders', 'order_items', 'order_timeline_entries', 'admin_profiles', 'audit_logs')
    AND roles = ARRAY['anon']::name[]
  ORDER BY tablename, policyname;

-- ============================================================
-- 6. ALL PUBLIC POLICIES (inspection aid)
-- ============================================================

SELECT 'policy_list' AS check_name, tablename, policyname, roles, cmd
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;

-- ============================================================
-- 7. SUMMARY
-- ============================================================

SELECT
  CASE
    WHEN (SELECT count(*) FROM public.products) = 0 THEN 'EMPTY CATALOG — create products via Admin UI (no hidden rows).'
    WHEN (SELECT count(*) FROM public.products WHERE status = 'ACTIVE' AND is_deleted = false) = 0
      THEN 'PRODUCTS EXIST BUT ARE HIDDEN/DRAFT/DELETED — set status = ACTIVE in Admin products page.'
    ELSE 'CATALOG OK — active products are visible to the storefront.'
  END AS catalog_verdict,
  CASE
    WHEN to_regprocedure('public.place_cod_order(jsonb)') IS NOT NULL THEN 'RPC OK'
    ELSE 'RPC MISSING — run 016_production_fixes.sql'
  END AS rpc_verdict,
  CASE
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'products') THEN 'BUCKET OK'
    ELSE 'BUCKET MISSING — run 016_production_fixes.sql'
  END AS storage_verdict;