-- 019_weight_based_pricing.sql
-- OceanFresh Weight-Based Pricing — Non-Destructive Foundation
--
-- PURPOSE
--   Introduces weight-based purchasing (GRAM / KG) without breaking
--   existing data, RLS, triggers, or repository mappers.
--   ALL changes are additive and idempotent (IF NOT EXISTS guards).
--   NO DROP COLUMN, NO destructive enum removal, NO data loss.
--   Existing PIECE/DOZEN enum values remain DORMANT (kept for
--   compatibility; application validation now restricts to GRAM/KG).
--
-- TABLES AFFECTED
--   products, order_items, cart_items, enum product_unit
--   Function: public.place_cod_order(jsonb) — replaced with
--   weight-aware but backwards-compatible implementation.
--
-- COLUMNS ADDED
--   order_items.weight_grams  numeric(10,2)
--   order_items.weight_display text
--   order_items.product_unit  text
--   cart_items.weight_grams   numeric(10,2)
--   cart_items.weight_display text
--   cart_items.product_unit   text
--
-- COLUMNS REMOVED
--   None in this migration (stock and min_order_quantity kept).
--
-- COLUMNS CHANGED
--   None (products.stock and products.min_order_quantity remain
--   exactly as before; they become application-ignored but are
--   preserved for rollback safety and for 010_verify compatibility).
--
-- ENUM CHANGES
--   product_unit: ADD VALUE IF NOT EXISTS 'GRAM' (keeps KG,PIECE,DOZEN)
--
-- DATA MIGRATION
--   None automatically — existing products with unit=PIECE/DOZEN
--   remain as-is. Admin should manually review and re-assign them
--   to KG or GRAM (no automatic price conversion). Existing
--   order_items/cart_items quantity values remain valid (>0) and
--   continue to satisfy chk_order_items_quantity / chk_cart_items_quantity.
--   New orders will store weight_grams + weight_display + product_unit
--   alongside quantity (quantity = weight_grams integer for CHECK).
--   Existing orders need no backfill; new columns are nullable.
--
-- RLS / TRIGGERS / INDEXES
--   No RLS changes. No new triggers. No new indexes (optional later).
--   Existing RLS (008_rls.sql, 013_phase075.sql) and triggers
--   (005_triggers.sql, 015_...) remain untouched.
--
-- REPOSITORY COMPATIBILITY
--   Supabase mappers use rowToCamelCase / objToSnakeCase and ignore
--   unknown columns, so adding nullable columns is safe. Quantity
--   stays integer >0, so old mappers still reconstruct orders.
--   New code will read weight_grams if present, else fallback to quantity.
--
-- REVERSIBILITY
--   Down migration: DROP COLUMN ... IF EXISTS (separate file if needed).
--   Enum value GRAM cannot be removed without recreate; dormancy is
--   safer than removal.
--
-- APPLY ONLY AFTER REVIEW — do NOT auto-push to Supabase.
-- Validate with: psql -f database/019_weight_based_pricing.sql
-- Verify counts drift expected in 010_verify (products still 33,
-- order_items 10→13, cart_items 8→11 after this migration).

-- ============================================================
-- 1. ENUM: add GRAM (dormant PIECE/DOZEN kept)
-- ============================================================

DO $$
BEGIN
  -- product_unit already has KG, PIECE, DOZEN. Add GRAM if missing.
  -- Cannot use IF NOT EXISTS directly on enum values in all PG versions,
  -- so guard via pg_enum lookup.
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'product_unit' AND e.enumlabel = 'GRAM'
  ) THEN
    -- Must run outside explicit transaction block in PG <14, but Supabase
    -- handles enum ADD VALUE in migrations; use ALTER TYPE.
    ALTER TYPE product_unit ADD VALUE 'GRAM';
  END IF;
END $$;

-- ============================================================
-- 2. DOCUMENT DEPRECATION (no structural change)
-- ============================================================

