-- 021_store_configuration_expansion.sql
-- OceanFresh Central Store Configuration — Admin → DB → Storefront
--
-- Extends shop_settings (single-row id='default') into the CENTRAL STORE
-- CONFIGURATION SYSTEM per audit seeting.md. No new table, no realtime,
-- no Google Maps API — Phase 1 stores stable location data (lat/lng + Maps URL).
--
-- VERIFIED: database/ contains 001..020, no 021 exists → next is 021.
-- All ALTERs are IF NOT EXISTS guarded, preserve existing data, use safe
-- defaults (NULL for new public config), add geographic CHECKs, do not
-- expose secrets.
--
-- RLS: unchanged — shop_settings_select_public TO public USING true already
-- covers new public columns (social + location). UPDATE/INSERT/DELETE remain
-- is_admin() only. No secrets stored in DB.
--
-- APPLY: psql -f database/021_store_configuration_expansion.sql
-- Verify: SELECT column_name FROM information_schema.columns WHERE table_name='shop_settings' ORDER BY ordinal_position;

-- ============================================================
-- 1. SOCIAL MEDIA — public links, NULL hides icon on storefront
-- ============================================================

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS x_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text;

-- ============================================================
-- 2. LOCATION — stable data, not a fragile constructed string
--    Phase 1: latitude + longitude + google_maps_url (+ optional place_id)
--    Client-side Google Maps API key (if later added) lives in
--    VITE_GOOGLE_MAPS_API_KEY env, never in DB. See seeting.md §5.
-- ============================================================

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS latitude numeric(10,8),
  ADD COLUMN IF NOT EXISTS longitude numeric(11,8),
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS place_id text;

-- ============================================================
-- 3. STRUCTURED ADDRESS SPLIT (optional convenience)
--    address jsonb remains canonical (string[]). These cols allow
--    Admin to edit City/State/Postal separately and compose LINE2.
--    Kept nullable to avoid dual source-of-truth drift.
-- ============================================================

ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal_code text;

-- ============================================================
-- 4. CONSTRAINTS — geographic ranges (nullable-safe, idempotent)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_latitude') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_latitude
      CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_longitude') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_longitude
      CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;

  -- Social URL format: allow NULL/empty, otherwise must be http(s)://
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_instagram_url') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_instagram_url
      CHECK (instagram_url IS NULL OR instagram_url = '' OR instagram_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_facebook_url') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_facebook_url
      CHECK (facebook_url IS NULL OR facebook_url = '' OR facebook_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_x_url') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_x_url
      CHECK (x_url IS NULL OR x_url = '' OR x_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_linkedin_url') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_linkedin_url
      CHECK (linkedin_url IS NULL OR linkedin_url = '' OR linkedin_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_youtube_url') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_youtube_url
      CHECK (youtube_url IS NULL OR youtube_url = '' OR youtube_url ~* '^https?://');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shop_settings_google_maps_url') THEN
    ALTER TABLE public.shop_settings
      ADD CONSTRAINT chk_shop_settings_google_maps_url
      CHECK (google_maps_url IS NULL OR google_maps_url = '' OR google_maps_url ~* '^https?://');
  END IF;
END $$;

-- ============================================================
-- 5. COMMENTS — production-grade documentation
-- ============================================================

COMMENT ON COLUMN public.shop_settings.instagram_url IS 'Public Instagram URL; NULL/empty hides icon on storefront. Validated ~* ^https?://';
COMMENT ON COLUMN public.shop_settings.facebook_url IS 'Public Facebook URL; NULL/empty hides icon.';
COMMENT ON COLUMN public.shop_settings.x_url IS 'Public X (Twitter) URL; NULL/empty hides icon.';
COMMENT ON COLUMN public.shop_settings.linkedin_url IS 'Public LinkedIn URL; NULL/empty hides icon.';
COMMENT ON COLUMN public.shop_settings.youtube_url IS 'Public YouTube URL; NULL/empty hides icon.';
COMMENT ON COLUMN public.shop_settings.latitude IS 'Store latitude WGS84 (-90..90); NULL hides map. Phase 1: stored directly, no Google API.';
COMMENT ON COLUMN public.shop_settings.longitude IS 'Store longitude WGS84 (-180..180); NULL hides map.';
COMMENT ON COLUMN public.shop_settings.google_maps_url IS 'Canonical Google Maps URL; auto-derived as https://www.google.com/maps?q={lat},{lng} if NULL and lat/lng present. Never stores API key.';
COMMENT ON COLUMN public.shop_settings.place_id IS 'Optional Google Place ID; stable identifier for directions. Never stores API key.';
COMMENT ON COLUMN public.shop_settings.city IS 'Structured address helper — city (e.g., Jhargram). address jsonb remains canonical display.';
COMMENT ON COLUMN public.shop_settings.state IS 'Structured address helper — state (e.g., West Bengal).';
COMMENT ON COLUMN public.shop_settings.postal_code IS 'Structured address helper — postal/PIN code (e.g., 721507).';

-- ============================================================
-- 6. RLS — no change required
--    Existing policies cover new public columns:
--      shop_settings_select_public TO public USING true
--      shop_settings_update_admin  TO authenticated USING is_admin()
--    No private data added; no secrets in DB.
-- ============================================================

-- ============================================================
-- 7. BACKFILL — keep existing row, set new cols NULL (safe default)
--    No UPDATE overwriting live business values.
--    New cols default NULL hides all social/location UI until configured.
-- ============================================================

-- No backfill UPDATE needed — new columns are NULL by default.
-- Existing row id='default' retains store_name, address, hours, etc. from 013.

-- ============================================================
-- 8. VERIFICATION — run after apply
-- ============================================================
-- SELECT 'shop_settings columns' AS check,
--   string_agg(column_name || ':' || data_type, ', ' ORDER BY ordinal_position)
-- FROM information_schema.columns WHERE table_schema='public' AND table_name='shop_settings';
--
-- SELECT 'shop_settings constraints' AS check,
--   string_agg(conname, ', ' ORDER BY conname)
-- FROM pg_constraint WHERE conrelid='public.shop_settings'::regclass AND contype='c';
--
-- SELECT 'shop_settings row' AS check, row_to_json(s) FROM shop_settings s WHERE id='default';
--
-- SELECT 'rls policies' AS check, string_agg(policyname, ', ') FROM pg_policies WHERE tablename='shop_settings';
