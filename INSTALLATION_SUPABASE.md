# Guide d'Installation Supabase - ML Immobilier SARL

## 📋 Vue d'Ensemble

Ce guide vous accompagne étape par étape dans la création et configuration d'un nouveau projet Supabase pour ML Immobilier SARL.

**Durée estimée** : 30-45 minutes

---

## 🎯 Pré-requis

- [ ] Compte Supabase (gratuit) : [https://supabase.com](https://supabase.com)
- [ ] Accès au code source ML Immobilier
- [ ] Terminal / ligne de commande
- [ ] Éditeur de texte

---

## 📦 Étape 1 : Créer le Projet Supabase

### 1.1 Connexion à Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Cliquer sur **"Start your project"**
3. Se connecter avec GitHub, Google ou email

### 1.2 Créer un Nouveau Projet

1. Cliquer sur **"New Project"**
2. Remplir les informations :
   - **Organization** : Créer ou sélectionner
   - **Name** : `ml-immobilier-prod` (ou `ml-immobilier-dev` pour développement)
   - **Database Password** : Générer un mot de passe fort (SAUVEGARDER PRÉCIEUSEMENT)
   - **Region** : Choisir la plus proche (Europe West `eu-west-1` ou US East `us-east-1`)
   - **Pricing Plan** : Free (suffisant pour commencer)

3. Cliquer sur **"Create new project"**

⏳ **Attendre 2-3 minutes** que le projet soit provisionné

### 1.3 Récupérer les Clés API

Une fois le projet créé :

1. Aller dans **Settings** (roue crantée) > **API**
2. Noter les informations suivantes :

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzd...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzd...
```

⚠️ **IMPORTANT** : Ne jamais partager ou commit la `service_role key` !

---

## 🗄️ Étape 2 : Exécuter les Migrations SQL

### 2.1 Accéder au SQL Editor

1. Dans le projet Supabase, cliquer sur **SQL Editor** (icône </> dans le menu)
2. Cliquer sur **"New query"**

### 2.2 Exécuter les Migrations (dans l'ordre)

#### Migration 1 : Site Images (déjà préparée)

```sql
-- Copier tout le contenu de :
-- supabase/migrations/001_create_site_images.sql
```

1. Copier le contenu du fichier
2. Coller dans l'éditeur SQL
3. Cliquer sur **"Run"** (ou Ctrl+Enter)
4. ✅ Vérifier : `Success. No rows returned`

#### Migration 2 : Core Tables

```sql
-- Copier tout le contenu de :
-- supabase/migrations/002_create_core_tables.sql
```

1. **New query**
2. Copier-coller le contenu
3. **Run**
4. ✅ Vérifier dans **Table Editor** : `site_settings`, `quote_requests`, `testimonials` créées

#### Migration 3 : Admin Profiles

```sql
-- Copier tout le contenu de :
-- supabase/migrations/003_create_admin_profiles.sql
```

1. **New query**
2. Copier-coller le contenu
3. **Run**
4. ✅ Vérifier : table `admin_profiles` + fonctions `is_admin()`, `is_authenticated_admin()`

#### Migration 4 : Projects

```sql
-- Copier tout le contenu de :
-- supabase/migrations/004_create_projects.sql
```

1. **New query**
2. Copier-coller le contenu
3. **Run**
4. ✅ Vérifier : tables `projects` et `project_images`

#### Migration 5 : Rate Limits

```sql
-- Copier tout le contenu de :
-- supabase/migrations/005_create_rate_limits.sql
```

1. **New query**
2. Copier-coller le contenu
3. **Run**
4. ✅ Vérifier : table `rate_limits` + fonction `check_rate_limit()`

#### Migration 6 : Utility Functions

```sql
-- Copier tout le contenu de :
-- supabase/migrations/006_create_utility_functions.sql
```

1. **New query**
2. Copier-coller le contenu
3. **Run**
4. ✅ Vérifier : fonctions utilitaires + vues + table `audit_logs`

### 2.3 Vérifier les Tables

Dans **Table Editor**, vous devriez voir :

- ✅ `site_settings` (1 ligne par défaut)
- ✅ `site_images` (6 lignes par défaut)
- ✅ `quote_requests` (vide)
- ✅ `projects` (vide)
- ✅ `project_images` (vide)
- ✅ `admin_profiles` (vide pour l'instant)
- ✅ `testimonials` (3 lignes par défaut)
- ✅ `rate_limits` (vide)
- ✅ `audit_logs` (vide)

---

## 📁 Étape 3 : Configurer Storage

### 3.1 Créer les Buckets

#### Bucket 1 : site-images

1. Aller dans **Storage** (menu gauche)
2. Cliquer sur **"New bucket"**
3. Paramètres :
   - **Name** : `site-images`
   - **Public bucket** : ✅ **Coché**
   - **File size limit** : `5` MB
   - **Allowed MIME types** : Laisser vide (tous types images acceptés)

4. Cliquer sur **"Create bucket"**

#### Bucket 2 : project-images

1. **New bucket**
2. Paramètres :
   - **Name** : `project-images`
   - **Public bucket** : ✅ **Coché**
   - **File size limit** : `10` MB

3. **Create bucket**

#### Bucket 3 : avatars (optionnel)

1. **New bucket**
2. Paramètres :
   - **Name** : `avatars`
   - **Public bucket** : ❌ **Décoché**
   - **File size limit** : `2` MB

3. **Create bucket**

### 3.2 Configurer les Politiques RLS des Buckets

#### Pour `site-images` :

1. Cliquer sur `site-images` > **Policies**
2. Créer 3 politiques :

**Politique 1 : Lecture publique**
```sql
CREATE POLICY "Public can view site images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');
```

**Politique 2 : Upload admins**
```sql
CREATE POLICY "Authenticated admins can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' 
  AND is_authenticated_admin()
);
```

**Politique 3 : Suppression admins**
```sql
CREATE POLICY "Authenticated admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images' 
  AND is_authenticated_admin()
);
```

#### Pour `project-images` :

Répéter les mêmes 3 politiques en remplaçant `'site-images'` par `'project-images'`

#### Pour `avatars` (si créé) :

**Lecture propriétaire**
```sql
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Upload propriétaire**
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Suppression propriétaire**
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 🔐 Étape 4 : Configurer Authentication

