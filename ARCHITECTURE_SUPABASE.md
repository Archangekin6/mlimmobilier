# Architecture Supabase - ML Immobilier SARL

> **Document historique.** Les sections ci-dessous décrivent l'état antérieur
> à la connexion Supabase et ne sont pas la source de vérité pour le code actuel.
> Consulter [SUPABASE_READY.md](./SUPABASE_READY.md) et les migrations
> `supabase/migrations/` pour l'architecture et les opérations de déploiement
> actuelles. Ne pas exécuter les anciens exemples SQL de ce document sans les
> comparer au schéma distant.

## 📋 Audit du Projet

### Fonctionnalités Identifiées

#### 1. **Paramètres Généraux du Site** (SiteSettings)
- Informations entreprise (nom, logo, slogan)
- Coordonnées (adresse, téléphones, email, réseaux sociaux)
- Horaires d'ouverture
- Textes Hero (titre, sous-titre, CTA)
- Statistiques affichées (clients, projets, années, satisfaction)
- Bannière de notification

**Stockage actuel** : localStorage  
**Migration vers** : Table `site_settings`

#### 2. **Demandes de Devis** (QuoteRequest)
- Formulaire de contact public
- Type de service (BTP, Électrification, Gestion, Autre)
- Informations client (nom, téléphone, email, localisation)
- Détails projet (budget, délai, description)
- Statut de traitement (nouveau, en_cours, devis_envoyé, terminé, archivé)
- Notes administrateur

**Stockage actuel** : localStorage  
**Migration vers** : Table `quote_requests`  
**Protection** : Cloudflare Turnstile + Honeypot + Rate limiting

#### 3. **Projets/Réalisations** (Project)
- Portfolio de réalisations (BTP, Électrification, Gestion)
- Informations projet (titre, catégorie, localisation, date)
- Descriptions courte et complète
- Client (optionnel)
- Image principale + galerie d'images
- Statut publication (publié/brouillon)
- Mise en avant (featured)

**Stockage actuel** : localStorage  
**Migration vers** : Table `projects`

#### 4. **Images du Site** (SiteImage)
- Images Hero des différentes pages
- Images de sections (Services, À propos)
- Images modifiables depuis l'administration
- Textes alternatifs (ALT) pour accessibilité

**Stockage actuel** : Déjà préparé pour Supabase  
**Tables** : `site_images` (déjà créée)  
**Storage** : Bucket `site-images`

#### 5. **Authentification Administrateurs**
- Connexion sécurisée
- Rôles : Admin / Éditeur
- Gestion des permissions

**Stockage actuel** : localStorage (credentials hardcodés)  
**Migration vers** : Supabase Auth + Table `admin_profiles`

#### 6. **Témoignages Clients** (Non implémenté mais présent dans le design)
- Avis clients avec étoiles
- Nom, localisation
- Citation

**À créer** : Table `testimonials`

---

## 🏗️ Architecture de la Base de Données

### Vue d'Ensemble

```
┌─────────────────┐
│  site_settings  │
│   (Singleton)   │
└─────────────────┘

┌─────────────────┐      ┌──────────────────┐
│ quote_requests  │      │  rate_limits     │
│                 │      │   (Protection)   │
└─────────────────┘      └──────────────────┘

┌─────────────────┐      ┌──────────────────┐
│    projects     │─────▶│ project_images   │
│                 │      │   (1 to many)    │
└─────────────────┘      └──────────────────┘

┌─────────────────┐
│  site_images    │
│  (Déjà créée)   │
└─────────────────┘

┌─────────────────┐
│ admin_profiles  │─────▶ Supabase Auth
│                 │
└─────────────────┘

┌─────────────────┐
│ testimonials    │
│                 │
└─────────────────┘
```

### Tables Détaillées

