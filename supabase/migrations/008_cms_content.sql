-- Migration 008: editable public page content and fixed service sections.
-- Prerequisites: migrations 001-007.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS home_description TEXT,
  ADD COLUMN IF NOT EXISTS hero_secondary_cta_text TEXT,
  ADD COLUMN IF NOT EXISTS about_hero_title TEXT,
  ADD COLUMN IF NOT EXISTS about_hero_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS about_presentation_title TEXT,
  ADD COLUMN IF NOT EXISTS about_presentation_text TEXT,
  ADD COLUMN IF NOT EXISTS about_location_text TEXT,
  ADD COLUMN IF NOT EXISTS about_mission_title TEXT,
  ADD COLUMN IF NOT EXISTS about_mission_text TEXT,
  ADD COLUMN IF NOT EXISTS about_values_title TEXT,
  ADD COLUMN IF NOT EXISTS about_values_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS about_value_1_title TEXT,
  ADD COLUMN IF NOT EXISTS about_value_1_text TEXT,
  ADD COLUMN IF NOT EXISTS about_value_2_title TEXT,
  ADD COLUMN IF NOT EXISTS about_value_2_text TEXT,
  ADD COLUMN IF NOT EXISTS about_value_3_title TEXT,
  ADD COLUMN IF NOT EXISTS about_value_3_text TEXT,
  ADD COLUMN IF NOT EXISTS about_value_4_title TEXT,
  ADD COLUMN IF NOT EXISTS about_value_4_text TEXT,
  ADD COLUMN IF NOT EXISTS about_cta_title TEXT,
  ADD COLUMN IF NOT EXISTS about_cta_text TEXT;

-- Seed only newly-added fields, preserving any content already managed in Supabase.
UPDATE public.site_settings
SET
  home_description = COALESCE(
    home_description,
    'Une synergie de compétences pour concevoir vos ouvrages, assurer vos raccordements haute/basse tension et pérenniser vos actifs immobiliers.'
  ),
  hero_secondary_cta_text = COALESCE(hero_secondary_cta_text, 'Nos réalisations'),
  about_hero_title = COALESCE(about_hero_title, 'Bâtir l''Avenir d''Abidjan avec Rigueur & Méthode'),
  about_hero_subtitle = COALESCE(about_hero_subtitle, 'Découvrez les valeurs, la mission et l''équipe d''ingénieurs et techniciens qui constituent le socle de ML Immobilier SARL.'),
  about_presentation_title = COALESCE(about_presentation_title, 'Un acteur d''ingénierie BTP et d''énergie à Abidjan'),
  about_presentation_text = COALESCE(
    about_presentation_text,
    'Créée pour répondre aux impératifs d''urbanisation, d''infrastructures électriques conformes et de sécurisation du foncier en Côte d''Ivoire, ML Immobilier SARL est une entreprise pluridisciplinaire enregistrée au registre du commerce d''Abidjan.'
  ),
  about_location_text = COALESCE(
    about_location_text,
    'Implantée à Yopougon (Terminus 27), notre équipe regroupe des ingénieurs en génie civil, des techniciens électriciens habilités et des gestionnaires d''actifs. Nous garantissons une présence terrain continue, le contrôle des coûts et le respect scrupuleux des normes ivoiriennes.'
  ),
  about_values_title = COALESCE(about_values_title, 'Nos Piliers'),
  about_values_subtitle = COALESCE(about_values_subtitle, '4 Principes au Cœur de Chacun de nos Chantiers'),
  about_value_1_title = COALESCE(about_value_1_title, 'Rigueur & Qualité'),
  about_value_1_text = COALESCE(about_value_1_text, 'Exigence absolue sur le calcul des charges, le ferraillage et la sécurité des installations haute tension.'),
  about_value_2_title = COALESCE(about_value_2_title, 'Transparence Totale'),
  about_value_2_text = COALESCE(about_value_2_text, 'Devis quantitatifs clairs sans frais dissimulés. Rapports d''avancement remis à chaque phase d''exécution.'),
  about_value_3_title = COALESCE(about_value_3_title, 'Respect des Délais'),
  about_value_3_text = COALESCE(about_value_3_text, 'Planification rigoureuse et approvisionnement anticipé pour livrer les ouvrages aux dates contractuelles.'),
  about_value_4_title = COALESCE(about_value_4_title, 'Interlocuteur Dédié'),
  about_value_4_text = COALESCE(about_value_4_text, 'Un chargé d''affaires qui suit votre dossier de bout en bout et vous conseille avec précision.'),
  about_cta_title = COALESCE(about_cta_title, 'Un projet à Abidjan ou en Côte d''Ivoire ?'),
  about_cta_text = COALESCE(
    about_cta_text,
    'Consultez nos équipes techniques à notre agence de Yopougon Terminus 27 ou transmettez votre cahier des charges en ligne.'
  )
WHERE id = '00000000-0000-0000-0000-000000000001';