### 4.1 Paramètres Email

1. Aller dans **Authentication** > **Settings** (anciennement **Auth**)
2. Section **Email Auth** :
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations
   - ✅ Secure password change

### 4.2 Paramètres de Sécurité

1. **Site URL** : `http://localhost:3000` (dev) ou `https://votre-domaine.com` (prod)
2. **Redirect URLs** : 
   - `http://localhost:3000/admin`
   - `https://votre-domaine.com/admin` (en production)

### 4.3 Créer le Premier Compte Admin

1. Aller dans **Authentication** > **Users**
2. Cliquer sur **"Add user"** > **"Create new user"**
3. Remplir :
   - **Email** : `admin@mlimmobilier.com` (ou votre email)
   - **Password** : Générer un mot de passe fort
   - **Auto Confirm User** : ✅ **Coché** (pour éviter l'email de confirmation)
   - **User Metadata** (JSON) :
     ```json
     {
       "is_admin": "true",
       "full_name": "Administrateur Principal",
       "role": "admin"
     }
     ```

4. Cliquer sur **"Create user"**

5. ✅ Vérifier dans **Table Editor** > `admin_profiles` : Un profil a été créé automatiquement

---

## ⚙️ Étape 5 : Configuration Locale

### 5.1 Créer le Fichier `.env`

Dans le projet ML Immobilier (`ml-immobilier/`) :

```bash
# Copier le template
cp .env.example .env
```

### 5.2 Remplir les Variables

Éditer `.env` :

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

# Cloudflare Turnstile (optionnel pour l'instant)
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Application
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

⚠️ **Ne jamais commit ce fichier !** Vérifier qu'il est dans `.gitignore`

### 5.3 Installer les Dépendances

```bash
cd ml-immobilier
npm install
```

### 5.4 Démarrer le Serveur

```bash
npm run dev
```

✅ Le serveur doit démarrer sans erreur Supabase

---

## 🧪 Étape 6 : Tests de Vérification

### 6.1 Tester la Connexion

1. Ouvrir `http://localhost:3000`
2. Les pages doivent charger normalement
3. Pas d'erreur console liée à Supabase

### 6.2 Tester l'Administration

1. Aller sur `http://localhost:3000/admin/login`
2. Se connecter avec les identifiants créés à l'étape 4.3
3. ✅ Connexion réussie
4. ✅ Dashboard admin visible

### 6.3 Tester la Gestion d'Images

1. Dans l'admin, aller sur **"Images du site"**
2. ✅ Les 6 images par défaut s'affichent
3. Essayer de remplacer une image
4. ✅ Upload réussi
5. Vérifier sur la page publique
6. ✅ La nouvelle image apparaît

### 6.4 Tester le Formulaire de Devis

1. Aller sur `http://localhost:3000/contact`
2. Remplir le formulaire
3. Soumettre
4. ✅ Message de succès
5. Dans l'admin > **"Demandes de devis"**
6. ✅ La demande apparaît

---

## 🔒 Étape 7 : Cloudflare Turnstile (Optionnel)

### 7.1 Créer un Site Turnstile

1. Aller sur [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Turnstile** > **Add site**
3. Paramètres :
   - **Domain** : `localhost` (dev) et votre domaine (prod)
   - **Widget Mode** : Managed
4. Récupérer :
   - **Sitekey** → `NUXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret key** → `TURNSTILE_SECRET_KEY`

### 7.2 Ajouter au `.env`

```env
NUXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

### 7.3 Intégrer au Formulaire

Le formulaire est déjà préparé pour Turnstile. Installer le package :

```bash
npm install @nuxtjs/turnstile
```

Redémarrer le serveur.

---

## 📊 Étape 8 : Monitoring (Optionnel)

### 8.1 Vérifier l'Utilisation

Dans Supabase :

1. **Settings** > **Usage**
2. Surveiller :
   - Database size
   - Storage size
   - API requests

### 8.2 Configurer les Alertes

1. **Settings** > **Billing**
2. Activer les alertes de quota

---

## ✅ Checklist Finale

### Base de Données

- [ ] Toutes les tables créées (9 tables)
- [ ] Données par défaut insérées (`site_settings`, `site_images`, `testimonials`)
- [ ] RLS activé sur toutes les tables
- [ ] Fonctions helper créées (`is_admin()`, etc.)

### Storage

- [ ] Buckets créés (`site-images`, `project-images`)
- [ ] Politiques RLS configurées
- [ ] Accès public sur buckets images

### Authentication

- [ ] Email auth activé
- [ ] Premier compte admin créé
- [ ] Profil admin lié automatiquement

### Configuration Locale

- [ ] Fichier `.env` créé et rempli
- [ ] `.env` dans `.gitignore`
- [ ] Dépendances installées
- [ ] Serveur démarre sans erreur

### Tests

- [ ] Connexion admin fonctionnelle
- [ ] Upload d'image fonctionnel
- [ ] Formulaire de devis fonctionnel
- [ ] Pages publiques chargent correctement

---

## 🚨 Troubleshooting

### Erreur : "supabaseUrl is required"

✅ **Solution** : Vérifier que `.env` existe et contient les bonnes clés

### Erreur : "Row Level Security policy violation"

✅ **Solution** : Vérifier que les politiques RLS sont bien créées

### Les images ne s'affichent pas

✅ **Solution** : Vérifier que le bucket est public et les politiques RLS configurées

### Impossible de se connecter en admin

✅ **Solution** : Vérifier que le compte admin a été créé avec `"is_admin": "true"` dans les metadata

---

## 📞 Support

- **Documentation Supabase** : [https://supabase.com/docs](https://supabase.com/docs)
- **Documentation Projet** : Voir `ARCHITECTURE_SUPABASE.md`
- **Community Discord** : [https://discord.supabase.com](https://discord.supabase.com)

---

## 📝 Prochaines Étapes

Après installation :

1. [ ] Migrer les données localStorage existantes vers Supabase
2. [ ] Remplacer `useSiteData` par les appels Supabase directs
3. [ ] Tester en profondeur toutes les fonctionnalités
4. [ ] Configurer Cloudflare Turnstile
5. [ ] Préparer le déploiement en production

---

**Installation créée le** : 19 novembre 2026  
**Version** : 1.0  
**Projet** : ML Immobilier SARL
