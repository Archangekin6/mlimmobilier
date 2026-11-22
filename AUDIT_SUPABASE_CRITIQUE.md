# 🔍 AUDIT CRITIQUE - Architecture Supabase ML Immobilier SARL

**Date d'audit** : 19 novembre 2026  
**Version analysée** : Préparation initiale pré-déploiement  
**Auditeur** : Système d'analyse critique  
**Contraintes** : FREE Tier uniquement, pas de services payants, migration Pro possible

---

## 📊 RÉSUMÉ EXÉCUTIF

### ✅ Points Forts

1. **Architecture solide** : Tables bien structurées avec UUID, timestamps, et relations claires
2. **Politiques RLS** : Présentes sur toutes les tables avec séparation public/admin
3. **Protection multicouche** : Turnstile + Honeypot + Rate limiting + Validation serveur
4. **Code serveur sécurisé** : Service role protégé, validation des entrées, sanitization
5. **Documentation complète** : Architecture et installation détaillées

### ⚠️ RISQUES CRITIQUES IDENTIFIÉS

| # | Risque | Gravité | Impact |
|---|--------|---------|--------|
| 1 | **Admin auth basé sur user_metadata** | 🔴 CRITIQUE | Contournement possible des privilèges admin |
| 2 | **Fake testimonials en production** | 🟡 MOYEN | Contenu fictif présenté comme réel |
| 3 | **Tables inutilisées (audit_logs)** | 🟡 MOYEN | Complexité inutile |
| 4 | **Fonctions SQL redondantes** | 🟡 MOYEN | Maintenance difficile |
| 5 | **Surveillance FREE tier non définie** | 🟠 ÉLEVÉ | Site peut être en pause sans alerte |
| 6 | **Migration path Pro non documentée** | 🟡 MOYEN | Risque lors du scale |

---

## 🚨 ANALYSE DÉTAILLÉE DES RISQUES

### 1. 🔴 SÉCURITÉ CRITIQUE : Admin Auth basé sur user_metadata

#### Problème

**Fichier** : `supabase/migrations/003_create_admin_profiles.sql` (lignes 70-81)

```sql
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'is_admin' = 'true')  -- ❌ VULNÉRABLE
  EXECUTE FUNCTION handle_new_admin_user();
```

**Pourquoi c'est dangereux** :

- Les `raw_user_meta_data` peuvent être modifiés côté client lors de l'inscription
- Un utilisateur malveillant peut s'inscrire avec `{"is_admin": "true"}` dans les metadata
- Le trigger créera automatiquement un profil admin sans vérification

**Scénario d'attaque** :

```typescript
// Côté client - inscription malveillante
const { data, error } = await supabase.auth.signUp({
  email: 'attaquant@evil.com',
  password: 'password123',
  options: {
    data: {
      is_admin: 'true',  // ❌ Contournement du système
      role: 'admin'
    }
  }
})
// L'attaquant obtient un compte admin !
```

#### Solution Obligatoire

**Option A : Désactiver l'auto-création** (Recommandé)

1. Supprimer complètement le trigger `on_auth_user_created_admin`
2. Créer les profils admin **manuellement** via SQL après création du compte :

```sql
-- Supprimer le trigger dangereux
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP FUNCTION IF EXISTS handle_new_admin_user();

-- Créer manuellement après inscription
INSERT INTO admin_profiles (id, full_name, role)
VALUES (
  'uuid-du-user-auth',
  'Nom de l'admin',
  'admin'
);
```

**Option B : Whitelist d'emails** (Alternative)

Si vous voulez garder l'auto-création, ajoutez une validation :

```sql
CREATE OR REPLACE FUNCTION handle_new_admin_user()
RETURNS TRIGGER AS $$
DECLARE
  allowed_emails TEXT[] := ARRAY[
    'admin@mlimmobilier.com',
    'direction@mlimmobilier.com'
  ];
BEGIN
  -- Vérifier si l'email est dans la whitelist
  IF NEW.email = ANY(allowed_emails) THEN
    INSERT INTO admin_profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrateur'),
      'admin'  -- Force le role admin, ignore les metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sans condition sur metadata
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_admin_user();
```

