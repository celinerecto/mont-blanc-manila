-- Create the public photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public read photos bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- Allow authenticated uploads
CREATE POLICY "Auth upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND auth.uid() IS NOT NULL
  );

-- Allow owner to delete their own photos
CREATE POLICY "Owner delete photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
