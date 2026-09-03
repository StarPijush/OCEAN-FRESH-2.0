-- 020_price_per_kg_authority.sql
-- OceanFresh — Price Per KG Authority & Manual Repricing Safety
--
-- PURPOSE
--   Makes explicit: products.price = canonical price per 1 KG (₹ per 1000g).
--   Existing column "price" stays named "price" to avoid churn, but its
--   semantic becomes unambiguous in code/comments/Admin UI:
--     products.price = pricePerKg
--     Admin shows: PRICE / KG — Price for 1 kilogram of this product.
--   Customer mode GRAM|KG only changes display/presets; internally always
--   grams. Price calc: lineTotal = ROUND(pricePerKg*100 * grams/1000)/100.
--
--   This migration DOES NOT auto-convert existing GRAM/PIECE/DOZEN prices.
--   Manual review is required (see §4). Automatic price*1000 would corrupt
--   data if interpretation was wrong.
--
-- TABLES AFFECTED
--   products (COMMENT only; no column drop), order_items, cart_items,
--   enum product_unit (no change; GRAM already added in 019, PIECE/DOZEN dormant),
--   function public.place_cod_order(jsonb) — replaced with price-authority version.
--
-- COLUMNS ADDED
--   None new (019 already added weight_grams/weight_display/product_unit nullable).
--   This file adds CHECK constraints IF NOT EXISTS and COMMENTs.
--
-- COLUMNS REMOVED
--   None. stock and min_order_quantity kept for 010_verify 33-col compatibility.
--
-- COLUMNS CHANGED
--   None structurally; only COMMENTs clarifying semantics.
--
-- ENUM CHANGES
--   None (GRAM already added; PIECE/DOZEN kept dormant).
--
-- DATA MIGRATION
--   NONE AUTOMATIC. Existing products remain as-is. Two reports for manual:
--     1) GRAM products: SELECT id,name,price,unit FROM products WHERE unit='GRAM' AND is_deleted=false;
--        These were previously priced per gram. Verify each price is intended
--        per gram; if so, new pricePerKg = old *1000 must be entered manually
--        via Admin (do not UPDATE here).
--     2) PIECE/DOZEN products: SELECT ... WHERE unit IN ('PIECE','DOZEN');
--        Do not convert to KG automatically; verify if they are truly seafood
--        weight items or should be recreated.
--   No UPDATE executed by this migration.
--
-- RLS / TRIGGERS / INDEXES
--   No RLS change (already tightened in 013/016). No trigger change.
--   Optional CHECKs are additive and nullable-safe.
--
-- REPOSITORY COMPATIBILITY
--   Mappers ignore unknown columns; order_items.quantity still stores
--   round(weight_grams) for CHECK>0 compatibility. New code reads/writes
--   weight_grams canonical.
--
-- REVERSIBILITY
--   DROP CONSTRAINT IF EXISTS, COMMENT resets, CREATE OR REPLACE FUNCTION
--   with 019 body. Enum value GRAM not removed (unsafe).
--
-- APPLY ONLY AFTER REVIEW — do NOT auto-push to Supabase.

-- ============================================================
-- 1. EXPLICIT SEMANTICS — COMMENTS ONLY (no DDL)
-- ============================================================

COMMENT ON COLUMN products.price IS 'pricePerKg: Price for 1 kilogram of this product (₹ per 1000g, numeric 12,2). Single source. Customer mode GRAM|KG only changes display; internally lineTotal = ROUND(pricePerKg*100 * weight_grams/1000)/100. Admin UI must show "PRICE / KG — Price for 1 kilogram". See shared/domain/weight.ts calculatePriceFromKg.';

COMMENT ON COLUMN products.unit IS 'DORMANT for pricing after 020: price always from products.price per KG. Unit kept for row compatibility (GRAM/KG still valid display mode, PIECE/DOZEN legacy). Do not use as pricing basis; application restricts new products to pricePerKg only.';

COMMENT ON COLUMN products.stock IS 'DEPRECATED — see 019. Kept for 010_verify 33 cols and rollback. Use products.status ACTIVE vs OUT_OF_STOCK for availability; weight domain isProductAvailable().';

COMMENT ON COLUMN products.min_order_quantity IS 'DEPRECATED — see 019. Weight presets 500/750/1000g and 1/1.5/3kg are global via domain, not per-product.';

COMMENT ON COLUMN order_items.weight_grams IS 'Canonical weight in grams (numeric 10,2) for new orders. Must equal ROUND(quantity) for CHECK compatibility. Price calc uses pricePerKg from products.price.';
COMMENT ON COLUMN order_items.product_unit IS 'Customer selected mode GRAM|KG for display (not product pricing unit). Validates suffix of weight_display.';
COMMENT ON COLUMN cart_items.weight_grams IS 'Canonical grams for cart; mode decides display.';
COMMENT ON COLUMN cart_items.product_unit IS 'GRAM|KG mode';

