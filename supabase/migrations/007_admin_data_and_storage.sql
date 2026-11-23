-- Migration 007: align admin data and public image storage with the Nuxt APIs.
-- Prerequisites: migrations 001-006.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS project_date TEXT,
  ADD COLUMN IF NOT EXISTS full_description TEXT;

-- The single-admin policy is enforced by server APIs using service_role.
-- Remove the broad client write policies created by migration 001.
DROP POLICY IF EXISTS "Authenticated users can insert site images" ON public.site_images;
DROP POLICY IF EXISTS "Authenticated users can update site images" ON public.site_images;
DROP POLICY IF EXISTS "Authenticated users can delete site images" ON public.site_images;

-- Public buckets expose image reads only. All writes are made by authenticated
-- Nuxt server APIs using the service_role key.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('site-images', 'site-images', true, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('project-images', 'project-images', true, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view ML public images" ON storage.objects;
CREATE POLICY "Public can view ML public images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('site-images', 'project-images'));

GRANT SELECT ON public.site_images TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.project_images TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.site_images FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.site_settings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.project_images FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.testimonials FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.quote_requests FROM anon, authenticated;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

COMMENT ON COLUMN public.projects.client_name IS
  'Optional client label shown on the public portfolio.';
COMMENT ON COLUMN public.projects.project_date IS
  'Display date retained for the existing portfolio interface.';
COMMENT ON COLUMN public.projects.full_description IS
  'Long project description shown in the portfolio detail view.';
COMMENT ON COLUMN public.rate_limits.identifier_hash IS
  'HMAC-SHA256 of a server-signed quote-form visitor ID or normalized phone number and action; no client-supplied IP header is trusted.';
