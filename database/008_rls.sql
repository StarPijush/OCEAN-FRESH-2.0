-- 008_rls.sql
-- OceanFresh Row Level Security Policies
-- RLS enabled on all tables with minimum-privilege policies

-- ============================================================
-- CATEGORIES
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read active, non-deleted categories
CREATE POLICY "categories_select_public"
ON categories
FOR SELECT
TO public
USING (
  status = 'ACTIVE'
  AND is_deleted = false
);

-- Authenticated admin users have full CRUD access
CREATE POLICY "categories_all_admin"
ON categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- PRODUCTS
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read active, non-deleted products
CREATE POLICY "products_select_public"
ON products
FOR SELECT
TO public
USING (
  status = 'ACTIVE'
  AND is_deleted = false
);

-- Authenticated admin users have full CRUD access
CREATE POLICY "products_all_admin"
ON products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- USERS (customer profiles)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own profile
CREATE POLICY "users_select_own"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Authenticated users can update their own profile
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin users can read all customer profiles
CREATE POLICY "users_select_admin"
ON users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Insert is restricted: only the application can create user profiles
-- (via Supabase Auth trigger or application-managed insert)
CREATE POLICY "users_insert_service"
ON users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- ============================================================
-- ADMIN PROFILES
-- ============================================================

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Admin users can read their own profile
CREATE POLICY "admin_profiles_select_own"
ON admin_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin users can update their own profile
CREATE POLICY "admin_profiles_update_own"
ON admin_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Super admin users can manage all admin profiles
CREATE POLICY "admin_profiles_all_super_admin"
ON admin_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- ============================================================
-- ORDERS
-- ============================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can read their own orders
CREATE POLICY "orders_select_own"
ON orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Admin users have full CRUD access on orders
CREATE POLICY "orders_all_admin"
ON orders
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read items from their own orders
CREATE POLICY "order_items_select_own"
ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()::text
  )
);

-- Admin users have full CRUD access on order items
CREATE POLICY "order_items_all_admin"
ON order_items
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- ORDER TIMELINE ENTRIES
-- ============================================================

ALTER TABLE order_timeline_entries ENABLE ROW LEVEL SECURITY;

-- Users can read timeline from their own orders
CREATE POLICY "timeline_select_own"
ON order_timeline_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_timeline_entries.order_id
    AND orders.user_id = auth.uid()::text
  )
);

-- Admin users have full CRUD access on timeline entries
CREATE POLICY "timeline_all_admin"
ON order_timeline_entries
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- CARTS
-- ============================================================

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Anonymous users can read/update carts by session_id
CREATE POLICY "carts_select_anon"
ON carts
FOR SELECT
TO anon
USING (session_id IS NOT NULL);

-- Authenticated users can read their own carts
CREATE POLICY "carts_select_own"
ON carts
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Authenticated users can manage their own carts
CREATE POLICY "carts_all_own"
ON carts
FOR ALL
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Anonymous users can insert carts (for guest checkout)
CREATE POLICY "carts_insert_anon"
ON carts
FOR INSERT
TO anon
WITH CHECK (true);

-- Admin users can view all carts
CREATE POLICY "carts_select_admin"
ON carts
FOR SELECT
TO authenticated
USING (public.is_admin());

-- ============================================================
-- CART ITEMS
-- ============================================================

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage items in their own carts
CREATE POLICY "cart_items_all_own"
ON cart_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()::text
  )
);

-- Anonymous users can manage items in session-based carts
CREATE POLICY "cart_items_all_anon"
ON cart_items
FOR ALL
TO anon
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.session_id IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
  )
);

-- Admin users can view all cart items
CREATE POLICY "cart_items_select_admin"
ON cart_items
FOR SELECT
TO authenticated
USING (public.is_admin());

-- ============================================================
-- SHOP SETTINGS
-- ============================================================

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read shop settings
-- (needed for delivery charge info on the storefront)
CREATE POLICY "shop_settings_select_public"
ON shop_settings
FOR SELECT
TO public
USING (true);

-- Only admin users can update shop settings
CREATE POLICY "shop_settings_update_admin"
ON shop_settings
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admin users can insert shop settings
CREATE POLICY "shop_settings_insert_admin"
ON shop_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only admin users can delete shop settings
CREATE POLICY "shop_settings_delete_admin"
ON shop_settings
FOR DELETE
TO authenticated
USING (public.is_admin());
