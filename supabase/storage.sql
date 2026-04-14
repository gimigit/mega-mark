-- AgroMark EU - Storage Bucket Policies
-- Run AFTER creating buckets via Supabase Dashboard or CLI:
-- Storage → New Bucket → create: listings, listings-images, listing-documents, avatars, dealer-logos
-- All as PUBLIC buckets

-- ============================================
-- LISTINGS BUCKET (main listing images)
-- ============================================

-- Create the 'listings' bucket (public, downloadable without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Anyone can VIEW images in the listings bucket
DROP POLICY IF EXISTS "Public listing images are viewable" ON storage.objects;
CREATE POLICY "Public listing images are viewable"
  ON storage.objects FOR SELECT USING (bucket_id = 'listings');

-- Policy: Authenticated users can UPLOAD images to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'listings' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Policy: Users can UPDATE their own listing images
DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
CREATE POLICY "Users can update own listing images"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'listings' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Policy: Users can DELETE their own listing images
DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;
CREATE POLICY "Users can delete own listing images"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'listings' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================
-- LISTINGS-IMAGES BUCKET
-- ============================================

DROP POLICY IF EXISTS "Public listing images are accessible" ON storage.objects;
CREATE POLICY "Public listing images are accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'listings-images');

DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'listings-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
CREATE POLICY "Users can update own listing images"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'listings-images' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;
CREATE POLICY "Users can delete own listing images"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'listings-images' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================
-- LISTING-DOCUMENTS BUCKET
-- ============================================

DROP POLICY IF EXISTS "Public listing documents are accessible" ON storage.objects;
CREATE POLICY "Public listing documents are accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'listing-documents');

DROP POLICY IF EXISTS "Authenticated users can upload listing documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing documents"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'listing-documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can delete own listing documents" ON storage.objects;
CREATE POLICY "Users can delete own listing documents"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'listing-documents' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================
-- AVATARS BUCKET
-- ============================================

DROP POLICY IF EXISTS "Public avatars are accessible" ON storage.objects;
CREATE POLICY "Public avatars are accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ============================================
-- DEALER-LOGOS BUCKET
-- ============================================

DROP POLICY IF EXISTS "Public dealer logos are accessible" ON storage.objects;
CREATE POLICY "Public dealer logos are accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'dealer-logos');

DROP POLICY IF EXISTS "Dealers can upload own logos" ON storage.objects;
CREATE POLICY "Dealers can upload own logos"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'dealer-logos' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Dealers can update own logos" ON storage.objects;
CREATE POLICY "Dealers can update own logos"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'dealer-logos' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ============================================
-- FILE SIZE RESTRICTIONS
-- (apply via Dashboard: Storage → Bucket → Settings)
-- ============================================
--
-- listings-images:    10MB max,  image/jpeg, image/png, image/webp
-- listing-documents: 50MB max,  application/pdf, image/jpeg, image/png
-- avatars:           2MB max,  image/jpeg, image/png, image/webp
-- dealer-logos:      2MB max,  image/jpeg, image/png, image/svg+xml
