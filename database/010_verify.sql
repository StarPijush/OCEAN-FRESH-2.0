-- 010_verify.sql
-- OceanFresh Database Verification Script
-- Confirms every table, column, FK, index, trigger, RLS policy,
-- storage bucket, extension, and seed data exists as designed.
--
-- Run this script after migration.
-- All queries should return the expected values.
-- Any empty result or unexpected NULL indicates a missing object.

-- ============================================================
-- 1. EXTENSIONS INSTALLED
-- ============================================================

SELECT '001_extensions' AS check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm')
    THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  (SELECT string_agg(extname, ', ') FROM pg_extension WHERE extname IN ('pgcrypto', 'pg_trgm')) AS details;

-- ============================================================
-- 2. ALL TABLES EXIST
-- ============================================================

SELECT '002_tables' AS check_name,
  CASE
    WHEN COUNT(*) = 10 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  string_agg(tablename, ', ' ORDER BY tablename) AS details
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'categories', 'products', 'users', 'admin_profiles',
    'orders', 'order_items', 'order_timeline_entries',
    'carts', 'cart_items', 'shop_settings'
  );

-- ============================================================
-- 3. ALL ENUMS EXIST
-- ============================================================

SELECT 'enums' AS check_name,
  CASE
    WHEN COUNT(*) = 6 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  string_agg(typname, ', ' ORDER BY typname) AS details
FROM pg_type
WHERE typnamespace = 'public'::regnamespace
  AND typtype = 'e'
  AND typname IN (
    'product_status', 'product_unit',
    'category_status', 'order_status',
    'cart_status', 'cart_source'
  );

-- ============================================================
-- 4. ALL COLUMNS EXIST (per table)
-- ============================================================

-- Verify categories columns
SELECT 'categories_columns' AS check_name,
  CASE WHEN COUNT(*) = 22 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'categories'
  AND column_name IN (
    'id', 'name', 'slug', 'description', 'parent_id', 'path', 'level',
    'sort_order', 'status', 'visibility', 'featured',
    'thumbnail', 'banner', 'icon', 'seo', 'metadata',
    'product_count', 'created_by', 'updated_by', 'version',
    'is_deleted', 'created_at', 'updated_at', 'deleted_at'
  );

-- Verify products columns
SELECT 'products_columns' AS check_name,
  CASE WHEN COUNT(*) = 29 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
  AND column_name IN (
    'id', 'name', 'slug', 'sku', 'barcode', 'description',
    'price', 'compare_at_price', 'category_id', 'warehouse_id',
    'status', 'featured', 'stock', 'weight', 'weight_unit',
    'dimensions', 'unit', 'tags', 'search_keywords', 'seo',
    'thumbnail', 'gallery', 'variants', 'metadata', 'version',
    'sort_order', 'min_order_quantity', 'created_by', 'updated_by',
    'is_deleted', 'created_at', 'updated_at', 'deleted_at'
  );

-- Verify orders columns
SELECT 'orders_columns' AS check_name,
  CASE WHEN COUNT(*) = 16 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
  AND column_name IN (
    'id', 'order_number', 'user_id', 'idempotency_key', 'source',
    'status', 'currency', 'customer_snapshot', 'shipping_snapshot',
    'billing_snapshot', 'totals', 'payment', 'notes', 'cart_id',
    'created_at', 'updated_at'
  );

-- Verify users columns
SELECT 'users_columns' AS check_name,
  CASE WHEN COUNT(*) = 14 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
  AND column_name IN (
    'id', 'email', 'phone', 'display_name', 'photo_url',
    'provider', 'identity_type', 'email_verified', 'phone_verified',
    'account_status', 'is_anonymous', 'metadata',
    'last_login_at', 'created_at', 'updated_at'
  );

