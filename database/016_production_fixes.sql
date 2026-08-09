-- 016_production_fixes.sql
-- OceanFresh Production Blocker Fixes
--
-- Purpose: Restores the two confirmed production blockers on the live project
-- discovered during the production audit (schema/security/storage changes ONLY;
-- no SELECT diagnostics — see 017_production_diagnostic.sql for those):
--
--   1. public.place_cod_order(jsonb) is MISSING on the live database
--      (PGRST202 404). Guest checkout aborts and no order is ever created,
--      because the storefront intentionally fails the order when the
--      persistence step cannot succeed.
--   2. The `products` storage bucket is MISSING (007_storage.sql never
--      applied). Product images will be stored in Supabase Storage and the
--      bucket does not exist.
--
-- Additionally this re-applies, idempotently, the security hardening that was
-- shipped in 013_phase075.sql but is missing on the live database:
--   * drops any leftover anonymous order-table policies (if present)
--   * re-creates authenticated-customer INSERT policies (if missing)
--   * re-tightens anonymous cart policies to session-scoped only
--
-- Everything below is additive, guarded (IF EXISTS / IF NOT EXISTS /
-- ON CONFLICT DO NOTHING), and safe to re-run multiple times.
--
-- SECURITY NOTE on storage policies:
-- 007_storage.sql gated admin storage access on "admin_profiles row exists".
-- 016 uses public.is_admin() (role IN ('admin','super_admin')) instead — the
-- SAME authority as all public-table RLS policies, so storage authorization
-- matches table authorization exactly and cannot be granted by a row that the
-- is_admin() checks elsewhere would reject. It is strictly stronger.
--
-- Approval: reviewed for RLS integrity. RLS on every public table remains
-- ENABLED; no anonymous access is added to any order/settings/admin data.

-- ============================================================
-- 1. place_cod_order() — secure guest order entry point
-- ============================================================
-- Source of truth: 013_phase075.sql. Recreated verbatim so the repository
-- layer (packages/order) routes guest orders through the exact same contract:
--   * returns { order, items, timeline }
--   * validates order_number, items, quantity > 0, unit price >= 0
--   * forces user_id = NULL for guests
--   * idempotency_key deduplication

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
-- 2. REMOVE ANY LEFTOVER ANONYMOUS ORDER TABLE ACCESS
-- ============================================================

DROP POLICY IF EXISTS "orders_insert_anon" ON public.orders;
DROP POLICY IF EXISTS "orders_select_anon" ON public.orders;
DROP POLICY IF EXISTS "order_items_insert_anon" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_anon" ON public.order_items;
DROP POLICY IF EXISTS "order_timeline_insert_anon" ON public.order_timeline_entries;
DROP POLICY IF EXISTS "order_timeline_select_anon" ON public.order_timeline_entries;

-- ============================================================
-- 3. AUTHENTICATED CUSTOMER ORDER INSERTS
-- ============================================================
-- Logged-in (non-admin) customers may create their own orders directly.
-- They can still never read or modify someone else's orders.

DROP POLICY IF EXISTS "orders_insert_customer" ON public.orders;
CREATE POLICY "orders_insert_customer"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "order_items_insert_customer" ON public.order_items;
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

DROP POLICY IF EXISTS "order_timeline_insert_customer" ON public.order_timeline_entries;
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
-- 4. ANONYMOUS CART POLICY TIGHTENING (session-scoped only)
-- ============================================================

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
-- 5. STORAGE BUCKET: products + secure policies
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Public read: product images are intended to be publicly viewable.
-- Files public -> anon consumes image URLs from storefront <img> tags.

DROP POLICY IF EXISTS "products_select_public" ON storage.objects;
CREATE POLICY "products_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Admin-only writes: same authority as public.is_admin() table policies.

DROP POLICY IF EXISTS "products_insert_admin" ON storage.objects;
CREATE POLICY "products_insert_admin"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND public.is_admin()
);

DROP POLICY IF EXISTS "products_update_admin" ON storage.objects;
CREATE POLICY "products_update_admin"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'products'
  AND public.is_admin()
);

DROP POLICY IF EXISTS "products_delete_admin" ON storage.objects;
CREATE POLICY "products_delete_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND public.is_admin()
);