-- Migration 002: Core Business Tables
-- Tables: site_settings, quote_requests, testimonials
--
-- Prérequis : migration 001 doit avoir été exécutée au préalable
-- (elle crée la fonction update_updated_at_column).
--
-- Modèle de sécurité
-- ==================
-- Toutes les opérations d'écriture administratives (INSERT, UPDATE, DELETE)
-- sont réalisées EXCLUSIVEMENT par les API serveur Nuxt via SUPABASE_SERVICE_ROLE_KEY.
-- La clé service_role contourne RLS par conception Supabase : il n'est donc pas
-- nécessaire de créer des politiques RLS d'écriture pour les admins.
-- Aucune politique ne doit s'appuyer sur auth.uid() IS NOT NULL pour ouvrir
-- un accès en écriture : cela autoriserait n'importe quel utilisateur authentifié.
--
-- Résumé des accès autorisés par RLS :
--   site_settings  : SELECT public uniquement
--   quote_requests : aucun accès public ni authentifié (service_role uniquement)
--   testimonials   : SELECT public sur published = true uniquement
--
-- Cette migration est idempotente : elle peut être exécutée plusieurs fois
-- sans erreur grâce aux clauses IF NOT EXISTS, ON CONFLICT et aux blocs DO $$.


-- =======================
-- 1. TABLE site_settings
-- =======================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identité de l'entreprise
  company_name TEXT NOT NULL DEFAULT 'ML Immobilier SARL',
  logo_url     TEXT,
  tagline      TEXT,

  -- Coordonnées (toutes facultatives : à renseigner depuis l'admin)
  address       TEXT,
  city          TEXT,
  phone1        TEXT,
  phone2        TEXT,
  whatsapp      TEXT,
  email         TEXT,
  working_hours TEXT,

  -- Section Hero (facultatif : à renseigner depuis l'admin)
  hero_title    TEXT,
  hero_subtitle TEXT,
  hero_cta_text TEXT,

  -- Statistiques affichées sur le site (facultatif)
  stats_clients      INTEGER,
  stats_projects     INTEGER,
  stats_years        INTEGER,
  stats_satisfaction INTEGER,

  -- Réseaux sociaux (facultatif)
  social_facebook  TEXT,
  social_linkedin  TEXT,
  social_instagram TEXT,

  -- Bandeau d'annonce (facultatif)
  banner_notice TEXT,
  show_notice   BOOLEAN NOT NULL DEFAULT false,

  -- Horodatage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contrainte UUID fixe : garantit qu'il n'existe qu'une seule ligne
-- et que son identifiant est toujours prévisible pour les mises à jour.
-- Le bloc DO $$ évite l'erreur si la contrainte existe déjà.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_site_settings_singleton'
  ) THEN
    ALTER TABLE site_settings
      ADD CONSTRAINT chk_site_settings_singleton
      CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid);
  END IF;
END;
$$;

-- Insertion de la ligne initiale avec uniquement le nom de l'entreprise.
-- Toutes les autres valeurs sont NULL et seront renseignées depuis l'admin.
INSERT INTO site_settings (id, company_name)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'ML Immobilier SARL')
ON CONFLICT (id) DO NOTHING;

-- Trigger updated_at (protégé contre la double création)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_site_settings_updated_at'
      AND tgrelid = 'public.site_settings'::regclass
  ) THEN
    CREATE TRIGGER update_site_settings_updated_at
      BEFORE UPDATE ON site_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;


-- =======================
-- 2. TABLE quote_requests
-- =======================

CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type de prestation demandée
  service TEXT NOT NULL CHECK (service IN ('btp', 'electrification', 'gestion', 'autre')),

  -- Informations du client
  full_name TEXT NOT NULL,
  phone     TEXT NOT NULL,
  email     TEXT,
  location  TEXT,

  -- Détails du projet
  budget      TEXT,
  timeline    TEXT,
  description TEXT NOT NULL,

  -- Gestion administrative
  status TEXT NOT NULL DEFAULT 'nouveau'
    CHECK (status IN ('nouveau', 'en_cours', 'devis_envoye', 'termine', 'archive')),
  admin_notes TEXT,

  -- Traçabilité antispam (renseigné par l'API serveur)
  ip_address TEXT,
  user_agent TEXT,

  -- Horodatage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_status     ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_service    ON quote_requests(service);
CREATE INDEX IF NOT EXISTS idx_quote_requests_ip         ON quote_requests(ip_address, created_at);

-- Trigger updated_at (protégé contre la double création)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_quote_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_quote_requests_updated_at
      BEFORE UPDATE ON quote_requests
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;


-- =======================
-- 3. TABLE testimonials
-- =======================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification du client
  client_name     TEXT NOT NULL,
  client_function TEXT,
  client_company  TEXT,
  client_location TEXT,

  -- Contenu du témoignage
  testimonial_text TEXT NOT NULL,
  service_type     TEXT,
  rating           INTEGER CHECK (rating >= 1 AND rating <= 5),
  photo_url        TEXT,
  testimonial_date DATE,

  -- Publication
  published     BOOLEAN NOT NULL DEFAULT false,
  featured      BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Horodatage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials(published, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured  ON testimonials(featured) WHERE featured = true;

-- Trigger updated_at (protégé contre la double création)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_testimonials_updated_at'
  ) THEN
    CREATE TRIGGER update_testimonials_updated_at
      BEFORE UPDATE ON testimonials
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;


-- =======================
-- 4. ROW LEVEL SECURITY
-- =======================

ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials   ENABLE ROW LEVEL SECURITY;

-- ---- site_settings ----
-- Seul accès autorisé par RLS : lecture publique.
-- Toute écriture passe par service_role (API serveur).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'site_settings' AND policyname = 'site_settings_select_public'
  ) THEN
    CREATE POLICY "site_settings_select_public"
      ON site_settings FOR SELECT
      TO public
      USING (true);
  END IF;
END;
$$;

-- ---- quote_requests ----
-- Aucun accès public ni authentifié par RLS.
-- Toutes les opérations (INSERT, SELECT, UPDATE, DELETE) passent par service_role.
-- RLS actif sans aucune politique = table inaccessible aux clients Supabase.

-- ---- testimonials ----
-- Seul accès autorisé par RLS : lecture publique des témoignages publiés.
-- Toute écriture passe par service_role (API serveur).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'testimonials' AND policyname = 'testimonials_select_published'
  ) THEN
    CREATE POLICY "testimonials_select_published"
      ON testimonials FOR SELECT
      TO public
      USING (published = true);
  END IF;
END;
$$;


-- =======================
-- 5. COMMENTAIRES
-- =======================

COMMENT ON TABLE site_settings IS
  'Ligne unique de configuration globale du site. UUID fixe 00000000-0000-0000-0000-000000000001. Lecture publique via RLS. Écriture via service_role uniquement.';

COMMENT ON TABLE quote_requests IS
  'Demandes de devis créées et gérées exclusivement via service_role (API serveur Nuxt). Aucun accès direct depuis le navigateur.';

COMMENT ON TABLE testimonials IS
  'Témoignages clients réels saisis depuis l''administration. Lecture publique limitée aux enregistrements published = true. Écriture via service_role uniquement.';

COMMENT ON COLUMN testimonials.featured IS
  'Si true, le témoignage peut être mis en avant sur la page d''accueil.';

COMMENT ON COLUMN testimonials.testimonial_date IS
  'Date à laquelle le témoignage a été recueilli auprès du client.';

COMMENT ON COLUMN testimonials.client_function IS
  'Fonction ou titre du client (ex : Directeur technique). Facultatif.';

COMMENT ON COLUMN testimonials.service_type IS
  'Prestation concernée par le témoignage : btp, electrification, gestion ou autre. Facultatif.';

COMMENT ON COLUMN quote_requests.admin_notes IS
  'Notes internes de l''administrateur, non visibles par le client.';

COMMENT ON COLUMN quote_requests.ip_address IS
  'Adresse IP du client au moment de la soumission, renseignée par l''API serveur.';