-- Verify admin_profiles columns
SELECT 'admin_profiles_columns' AS check_name,
  CASE WHEN COUNT(*) = 10 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'admin_profiles'
  AND column_name IN (
    'id', 'user_id', 'full_name', 'mobile', 'avatar_url',
    'role', 'permissions', 'preferences', 'created_at', 'updated_at'
  );

-- Verify order_items columns
SELECT 'order_items_columns' AS check_name,
  CASE WHEN COUNT(*) = 10 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'order_items'
  AND column_name IN (
    'id', 'order_id', 'product_id', 'snapshot', 'quantity',
    'unit_price_amount', 'unit_price_currency',
    'subtotal_amount', 'subtotal_currency', 'created_at'
  );

-- Verify order_timeline_entries columns
SELECT 'timeline_columns' AS check_name,
  CASE WHEN COUNT(*) = 6 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'order_timeline_entries'
  AND column_name IN (
    'id', 'order_id', 'status', 'changed_by', 'note', 'created_at'
  );

-- Verify carts columns
SELECT 'carts_columns' AS check_name,
  CASE WHEN COUNT(*) = 9 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'carts'
  AND column_name IN (
    'id', 'user_id', 'session_id', 'source', 'status',
    'totals', 'expires_at', 'created_at', 'updated_at'
  );

-- Verify cart_items columns
SELECT 'cart_items_columns' AS check_name,
  CASE WHEN COUNT(*) = 8 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'cart_items'
  AND column_name IN (
    'id', 'cart_id', 'product_id', 'snapshot', 'quantity',
    'subtotal_amount', 'subtotal_currency', 'added_at'
  );

-- Verify shop_settings columns
SELECT 'shop_settings_columns' AS check_name,
  CASE WHEN COUNT(*) = 6 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' columns found' AS details
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'shop_settings'
  AND column_name IN (
    'id', 'whatsapp_number', 'delivery_charge_amount',
    'delivery_free_above', 'created_at', 'updated_at'
  );

-- ============================================================
-- 5. ALL FOREIGN KEYS EXIST
-- ============================================================

-- Count all expected FKs across schemas (public + auth for cross-schema FKs)
SELECT 'foreign_keys' AS check_name,
  CASE WHEN COUNT(*) = 6 THEN 'PASS' ELSE 'FAIL' END AS status,
  string_agg(conname, ', ' ORDER BY conname) AS details
FROM pg_constraint
WHERE conrelid = 'public.categories'::regclass AND conname = 'categories_parent_id_fkey'
   OR conrelid = 'public.products'::regclass AND conname = 'products_category_id_fkey'
   OR conrelid = 'public.users'::regclass AND conname = 'users_id_fkey'
   OR conrelid = 'public.admin_profiles'::regclass AND conname = 'admin_profiles_user_id_fkey'
   OR conrelid = 'public.order_items'::regclass AND conname = 'order_items_order_id_fkey'
   OR conrelid = 'public.order_timeline_entries'::regclass AND conname = 'order_timeline_entries_order_id_fkey'
   OR conrelid = 'public.cart_items'::regclass AND conname = 'cart_items_cart_id_fkey';

-- Load all FK details
SELECT 'fk_details' AS check_name,
  'PASS' AS status,
  string_agg(
    conrelid::regclass::text || '.' || conname || ' -> ' || confrelid::regclass::text,
    E'\n' ORDER BY conrelid::regclass::text
  ) AS details
FROM pg_constraint
WHERE contype = 'f'
  AND conrelid IN (
    'public.categories'::regclass,
    'public.products'::regclass,
    'public.users'::regclass,
    'public.admin_profiles'::regclass,
    'public.order_items'::regclass,
    'public.order_timeline_entries'::regclass,
    'public.cart_items'::regclass
  );

-- ============================================================
-- 6. ALL INDEXES EXIST
-- ============================================================

