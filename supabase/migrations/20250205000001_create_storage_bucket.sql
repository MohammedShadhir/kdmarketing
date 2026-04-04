INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to project media"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-media');

CREATE POLICY "Allow uploads to project media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-media');

CREATE POLICY "Allow deletes from project media"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-media');

CREATE POLICY "Allow updates to project media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-media');
