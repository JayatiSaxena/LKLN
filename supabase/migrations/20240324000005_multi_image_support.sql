-- Multi-image support for products

-- 1. Add images array column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Migrate existing image_url to the first element of the array
UPDATE public.products 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- 3. Storage Bucket Setup (Instructions for user)
-- Create bucket 'products' with PUBLIC access.

-- 4. Storage RLS (Allow admins to manage)
-- Note: These policies are usually handled via the Supabase Dashboard, 
-- but we can add them to the 'storage' schema if needed.
-- We'll stick to the table-level changes for now as storage setup is often manual.