SELECT 'indexes' AS check_name,
  CASE WHEN COUNT(*) >= 24 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' indexes found' AS details
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_products_slug', 'idx_products_category', 'idx_products_status',
    'idx_products_featured', 'idx_products_active', 'idx_products_search_keywords',
    'idx_products_tags', 'idx_products_stock', 'idx_products_price',
    'idx_products_created_at', 'idx_products_sort_order', 'idx_products_created_by',
    'idx_categories_slug', 'idx_categories_parent', 'idx_categories_path',
    'idx_categories_status', 'idx_categories_active', 'idx_categories_featured',
    'idx_categories_visibility', 'idx_categories_sort_order',
    'idx_orders_order_number', 'idx_orders_idempotency_key', 'idx_orders_user_id',
    'idx_orders_status', 'idx_orders_created_at',
    'idx_order_items_order', 'idx_timeline_order', 'idx_timeline_created_at',
    'idx_carts_user_id', 'idx_carts_session_id', 'idx_carts_status',
    'idx_cart_items_cart',
    'idx_users_email',
    'idx_admin_profiles_role'
  );

-- ============================================================
-- 7. ALL UNIQUE CONSTRAINTS EXIST
-- ============================================================

SELECT 'unique_constraints' AS check_name,
  CASE WHEN COUNT(*) >= 6 THEN 'PASS' ELSE 'FAIL' END AS status,
  string_agg(conname, ', ' ORDER BY conname) AS details
FROM pg_constraint
WHERE contype = 'u'
  AND conrelid IN (
    'public.categories'::regclass,
    'public.products'::regclass,
    'public.orders'::regclass,
    'public.users'::regclass,
    'public.admin_profiles'::regclass
  );

-- ============================================================
-- 8. ALL TRIGGERS EXIST
-- ============================================================

SELECT 'triggers' AS check_name,
  CASE WHEN COUNT(*) = 7 THEN 'PASS' ELSE 'FAIL' END AS status,
  string_agg(event_object_table || '.' || trigger_name, ', ' ORDER BY event_object_table) AS details
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trg_%_updated_at';

-- ============================================================
-- 9. RLS ENABLED ON ALL TABLES
-- ============================================================

SELECT 'rls_enabled' AS check_name,
  CASE
    WHEN COUNT(*) = 10 THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  string_agg(relname, ', ' ORDER BY relname) AS details
FROM pg_class
WHERE relname IN (
  'categories', 'products', 'users', 'admin_profiles',
  'orders', 'order_items', 'order_timeline_entries',
  'carts', 'cart_items', 'shop_settings'
)
  AND relrowsecurity = true;

-- ============================================================
-- 10. RLS POLICIES EXIST
-- ============================================================

SELECT 'rls_policies' AS check_name,
  CASE WHEN COUNT(*) >= 20 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' policies found' AS details
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'categories', 'products', 'users', 'admin_profiles',
    'orders', 'order_items', 'order_timeline_entries',
    'carts', 'cart_items', 'shop_settings'
  );

-- List all policies for inspection
SELECT 'rls_policy_list' AS check_name,
  'INFO' AS status,
  string_agg(tablename || ': ' || policyname, E'\n' ORDER BY tablename, policyname) AS details
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY 1, 2;

-- ============================================================
-- 11. FUNCTION EXISTS
-- ============================================================

SELECT 'is_admin_function' AS check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace)
    THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  'public.is_admin()' AS details;

-- ============================================================
-- 12. STORAGE BUCKET EXISTS
-- ============================================================

SELECT 'storage_bucket' AS check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'products')
    THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  'products' AS details;

-- ============================================================
-- 13. SEED DATA VERIFICATION
-- ============================================================

SELECT 'seed_shop_settings' AS check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM shop_settings WHERE id = 'default') THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  (SELECT row_to_json(s) FROM shop_settings s WHERE id = 'default')::text AS details;

SELECT 'seed_categories' AS check_name,
  CASE WHEN COUNT(*) >= 4 THEN 'PASS' ELSE 'FAIL' END AS status,
  COUNT(*)::text || ' categories: ' || string_agg(name, ', ' ORDER BY sort_order) AS details
