-- Create a bucket for review images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for review images
DROP POLICY IF EXISTS "Public Access to Review Images" ON storage.objects;
CREATE POLICY "Public Access to Review Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'reviews');

DROP POLICY IF EXISTS "Users can upload review images" ON storage.objects;
CREATE POLICY "Users can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reviews' AND 
    auth.role() = 'authenticated'
  );
