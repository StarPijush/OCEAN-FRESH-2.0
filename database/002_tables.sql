-- 002_tables.sql
-- OceanFresh Database Schema — All Enums and Tables
-- Derived from codebase audit of packages/product, category, order, cart, auth, and apps/admin

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE product_status AS ENUM (
  'DRAFT',
  'ACTIVE',
  'OUT_OF_STOCK',
  'COMING_SOON',
  'DISCONTINUED',
  'ARCHIVED',
  'HIDDEN',
  'PREORDER'
);

CREATE TYPE product_unit AS ENUM (
  'KG',
  'PIECE',
  'DOZEN'
);

CREATE TYPE category_status AS ENUM (
  'ACTIVE',
  'DRAFT',
  'HIDDEN',
  'ARCHIVED'
);

CREATE TYPE order_status AS ENUM (
  'DRAFT',
  'VALIDATING',
  'PENDING_PAYMENT',
  'PAYMENT_FAILED',
  'PAID',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUND_REQUESTED',
  'REFUNDED',
  'ARCHIVED'
);

CREATE TYPE cart_status AS ENUM (
  'ACTIVE',
  'VALIDATING',
  'READY_FOR_CHECKOUT',
  'CHECKOUT_STARTED',
  'CHECKED_OUT',
  'ARCHIVED',
  'EXPIRED',
  'ABANDONED'
);

CREATE TYPE cart_source AS ENUM (
  'GUEST',
  'AUTHENTICATED'
);

-- ============================================================
-- TABLES
-- ============================================================

-- --------------------------------------------------
-- 1. categories — Hierarchical product categories
--    Uses materialized path pattern for efficient tree queries
-- --------------------------------------------------
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL,
  description text NOT NULL DEFAULT '',
  parent_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  path        text NOT NULL DEFAULT '',
  level       smallint NOT NULL DEFAULT 0,
  sort_order  integer NOT NULL DEFAULT 0,
  status      category_status NOT NULL DEFAULT 'ACTIVE',
  visibility  text NOT NULL DEFAULT 'public',
  featured    boolean NOT NULL DEFAULT false,
  thumbnail   text,
  banner      text,
  icon        text,
  seo         jsonb,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  product_count integer NOT NULL DEFAULT 0,
  created_by  text NOT NULL,
  updated_by  text,
  version     integer NOT NULL DEFAULT 1,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- --------------------------------------------------
-- 2. products — Main product catalog
--    Variants stored as JSONB in the variants column
-- --------------------------------------------------
CREATE TABLE products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text NOT NULL,
  sku               text,
  barcode           text,
  description       text,
  price             numeric(12,2) NOT NULL,
  compare_at_price  numeric(12,2),
  category_id       uuid REFERENCES categories(id) ON DELETE SET NULL,
  warehouse_id      text,
  status            product_status NOT NULL DEFAULT 'DRAFT',
  featured          boolean NOT NULL DEFAULT false,
  stock             integer NOT NULL DEFAULT 0,
  weight            numeric(10,2),
  weight_unit       text,
  dimensions        jsonb,
  unit              product_unit NOT NULL DEFAULT 'KG',
  tags              jsonb NOT NULL DEFAULT '[]'::jsonb,
  search_keywords   jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo               jsonb,
  thumbnail         text NOT NULL DEFAULT '',
  gallery           jsonb NOT NULL DEFAULT '[]'::jsonb,
  variants          jsonb,
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  version           integer NOT NULL DEFAULT 1,
  sort_order        integer NOT NULL DEFAULT 0,
  min_order_quantity integer,
  created_by        text NOT NULL,
  updated_by        text,
  is_deleted        boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

-- --------------------------------------------------
-- 3. users — Customer profiles
--    Linked 1:1 with auth.users for extended profile data
-- --------------------------------------------------
CREATE TABLE users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text,
  phone           text,
  display_name    text,
  photo_url       text,
  provider        text,
  identity_type   text,
  email_verified  boolean NOT NULL DEFAULT false,
  phone_verified  boolean NOT NULL DEFAULT false,
  account_status  text,
  is_anonymous    boolean NOT NULL DEFAULT false,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- 4. admin_profiles — Admin user metadata
--    Strictly profile data only. No passwords.
--    Authentication through auth.users only.
-- --------------------------------------------------
CREATE TABLE admin_profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  mobile      text,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'admin',
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- 5. orders — Customer orders (immutable business records)
-- --------------------------------------------------
CREATE TABLE orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       text NOT NULL,
  user_id            text,
  idempotency_key    text,
  source             text,
  status             order_status NOT NULL DEFAULT 'DRAFT',
  currency           text NOT NULL DEFAULT 'INR',
  customer_snapshot  jsonb,
  shipping_snapshot  jsonb,
  billing_snapshot   jsonb,
  totals             jsonb,
  payment            jsonb,
  notes              text,
  cart_id            text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- 6. order_items — Individual line items within an order
-- --------------------------------------------------
CREATE TABLE order_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          text,
  snapshot            jsonb,
  quantity            integer NOT NULL,
  unit_price_amount   numeric(12,2) NOT NULL,
  unit_price_currency text NOT NULL DEFAULT 'INR',
  subtotal_amount     numeric(12,2) NOT NULL,
  subtotal_currency   text NOT NULL DEFAULT 'INR',
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- 7. order_timeline_entries — Status change audit trail
-- --------------------------------------------------
CREATE TABLE order_timeline_entries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     text NOT NULL,
  changed_by text NOT NULL,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- 8. carts — Shopping carts (supports guest and authenticated)
-- --------------------------------------------------
CREATE TABLE carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text,
  session_id text,
  source     cart_source NOT NULL DEFAULT 'GUEST',
  status     cart_status NOT NULL DEFAULT 'ACTIVE',
  totals     jsonb,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- 9. cart_items — Items within a cart
-- --------------------------------------------------
CREATE TABLE cart_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id           uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id        text NOT NULL,
  snapshot          jsonb,
  quantity          integer NOT NULL DEFAULT 1,
  subtotal_amount   numeric(12,2) NOT NULL,
  subtotal_currency text NOT NULL DEFAULT 'INR',
  added_at          timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- 10. shop_settings — Global application configuration
--     Fixed primary key 'default' for single-row pattern
-- --------------------------------------------------
CREATE TABLE shop_settings (
  id                      text PRIMARY KEY DEFAULT 'default',
  whatsapp_number         text,
  delivery_charge_amount  numeric(12,2) NOT NULL DEFAULT 0,
  delivery_free_above     numeric(12,2) NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------
-- RELATIONSHIP SUMMARY (for reference)
-- --------------------------------------------------
-- categories.parent_id          → categories.id              (self-referencing)
-- products.category_id          → categories.id
-- users.id                      → auth.users.id               (application-managed)
-- admin_profiles.user_id        → auth.users.id              ON DELETE CASCADE
-- orders.id                     → order_items.order_id        ON DELETE CASCADE
-- orders.id                     → order_timeline_entries.order_id ON DELETE CASCADE
-- carts.id                      → cart_items.cart_id          ON DELETE CASCADE
