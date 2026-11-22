-- Migration 003: Table admin_profiles
--
-- Prérequis : migrations 001 et 002 exécutées au préalable.
--   - 001 crée la fonction update_updated_at_column().
--   - 002 crée les tables métier (site_settings, quote_requests, testimonials).
--
-- Rôle de cette table
-- ===================
-- admin_profiles est la source de vérité pour les droits d'administration.
-- La présence d'une ligne dans cette table, associée à un user_id Supabase Auth
-- valide, est la seule condition reconnue comme preuve de privilège admin.
--
-- Modèle de vérification (côté API serveur Nuxt)
-- -----------------------------------------------
-- 1. Le serveur reçoit la requête avec le JWT Supabase du navigateur.
-- 2. Il appelle supabase.auth.getUser() pour valider le token.
-- 3. Il interroge admin_profiles via service_role pour vérifier
--    qu'une ligne existe pour ce user_id.
-- 4. Si les deux conditions sont réunies, il traite la requête.
-- 5. Sinon, il répond 401 ou 403.
--
-- Ce que cette migration ne fait PAS
-- ------------------------------------
-- - Pas de trigger automatique à l'inscription (risque d'escalade de privilèges).
-- - Pas de lecture du champ user_metadata pour déduire un rôle.
-- - Pas de politique RLS accordant des droits d'écriture à des utilisateurs
--   simplement parce qu'ils sont authentifiés.
-- - Pas de données fictives.
--
-- Modèle de sécurité RLS
-- -----------------------
-- RLS est activé. Aucune politique d'écriture n'est définie côté RLS.
-- Toutes les opérations (INSERT, UPDATE, DELETE) passent par service_role.
-- La seule politique définie permet à un utilisateur authentifié de lire
-- uniquement sa propre ligne, ce qui permet à l'API serveur de vérifier
-- l'existence du profil en utilisant le client auth (anon key + JWT)
-- sans exposer les profils des autres comptes.
--
-- Cette migration est idempotente : relançable sans erreur.


-- =======================
-- 1. TABLE admin_profiles
-- =======================

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  -- Clé primaire indépendante
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Référence à l'utilisateur Supabase Auth
  -- ON DELETE CASCADE : la suppression du compte Auth supprime le profil admin.
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations du compte
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL,

  -- Horodatage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un utilisateur Auth ne peut avoir qu'un seul profil admin.
CREATE UNIQUE INDEX IF NOT EXISTS uq_admin_profiles_user_id
  ON public.admin_profiles(user_id);

-- Une seule ligne peut exister dans cette table.
-- L'index unique fonctionnel sur (true) garantit qu'aucun second administrateur
-- ne peut être inséré, même avec un user_id différent.
CREATE UNIQUE INDEX IF NOT EXISTS uq_admin_profiles_single_admin
  ON public.admin_profiles ((true));


-- =======================
-- 2. TRIGGER updated_at
-- =======================
-- Utilise update_updated_at_column() créée dans la migration 001.
-- Protégé contre la double création par la vérification tgrelid.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname    = 'update_admin_profiles_updated_at'
      AND tgrelid   = 'public.admin_profiles'::regclass
  ) THEN
    CREATE TRIGGER update_admin_profiles_updated_at
      BEFORE UPDATE ON public.admin_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;


-- =======================
-- 3. ROW LEVEL SECURITY
-- =======================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : un utilisateur authentifié ne peut lire
-- que sa propre ligne. Cela permet à l'API serveur de vérifier
-- l'existence du profil via le client auth sans exposer les autres lignes.
-- Les opérations en écriture passent exclusivement par service_role.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'admin_profiles'
      AND policyname = 'admin_profiles_select_own'
  ) THEN
    CREATE POLICY "admin_profiles_select_own"
      ON public.admin_profiles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END;
$$;


-- =======================
-- 4. COMMENTAIRES
-- =======================

COMMENT ON TABLE public.admin_profiles IS
  'Source de vérité pour les droits d''administration. '
  'Un profil est créé manuellement après création du compte dans Supabase Auth. '
  'La présence d''une ligne pour un user_id donné est la seule preuve de privilège admin. '
  'Toutes les écritures passent par service_role (API serveur Nuxt).';

COMMENT ON COLUMN public.admin_profiles.user_id IS
  'UUID de l''utilisateur dans auth.users. Unique : un compte Auth = un profil admin maximum.';

COMMENT ON COLUMN public.admin_profiles.full_name IS
  'Nom complet de l''administrateur, affiché dans l''interface d''administration.';

COMMENT ON COLUMN public.admin_profiles.email IS
  'Email de l''administrateur, dupliqué ici pour faciliter l''affichage '
  'sans jointure sur auth.users (accessible uniquement via service_role).';


-- =======================
-- 5. PROCÉDURE DE CRÉATION
-- =======================
-- Ce bloc SQL ne s'exécute PAS automatiquement.
-- Il documente la procédure manuelle à suivre après exécution de cette migration.
--
-- ÉTAPE 1 — Créer le compte dans Supabase Auth :
--   Dashboard > Authentication > Users > Add user > Create new user
--   Email    : adresse email de l'administrateur
--   Password : mot de passe fort (généré, non mémorisé en clair)
--   Cocher   : Auto Confirm User
--
-- ÉTAPE 2 — Récupérer l'UUID généré (colonne UID dans la liste des users).
--
-- ÉTAPE 3 — Insérer le profil admin (remplacer les valeurs entre < >) :
--
--   INSERT INTO public.admin_profiles (user_id, full_name, email)
--   VALUES (
--     '<UUID-copié-depuis-Auth>'::uuid,
--     '<Prénom Nom>',
--     '<email@mlimmobilier.com>'
--   );
--
-- ÉTAPE 4 — Vérifier la ligne créée :
--
--   SELECT * FROM public.admin_profiles;