#### Impact

- **Urgence** : À corriger AVANT le premier déploiement
- **Effort** : 10 minutes
- **Blocage** : Oui, ne pas déployer sans cette correction

---

### 2. 🟡 CONTENU FICTIF : Fake Testimonials

#### Problème

**Fichier** : `supabase/migrations/002_create_core_tables.sql` (lignes 161-165)

```sql
INSERT INTO testimonials (...) VALUES
  ('M. Kouamé A.', 'Propriétaire', 'Cocody', 5, '...', true, 1),
  ('Dr. Ouattara T.', 'Promoteur', 'Songon', 5, '...', true, 2),
  ('Mme Soro B.', 'Investisseuse', 'Yopougon', 5, '...', true, 3)
```

Ces témoignages sont **inventés** et insérés automatiquement comme **publiés** (`published = true`).

#### Pourquoi c'est problématique

- Violation de transparence : présenter des avis fictifs comme réels
- Risque légal : publicité mensongère (Code ivoirien de consommation)
- Perte de crédibilité si découvert par les clients

#### Solution Obligatoire

**Supprimer l'insertion de données fictives** :

```sql
-- Supprimer cette section complète (lignes 161-165)
-- INSERT INTO testimonials (...) VALUES ...
```

**Remplacer par une structure vide** :

```sql
-- Table testimonials créée mais vide
-- Les témoignages réels seront ajoutés manuellement après validation client
```

#### Impact

- **Urgence** : À corriger AVANT le premier déploiement
- **Effort** : 2 minutes
- **Blocage** : Oui (risque légal)

---

### 3. 🟡 TABLES INUTILISÉES : audit_logs

#### Problème

**Fichier** : `supabase/migrations/006_create_utility_functions.sql` (lignes 101-149)

La table `audit_logs` est créée mais :

- ❌ Aucune utilisation dans le code actuel (`useSiteData.ts` ne fait aucun audit)
- ❌ Aucune interface admin pour consulter les logs
- ❌ Fonction `log_audit_event()` jamais appelée
- ❌ Aucun trigger automatique pour l'audit

**Stockage inutile** :

- La table va consommer de l'espace DB du FREE tier (500 MB limite)
- Complexité de maintenance sans bénéfice

#### Solution Recommandée

**Option A : Supprimer complètement** (Recommandé pour FREE tier)

```sql
-- Ne pas créer la table audit_logs
-- Ne pas créer la fonction log_audit_event()
```

**Option B : Garder avec clarification** (Si besoin futur)

Ajouter un commentaire clair :

```sql
-- NOTE: Audit logs désactivés sur FREE tier pour économiser l'espace DB
-- Activer uniquement si migration vers Pro et besoin de traçabilité
```

#### Impact

- **Urgence** : Moyenne
- **Effort** : 5 minutes
- **Économie DB** : ~10-20 MB sur le long terme

---

### 4. 🟡 FONCTIONS SQL REDONDANTES

#### Problèmes Identifiés

**Fichier** : `supabase/migrations/006_create_utility_functions.sql`

##### A. Fonctions de validation inutiles

```sql
-- Lignes 9-32
CREATE FUNCTION is_valid_ci_phone(p_phone TEXT) ...
CREATE FUNCTION is_valid_email(p_email TEXT) ...
CREATE FUNCTION sanitize_text(p_text TEXT) ...
```

**Pourquoi redondantes** :

- Ces validations sont **déjà faites côté serveur** dans `server/utils/supabase.ts`
- Elles ne sont **jamais appelées** dans les migrations ou le code applicatif
- Elles ne sont **pas utilisées comme contraintes CHECK** sur les tables

**Code serveur existant** :