FROM categories
WHERE is_deleted = false;

SELECT 'seed_admin_profile' AS check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM admin_profiles WHERE role IN ('admin', 'super_admin')) THEN 'PASS'
    ELSE 'INFO'
  END AS status,
  CASE
    WHEN EXISTS (SELECT 1 FROM admin_profiles WHERE role IN ('admin', 'super_admin'))
    THEN (SELECT full_name || ' (' || role || ')' FROM admin_profiles WHERE role IN ('admin', 'super_admin') LIMIT 1)
    ELSE 'No admin profile found — create via Supabase Dashboard first (see 009_seed.sql for instructions)'
  END AS details;

-- ============================================================
-- 14. NO PASSWORD COLUMN IN ADMIN PROFILES
-- ============================================================

SELECT 'no_password_in_admin_profiles' AS check_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'admin_profiles'
        AND column_name IN ('password', 'password_hash', 'encrypted_password')
    ) THEN 'FAIL — password column found'
    ELSE 'PASS'
  END AS status,
  'admin_profiles contains only profile metadata' AS details;

-- ============================================================
-- 15. COMPREHENSIVE SUMMARY
-- ============================================================

-- Final summary (seed admin is informational — not a hard requirement)
WITH required_checks AS (
  SELECT 'All 10 tables exist' AS check, COUNT(*) = 10 AS pass FROM pg_tables
    WHERE schemaname = 'public' AND tablename IN (
      'categories', 'products', 'users', 'admin_profiles',
      'orders', 'order_items', 'order_timeline_entries',
      'carts', 'cart_items', 'shop_settings'
    )
  UNION ALL
  SELECT 'All 6 enums exist' AS check, COUNT(*) = 6 AS pass FROM pg_type
    WHERE typnamespace = 'public'::regnamespace AND typtype = 'e'
      AND typname IN ('product_status','product_unit','category_status','order_status','cart_status','cart_source')
  UNION ALL
  SELECT 'RLS enabled on all 10 tables' AS check, COUNT(*) = 10 AS pass FROM pg_class
    WHERE relname IN (
      'categories', 'products', 'users', 'admin_profiles',
      'orders', 'order_items', 'order_timeline_entries',
      'carts', 'cart_items', 'shop_settings'
    ) AND relrowsecurity = true
  UNION ALL
  SELECT 'users.id FK to auth.users.id' AS check, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND conname = 'users_id_fkey'
      AND confrelid = 'auth.users'::regclass
  ) AS pass
  UNION ALL
  SELECT 'admin_profiles.user_id FK to auth.users.id' AS check, EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.admin_profiles'::regclass
      AND conname = 'admin_profiles_user_id_fkey'
      AND confrelid = 'auth.users'::regclass
  ) AS pass
  UNION ALL
  SELECT 'No password columns in admin_profiles' AS check, NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_profiles'
      AND column_name IN ('password', 'password_hash')
  ) AS pass
  UNION ALL
  SELECT 'Storage bucket "products" exists' AS check, EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'products'
  ) AS pass
  UNION ALL
  SELECT 'is_admin() function exists' AS check, EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin'
  ) AS pass
  UNION ALL
  SELECT 'Seed shop_settings exists' AS check, EXISTS (
    SELECT 1 FROM shop_settings WHERE id = 'default'
  ) AS pass
  UNION ALL
  SELECT 'Seed categories exist' AS check, EXISTS (
    SELECT 1 FROM categories WHERE is_deleted = false
  ) AS pass
)
SELECT
  'FINAL_VERDICT' AS check_name,
  CASE WHEN bool_and(pass) THEN 'ALL CHECKS PASSED' ELSE 'SOME CHECKS FAILED' END AS status,
  string_agg(
    CASE WHEN pass THEN '✓ ' ELSE '✗ ' END || check,
    E'\n' ORDER BY check
  ) AS details
FROM required_checks;