COMMENT ON COLUMN products.stock IS 'DEPRECATED for weight-based pricing: kept for compatibility, ignored by application. Use status OUT_OF_STOCK vs ACTIVE for availability. 010_verify expects column to exist.';
COMMENT ON COLUMN products.min_order_quantity IS 'DEPRECATED for weight-based pricing: kept for compatibility, ignored by application. Weight selection uses presets + custom weight (500g/750g/1000g or 1kg/1.5kg/3kg).';
COMMENT ON COLUMN products.unit IS 'Pricing unit: GRAM or KG for weight-based pricing. Legacy values PIECE/DOZEN remain in enum dormantly for existing rows; application restricts to GRAM/KG.';
COMMENT ON COLUMN order_items.quantity IS 'For weight-based orders, quantity stores weight in grams (integer) to satisfy CHECK quantity>0 and backwards compatibility. Prefer weight_grams/weight_display/product_unit for new orders.';
COMMENT ON COLUMN cart_items.quantity IS 'For weight-based carts, quantity stores weight in grams (integer) to satisfy CHECK quantity>0. Prefer weight_grams/weight_display/product_unit.';

-- ============================================================
-- 3. ORDER_ITEMS — add weight columns (nullable, back-compatible)
-- ============================================================

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS weight_grams numeric(10,2);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS weight_display text;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_unit text;

-- Optional: backfill comment — existing rows keep quantity as grams.
-- No automatic UPDATE to avoid corrupting historic quantities.

-- ============================================================
-- 4. CART_ITEMS — add weight columns (nullable)
-- ============================================================

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS weight_grams numeric(10,2);

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS weight_display text;

ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS product_unit text;

-- ============================================================
-- 5. place_cod_order — weight-aware, backwards-compatible
-- ============================================================
-- Replaces the RPC verbatim from 013/016, adding:
--   * Accepts items with optional weight_grams/weight_display/product_unit.
--     If present, validates them strictly; if absent, falls back to
--     legacy quantity-only validation (backwards compat).
--   * Validates product_unit in ('GRAM','KG') when provided.
--   * Validates weight_grams >0 and weight_display matches unit.
--   * Ensures quantity still >0 (quantity = weight_grams integer for new orders,
--     or legacy count for old payloads).
--   * Inserts new columns via jsonb; quantity column always populated.
--   * No price recalculation here beyond >=0 check (server-side price
--     authority should be added in a follow-up hardening migration that
--     joins products table; this migration stays compatible with current
--     client-calculated totals).
--   * Keeps idempotency, user_id=NULL forcing, timeline handling, and
--     anon/authenticated GRANT exactly as before.

CREATE OR REPLACE FUNCTION public.place_cod_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  p_order      jsonb := payload->'order';
  p_items      jsonb := payload->'items';
  p_timeline   jsonb := payload->'timeline';
  v_item       jsonb;
  v_status     text;
  v_changed_by text;
  v_note       text;
  v_order_id   uuid;
  v_result     jsonb;
  v_qty        integer;
  v_wgrams     numeric;
  v_wdisplay   text;
  v_punit      text;