```typescript
// server/utils/supabase.ts - lignes 92-105
export function isValidEmail(email: string): boolean { ... }
export function isValidCIPhone(phone: string): boolean { ... }
export function sanitizeText(text: string): string { ... }
```

##### B. Fonctions de recherche superflues

```sql
-- Lignes 61-96
CREATE FUNCTION search_projects(...) ...
CREATE FUNCTION search_quote_requests(...) ...
```

**Pourquoi inutiles** :

- Le projet utilise **localStorage** actuellement, pas de recherche DB
- Quand la migration vers Supabase sera faite, la recherche se fera **côté client** avec des filtres JS simples
- Pas d'interface admin de recherche avancée prévue

##### C. Fonctions de bulk operations non utilisées

```sql
-- Lignes 101-149
CREATE FUNCTION bulk_update_project_status(...) ...
CREATE FUNCTION bulk_update_quote_status(...) ...
```

**Jamais utilisées** : Aucune interface pour les opérations en masse dans l'admin

#### Solution Recommandée

**SUPPRIMER** ces fonctions pour simplifier :

```sql
-- Migration 006 : NETTOYER
-- Garder uniquement :
- get_dashboard_stats() (si utilisé dans l'admin dashboard)
- Vues statistiques (projects_stats, quotes_stats, quotes_by_service)

-- Supprimer :
- is_valid_ci_phone, is_valid_email, sanitize_text
- search_projects, search_quote_requests
- bulk_update_project_status, bulk_update_quote_status
- audit_logs et log_audit_event
```

#### Impact

- **Urgence** : Moyenne
- **Effort** : 10 minutes
- **Bénéfice** : Moins de complexité, plus facile à maintenir

---

### 5. 🟠 SURVEILLANCE FREE TIER NON DÉFINIE

#### Problème

**Contexte Supabase FREE** :

- Les projets FREE sont **mis en pause après 7 jours d'inactivité**
- Nécessite un **réveil manuel** depuis le dashboard Supabase
- **Pas d'API** pour réveiller un projet automatiquement (FREE tier)

**Documentation actuelle** :

- Mentionne un "robot externe de monitoring" mais :
  - ❌ Aucune recommandation concrète d'outil
  - ❌ Aucune explication des limitations FREE
  - ❌ Aucun guide de configuration

#### Solution Obligatoire

**Clarifier la surveillance avec limitations FREE** :

**Systèmes de monitoring recommandés (GRATUITS)** :

1. **UptimeRobot** (gratuit, 50 monitors)
   - Vérification HTTP toutes les 5 minutes
   - Alertes par email/SMS si down
   - **Limitation** : Ne peut PAS réveiller un projet Supabase en pause

2. **Pingdom Free** (gratuit, 10 checks)
   - Similar à UptimeRobot

3. **Healthchecks.io** (gratuit)
   - Monitoring cron jobs et webhooks

**Workflow recommandé** :

```
┌──────────────────┐
│  UptimeRobot     │ Vérifie http://site.com/api/health toutes les 5 min
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Site UP ?       │───YES──▶ Rien faire
└────────┬─────────┘
         │
         NO
         ▼
┌──────────────────┐
│  Email d'alerte  │───▶ Admin se connecte à Supabase
└──────────────────┘     et réveille manuellement le projet
```

**IMPORTANT** : Documenter clairement :

```markdown
### ⚠️ LIMITE FREE TIER

Le projet Supabase FREE se met en pause après 7 jours sans activité.

**Monitoring externe peut** :
- ✅ Alerter que le site est down
- ✅ Détecter les erreurs 500

**Monitoring externe NE peut PAS** :
- ❌ Réveiller automatiquement Supabase
- ❌ Empêcher la mise en pause

**Action requise** : Réveil manuel depuis https://supabase.com
```

#### Solution pour éviter la pause (LÉGAL)

**Créer un cron job qui lit la DB** :

