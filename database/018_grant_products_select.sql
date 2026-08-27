-- 018_grant_products_select.sql
-- OceanFresh Production Fix: Grant SELECT on products to API roles
-- 
-- Root cause: RLS policy 'products_select_public' filters rows correctly
-- (status = 'ACTIVE' AND is_deleted = false) but the 'anon' and 
-- 'authenticated' roles lack explicit SELECT privilege on the table.
-- Without GRANT, Supabase Data API returns empty/permission-denied 
-- for storefront queries using the anon key.
--
-- This migration is additive, re-runnable, and does not modify RLS.

-- ============================================================
-- GRANT SELECT on products to API roles
-- ============================================================

GRANT SELECT ON public.products TO anon, authenticated;