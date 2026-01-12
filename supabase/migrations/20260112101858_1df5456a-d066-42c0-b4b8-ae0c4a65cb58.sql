-- Fix storage policies (drop existing first)
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view their own media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view chat media in conversations" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own media" ON storage.objects;

-- Add storage RLS policies for authenticated access
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can view chat media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-media');

CREATE POLICY "Authenticated users can delete their own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);