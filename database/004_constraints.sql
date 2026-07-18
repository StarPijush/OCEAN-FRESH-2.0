-- 004_constraints.sql
-- OceanFresh Database Additional Constraints
-- CHECK constraints and other integrity rules beyond PKs and FKs

-- ============================================================
-- CATEGORIES
-- ============================================================

-- Visibility must be 'public' or 'private'
ALTER TABLE categories
  ADD CONSTRAINT chk_categories_visibility
  CHECK (visibility IN ('public', 'private'));

-- Path format must start with current id
-- (application-managed, but ensure non-empty for non-root)
ALTER TABLE categories
  ADD CONSTRAINT chk_categories_level_range
  CHECK (level >= 0 AND level <= 5);

-- ============================================================
-- PRODUCTS
-- ============================================================

-- Price must be non-negative
ALTER TABLE products
  ADD CONSTRAINT chk_products_price
  CHECK (price >= 0);

-- Compare-at price must be non-negative
ALTER TABLE products
  ADD CONSTRAINT chk_products_compare_at_price
  CHECK (compare_at_price IS NULL OR compare_at_price >= 0);

-- Stock must be non-negative
ALTER TABLE products
  ADD CONSTRAINT chk_products_stock
  CHECK (stock >= 0);

-- Min order quantity must be positive
ALTER TABLE products
  ADD CONSTRAINT chk_products_min_order_qty
  CHECK (min_order_quantity IS NULL OR min_order_quantity > 0);

-- Version must be positive
ALTER TABLE products
  ADD CONSTRAINT chk_products_version
  CHECK (version > 0);

-- Deleted flag consistency
ALTER TABLE products
  ADD CONSTRAINT chk_products_deleted_consistency
  CHECK (
    (is_deleted = true AND deleted_at IS NOT NULL) OR
    (is_deleted = false)
  );

-- ============================================================
-- ORDERS
-- ============================================================

-- Order number must not be empty
ALTER TABLE orders
  ADD CONSTRAINT chk_orders_order_number
  CHECK (length(trim(order_number)) > 0);

-- ============================================================
-- ORDER ITEMS
-- ============================================================

-- Quantity must be positive
ALTER TABLE order_items
  ADD CONSTRAINT chk_order_items_quantity
  CHECK (quantity > 0);

-- Unit price must be non-negative
ALTER TABLE order_items
  ADD CONSTRAINT chk_order_items_price
  CHECK (unit_price_amount >= 0);

-- ============================================================
-- CARTS
-- ============================================================

-- Cart expiry must be in the future when set
ALTER TABLE carts
  ADD CONSTRAINT chk_carts_expires_at
  CHECK (expires_at IS NULL OR expires_at > created_at);

-- ============================================================
-- CART ITEMS
-- ============================================================

-- Quantity must be positive
ALTER TABLE cart_items
  ADD CONSTRAINT chk_cart_items_quantity
  CHECK (quantity > 0);

-- Subtotal must be non-negative
ALTER TABLE cart_items
  ADD CONSTRAINT chk_cart_items_subtotal
  CHECK (subtotal_amount >= 0);

-- ============================================================
-- ADMIN PROFILES
-- ============================================================

-- Role must be one of the allowed values
ALTER TABLE admin_profiles
  ADD CONSTRAINT chk_admin_profiles_role
  CHECK (role IN ('admin', 'super_admin'));

-- ============================================================
-- USERS
-- ============================================================

-- User ID must match auth.users pattern (UUID)
-- Ensured by the FK application contract, not DB-enforced
-- since auth.users is in a different schema