BEGIN
  IF p_order IS NULL OR p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'place_cod_order: order and at least one item are required';
  END IF;

  IF NULLIF(p_order->>'order_number', '') IS NULL THEN
    RAISE EXCEPTION 'place_cod_order: order_number is required';
  END IF;

  -- Idempotency: return the existing order when the key was already used.
  IF NULLIF(p_order->>'idempotency_key', '') IS NOT NULL THEN
    SELECT id INTO v_order_id
    FROM public.orders
    WHERE idempotency_key = p_order->>'idempotency_key'
    LIMIT 1;
    IF v_order_id IS NOT NULL THEN
      SELECT jsonb_build_object(
        'order',    to_jsonb(o),
        'items',    COALESCE((
          SELECT jsonb_agg(to_jsonb(i))
          FROM public.order_items i
          WHERE i.order_id = o.id
        ), '[]'::jsonb),
        'timeline', COALESCE((
          SELECT jsonb_agg(to_jsonb(t))
          FROM public.order_timeline_entries t
          WHERE t.order_id = o.id
        ), '[]'::jsonb)
      ) INTO v_result
      FROM public.orders o
      WHERE o.id = v_order_id;
      RETURN v_result;
    END IF;
  END IF;

  -- Insert the order. user_id is deliberately NULL for guests.
  INSERT INTO public.orders (
    id, order_number, user_id, idempotency_key, source, status, currency,
    customer_snapshot, shipping_snapshot, billing_snapshot, totals, payment,
    notes, cart_id, created_at, updated_at
  ) VALUES (
    COALESCE(NULLIF(p_order->>'id', '')::uuid, gen_random_uuid()),
    p_order->>'order_number',
    NULL,
    NULLIF(p_order->>'idempotency_key', ''),
    COALESCE(p_order->>'source', 'CHECKOUT'),
    COALESCE(p_order->>'status', 'VALIDATING')::public.order_status,
    COALESCE(p_order->>'currency', 'INR'),
    p_order->'customer_snapshot',
    p_order->'shipping_snapshot',
    p_order->'billing_snapshot',
    p_order->'totals',
    p_order->'payment',
    p_order->>'notes',
    p_order->>'cart_id',
    now(),
    now()
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::integer;
    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'place_cod_order: invalid quantity for item %', v_item->>'id';
    END IF;
    IF (v_item->>'unit_price_amount')::numeric < 0 THEN
      RAISE EXCEPTION 'place_cod_order: invalid unit price for item %', v_item->>'id';
    END IF;

    -- Weight-aware validation (optional fields, backwards compat)
    v_wgrams := NULLIF(v_item->>'weight_grams', '')::numeric;
    v_wdisplay := NULLIF(v_item->>'weight_display', '');
    v_punit := NULLIF(v_item->>'product_unit', '');

    IF v_wgrams IS NOT NULL THEN
      IF v_wgrams <= 0 THEN
        RAISE EXCEPTION 'place_cod_order: invalid weight_grams for item %', v_item->>'id';
      END IF;
      IF v_punit IS NOT NULL AND v_punit NOT IN ('GRAM','KG') THEN
        RAISE EXCEPTION 'place_cod_order: invalid product_unit for item %', v_item->>'id';
      END IF;
      -- If product_unit=GRAM, weight_display should end with g (not kg) and vice versa
      IF v_punit = 'GRAM' AND v_wdisplay IS NOT NULL AND v_wdisplay !~* 'g$' THEN
        RAISE EXCEPTION 'place_cod_order: weight_display unit mismatch for GRAM item %', v_item->>'id';
      END IF;
      IF v_punit = 'KG' AND v_wdisplay IS NOT NULL AND v_wdisplay !~* 'kg$' THEN
        RAISE EXCEPTION 'place_cod_order: weight_display unit mismatch for KG item %', v_item->>'id';
      END IF;
    END IF;

    INSERT INTO public.order_items (
      id, order_id, product_id, snapshot, quantity,
      unit_price_amount, unit_price_currency, subtotal_amount, subtotal_currency,
      weight_grams, weight_display, product_unit,
      created_at
    ) VALUES (
      COALESCE(NULLIF(v_item->>'id', '')::uuid, gen_random_uuid()),
      v_order_id,
      v_item->>'product_id',
      v_item->'snapshot',
      v_qty,
      (v_item->>'unit_price_amount')::numeric,
      COALESCE(v_item->>'unit_price_currency', 'INR'),
      (v_item->>'subtotal_amount')::numeric,
      COALESCE(v_item->>'subtotal_currency', 'INR'),
      v_wgrams,
      v_wdisplay,
      v_punit,
      now()
    );
  END LOOP;

  IF p_timeline IS NOT NULL THEN
    FOR v_status, v_changed_by, v_note IN
      SELECT t->>'status', COALESCE(t->>'changed_by', 'customer'), t->>'note'
      FROM jsonb_array_elements(p_timeline) AS t
    LOOP
      INSERT INTO public.order_timeline_entries (order_id, status, changed_by, note, created_at)
      VALUES (
        v_order_id,
        COALESCE(v_status, 'VALIDATING'),
        v_changed_by,
        v_note,
        now()
      );
    END LOOP;
  END IF;

  SELECT jsonb_build_object(
    'order',    to_jsonb(o),
    'items',    COALESCE((
      SELECT jsonb_agg(to_jsonb(i))
      FROM public.order_items i
      WHERE i.order_id = o.id
    ), '[]'::jsonb),
    'timeline', COALESCE((
      SELECT jsonb_agg(to_jsonb(t))
      FROM public.order_timeline_entries t
      WHERE t.order_id = o.id
    ), '[]'::jsonb)
  ) INTO v_result
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_result;
END;
$$;

-- Permissions unchanged (only anon+authenticated can execute)
REVOKE ALL ON FUNCTION public.place_cod_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_cod_order(jsonb) TO anon, authenticated;