CREATE TABLE IF NOT EXISTS public.site_services (
  slug TEXT PRIMARY KEY CHECK (slug IN ('btp', 'electrification', 'gestion')),
  home_title TEXT NOT NULL,
  detail_title TEXT NOT NULL,
  badge TEXT NOT NULL,
  home_description TEXT NOT NULL,
  home_highlights JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(home_highlights) = 'array'),
  detail_description TEXT NOT NULL,
  detail_items JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(detail_items) = 'array'),
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_services_published_order
  ON public.site_services(published, display_order);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_site_services_updated_at'
      AND tgrelid = 'public.site_services'::regclass
  ) THEN
    CREATE TRIGGER update_site_services_updated_at
      BEFORE UPDATE ON public.site_services
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

ALTER TABLE public.site_services ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.site_services TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.site_services FROM anon, authenticated;

DROP POLICY IF EXISTS "Public can view published services" ON public.site_services;
CREATE POLICY "Public can view published services"
  ON public.site_services
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

INSERT INTO public.site_services (
  slug, home_title, detail_title, badge, home_description, home_highlights,
  detail_description, detail_items, display_order, published
) VALUES
(
  'btp',
  'BTP & Construction Générale',
  'BTP & Construction Générale',
  'Pôle Construction',
  'De l’étude géotechnique aux finitions de standing. Réalisation d’immeubles d’habitation, villas modernes, travaux de génie civil et rénovation lourde.',
  '["Gros œuvre & béton armé certifié", "Rénovation & second œuvre soigné", "Suivi de chantier rigoureux & délais garantis"]'::jsonb,
  'De la préparation de votre terrain à la remise définitive des clés, notre division BTP prend en charge l''ensemble des corps d''état avec une rigueur d''ingénierie exemplaire.',
  '[
    {"title":"Gros Œuvre & Fondations","text":"Études de sols, terrassements, fondations profondes, béton armé certifié."},
    {"title":"Second Œuvre & Finitions","text":"Plâtrerie, carrelage grand format, peinture industrielle, étanchéité terrasses."},
    {"title":"Rénovation & Extension","text":"Surélévation d''immeubles, réaménagement de bureaux et remise aux normes."},
    {"title":"Voiries & Clôtures","text":"Aménagement d''accès pavés, assainissement individuel ou collectif, clôtures sécurisées."}
  ]'::jsonb,
  1, true
),
(
  'electrification',
  'Électrification HTA / BTA & Énergie',
  'Électrification HTA / BTA & Réseaux',
  'Pôle Énergie',
  'Conception et déploiement de réseaux électriques sécurisés conformes aux normes CIE. Postes transformateurs, électrification de lotissements et solaire.',
  '["Postes HTA/BTA & armoires TGBT", "Électrification lotissements & voiries", "Solutions solaires & groupes électrogènes"]'::jsonb,
  'Spécialistes reconnus pour les travaux électriques d’envergure à Abidjan et en région. Conformité stricte avec le cahier des charges de la Compagnie Ivoirienne d’Électricité (CIE).',
  '[
    {"title":"Postes HTA/BTA","text":"Cellules de protection, transformateurs de puissance et raccordements réseau."},
    {"title":"Électrification Lotissements","text":"Lignes aériennes et souterraines, candélabres LED et colonnes montantes."},
    {"title":"Armoires & TGBT","text":"Câblage de tableaux divisionnaires, équilibrage des phases et mise à la terre."},
    {"title":"Solaire & Groupes","text":"Systèmes photovoltaïques hybrides avec batteries et inverseur automatique."}
  ]'::jsonb,
  2, true
),
(
  'gestion',
  'Gestion & Valorisation Immobilière',
  'Gestion & Administration de Biens',
  'Pôle Patrimoine',
  'Optimisez la rentabilité et la longévité de vos biens à Abidjan. Gestion locative intégrale, recouvrement rigoureux et maintenance technique préventive.',
  '["Sélection rigoureuse des locataires", "Taux de recouvrement des loyers > 99%", "Entretien & valorisation du bâti"]'::jsonb,
  'Propriétaires résidant à Abidjan ou dans la diaspora : confiez votre patrimoine immobilier à un gestionnaire rigoureux. Sécurité juridique et régularité des reversements locatifs garanties.',
  '[
    {"title":"Sélection des Locataires","text":"Étude de solvabilité poussée, contrats de bail conformes et états des lieux minutieux."},
    {"title":"Recouvrement & Reversement","text":"Perception ponctuelle des loyers et reversement sécurisé sur votre compte bancaire chaque mois."},
    {"title":"Maintenance & Entretien","text":"Interventions rapides de plomberie, serrurerie et électricité pour préserver la valeur du bien."},
    {"title":"Rapports de Gestion","text":"États financiers trimestriels détaillés et assistance aux déclarations foncières."}
  ]'::jsonb,
  3, true
)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE public.site_services IS
  'Contenu administrable des trois pôles de services existants. Les modifications passent par les API serveur administrateur.';