```typescript
// Cron job quotidien (ex: Vercel Cron ou GitHub Actions)
// Route : /api/cron/keep-alive (protected by secret token)

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'x-cron-token')
  
  if (token !== process.env.CRON_SECRET_TOKEN) {
    throw createError({ statusCode: 401 })
  }
  
  // Simple lecture pour garder Supabase actif
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('id')
    .single()
  
  return { success: true, timestamp: new Date() }
})
```

**Déclencheur quotidien** :

```yaml
# .github/workflows/keep-alive.yml
name: Keep Supabase Alive
on:
  schedule:
    - cron: '0 3 * * *'  # Tous les jours à 3h
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://votre-site.com/api/cron/keep-alive \
            -H "x-cron-token: ${{ secrets.CRON_TOKEN }}"
```

#### Impact

- **Urgence** : Haute (à documenter avant déploiement)
- **Effort** : 1 heure (doc + setup)
- **Blocage** : Non, mais alerte utilisateur requise

---

### 6. 🟡 MIGRATION PATH PRO NON DOCUMENTÉE

#### Problème

**Documentation actuelle** :

> "Prépare une architecture permettant de migrer ultérieurement vers Supabase Pro sans reconstruire l'application."

Mais :

- ❌ Aucune checklist de migration FREE → Pro
- ❌ Aucune explication des changements nécessaires
- ❌ Pas de guide de coûts

#### Solution Recommandée

**Créer une checklist de migration** :

```markdown
## 📈 MIGRATION VERS SUPABASE PRO

### Quand migrer ?

- Database > 400 MB (FREE limit: 500 MB)
- Storage > 800 MB (FREE limit: 1 GB)
- Bandwidth > 1.5 GB/mois (FREE limit: 2 GB)
- Besoin de pas de pause automatique
- Besoin de support prioritaire

### Coût Supabase Pro

- **$25/mois** (base)
- Database: 8 GB inclus (+$0.125/GB)
- Storage: 100 GB inclus (+$0.021/GB)
- Bandwidth: 250 GB inclus (+$0.09/GB)

### Checklist de migration

- [ ] Sauvegarder la DB (pg_dump)
- [ ] Créer nouveau projet Pro
- [ ] Migrer les données
- [ ] Mettre à jour les variables d'env (URL + clés)
- [ ] Tester en staging
- [ ] Basculer le DNS
- [ ] Activer pg_cron pour cleanup automatique
- [ ] Configurer les backups automatiques
- [ ] Activer les alertes de quota
```

#### Impact

- **Urgence** : Basse (documentation préventive)
- **Effort** : 30 minutes
- **Blocage** : Non

---

## 📋 ÉLÉMENTS À CONSERVER

### ✅ Tables Nécessaires

Toutes correspondent à des fonctionnalités réelles dans `useSiteData.ts` :

| Table | Interface | Justification |
|-------|-----------|---------------|
| `site_settings` | `SiteSettings` | Paramètres globaux du site |
| `site_images` | Système images | Images dynamiques (déjà utilisé) |
| `quote_requests` | `QuoteRequest` | Formulaire de devis |
| `projects` | `Project` | Portfolio réalisations |
| `project_images` | Galerie | Images des projets |
| `admin_profiles` | `AdminUser` | Profils administrateurs |
| `testimonials` | (Non implémenté) | Avis clients (à utiliser sans fake data) |
| `rate_limits` | Protection spam | Rate limiting anti-abus |

**Verdict** : Toutes les tables sont justifiées ✅

### ✅ Politiques RLS

**Toutes sont correctes** SAUF la dépendance à `is_authenticated_admin()` qui dépend du trigger vulnérable.

**Après correction du trigger admin**, toutes les politiques RLS sont sécurisées.

### ✅ Fonctions Essentielles

À **CONSERVER** :

