-- Migration 009: restore missing managed image slots without changing existing references.
-- Project galleries remain in project_images and may contain multiple images.

INSERT INTO public.site_images (
  page, section, description, image_url, storage_path, alt_text, display_order
)
SELECT slot.page, slot.section, slot.description, slot.image_url, '', slot.alt_text, slot.display_order
FROM (VALUES
  ('home', 'hero_background',
    'Image d’arrière-plan du Hero de la page d’accueil',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    'Architecture contemporaine ML Immobilier', 1),
  ('about', 'hero_background',
    'Image d’arrière-plan du Hero de la page Qui sommes-nous',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80',
    'Architecture moderne Abidjan', 1),
  ('about', 'presentation_image',
    'Image de présentation de l’entreprise',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
    'Équipe technique ML Immobilier SARL', 2),
  ('services', 'btp_section_image',
    'Image du pôle Construction & Ouvrages',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    'Travaux de construction BTP ML Immobilier', 1),
  ('services', 'electrification_section_image',
    'Image du pôle Énergie & Distribution',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80',
    'Travaux d’Électrification et réseau HTA/BTA', 2),
  ('services', 'gestion_section_image',
    'Image du pôle Gestion de Patrimoine',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
    'Gestion immobilière à Abidjan ML Immobilier', 3)
) AS slot(page, section, description, image_url, alt_text, display_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.site_images AS existing
  WHERE existing.page = slot.page
    AND existing.section = slot.section
);
