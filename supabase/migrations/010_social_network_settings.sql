ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS social_facebook_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_instagram_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_whatsapp_enabled BOOLEAN NOT NULL DEFAULT false;
