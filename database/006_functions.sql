-- 006_functions.sql
-- OceanFresh Database Functions
-- Only security/RLS-essential functions (no business logic)

-- ============================================================
-- FUNCTION: public.is_admin()
-- Returns true if the current authenticated user has an admin profile.
-- Used exclusively in RLS policies for admin access control.
-- This is a security function, NOT business logic.
-- ============================================================

-- Determines whether the authenticated user has an administrator role.
-- ONLY checks admin_profiles membership. No business logic.
-- Authorization decisions belong in RLS policies, not here.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;
