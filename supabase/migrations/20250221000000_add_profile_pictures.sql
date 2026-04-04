-- Add profile_picture_url column to subcontractors table
ALTER TABLE public.subcontractors
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create profile-pictures storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-pictures bucket
CREATE POLICY "Public Access to profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Allow uploads to profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures');

CREATE POLICY "Allow deletes from profile pictures"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Allow updates to profile pictures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures');
