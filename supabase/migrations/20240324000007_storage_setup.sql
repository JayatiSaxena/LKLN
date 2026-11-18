-- Supabase Storage Setup for Products

-- 1. Create the 'products' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow Public Access to view images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- 3. Allow Authenticated Users (Admins) to upload images
CREATE POLICY "Admin Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' 
    AND (SELECT public.is_admin())
  );

-- 4. Allow Authenticated Users (Admins) to delete images
CREATE POLICY "Admin Delete Access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' 
    AND (SELECT public.is_admin())
  );

-- 5. Allow Authenticated Users (Admins) to update images
CREATE POLICY "Admin Update Access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products' 
    AND (SELECT public.is_admin())
  );