#### 1. `site_settings` (Singleton)
```sql
- id: UUID (PK)
- company_name: TEXT
- logo_url: TEXT
- tagline: TEXT
- address: TEXT
- city: TEXT
- phone1: TEXT
- phone2: TEXT
- whatsapp: TEXT
- email: TEXT
- working_hours: TEXT
- hero_title: TEXT
- hero_subtitle: TEXT
- hero_cta_text: TEXT
- stats_clients: INTEGER
- stats_projects: INTEGER
- stats_years: INTEGER
- stats_satisfaction: INTEGER
- social_facebook: TEXT
- social_linkedin: TEXT
- social_instagram: TEXT
- banner_notice: TEXT
- show_notice: BOOLEAN
- updated_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

#### 2. `quote_requests`
```sql
- id: UUID (PK)
- service: TEXT (btp, electrification, gestion, autre)
- full_name: TEXT NOT NULL
- phone: TEXT NOT NULL
- email: TEXT
- location: TEXT
- budget: TEXT
- timeline: TEXT
- description: TEXT NOT NULL
- status: TEXT (nouveau, en_cours, devis_envoye, termine, archive)
- notes: TEXT
- ip_address: TEXT (pour rate limiting)
- user_agent: TEXT (détection bot)
- turnstile_token: TEXT (validation Cloudflare)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 3. `projects`
```sql
- id: UUID (PK)
- title: TEXT NOT NULL
- category: TEXT (btp, electrification, gestion)
- location: TEXT
- date: TEXT
- description: TEXT NOT NULL
- full_description: TEXT
- client: TEXT
- image_url: TEXT NOT NULL
- published: BOOLEAN DEFAULT false
- featured: BOOLEAN DEFAULT false
- display_order: INTEGER DEFAULT 0
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- created_by: UUID (FK -> auth.users)
```

#### 4. `project_images` (Galerie)
```sql
- id: UUID (PK)
- project_id: UUID NOT NULL (FK -> projects)
- image_url: TEXT NOT NULL
- storage_path: TEXT
- display_order: INTEGER DEFAULT 0
- alt_text: TEXT
- created_at: TIMESTAMPTZ
```

#### 5. `site_images` (Déjà créée)
```sql
- id: UUID (PK)
- page: TEXT
- section: TEXT
- description: TEXT
- image_url: TEXT
- storage_path: TEXT
- alt_text: TEXT
- display_order: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 6. `admin_profiles`
```sql
- id: UUID (PK, FK -> auth.users)
- full_name: TEXT
- role: TEXT (admin, editeur)
- avatar_url: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 7. `testimonials`
```sql
- id: UUID (PK)
- client_name: TEXT NOT NULL
- client_role: TEXT
- client_location: TEXT
- rating: INTEGER (1-5)
- testimonial_text: TEXT NOT NULL
- published: BOOLEAN DEFAULT false
- display_order: INTEGER DEFAULT 0
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 8. `rate_limits` (Protection anti-spam)
```sql
- id: UUID (PK)
- identifier: TEXT NOT NULL (IP ou fingerprint)
- action: TEXT NOT NULL (quote_submission)
- count: INTEGER DEFAULT 1
- window_start: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- INDEX: (identifier, action, window_start)
```

---

## 🔒 Row Level Security (RLS)

### Politique Générale

| Table | SELECT (Public) | INSERT | UPDATE | DELETE |
|-------|----------------|--------|--------|--------|
| `site_settings` | ✅ Tous | ❌ Aucun | ✅ Admins | ❌ Aucun |
| `quote_requests` | ❌ Admins uniquement | ✅ Tous (avec rate limit) | ✅ Admins | ✅ Admins |
| `projects` | ✅ Publiés uniquement | ✅ Admins | ✅ Admins | ✅ Admins |
| `project_images` | ✅ Projets publiés | ✅ Admins | ✅ Admins | ✅ Admins |
| `site_images` | ✅ Tous | ✅ Admins | ✅ Admins | ✅ Admins |
| `admin_profiles` | ❌ Admins uniquement | ❌ Super admin | ✅ Propriétaire | ❌ Super admin |
| `testimonials` | ✅ Publiés uniquement | ✅ Admins | ✅ Admins | ✅ Admins |
| `rate_limits` | ❌ Aucun | ✅ Service role | ✅ Service role | ✅ Service role |

### Fonctions Helper RLS

```sql
-- Vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier si l'utilisateur est authentifié et a un profil
CREATE OR REPLACE FUNCTION is_authenticated_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📦 Supabase Storage

