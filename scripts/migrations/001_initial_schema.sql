-- Fresh Catch: Firebase → Supabase Migration
-- Phase 1: Initial PostgreSQL Schema
-- This migration creates all 12 tables required by the current application.
-- Tables deferred: auth_sessions, auth_devices, audit_logs (add later if needed)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS (profile table, synced with auth.users via trigger)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            TEXT PRIMARY KEY,
  email         TEXT,
  phone         TEXT,
  display_name  TEXT NOT NULL DEFAULT '',
  photo_url     TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  preferences   JSONB NOT NULL DEFAULT '{"notifications":true,"theme":"light"}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL DEFAULT '',
  parent_id     TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  path          TEXT NOT NULL DEFAULT '',
  level         INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 5),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'hidden', 'archived')),
  visibility    TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
  featured      BOOLEAN NOT NULL DEFAULT false,
  thumbnail     TEXT,
  banner        TEXT,
  icon          TEXT,
  seo           JSONB,
  metadata      JSONB NOT NULL DEFAULT '{}',
  product_count INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT NOT NULL,
  updated_by    TEXT,
  version       INTEGER NOT NULL DEFAULT 1,
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_is_deleted ON public.categories(is_deleted);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  sku               TEXT,
  barcode           TEXT,
  description       TEXT NOT NULL DEFAULT '',
  price             NUMERIC(12,2) NOT NULL,
  compare_at_price  NUMERIC(12,2),
  category_id       TEXT NOT NULL REFERENCES public.categories(id),
  images            JSONB NOT NULL DEFAULT '[]',
  thumbnail         TEXT NOT NULL DEFAULT '',
  gallery           JSONB NOT NULL DEFAULT '[]',
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','out_of_stock','coming_soon','discontinued','archived','hidden','preorder','draft')),
  featured          BOOLEAN NOT NULL DEFAULT false,
  stock             INTEGER NOT NULL DEFAULT 0,
  weight            NUMERIC(10,2),
  weight_unit       TEXT CHECK (weight_unit IN ('g', 'kg', 'lb')),
  dimensions        JSONB,
  unit              TEXT NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'piece', 'dozen')),
  tags              JSONB NOT NULL DEFAULT '[]',
  search_keywords   JSONB NOT NULL DEFAULT '[]',
  seo               JSONB,
  metadata          JSONB NOT NULL DEFAULT '{}',
  version           INTEGER NOT NULL DEFAULT 1,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  warehouse_id      TEXT,
  min_order_qty     INTEGER NOT NULL DEFAULT 1 CHECK (min_order_qty >= 1),
  created_by        TEXT NOT NULL,
  updated_by        TEXT,
  is_deleted        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON public.products(is_deleted);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_search_keywords ON public.products USING GIN(search_keywords);

-- ============================================================
-- 4. PRODUCT VARIANTS (normalized from nested array)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id          TEXT PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sku         TEXT NOT NULL,
  price       NUMERIC(12,2) NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  unit        TEXT NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'piece', 'dozen')),
  weight      NUMERIC(10,2),
  weight_unit TEXT CHECK (weight_unit IN ('g', 'kg', 'lb')),
  images      JSONB NOT NULL DEFAULT '[]',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- ============================================================
-- 5. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                 TEXT PRIMARY KEY,
  order_number       TEXT NOT NULL UNIQUE,
  idempotency_key    TEXT NOT NULL UNIQUE,
  source             TEXT NOT NULL CHECK (source IN ('checkout', 'admin', 'api')),
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','validating','pending_payment','payment_failed','paid','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','refund_requested','refunded','archived')),
  totals             JSONB NOT NULL,
  customer_snapshot  JSONB NOT NULL,
  shipping_snapshot  JSONB NOT NULL,
  billing_snapshot   JSONB NOT NULL,
  payment            JSONB NOT NULL DEFAULT '{}',
  notes              TEXT NOT NULL DEFAULT '',
  cart_id            TEXT,
  user_id            TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ============================================================
-- 6. ORDER ITEMS (normalized from nested array)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id                  TEXT PRIMARY KEY,
  order_id            TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id          TEXT NOT NULL,
  snapshot            JSONB NOT NULL,
  quantity            INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_amount   NUMERIC(12,2) NOT NULL,
  unit_price_currency TEXT NOT NULL DEFAULT 'INR',
  subtotal_amount     NUMERIC(12,2) NOT NULL,
  subtotal_currency   TEXT NOT NULL DEFAULT 'INR',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ============================================================
-- 7. ORDER TIMELINE ENTRIES (normalized from nested array)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_timeline_entries (
  id         TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON public.order_timeline_entries(order_id);

-- ============================================================
-- 8. CARTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  session_id TEXT,
  source     TEXT NOT NULL CHECK (source IN ('guest', 'authenticated')),
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','validating','ready_for_checkout','checkout_started','checked_out','archived','expired','abandoned')),
  totals     JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON public.carts(status);

-- ============================================================
-- 9. CART ITEMS (normalized from nested array)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id                TEXT PRIMARY KEY,
  cart_id           TEXT NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,
  snapshot          JSONB NOT NULL,
  quantity          INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 999),
  subtotal_amount   NUMERIC(12,2) NOT NULL,
  subtotal_currency TEXT NOT NULL DEFAULT 'INR',
  added_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);

-- ============================================================
-- 10. COUNTERS (year-based sequential counters)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.counters (
  year  INTEGER NOT NULL,
  type  TEXT NOT NULL DEFAULT 'order_number',
  value INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (year, type)
);

-- ============================================================
-- 11. SHOP SETTINGS (single-row table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id                    INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  whatsapp_number       TEXT NOT NULL DEFAULT '',
  delivery_charge_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_free_above   NUMERIC(10,2) NOT NULL DEFAULT 0,
  serviceable_pincodes  JSONB NOT NULL DEFAULT '[]',
  shop_name             TEXT NOT NULL DEFAULT '',
  shop_address          TEXT NOT NULL DEFAULT '',
  shop_phone            TEXT NOT NULL DEFAULT '',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 12. ADMIN PROFILES (legacy fallback auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  mobile        TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Public read for products and categories
CREATE POLICY "products_read_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "categories_read_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "shop_settings_read_all" ON public.shop_settings FOR SELECT USING (true);

-- Authenticated user reads own data
CREATE POLICY "users_read_own" ON public.users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "orders_read_own" ON public.orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "carts_read_own" ON public.carts FOR SELECT USING (auth.uid()::text = user_id);

-- Admin full access
CREATE POLICY "admin_all" ON public.products FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');
CREATE POLICY "admin_all_categories" ON public.categories FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');
CREATE POLICY "admin_all_orders" ON public.orders FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');
CREATE POLICY "admin_all_carts" ON public.carts FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');
CREATE POLICY "admin_all_users" ON public.users FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');
CREATE POLICY "admin_all_settings" ON public.shop_settings FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');
CREATE POLICY "admin_all_counters" ON public.counters FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');
CREATE POLICY "admin_all_admin_profiles" ON public.admin_profiles FOR ALL USING (auth.role() = 'admin' OR auth.role() = 'super_admin');

-- User inserts/updates own cart
CREATE POLICY "carts_insert_own" ON public.carts FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "carts_update_own" ON public.carts FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()::text)
);

-- ============================================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email, ''),
    NEW.raw_user_meta_data ->> 'photo_url',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
