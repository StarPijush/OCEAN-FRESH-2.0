-- 003_indexes.sql
-- OceanFresh Database Indexes
-- Purpose: Optimize query performance for all repository operations

-- ============================================================
-- PRODUCTS
-- ============================================================

-- Slug lookup (findBySlug, existsBySlug)
CREATE UNIQUE INDEX idx_products_slug ON products (slug);

-- Unique slug generation checks
CREATE INDEX idx_products_slug_prefix ON products (slug text_pattern_ops);

-- Category filter (findByCategory)
CREATE INDEX idx_products_category ON products (category_id);

-- Status filter (findByStatus, status in findAll/search)
CREATE INDEX idx_products_status ON products (status);

-- Featured products (findFeatured)
CREATE INDEX idx_products_featured ON products (featured)
  WHERE featured = true AND is_deleted = false;

-- Soft-delete filter (nearly every query filters is_deleted = false)
CREATE INDEX idx_products_active ON products (is_deleted)
  WHERE is_deleted = false;

-- Full-text search via search_keywords array
CREATE INDEX idx_products_search_keywords ON products USING GIN (search_keywords);

-- Tag filtering
CREATE INDEX idx_products_tags ON products USING GIN (tags);

-- Low stock queries (getLowStock)
CREATE INDEX idx_products_stock ON products (stock)
  WHERE is_deleted = false;

-- Price range queries (priceMin/priceMax in ProductQuery)
CREATE INDEX idx_products_price ON products (price);

-- Sort by creation date (sort by created_at desc)
CREATE INDEX idx_products_created_at ON products (created_at DESC);

-- Sort by sort order
CREATE INDEX idx_products_sort_order ON products (sort_order, name);

-- SKU lookup
CREATE INDEX idx_products_sku ON products (sku)
  WHERE sku IS NOT NULL;

-- Created by filter
CREATE INDEX idx_products_created_by ON products (created_by);

-- ============================================================
-- CATEGORIES
-- ============================================================

-- Slug lookup (findBySlug, existsBySlug)
CREATE UNIQUE INDEX idx_categories_slug ON categories (slug);

-- Parent-child queries (findChildren, findRootCategories)
CREATE INDEX idx_categories_parent ON categories (parent_id);

-- Materialized path range scan (findDescendants)
-- WHERE path >= prefix AND path < prefix || '~'
CREATE INDEX idx_categories_path ON categories (path text_pattern_ops);

-- Status filter
CREATE INDEX idx_categories_status ON categories (status);

-- Soft-delete filter
CREATE INDEX idx_categories_active ON categories (is_deleted)
  WHERE is_deleted = false;

-- Featured categories
CREATE INDEX idx_categories_featured ON categories (featured)
  WHERE featured = true AND is_deleted = false;

-- Visibility filter (findVisible: WHERE visibility = 'public')
CREATE INDEX idx_categories_visibility ON categories (visibility);

-- Sort order
CREATE INDEX idx_categories_sort_order ON categories (sort_order, name);

-- ============================================================
-- ORDERS
-- ============================================================

-- Order number lookup (findByOrderNumber, existsByOrderNumber)
CREATE UNIQUE INDEX idx_orders_order_number ON orders (order_number);

-- Idempotency key lookup (findByIdempotencyKey)
CREATE UNIQUE INDEX idx_orders_idempotency_key ON orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Customer order history (findByUserId)
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Status filter (findByStatus, status in findAll)
CREATE INDEX idx_orders_status ON orders (status);

-- Date range and sort by creation date
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- ============================================================
-- ORDER ITEMS
-- ============================================================

-- Items by order (queried for every order read)
CREATE INDEX idx_order_items_order ON order_items (order_id);

-- ============================================================
-- ORDER TIMELINE ENTRIES
-- ============================================================

-- Timeline by order (queried for every order read)
CREATE INDEX idx_timeline_order ON order_timeline_entries (order_id);

-- Timeline sort
CREATE INDEX idx_timeline_created_at ON order_timeline_entries (order_id, created_at ASC);

-- ============================================================
-- CARTS
-- ============================================================

-- Cart by user (findByUserId)
CREATE INDEX idx_carts_user_id ON carts (user_id);

-- Cart by session (findBySessionId)
CREATE INDEX idx_carts_session_id ON carts (session_id);

-- Active cart filter (findByUserId scans ACTIVE/READY_FOR_CHECKOUT)
CREATE INDEX idx_carts_status ON carts (status);

-- ============================================================
-- CART ITEMS
-- ============================================================

-- Items by cart (queried for every cart read)
CREATE INDEX idx_cart_items_cart ON cart_items (cart_id);

-- ============================================================
-- USERS
-- ============================================================

-- Email lookup
CREATE UNIQUE INDEX idx_users_email ON users (email)
  WHERE email IS NOT NULL;

-- ============================================================
-- ADMIN PROFILES
-- ============================================================
-- user_id already has UNIQUE constraint inline (created implicitly)
-- Additional index for role-based queries
CREATE INDEX idx_admin_profiles_role ON admin_profiles (role);