### Buckets

#### 1. `site-images` (Public)
- **Usage** : Images du site éditables depuis l'admin
- **Taille max** : 5 MB par fichier
- **Types** : image/jpeg, image/png, image/webp
- **Public** : ✅ Oui

**Politiques** :
```sql
-- Lecture publique
SELECT: bucket_id = 'site-images'

-- Upload : admins uniquement
INSERT: bucket_id = 'site-images' AND is_authenticated_admin()

-- Suppression : admins uniquement
DELETE: bucket_id = 'site-images' AND is_authenticated_admin()
```

#### 2. `project-images` (Public)
- **Usage** : Images des projets/réalisations
- **Taille max** : 10 MB par fichier
- **Types** : image/jpeg, image/png, image/webp
- **Public** : ✅ Oui

**Politiques** :
```sql
-- Lecture publique
SELECT: bucket_id = 'project-images'

-- Upload : admins uniquement
INSERT: bucket_id = 'project-images' AND is_authenticated_admin()

-- Suppression : admins uniquement
DELETE: bucket_id = 'project-images' AND is_authenticated_admin()
```

#### 3. `avatars` (Privé)
- **Usage** : Photos de profil administrateurs
- **Taille max** : 2 MB par fichier
- **Types** : image/jpeg, image/png
- **Public** : ❌ Non

**Politiques** :
```sql
-- Lecture : propriétaire uniquement
SELECT: bucket_id = 'avatars' AND auth.uid() = owner

-- Upload : propriétaire uniquement
INSERT: bucket_id = 'avatars' AND auth.uid() = owner

-- Suppression : propriétaire uniquement
DELETE: bucket_id = 'avatars' AND auth.uid() = owner
```

---

## 🔐 Authentification (Supabase Auth)

### Configuration

**Providers activés** :
- ✅ Email/Password (principal)
- ❌ Google (optionnel pour future extension)

**Paramètres de sécurité** :
- Confirmation email : ✅ Activée
- Réinitialisation mot de passe : ✅ Activée
- Durée session : 7 jours
- Refresh token : 30 jours
- MFA : ❌ Désactivé (peut être activé ultérieurement)

### Rôles et Permissions

| Rôle | Permissions |
|------|-------------|
| **Admin** | Accès complet : Paramètres, Projets, Devis, Images, Témoignages, Gestion utilisateurs |
| **Éditeur** | Accès limité : Projets, Devis (consultation), Images |

**Implémentation** : Via table `admin_profiles` avec champ `role`

### Workflow d'Inscription

1. **Création compte** : Par super admin uniquement
2. **Email de confirmation** : Envoyé automatiquement
3. **Première connexion** : Changement mot de passe obligatoire
4. **Profil admin** : Créé automatiquement via trigger

---

## 🛡️ Protection Formulaire de Devis

### 1. Cloudflare Turnstile

**Configuration** :
- Mode : Managed (Challenge automatique si suspect)
- Sitekey : Variable d'environnement `NUXT_PUBLIC_TURNSTILE_SITE_KEY`
- Secret : Variable d'environnement `TURNSTILE_SECRET_KEY`

**Intégration** :
- Côté client : Widget invisible ou compact
- Côté serveur : Validation du token avant insertion

**Vérifications illimitées** : Offre gratuite Cloudflare

### 2. Honeypot

- Champ caché `honeypot` dans le formulaire
- Si rempli : soumission rejetée silencieusement
- Nom de champ aléatoire pour éviter détection

### 3. Rate Limiting

**Limites** :
- 3 soumissions par IP par heure
- 10 soumissions par IP par jour
- Blocage progressif si dépassement