```sql
-- Helpers admin (après correction du trigger)
- is_admin()
- is_authenticated_admin()
- get_admin_profile()

-- Rate limiting (essentiel pour anti-spam)
- check_rate_limit()
- clean_old_rate_limits()

-- Statistiques (si utilisé dans dashboard)
- get_dashboard_stats()

-- Helper projets
- get_published_projects_count()
- get_project_with_images()
```

À **SUPPRIMER** :

```sql
- is_valid_ci_phone (doublons serveur)
- is_valid_email (doublons serveur)
- sanitize_text (doublons serveur)
- search_projects (non utilisé)
- search_quote_requests (non utilisé)
- bulk_update_project_status (non utilisé)
- bulk_update_quote_status (non utilisé)
- log_audit_event (table audit non utilisée)
```

### ✅ Code Serveur

**Fichier** : `server/utils/supabase.ts`

**Verdict** : Excellent ✅

- Service role bien protégé
- Validation des entrées
- Sanitization
- Rate limiting via DB
- Turnstile verification
- IP detection correcte
- Gestion d'erreurs robuste

**Aucune modification requise.**

**Fichier** : `server/api/quotes/submit.post.ts`

**Verdict** : Excellent ✅

- Protection multicouche (honeypot + rate limit + turnstile)
- Validation complète des champs
- Sanitization avant insertion
- Gestion d'erreurs claire
- Messages utilisateur adaptés

**Aucune modification requise.**

---

## 🔧 MODIFICATIONS SQL REQUISES

### Migration 002 : Supprimer fake testimonials

**Fichier** : `supabase/migrations/002_create_core_tables.sql`

**Modification** :

```sql
-- AVANT (lignes 161-165)
INSERT INTO testimonials (client_name, client_role, client_location, rating, testimonial_text, published, display_order) VALUES
  ('M. Kouamé A.', 'Propriétaire', 'Cocody', 5, '...', true, 1),
  ('Dr. Ouattara T.', 'Promoteur', 'Songon', 5, '...', true, 2),
  ('Mme Soro B.', 'Investisseuse', 'Yopougon', 5, '...', true, 3)
ON CONFLICT DO NOTHING;

-- APRÈS
-- Table testimonials prête à recevoir les témoignages clients réels
-- Les témoignages seront ajoutés manuellement après validation
```

### Migration 003 : Sécuriser admin auth

**Fichier** : `supabase/migrations/003_create_admin_profiles.sql`

**Option A : Suppression du trigger** (Recommandé)

```sql
-- SUPPRIMER complètement (lignes 63-81) :
-- CREATE OR REPLACE FUNCTION handle_new_admin_user() ...
-- CREATE TRIGGER on_auth_user_created_admin ...

-- AJOUTER à la fin du fichier :
-- =======================
-- NOTE: Création manuelle des profils admin
-- =======================
-- Les profils admin doivent être créés manuellement après inscription :
--
-- 1. Créer le compte dans Auth avec email/password
-- 2. Récupérer l'UUID du user dans auth.users
-- 3. Insérer le profil admin :
--    INSERT INTO admin_profiles (id, full_name, role)
--    VALUES ('uuid-du-user', 'Nom Admin', 'admin');
```

**Option B : Whitelist email** (Alternative)

```sql
-- REMPLACER (lignes 63-81) par :
CREATE OR REPLACE FUNCTION handle_new_admin_user()
RETURNS TRIGGER AS $$
DECLARE
  allowed_emails TEXT[] := ARRAY[
    'admin@mlimmobilier.com',
    'direction@mlimmobilier.com'
    -- Ajouter ici les emails autorisés
  ];
BEGIN
  -- Créer le profil uniquement si email autorisé
  IF NEW.email = ANY(allowed_emails) THEN
    INSERT INTO admin_profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrateur'),
      'admin'  -- Toujours admin, ignore metadata
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger SANS condition sur metadata
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_admin_user();
```

### Migration 006 : Nettoyer fonctions inutiles

**Fichier** : `supabase/migrations/006_create_utility_functions.sql`

