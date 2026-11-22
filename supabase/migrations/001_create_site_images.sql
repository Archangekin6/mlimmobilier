-- Migration: Create site_images table for managing all public site images
-- This table stores references to images uploaded to Supabase Storage

-- Create site_images table
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(50) NOT NULL, -- 'home', 'about', 'services', 'contact', 'realisations'
  section VARCHAR(100) NOT NULL, -- 'hero_background', 'presentation_image', 'btp_section', etc.
  description TEXT NOT NULL, -- Human-readable description of where this image appears
  image_url TEXT NOT NULL, -- Full Supabase Storage URL
  storage_path TEXT NOT NULL, -- Path in storage bucket (e.g., 'site-images/hero-home.jpg')
  alt_text TEXT, -- Alternative text for accessibility
  display_order INTEGER DEFAULT 0, -- For ordering multiple images in same section
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_images_page_section ON site_images(page, section);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON site_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default placeholder entries for all managed images
INSERT INTO site_images (page, section, description, image_url, storage_path, alt_text, display_order) VALUES
  -- Home page
  ('home', 'hero_background', 'Image d''arrière-plan de la section Hero de la page d''accueil', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80', '', 'Architecture contemporaine ML Immobilier', 1),
  
  -- About page
  ('about', 'hero_background', 'Image d''arrière-plan de la section Hero de la page Qui sommes-nous', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80', '', 'Architecture moderne Abidjan', 1),
  ('about', 'presentation_image', 'Image de présentation de l''entreprise sur la page Qui sommes-nous', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80', '', 'Équipe technique ML Immobilier SARL', 2),
  
  -- Services page
  ('services', 'btp_section_image', 'Image illustrant les services BTP & Construction Générale', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80', '', 'Travaux de construction BTP ML Immobilier', 1),
  ('services', 'electrification_section_image', 'Image illustrant les services d''Électrification HTA/BTA', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80', '', 'Travaux d''électrification et réseau HTA/BTA', 2),
  ('services', 'gestion_section_image', 'Image illustrant les services de Gestion Immobilière', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80', '', 'Gestion immobilière à Abidjan ML Immobilier', 3)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public read access (anyone can view images)
CREATE POLICY "Public can view site images"
  ON site_images
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users (admins) can insert
CREATE POLICY "Authenticated users can insert site images"
  ON site_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users (admins) can update
CREATE POLICY "Authenticated users can update site images"
  ON site_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users (admins) can delete
CREATE POLICY "Authenticated users can delete site images"
  ON site_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment to table
COMMENT ON TABLE site_images IS 'Stores references to all public site images managed through the admin panel';