**Implémentation** :
- Table `rate_limits` avec fenêtres glissantes
- Fonction SQL `check_rate_limit(identifier TEXT, action TEXT, max_count INT, window_minutes INT)`

**Adaptation Vercel** :
- Utilise IP du client (headers `x-forwarded-for`)
- Stockage dans Supabase (pas de fichiers locaux)
- Compatible avec edge functions

### 4. Validation Serveur

**Champs obligatoires** :
- `full_name` : Non vide, 2-100 caractères
- `phone` : Format +225 XX XX XX XX XX
- `description` : Non vide, 10-5000 caractères

**Champs optionnels validés** :
- `email` : Format email valide si fourni
- `budget` : Texte libre
- `timeline` : Texte libre

### 5. Sanitization

- Nettoyage HTML/JavaScript (strip_tags)
- Échappement caractères spéciaux
- Limitation longueur des champs

---

## ⚙️ Configuration Nuxt

### Variables d'Environnement

Créer `.env` :

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare Turnstile
NUXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...

# Application
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### Fichiers de Configuration

1. **`nuxt.config.ts`** : Configuration runtime
2. **`app/lib/supabase.ts`** : Client Supabase (déjà créé)
3. **`server/utils/supabase.ts`** : Client serveur avec service role
4. **`server/middleware/turnstile.ts`** : Validation Turnstile
5. **`server/middleware/rateLimit.ts`** : Rate limiting

---

## 📁 Structure des Migrations

```
supabase/
├── migrations/
│   ├── 001_create_site_images.sql (✅ Existe)
│   ├── 002_create_core_tables.sql (À créer)
│   ├── 003_create_admin_profiles.sql (À créer)
│   ├── 004_create_projects.sql (À créer)
│   ├── 005_create_rate_limits.sql (À créer)
│   ├── 006_create_functions.sql (À créer)
│   └── 007_insert_default_data.sql (À créer)
└── seed.sql (Données de test - optionnel)
```

---

## 🚀 Plan de Migration

### Phase 1 : Infrastructure
1. Créer projet Supabase
2. Exécuter migrations SQL
3. Créer buckets Storage
4. Configurer Auth

### Phase 2 : Migration Données
1. Exporter données localStorage
2. Importer dans Supabase
3. Vérifier intégrité

### Phase 3 : Mise à Jour Code
1. Remplacer `useSiteData` par appels Supabase
2. Implémenter authentification Auth
3. Ajouter protection formulaires
4. Tests end-to-end

### Phase 4 : Déploiement
1. Configuration variables production
2. Tests sur staging
3. Migration production
4. Monitoring

---

## 📊 Métriques et Monitoring

### Quotas Supabase (Plan Gratuit)

- **Database** : 500 MB
- **Storage** : 1 GB
- **Bandwidth** : 2 GB/mois
- **Requêtes API** : Illimitées

### Estimation Utilisation

| Ressource | Usage Estimé | % Quota |
|-----------|--------------|---------|
| Database | ~20 MB (5000 devis) | 4% |
| Storage | ~200 MB (400 images) | 20% |
| Bandwidth | ~500 MB/mois | 25% |

**Conclusion** : Plan gratuit largement suffisant

---

## ✅ Checklist Prochaines Étapes

### À Faire Maintenant

- [ ] Créer projet Supabase
- [ ] Récupérer clés API
- [ ] Créer fichier `.env`
- [ ] Exécuter migrations SQL (dans l'ordre)
- [ ] Créer buckets Storage
- [ ] Configurer politiques RLS
- [ ] Créer premier compte admin
- [ ] Tester connexion depuis Nuxt

### À Faire Après

- [ ] Migrer composable `useSiteData`
- [ ] Implémenter Cloudflare Turnstile
- [ ] Ajouter rate limiting
- [ ] Créer API routes serveur
- [ ] Tests de sécurité
- [ ] Documentation utilisateur

---

**Date de création** : 19 novembre 2026  
**Version** : 1.0  
**Projet** : ML Immobilier SARL
