# 📋 Ordre d'Installation Final - Supabase ML Immobilier

**Date** : 19 novembre 2026  
**Version** : Corrigée après audit critique  
**Statut** : PRÊT POUR DÉPLOIEMENT

---

## ⚠️ CORRECTIONS APPLIQUÉES

Les fichiers SQL ont été corrigés pour résoudre les risques critiques identifiés lors de l'audit :

✅ **Migration 002** : Suppression des fake testimonials  
✅ **Migration 003** : Sécurisation de l'authentification admin (plus de user_metadata)  
✅ **Migration 006** : Nettoyage des fonctions SQL inutilisées

---

## 🚀 ORDRE D'EXÉCUTION (STRICT)

### 📦 Étape 0 : Prérequis

**Avant de commencer** :

- [ ] Compte Supabase créé (https://supabase.com)
- [ ] Node.js installé (v18 ou supérieur)
- [ ] Code source ML Immobilier cloné
- [ ] Éditeur de texte prêt

---

### 🗄️ Étape 1 : Créer le Projet Supabase

1. Se connecter à https://supabase.com
2. Cliquer sur **"New Project"**
3. Remplir :
   - **Name** : `ml-immobilier-prod` (ou `-dev` pour test)
   - **Database Password** : Générer un mot de passe fort (SAUVEGARDER!)
   - **Region** : `eu-west-1` (Europe) ou proche de la Côte d'Ivoire
   - **Plan** : **Free** ✅
4. Cliquer sur **"Create new project"**
5. ⏳ Attendre 2-3 minutes (provisionnement)

**Récupérer les clés API** :

1. Aller dans **Settings** > **API**
2. Noter :
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **NE JAMAIS PARTAGER la clé service_role !**

---

### 🗃️ Étape 2 : Exécuter les Migrations SQL

**IMPORTANT** : Exécuter dans l'ordre exact ci-dessous.

#### 2.1 Migration 001 : Site Images

1. Ouvrir **SQL Editor** dans Supabase
2. Cliquer sur **"New query"**
3. Copier tout le contenu de `supabase/migrations/001_create_site_images.sql`
4. Coller dans l'éditeur
5. Cliquer sur **"Run"** (ou Ctrl+Enter)
6. ✅ Vérifier : `Success. No rows returned`

**Table créée** : `site_images` (6 lignes par défaut)

#### 2.2 Migration 002 : Core Tables

1. **New query**
2. Copier tout `supabase/migrations/002_create_core_tables.sql`
3. **Run**
4. ✅ Vérifier dans **Table Editor** :
   - `site_settings` (1 ligne)
   - `quote_requests` (vide)
   - `testimonials` (vide ✅ pas de fake data)

#### 2.3 Migration 003 : Admin Profiles (SÉCURISÉ)

1. **New query**
2. Copier tout `supabase/migrations/003_create_admin_profiles.sql`
3. **Run**
4. ✅ Vérifier :
   - Table `admin_profiles` créée (vide)
   - Fonctions créées : `is_admin()`, `is_authenticated_admin()`, `get_admin_profile()`
   - **PAS de trigger automatique** (sécurité ✅)

#### 2.4 Migration 004 : Projects

1. **New query**
2. Copier tout `supabase/migrations/004_create_projects.sql`
3. **Run**
4. ✅ Vérifier :
   - Table `projects` (vide)
   - Table `project_images` (vide)

#### 2.5 Migration 005 : Rate Limits

1. **New query**
2. Copier tout `supabase/migrations/005_create_rate_limits.sql`
3. **Run**
4. ✅ Vérifier :
   - Table `rate_limits` (vide)
   - Fonction `check_rate_limit()` créée
   - Vue `rate_limit_configs` créée

#### 2.6 Migration 006 : Utility Functions (NETTOYÉ)

1. **New query**
2. Copier tout `supabase/migrations/006_create_utility_functions.sql`
3. **Run**
4. ✅ Vérifier :
   - Fonction `get_dashboard_stats()` créée
   - Fonction `get_published_projects_count()` créée
   - Fonction `get_project_with_images()` créée
   - Vues : `projects_stats`, `quotes_stats`, `quotes_by_service`
   - **PAS de table audit_logs** (supprimée ✅)

**Vérification finale** : Dans **Table Editor**, vous devez avoir **8 tables** :

```
1. site_settings      ✅
2. site_images        ✅
3. quote_requests     ✅
4. projects           ✅
5. project_images     ✅
6. admin_profiles     ✅
7. testimonials       ✅
8. rate_limits        ✅
```

---

### 📁 Étape 3 : Configurer Storage

#### 3.1 Bucket : site-images

1. Aller dans **Storage**
2. Cliquer sur **"New bucket"**
3. Paramètres :
   - **Name** : `site-images`
   - **Public bucket** : ✅ Coché
   - **File size limit** : `5` MB
4. **Create bucket**

**Politiques RLS** :

Cliquer sur le bucket > **Policies** > Créer 3 politiques :

```sql
-- 1. Lecture publique
CREATE POLICY "Public can view site images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');

-- 2. Upload admins
CREATE POLICY "Admins can upload site images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' 
  AND is_authenticated_admin()
);

-- 3. Suppression admins
CREATE POLICY "Admins can delete site images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images' 
  AND is_authenticated_admin()
);
```

#### 3.2 Bucket : project-images

Répéter les mêmes étapes que `site-images` :

- **Name** : `project-images`
- **Public** : ✅ Oui
- **Size limit** : `10` MB
- **3 politiques identiques** (remplacer `'site-images'` par `'project-images'`)

#### 3.3 Bucket : avatars (optionnel)

- **Name** : `avatars`
- **Public** : ❌ Non (privé)
- **Size limit** : `2` MB
- **Politiques** : Accès propriétaire uniquement (voir guide installation)

---

### 🔐 Étape 4 : Créer le Premier Admin (MANUELLEMENT)

**⚠️ IMPORTANT** : L'auto-création est désactivée pour des raisons de sécurité.

#### 4.1 Créer le Compte Auth

1. Aller dans **Authentication** > **Users**
2. Cliquer sur **"Add user"** > **"Create new user"**
3. Remplir :
   - **Email** : `admin@mlimmobilier.com` (ou votre email)
   - **Password** : Générer un mot de passe fort
   - **Auto Confirm User** : ✅ Coché
4. Cliquer sur **"Create user"**
5. **Noter l'UUID** généré (visible dans la liste des users)

#### 4.2 Créer le Profil Admin

1. Ouvrir **SQL Editor**
2. **New query**
3. Exécuter (remplacer `uuid-ici` par l'UUID du user créé) :

```sql
INSERT INTO admin_profiles (id, full_name, role)
VALUES (
  'uuid-ici',                    -- UUID du user auth
  'Administrateur Principal',    -- Nom complet
  'admin'                        -- Role : 'admin' ou 'editeur'
);
```

4. **Run**
5. ✅ Vérifier dans **Table Editor** > `admin_profiles` : 1 ligne créée

**Tester la connexion** : Plus tard dans l'étape 7.

---

### ⚙️ Étape 5 : Configuration Locale (Nuxt)

#### 5.1 Créer le fichier `.env`

Dans le dossier `ml-immobilier/` :

```bash
# Copier le template
cp .env.example .env
```

#### 5.2 Remplir les Variables

Éditer `.env` :

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare Turnstile (optionnel pour l'instant)
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Keep-Alive Cron (voir GUIDE_SURVEILLANCE_FREE.md)
CRON_SECRET_TOKEN=

# Application
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

**⚠️ Vérifier** que `.env` est dans `.gitignore` !

#### 5.3 Installer les Dépendances

```bash
cd ml-immobilier
npm install
```

---

### 🔍 Étape 6 : Configurer la Surveillance (OBLIGATOIRE)

**Voir le guide complet** : `GUIDE_SURVEILLANCE_FREE.md`

#### 6.1 Créer l'Endpoint Keep-Alive

**Fichier** : `server/api/cron/keep-alive.ts`

```typescript
import { supabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const cronToken = getHeader(event, 'x-cron-token')
  
  if (!cronToken || cronToken !== process.env.CRON_SECRET_TOKEN) {
    throw createError({ statusCode: 401 })
  }
  
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('id, company_name')
    .single()
  
  if (error) {
    return { success: false, error: error.message, timestamp: new Date() }
  }
  
  return { success: true, message: 'Keep-alive OK', timestamp: new Date() }
})
```

#### 6.2 Générer un Token Secret

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Ajouter au `.env` :

```env
CRON_SECRET_TOKEN=votre-token-genere-ici
```

#### 6.3 Configurer GitHub Actions

**Fichier** : `.github/workflows/keep-alive.yml`

```yaml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 3 * * *'  # Tous les jours à 3h UTC
  workflow_dispatch:

jobs:
  ping-supabase:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Keep-Alive
        run: |
          curl -X POST https://votre-site.com/api/cron/keep-alive \
            -H "x-cron-token: ${{ secrets.CRON_SECRET_TOKEN }}"
```

**Configuration GitHub** :

1. Repo > **Settings** > **Secrets** > **New repository secret**
2. Name : `CRON_SECRET_TOKEN`
3. Value : Votre token généré
4. **Add secret**

---

### ✅ Étape 7 : Tests de Vérification

#### 7.1 Démarrer le Serveur

```bash
npm run dev
```

✅ Le serveur doit démarrer sans erreur Supabase.

#### 7.2 Tester les Pages Publiques

1. Ouvrir http://localhost:3000
2. ✅ Page d'accueil s'affiche
3. ✅ Pas d'erreur console

#### 7.3 Tester la Connexion Admin

1. Aller sur http://localhost:3000/admin/login
2. Se connecter avec les identifiants créés à l'étape 4
3. ✅ Connexion réussie
4. ✅ Dashboard admin s'affiche

#### 7.4 Tester la Gestion d'Images

1. Dans l'admin, aller sur **"Images du site"**
2. ✅ Les 6 images par défaut s'affichent
3. Essayer de remplacer une image
4. ✅ Upload réussi vers Supabase Storage
5. Vérifier sur la page publique
6. ✅ La nouvelle image apparaît

#### 7.5 Tester le Formulaire de Devis

1. Aller sur http://localhost:3000/contact
2. Remplir et soumettre le formulaire
3. ✅ Message de succès
4. Dans l'admin > **"Demandes de devis"**
5. ✅ La demande apparaît dans la liste

#### 7.6 Tester le Keep-Alive

```bash
curl -X POST http://localhost:3000/api/cron/keep-alive \
  -H "x-cron-token: votre-token-secret"

# Réponse attendue :
# {"success":true,"message":"Keep-alive OK","timestamp":"..."}
```

---

## 📋 Checklist Finale

### Base de Données

- [ ] 8 tables créées et vérifiées
- [ ] Données par défaut insérées (`site_settings`, `site_images`)
- [ ] Pas de fake testimonials (table vide ✅)
- [ ] RLS activé sur toutes les tables
- [ ] Fonctions SQL créées (9 fonctions)

### Storage

- [ ] Bucket `site-images` créé (public)
- [ ] Bucket `project-images` créé (public)
- [ ] Politiques RLS configurées sur les buckets

### Authentication

- [ ] Email auth activé
- [ ] Premier compte admin créé manuellement
- [ ] Profil admin lié via SQL (pas de trigger auto ✅)

### Configuration Locale

- [ ] Fichier `.env` créé et rempli
- [ ] `.env` dans `.gitignore`
- [ ] Dépendances installées
- [ ] Serveur démarre sans erreur

### Surveillance

- [ ] Endpoint `/api/cron/keep-alive` créé
- [ ] Token secret généré et ajouté au `.env`
- [ ] GitHub Actions ou cron-job.org configuré
- [ ] Keep-alive testé manuellement

### Tests

- [ ] Connexion admin fonctionnelle
- [ ] Upload d'image fonctionnel
- [ ] Formulaire de devis fonctionnel
- [ ] Pages publiques chargent correctement
- [ ] Keep-alive répond correctement

---

## 🚨 Points de Vigilance

### Sécurité

✅ **Admin auth sécurisé** : Pas de création automatique via user_metadata  
✅ **Service role protégé** : Jamais exposé côté client  
✅ **RLS actif** : Sur toutes les tables et buckets  
✅ **Rate limiting** : Protection anti-spam sur le formulaire

### Surveillance

⚠️ **Supabase FREE pause après 7 jours sans activité**  
✅ **Keep-alive automatique** : Empêche la pause  
✅ **UptimeRobot** : Alerte si down (optionnel mais recommandé)

### Quotas FREE

- Database : 500 MB (largement suffisant)
- Storage : 1 GB (surveiller images projets)
- Bandwidth : 2 GB/mois (surveiller trafic)

---

## 📞 Support et Ressources

### Documentation Projet

- Architecture : `ARCHITECTURE_SUPABASE.md`
- Installation : `INSTALLATION_SUPABASE.md`
- Audit : `AUDIT_SUPABASE_CRITIQUE.md`
- Surveillance : `GUIDE_SURVEILLANCE_FREE.md`
- Ce document : `ORDRE_INSTALLATION_FINAL.md`

### Documentation Supabase

- Docs officielles : https://supabase.com/docs
- RLS Guide : https://supabase.com/docs/guides/auth/row-level-security
- Storage Guide : https://supabase.com/docs/guides/storage
- Free Tier Limits : https://supabase.com/pricing

### Community

- Discord Supabase : https://discord.supabase.com
- GitHub : https://github.com/supabase/supabase

---

## 🎉 Prochaines Étapes

Après installation réussie :

1. **Migrer les données localStorage** : Transférer projets/devis existants vers Supabase
2. **Configurer Cloudflare Turnstile** : Protection anti-spam formulaire
3. **Configurer UptimeRobot** : Monitoring externe (optionnel)
4. **Ajouter des témoignages réels** : Via l'interface admin
5. **Déployer en production** : Vercel, Netlify ou autre
6. **Configurer le DNS** : Pointer vers le site déployé
7. **Surveiller les quotas** : Dashboard Supabase

---

**Document créé le** : 19 novembre 2026  
**Version** : Finale (post-audit)  
**Statut** : ✅ PRÊT POUR INSTALLATION