**Modifications** :

```sql
-- SUPPRIMER ces sections :
-- 1. Fonctions de validation (lignes 9-46) :
--    - is_valid_ci_phone
--    - is_valid_email
--    - sanitize_text

-- 2. Fonctions de recherche (lignes 61-96) :
--    - search_projects
--    - search_quote_requests

-- 3. Fonctions bulk (lignes 101-149) :
--    - bulk_update_project_status
--    - bulk_update_quote_status

-- 4. Audit logs complet (lignes 101-149) :
--    - Table audit_logs
--    - Fonction log_audit_event

-- CONSERVER :
-- - get_dashboard_stats() (si utilisé)
-- - Vues : projects_stats, quotes_stats, quotes_by_service
```

---

## 📄 ARCHITECTURE FINALE RECOMMANDÉE

### Tables (8 au total)

```
1. site_settings      ✅ Singleton paramètres site
2. site_images        ✅ Images dynamiques
3. quote_requests     ✅ Demandes de devis
4. projects           ✅ Portfolio réalisations
5. project_images     ✅ Galerie projets
6. admin_profiles     ✅ Profils administrateurs (SÉCURISÉ)
7. testimonials       ✅ Avis clients (SANS fake data)
8. rate_limits        ✅ Protection anti-spam
```

### Fonctions SQL (9 au total)

```sql
-- Auth & Admin
1. is_admin()
2. is_authenticated_admin()
3. get_admin_profile()

-- Rate Limiting
4. check_rate_limit()
5. clean_old_rate_limits()
6. get_rate_limit_stats()

-- Stats & Helpers
7. get_dashboard_stats()
8. get_published_projects_count()
9. get_project_with_images()
```

### Vues Statistiques (3 au total)

```sql
1. rate_limit_configs
2. projects_stats
3. quotes_stats
4. quotes_by_service
```

### Storage Buckets (3 au total)

```
1. site-images       ✅ Public, 5 MB limit
2. project-images    ✅ Public, 10 MB limit
3. avatars           ✅ Privé, 2 MB limit
```

---

## ✅ CHECKLIST INSTALLATION CORRIGÉE

### Phase 1 : Création Projet

- [ ] Créer projet Supabase FREE
- [ ] Noter URL + anon key + service_role key
- [ ] Créer fichier `.env` local

### Phase 2 : Migrations SQL (ORDRE IMPORTANT)

- [ ] **Migration 001** : `create_site_images.sql` (inchangé)
- [ ] **Migration 002** : `create_core_tables.sql` (**MODIFIÉ** - sans fake testimonials)
- [ ] **Migration 003** : `create_admin_profiles.sql` (**MODIFIÉ** - admin sécurisé)
- [ ] **Migration 004** : `create_projects.sql` (inchangé)
- [ ] **Migration 005** : `create_rate_limits.sql` (inchangé)
- [ ] **Migration 006** : `create_utility_functions.sql` (**MODIFIÉ** - nettoyé)

### Phase 3 : Storage Buckets

- [ ] Créer bucket `site-images` (public)
- [ ] Créer bucket `project-images` (public)
- [ ] Créer bucket `avatars` (privé)
- [ ] Configurer politiques RLS des buckets

### Phase 4 : Authentication

- [ ] Activer Email Auth
- [ ] Configurer Site URL + Redirect URLs
- [ ] **Créer premier admin MANUELLEMENT** :
  ```sql
  -- 1. Inscrire via Supabase Auth UI
  -- 2. Noter l'UUID généré
  -- 3. Créer le profil admin :
  INSERT INTO admin_profiles (id, full_name, role)
  VALUES ('uuid-ici', 'Admin Principal', 'admin');
  ```

### Phase 5 : Surveillance

- [ ] Créer compte UptimeRobot
- [ ] Configurer monitoring sur `/api/health`
- [ ] Ajouter email d'alerte
- [ ] **DOCUMENTER** : Réveil manuel requis si pause

