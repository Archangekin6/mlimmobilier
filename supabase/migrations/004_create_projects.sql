-- Migration 004: Tables projects et project_images
--
-- Prérequis : migrations 001, 002 et 003 exécutées au préalable.
--   - 001 crée la fonction update_updated_at_column().
--   - 002 et 003 créent les tables métier et admin_profiles.
--
-- Objectif
-- ========
-- Gérer le portfolio de réalisations de ML Immobilier SARL.
-- Chaque projet peut posséder plusieurs images dans une galerie dédiée.
--
-- Modèle de sécurité
-- ==================
-- Toutes les opérations d'écriture (INSERT, UPDATE, DELETE) passent
-- exclusivement par les API serveur Nuxt via SUPABASE_SERVICE_ROLE_KEY,
-- après vérification du profil dans admin_profiles.
--
-- Résumé des accès autorisés par RLS :
--   projects       : SELECT public sur published = true uniquement
--   project_images : SELECT public sur les images des projets publiés uniquement
--
-- Cette migration est idempotente : relançable sans erreur.


-- =======================
-- 1. TABLE projects
-- =======================

CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  title         TEXT        NOT NULL,
  -- slug : identifiant lisible utilisé dans les URLs (/realisations/mon-projet).
  -- Doit être unique, en minuscules, sans espaces (généré côté serveur).
  slug          TEXT        NOT NULL,

  -- Contenu éditorial
  summary       TEXT,                   -- Résumé court affiché en liste
  description   TEXT,                   -- Description détaillée (page projet)

  -- Classification
  service_type  TEXT        NOT NULL
    CHECK (service_type IN ('btp', 'electrification', 'gestion')),
  location      TEXT,                   -- Ville ou quartier du chantier

  -- Dates du chantier (facultatives)
  start_date    DATE,
  end_date      DATE,

  -- État d'avancement
  status        TEXT        NOT NULL    DEFAULT 'completed'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold')),

  -- Image principale (URL directe, indépendante de project_images)
  cover_image_url TEXT,

  -- Visibilité et mise en avant
  published     BOOLEAN     NOT NULL    DEFAULT false,
  featured      BOOLEAN     NOT NULL    DEFAULT false,
  display_order INTEGER     NOT NULL    DEFAULT 0,

  -- Horodatage
  created_at    TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

-- Index unique sur slug : garantit l'unicité des URLs de projets.
CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_slug
  ON public.projects(slug);

-- Index de performance pour les requêtes publiques courantes.
CREATE INDEX IF NOT EXISTS idx_projects_published
  ON public.projects(published, display_order)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_projects_service_type
  ON public.projects(service_type)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_projects_featured
  ON public.projects(featured)
  WHERE featured = true;

-- Trigger updated_at (protégé contre la double création via tgrelid)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname  = 'update_projects_updated_at'
      AND tgrelid = 'public.projects'::regclass
  ) THEN
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON public.projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;


-- =======================
-- 2. TABLE project_images
-- =======================

CREATE TABLE IF NOT EXISTS public.project_images (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Projet parent
  -- ON DELETE CASCADE : la suppression d'un projet supprime toutes ses images.
  project_id    UUID        NOT NULL
    REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Fichier
  image_url     TEXT        NOT NULL,   -- URL publique dans Supabase Storage
  storage_path  TEXT        NOT NULL,   -- Chemin interne dans le bucket (ex: project-images/uuid/photo.jpg)
  alt_text      TEXT,                   -- Texte alternatif pour l'accessibilité

  -- Rôle de l'image dans la galerie
  -- is_cover = true signifie que cette image est l'image principale du projet
  -- dans la galerie (distincte de projects.cover_image_url qui peut être
  -- une URL externe ou temporaire).
  is_cover      BOOLEAN     NOT NULL    DEFAULT false,
  display_order INTEGER     NOT NULL    DEFAULT 0,

  -- Horodatage (pas d'updated_at : une image se remplace, pas se modifie)
  created_at    TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

-- Index de performance : récupérer les images d'un projet dans l'ordre.
CREATE INDEX IF NOT EXISTS idx_project_images_project_id
  ON public.project_images(project_id, display_order);

-- Contrainte : un projet ne peut avoir qu'une seule image marquée is_cover = true
-- dans la galerie project_images. L'index partiel unique porte uniquement sur
-- les lignes où is_cover = true, ce qui permet d'avoir autant d'images
-- is_cover = false que nécessaire.
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_images_one_cover_per_project
  ON public.project_images(project_id)
  WHERE is_cover = true;


-- =======================
-- 3. ROW LEVEL SECURITY
-- =======================

ALTER TABLE public.projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

-- ---- projects ----
-- Lecture publique des projets publiés uniquement.
-- Toute écriture passe par service_role (API serveur).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'projects'
      AND policyname = 'projects_select_published'
  ) THEN
    CREATE POLICY "projects_select_published"
      ON public.projects
      FOR SELECT
      TO public
      USING (published = true);
  END IF;
END;
$$;

-- ---- project_images ----
-- Lecture publique uniquement des images appartenant à un projet publié.
-- La sous-requête vérifie published = true sur la table projects parente.
-- Toute écriture passe par service_role (API serveur).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'project_images'
      AND policyname = 'project_images_select_published_project'
  ) THEN
    CREATE POLICY "project_images_select_published_project"
      ON public.project_images
      FOR SELECT
      TO public
      USING (
        EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id = project_id
            AND p.published = true
        )
      );
  END IF;
END;
$$;


-- =======================
-- 4. COMMENTAIRES
-- =======================

COMMENT ON TABLE public.projects IS
  'Portfolio de réalisations de ML Immobilier SARL. '
  'Lecture publique limitée aux projets published = true. '
  'Toutes les écritures passent par service_role (API serveur Nuxt).';

COMMENT ON COLUMN public.projects.slug IS
  'Identifiant URL unique du projet, en minuscules sans espaces. '
  'Généré côté serveur. Utilisé dans les URLs : /realisations/{slug}.';

COMMENT ON COLUMN public.projects.service_type IS
  'Catégorie de la prestation : btp, electrification ou gestion.';

COMMENT ON COLUMN public.projects.status IS
  'État d''avancement : planned, in_progress, completed ou on_hold.';

COMMENT ON COLUMN public.projects.cover_image_url IS
  'URL directe de l''image de couverture. '
  'Peut être renseignée indépendamment de la galerie project_images.';

COMMENT ON COLUMN public.projects.featured IS
  'Si true, le projet peut être mis en avant sur la page d''accueil ou en tête de liste.';

COMMENT ON TABLE public.project_images IS
  'Galerie d''images associées à un projet. '
  'Supprimée automatiquement si le projet parent est supprimé (ON DELETE CASCADE). '
  'Lecture publique limitée aux images des projets published = true. '
  'Toutes les écritures passent par service_role (API serveur Nuxt).';

COMMENT ON COLUMN public.project_images.storage_path IS
  'Chemin interne dans le bucket Supabase Storage. '
  'Exemple : project-images/550e8400-e29b-41d4-a716-446655440000/photo-chantier.jpg';

COMMENT ON COLUMN public.project_images.is_cover IS
  'Si true, cette image est l''image principale dans la galerie du projet. '
  'Un seul enregistrement is_cover = true est autorisé par projet '
  '(contrainte uq_project_images_one_cover_per_project).';