-- ============================================================
-- 2. REPORT QUERIES FOR MANUAL REVIEW (read-only, commented)
-- ============================================================
-- Run these manually before repricing:
-- SELECT id, name, price, unit, status FROM products WHERE unit='GRAM' AND is_deleted=false ORDER BY name;
-- SELECT id, name, price, unit, status FROM products WHERE unit IN ('PIECE','DOZEN') AND is_deleted=false ORDER BY name;
-- For each GRAM row, confirm whether old price meant per gram; if yes, set new pricePerKg = old*1000 via Admin Edit.
-- Do NOT run UPDATE price=price*1000 here automatically.

-- ============================================================
-- 3. CHECK CONSTRAINTS — additive, nullable-safe, idempotent
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_order_items_weight_grams') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_weight_grams CHECK (weight_grams IS NULL OR weight_grams > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_order_items_product_unit') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT chk_order_items_product_unit CHECK (product_unit IS NULL OR product_unit IN ('GRAM','KG'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_cart_items_weight_grams') THEN
    ALTER TABLE public.cart_items ADD CONSTRAINT chk_cart_items_weight_grams CHECK (weight_grams IS NULL OR weight_grams > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_cart_items_product_unit') THEN
    ALTER TABLE public.cart_items ADD CONSTRAINT chk_cart_items_product_unit CHECK (product_unit IS NULL OR product_unit IN ('GRAM','KG'));
  END IF;
END $$;

-- ============================================================
-- 4. place_cod_order — pricePerKg authority, weight required
-- ============================================================
-- Replaces 019 RPC with strict authority:
--   * weight_grams REQUIRED (no longer optional) for new orders
--   * product must exist, is_deleted=false, status='ACTIVE'
--   * product_unit must be GRAM|KG and suffix matches weight_display
--   * quantity must equal round(weight_grams)
--   * unit_price_amount must equal products.price (pricePerKg) ±0.01
--   * subtotal must equal ROUND(pricePerKg*100 * grams/1000)/100 ±0.01
-- Keeps idempotency, user_id=NULL, timeline, anon/auth GRANT.

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
  v_product_id text;
  v_price_per_kg numeric;
  v_client_unit numeric;
  v_client_subtotal numeric;
  v_expected_subtotal numeric;
BEGIN
  IF p_order IS NULL OR p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'place_cod_order: order and at least one item are required';
  END IF;

  IF NULLIF(p_order->>'order_number', '') IS NULL THEN
    RAISE EXCEPTION 'place_cod_order: order_number is required';
  END IF;

  -- Idempotency
  IF NULLIF(p_order->>'idempotency_key', '') IS NOT NULL THEN
    SELECT id INTO v_order_id FROM public.orders WHERE idempotency_key = p_order->>'idempotency_key' LIMIT 1;
    IF v_order_id IS NOT NULL THEN
      SELECT jsonb_build_object(
        'order',    to_jsonb(o),
        'items',    COALESCE((SELECT jsonb_agg(to_jsonb(i)) FROM public.order_items i WHERE i.order_id = o.id), '[]'::jsonb),
        'timeline', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM public.order_timeline_entries t WHERE t.order_id = o.id), '[]'::jsonb)
      ) INTO v_result FROM public.orders o WHERE o.id = v_order_id;
      RETURN v_result;
    END IF;
  END IF;

  INSERT INTO public.orders (id, order_number, user_id, idempotency_key, source, status, currency, customer_snapshot, shipping_snapshot, billing_snapshot, totals, payment, notes, cart_id, created_at, updated_at)
  VALUES (COALESCE(NULLIF(p_order->>'id', '')::uuid, gen_random_uuid()), p_order->>'order_number', NULL, NULLIF(p_order->>'idempotency_key', ''), COALESCE(p_order->>'source', 'CHECKOUT'), COALESCE(p_order->>'status', 'VALIDATING')::public.order_status, COALESCE(p_order->>'currency', 'INR'), p_order->'customer_snapshot', p_order->'shipping_snapshot', p_order->'billing_snapshot', p_order->'totals', p_order->'payment', p_order->>'notes', p_order->>'cart_id', now(), now())
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::integer;
    v_wgrams := NULLIF(v_item->>'weight_grams', '')::numeric;
    v_wdisplay := NULLIF(v_item->>'weight_display', '');
    v_punit := NULLIF(v_item->>'product_unit', '');
    v_product_id := v_item->>'product_id';
    v_client_unit := (v_item->>'unit_price_amount')::numeric;
    v_client_subtotal := (v_item->>'subtotal_amount')::numeric;

    IF v_qty IS NULL OR v_qty <= 0 THEN RAISE EXCEPTION 'place_cod_order: invalid quantity for item %', v_item->>'id'; END IF;
    IF v_client_unit IS NULL OR v_client_unit < 0 THEN RAISE EXCEPTION 'place_cod_order: invalid unit price for item %', v_item->>'id'; END IF;
    -- weight is now REQUIRED for pricePerKg model
    IF v_wgrams IS NULL THEN RAISE EXCEPTION 'place_cod_order: weight_grams is required for item %', v_item->>'id'; END IF;
    IF v_wgrams <= 0 THEN RAISE EXCEPTION 'place_cod_order: invalid weight_grams for item %', v_item->>'id'; END IF;
    IF v_punit NOT IN ('GRAM','KG') THEN RAISE EXCEPTION 'place_cod_order: invalid product_unit for item %', v_item->>'id'; END IF;
    IF v_punit = 'GRAM' AND v_wdisplay IS NOT NULL AND v_wdisplay !~* 'g$' THEN RAISE EXCEPTION 'place_cod_order: weight_display unit mismatch for GRAM item %', v_item->>'id'; END IF;
    IF v_punit = 'KG' AND v_wdisplay IS NOT NULL AND v_wdisplay !~* 'kg$' THEN RAISE EXCEPTION 'place_cod_order: weight_display unit mismatch for KG item %', v_item->>'id'; END IF;
    IF v_qty != round(v_wgrams)::int THEN RAISE EXCEPTION 'place_cod_order: quantity % must equal round(weight_grams) %', v_qty, round(v_wgrams)::int; END IF;

    -- authoritative product lookup: pricePerKg + ACTIVE check
    SELECT price INTO v_price_per_kg FROM public.products WHERE id::text = v_product_id AND is_deleted = false;
    IF v_price_per_kg IS NULL THEN RAISE EXCEPTION 'place_cod_order: product not found or deleted %', v_product_id; END IF;
    PERFORM 1 FROM public.products WHERE id::text = v_product_id AND status = 'ACTIVE' AND is_deleted = false;
    IF NOT FOUND THEN RAISE EXCEPTION 'place_cod_order: product not available %', v_product_id; END IF;
    IF abs(v_client_unit - v_price_per_kg) > 0.01 THEN RAISE EXCEPTION 'place_cod_order: unit_price_amount % != pricePerKg % for %', v_client_unit, v_price_per_kg, v_product_id; END IF;
    -- canonical subtotal = ROUND(pricePerKg*100 * grams/1000)/100
    v_expected_subtotal := round( round(v_price_per_kg * 100) * v_wgrams / 1000 ) / 100;
    IF abs(v_client_subtotal - v_expected_subtotal) > 0.01 THEN RAISE EXCEPTION 'place_cod_order: subtotal % != expected % (pricePerKg % * %g/1000) for %', v_client_subtotal, v_expected_subtotal, v_price_per_kg, v_wgrams, v_product_id; END IF;

    INSERT INTO public.order_items (id, order_id, product_id, snapshot, quantity, unit_price_amount, unit_price_currency, subtotal_amount, subtotal_currency, weight_grams, weight_display, product_unit, created_at)
    VALUES (COALESCE(NULLIF(v_item->>'id', '')::uuid, gen_random_uuid()), v_order_id, v_product_id, v_item->'snapshot', v_qty, v_client_unit, COALESCE(v_item->>'unit_price_currency', 'INR'), v_client_subtotal, COALESCE(v_item->>'subtotal_currency', 'INR'), v_wgrams, v_wdisplay, v_punit, now());
  END LOOP;

  IF p_timeline IS NOT NULL THEN
    FOR v_status, v_changed_by, v_note IN SELECT t->>'status', COALESCE(t->>'changed_by', 'customer'), t->>'note' FROM jsonb_array_elements(p_timeline) AS t LOOP
      INSERT INTO public.order_timeline_entries (order_id, status, changed_by, note, created_at) VALUES (v_order_id, COALESCE(v_status, 'VALIDATING'), v_changed_by, v_note, now());
    END LOOP;
  END IF;

  SELECT jsonb_build_object('order', to_jsonb(o), 'items', COALESCE((SELECT jsonb_agg(to_jsonb(i)) FROM public.order_items i WHERE i.order_id = o.id), '[]'::jsonb), 'timeline', COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM public.order_timeline_entries t WHERE t.order_id = o.id), '[]'::jsonb)) INTO v_result FROM public.orders o WHERE o.id = v_order_id;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.place_cod_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_cod_order(jsonb) TO anon, authenticated;
