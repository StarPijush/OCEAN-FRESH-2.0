-- 007_storage.sql
-- OceanFresh Storage Buckets and Policies
-- Bucket for product images (icons, thumbnails, banners, gallery images)

-- ============================================================
-- STORAGE BUCKET: products
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

-- ============================================================
-- POLICIES
-- ============================================================

-- Policy: Anyone can view/download public product images
CREATE POLICY "products_select_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy: Authenticated admin users can upload product images
CREATE POLICY "products_insert_admin"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND (
    SELECT EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Authenticated admin users can update product images
CREATE POLICY "products_update_admin"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
  AND (
    SELECT EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'products'
  AND (
    SELECT EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Authenticated admin users can delete product images
CREATE POLICY "products_delete_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND (
    SELECT EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE user_id = auth.uid()
    )
  )
);
