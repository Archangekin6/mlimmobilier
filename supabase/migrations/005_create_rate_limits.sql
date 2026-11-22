-- Migration 005: Table rate_limits
--
-- Prérequis : migrations 001 à 004 exécutées au préalable.
--   - 001 crée la fonction update_updated_at_column().
--
-- Objectif
-- ========
-- Protéger le formulaire de demande de devis contre le spam et les soumissions
-- abusives. Cette table conserve un compteur de tentatives par identifiant
-- haché et par action, sur une fenêtre de temps glissante.
--
-- Modèle de sécurité
-- ==================
-- Cette table est EXCLUSIVEMENT accessible via SUPABASE_SERVICE_ROLE_KEY
-- depuis les API serveur Nuxt. Aucune politique RLS n'est définie :
-- RLS activé sans politique = table hermétiquement fermée aux clients Supabase.
--
-- L'adresse IP brute n'est JAMAIS stockée dans cette table.
-- Le serveur calcule un HMAC-SHA256 de l'IP avant toute écriture.
-- Le secret HMAC est conservé uniquement dans les variables d'environnement
-- du serveur Nuxt. Il n'est jamais exposé au navigateur ni stocké dans Supabase.
--
-- Flux de vérification côté API serveur Nuxt
-- -------------------------------------------
-- 1. Recevoir la soumission du formulaire.
-- 2. Calculer identifier_hash = HMAC-SHA256(ip + ':' + action, RATE_LIMIT_SECRET).
-- 3. Interroger rate_limits via service_role :
--    - Si aucune ligne : créer (attempts = 1, window_started_at = NOW()).
--    - Si ligne existante dans la fenêtre et attempts < seuil : incrémenter.
--    - Si attempts >= seuil : mettre à jour blocked_until, rejeter la requête.
--    - Si window_started_at est dépassée : réinitialiser le compteur.
-- 4. Si non bloqué, vérifier le token Cloudflare Turnstile côté serveur.
-- 5. Vérifier le honeypot.
-- 6. Valider et enregistrer dans quote_requests.
--
-- Stratégie de nettoyage
-- ----------------------
-- pg_cron n'est pas disponible sur Supabase Free.
-- Le nettoyage est déclenché de l'une de ces deux façons :
--   A. Par le robot de surveillance externe (cron GitHub Actions ou cron-job.org)
--      qui appelle l'endpoint sécurisé /api/cron/cleanup-rate-limits.
--   B. Opportunistiquement : l'API serveur peut déclencher un nettoyage
--      en arrière-plan toutes les N soumissions (ex: 1 fois sur 50).
-- La fonction cleanup_rate_limits() définie ci-dessous supprime les lignes
-- dont la fenêtre est expirée et dont le blocage est terminé.
--
-- Cette migration est idempotente : relançable sans erreur.


-- =======================
-- 1. TABLE rate_limits
-- =======================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Empreinte hachée de l'identifiant (jamais l'IP en clair).
  -- Format : HMAC-SHA256(ip || ':' || action, RATE_LIMIT_SECRET) encodé en hex.
  -- Le secret HMAC est stocké dans les variables d'environnement Nuxt uniquement.
  -- Il n'est jamais exposé au navigateur ni stocké dans Supabase.
  identifier_hash   TEXT        NOT NULL,

  -- Action concernée par cette limite (ex: 'quote_request').
  -- Permet d'avoir des compteurs indépendants par type d'action
  -- si d'autres formulaires sont ajoutés ultérieurement.
  action            TEXT        NOT NULL,

  -- Compteur de tentatives dans la fenêtre courante.
  -- Initialisé à 1 à la création, incrémenté à chaque tentative.
  attempts          INTEGER     NOT NULL    DEFAULT 1
    CONSTRAINT chk_rate_limits_attempts_positive CHECK (attempts >= 0),

  -- Début de la fenêtre de comptage courante.
  -- Quand NOW() - window_started_at > durée_fenêtre, le compteur est réinitialisé.
  window_started_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),

  -- Date jusqu'à laquelle les soumissions sont bloquées.
  -- NULL si l'identifiant n'est pas bloqué.
  -- Renseigné par le serveur quand attempts atteint le seuil maximal.
  blocked_until     TIMESTAMPTZ,

  -- Horodatage
  created_at        TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

-- Contrainte unique sur (identifier_hash, action) :
-- un seul compteur par couple identifiant/action.
CREATE UNIQUE INDEX IF NOT EXISTS uq_rate_limits_identifier_action
  ON public.rate_limits(identifier_hash, action);

-- Index de performance : retrouver rapidement un compteur actif.
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits(identifier_hash, action, window_started_at);

-- Index pour le nettoyage : retrouver les entrées expirées efficacement.
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_started_at
  ON public.rate_limits(window_started_at);

CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until
  ON public.rate_limits(blocked_until)
  WHERE blocked_until IS NOT NULL;


-- =======================
-- 2. TRIGGER updated_at
-- =======================
-- Utilise update_updated_at_column() créée dans la migration 001.
-- Protégé contre la double création via tgrelid.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname  = 'update_rate_limits_updated_at'
      AND tgrelid = 'public.rate_limits'::regclass
  ) THEN
    CREATE TRIGGER update_rate_limits_updated_at
      BEFORE UPDATE ON public.rate_limits
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;


-- =======================
-- 3. ROW LEVEL SECURITY
-- =======================
-- RLS activé, aucune politique créée.
-- La table est inaccessible à tout client Supabase (anon ou authenticated).
-- Toutes les opérations passent par service_role (API serveur Nuxt).

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;


-- =======================
-- 4. FONCTION DE NETTOYAGE
-- =======================
-- Supprime les entrées dont la fenêtre est expirée ET dont le blocage
-- est terminé (ou inexistant). Ces lignes ne servent plus à rien.
--
-- Paramètre :
--   p_window_hours  : durée de la fenêtre de comptage en heures (défaut : 1).
--                     Une entrée est considérée expirée si
--                     window_started_at < NOW() - p_window_hours * INTERVAL '1 hour'.
--
-- Retourne le nombre de lignes supprimées.
--
-- Appelée par :
--   - L'endpoint sécurisé /api/cron/cleanup-rate-limits (robot externe).
--   - Opportunistiquement par l'API serveur lors des soumissions.

CREATE OR REPLACE FUNCTION public.cleanup_rate_limits(
  p_window_hours INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Rejeter les valeurs incorrectes du paramètre.
  IF p_window_hours IS NULL OR p_window_hours <= 0 THEN
    RAISE EXCEPTION 'p_window_hours doit être supérieur à zéro (valeur reçue : %)', p_window_hours;
  END IF;

  DELETE FROM public.rate_limits
  WHERE
    -- La fenêtre de comptage est expirée
    window_started_at < NOW() - (p_window_hours * INTERVAL '1 hour')
    AND (
      -- Pas de blocage actif
      blocked_until IS NULL
      OR
      -- Blocage terminé
      blocked_until < NOW()
    );

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- Révoquer les droits d'exécution accordés par défaut à PUBLIC, anon et authenticated.
-- Seul service_role (API serveur Nuxt) est autorisé à appeler cette fonction.
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) TO service_role;


-- =======================
-- 5. COMMENTAIRES
-- =======================

COMMENT ON TABLE public.rate_limits IS
  'Compteurs de tentatives pour la protection antispam du formulaire de devis. '
  'Table inaccessible aux clients Supabase (RLS sans politique). '
  'Toutes les opérations passent par service_role (API serveur Nuxt). '
  'Les adresses IP ne sont jamais stockées en clair : uniquement leur hash.';

COMMENT ON COLUMN public.rate_limits.identifier_hash IS
  'Empreinte HMAC-SHA256 de l''adresse IP et de l''action, calculée avec RATE_LIMIT_SECRET. '
  'Le secret HMAC est conservé uniquement dans les variables d''environnement Nuxt. '
  'Il n''est jamais exposé au navigateur ni stocké dans Supabase. '
  'Ne jamais stocker l''adresse IP en clair dans cette colonne.';

COMMENT ON COLUMN public.rate_limits.action IS
  'Identifiant de l''action limitée. Valeur actuelle : ''quote_request''. '
  'Permet d''étendre le système à d''autres formulaires sans modifier la structure.';

COMMENT ON COLUMN public.rate_limits.attempts IS
  'Nombre de tentatives enregistrées dans la fenêtre courante. '
  'Initialisé à 1 à la création, incrémenté par l''API serveur. '
  'Jamais modifié directement par le navigateur.';

COMMENT ON COLUMN public.rate_limits.window_started_at IS
  'Début de la fenêtre de comptage. '
  'Quand NOW() - window_started_at dépasse la durée configurée, '
  'l''API serveur réinitialise attempts à 1 et met à jour cette valeur.';

COMMENT ON COLUMN public.rate_limits.blocked_until IS
  'Date jusqu''à laquelle l''identifiant est bloqué. '
  'NULL si aucun blocage actif. '
  'Renseigné par l''API serveur quand attempts atteint le seuil maximal.';

COMMENT ON FUNCTION public.cleanup_rate_limits(INTEGER) IS
  'Supprime les entrées rate_limits expirées et non bloquées. '
  'Accessible uniquement via service_role (API serveur Nuxt). '
  'Exécution refusée pour PUBLIC, anon et authenticated. '
  'Paramètre p_window_hours : durée de rétention en heures (défaut : 1, doit être > 0).';
