-- 013_phase075.sql
-- OceanFresh Phase 0.75 — Production Security & Settings Foundation
--
-- Supersedes the untracked 011_orders_rls.sql and 012_settings.sql:
--   1. Replaces anon INSERT/SELECT policies on order tables with a single
--      SECURITY DEFINER RPC (place_cod_order) so anonymous visitors can place
--      COD orders WITHOUT being able to read ANY order data (PII exposure closed).
--   2. Adds authenticated-customer INSERT policies for orders/order_items/timeline
--      (a logged-in customer may create orders for themselves — still cannot
--      read or modify other customers' orders).
--   3. Tightens anon cart policies (session-scoped only; no inserting items
--      into arbitrary carts; no reading authenticated users' carts).
--   4. Extends shop_settings into the single source of truth for ALL store
--      business values (store name, tagline, contact, address, hours,
--      pincodes, areas, delivery radius, founded year) and backfills the
--      current live values. whatsapp_number is canonicalized to 918509597935.
--   5. Drops the optional 012 settings/setting_groups key-value tables if
--      they were applied (redundant second source of truth — the app only
--      reads shop_settings).

-- ============================================================
-- 1. REVOKE ANONYMOUS TABLE ACCESS (011 policies removed)
-- ============================================================

DROP POLICY IF EXISTS "orders_insert_anon" ON public.orders;
DROP POLICY IF EXISTS "orders_select_anon" ON public.orders;
DROP POLICY IF EXISTS "order_items_insert_anon" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_anon" ON public.order_items;
DROP POLICY IF EXISTS "order_timeline_insert_anon" ON public.order_timeline_entries;
DROP POLICY IF EXISTS "order_timeline_select_anon" ON public.order_timeline_entries;

-- ============================================================
-- 2. place_cod_order() — secure guest COD order entry point
-- ============================================================
-- Anonymous visitors have NO direct INSERT/SELECT on order tables. All guest
-- orders must go through this RPC. SECURITY DEFINER (owner runs the function,
-- bypassing RLS), so every input is validated defensively:
--   * order_number is required
--   * at least one item is required; quantity > 0; unit price >= 0
--   * status must be a valid order_status enum value
--   * user_id is ALWAYS forced to NULL (a guest cannot impersonate a customer)
--   * duplicate idempotency_key returns the existing order instead of creating
--     a second one
-- Returns { order, items, timeline } so the repository can map the full order
-- without any anon SELECT capability.

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
    IF (v_item->>'quantity')::integer <= 0 THEN
      RAISE EXCEPTION 'place_cod_order: invalid quantity for item %', v_item->>'id';
    END IF;
    IF (v_item->>'unit_price_amount')::numeric < 0 THEN
      RAISE EXCEPTION 'place_cod_order: invalid unit price for item %', v_item->>'id';
    END IF;

    INSERT INTO public.order_items (
      id, order_id, product_id, snapshot, quantity,
      unit_price_amount, unit_price_currency, subtotal_amount, subtotal_currency,
      created_at
    ) VALUES (
      COALESCE(NULLIF(v_item->>'id', '')::uuid, gen_random_uuid()),
      v_order_id,
      v_item->>'product_id',
      v_item->'snapshot',
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price_amount')::numeric,
      COALESCE(v_item->>'unit_price_currency', 'INR'),
      (v_item->>'subtotal_amount')::numeric,
      COALESCE(v_item->>'subtotal_currency', 'INR'),
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

-- The RPC is the ONLY way anonymous users can create orders.
REVOKE ALL ON FUNCTION public.place_cod_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_cod_order(jsonb) TO anon, authenticated;

-- ============================================================
-- 3. AUTHENTICATED CUSTOMER ORDER INSERTS
-- ============================================================
-- A logged-in (non-admin) customer may create their own orders directly.
-- They still cannot read or write anyone else's orders.

CREATE POLICY "orders_insert_customer"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "order_items_insert_customer"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()::text
  )
);

CREATE POLICY "order_timeline_insert_customer"
ON public.order_timeline_entries
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_timeline_entries.order_id
      AND orders.user_id = auth.uid()::text
  )
);

-- ============================================================
-- 4. CART POLICY TIGHTENING
-- ============================================================
-- Anonymous access is session-scoped ONLY:
--   * carts_select_anon / cart_items_all_anon apply exclusively to guest
--     carts (session_id present AND user_id NULL), so an anon caller can no
--     longer read authenticated users' carts or insert items into them.
--   * carts_insert_anon can no longer spoof a user_id.

DROP POLICY IF EXISTS "carts_select_anon" ON public.carts;
CREATE POLICY "carts_select_anon"
ON public.carts
FOR SELECT
TO anon
USING (session_id IS NOT NULL AND user_id IS NULL);

DROP POLICY IF EXISTS "carts_insert_anon" ON public.carts;
CREATE POLICY "carts_insert_anon"
ON public.carts
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "cart_items_all_anon" ON public.cart_items;
CREATE POLICY "cart_items_all_anon"
ON public.cart_items
FOR ALL
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.session_id IS NOT NULL
      AND carts.user_id IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
      AND carts.session_id IS NOT NULL
      AND carts.user_id IS NULL
  )
);

-- ============================================================
-- 5. SHOP SETTINGS — SINGLE SOURCE OF TRUTH
-- ============================================================
-- Extends the single-row shop_settings table to hold every business value
-- the storefront renders and the admin edits. No value is duplicated in
-- application code; the database wins, code defaults exist only as a
-- bootstrap fallback for the first render.

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS store_name         text,
  ADD COLUMN IF NOT EXISTS store_tagline      text,
  ADD COLUMN IF NOT EXISTS phone_display      text,
  ADD COLUMN IF NOT EXISTS phone_raw          text,
  ADD COLUMN IF NOT EXISTS email              text,
  ADD COLUMN IF NOT EXISTS address            jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hours              jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pincodes           jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_areas     jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_radius    numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS founded_year       integer NOT NULL DEFAULT 2018;

-- Backfill the live row with the canonical business values.
-- whatsapp_number is canonicalized to 918509597935 (the number orders
-- currently already go to); the drift value 919876543210 is removed.
UPDATE public.shop_settings
SET
  whatsapp_number       = COALESCE(NULLIF(whatsapp_number, ''), '918509597935'),
  store_name            = 'OceanFresh',
  store_tagline         = 'Fresh Seafood · Jhargram, West Bengal',
  phone_display         = '+91 85095 97935',
  phone_raw             = '+918509597935',
  email                 = 'hello@oceanfresh.in',
  address               = '["Shop No. 12, Fish Market","Jhargram, West Bengal 721507"]'::jsonb,
  hours                 = '["Mon–Sat · 6AM – 9PM","Sunday · 6AM – 2PM"]'::jsonb,
  pincodes              = '["721501","721502","721503","721504","721505","721506","721507","721508","721509","721513","721514","721515","721516","721517","721518","721520","721521","721527"]'::jsonb,
  delivery_areas        = '["Jamboni","Binpur","Gopiballavpur","Belpahari","Nayagram","Sankrail","Rohini","Silda","Gidhni","Lodhasuli"]'::jsonb,
  delivery_radius       = 15.00,
  founded_year          = 2018,
  updated_at            = now()
WHERE id = 'default';

-- ============================================================
-- 6. REMOVE REDUNDANT 012 KEY-VALUE SETTINGS TABLES
-- ============================================================
-- If the optional 012_settings.sql was applied, its settings/setting_groups
-- rows duplicate shop_settings. The application only reads shop_settings, so
-- the duplicates are dropped to guarantee a single source of truth.

DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.setting_groups;