### Phase 6 : Tests

- [ ] Tester connexion Nuxt → Supabase
- [ ] Tester login admin
- [ ] Tester upload image
- [ ] Tester soumission devis (avec rate limiting)
- [ ] Vérifier RLS (lecture publique OK, écriture admin seulement)

---

## 🎯 RECOMMANDATIONS FINALES

### Priorité 1 : AVANT DÉPLOIEMENT (BLOQUANT)

1. ✅ **Corriger** : Admin auth trigger (Migration 003)
2. ✅ **Supprimer** : Fake testimonials (Migration 002)
3. ✅ **Documenter** : Limitations FREE tier + surveillance

### Priorité 2 : AMÉLIORATION (NON BLOQUANT)

4. ✅ **Nettoyer** : Fonctions SQL inutilisées (Migration 006)
5. ✅ **Supprimer** : Table audit_logs (Migration 006)
6. ✅ **Créer** : Guide migration FREE → Pro

### Priorité 3 : POST-DÉPLOIEMENT

7. ✅ **Implémenter** : Cron keep-alive (éviter pause)
8. ✅ **Monitorer** : Quotas DB/Storage/Bandwidth
9. ✅ **Tester** : Restauration depuis backup

---

## 📊 ESTIMATION QUOTAS FREE

### Base de Données (500 MB limite)

| Donnée | Estimation | % Quota |
|--------|-----------|---------|
| Tables système | 10 MB | 2% |
| site_settings (1 row) | 1 KB | 0% |
| site_images (50 images) | 50 KB | 0% |
| quote_requests (1000/an) | 2 MB | 0.4% |
| projects (100 projets) | 1 MB | 0.2% |
| project_images (500 images) | 500 KB | 0.1% |
| testimonials (50 réels) | 100 KB | 0% |
| rate_limits (auto-cleanup) | 5 MB | 1% |
| **TOTAL** | **~20 MB** | **4%** |

**Marge** : 480 MB disponibles (96%) ✅

### Storage (1 GB limite)

| Type | Estimation | % Quota |
|------|-----------|---------|
| site-images (20 images) | 100 MB | 10% |
| project-images (500 images) | 750 MB | 75% |
| avatars (5 admins) | 5 MB | 0.5% |
| **TOTAL** | **~855 MB** | **85.5%** |

**Marge** : 145 MB disponibles (14.5%) ⚠️ Surveiller

### Bandwidth (2 GB/mois limite)

| Trafic | Estimation | % Quota |
|--------|-----------|---------|
| Visiteurs (1000/mois) | 500 MB | 25% |
| Images projet | 800 MB | 40% |
| API requests | 200 MB | 10% |
| **TOTAL** | **~1.5 GB** | **75%** |

**Marge** : 500 MB disponibles (25%) ⚠️ Surveiller

**Conclusion** : FREE tier suffisant pour 6-12 mois ✅

---

## 📞 SUPPORT ET RESSOURCES

### Documentation

- Architecture complète : `ARCHITECTURE_SUPABASE.md` (**À METTRE À JOUR**)
- Installation : `INSTALLATION_SUPABASE.md` (**À METTRE À JOUR**)
- Ce rapport : `AUDIT_SUPABASE_CRITIQUE.md`

### Outils Surveillance (GRATUITS)

- UptimeRobot : https://uptimerobot.com
- Healthchecks.io : https://healthchecks.io
- Supabase Dashboard : https://supabase.com/dashboard

### Ressources Supabase

- Docs RLS : https://supabase.com/docs/guides/auth/row-level-security
- Docs Storage : https://supabase.com/docs/guides/storage
- Free Tier Limits : https://supabase.com/pricing

---

**Rapport généré le** : 19 novembre 2026  
**Statut** : CORRECTIONS REQUISES AVANT DÉPLOIEMENT  
**Prochaine étape** : Appliquer les modifications SQL prioritaires

