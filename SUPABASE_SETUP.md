# Configuration Supabase pour ML Immobilier

## 1. Créer un Projet Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter ou créer un compte
3. Créer un nouveau projet :
   - Nom du projet : `ml-immobilier-prod`
   - Région : Choisir la plus proche (Europe ou US)
   - Mot de passe de la base de données : **Bien le noter !**

## 2. Créer le Bucket de Stockage

1. Dans le projet Supabase, aller dans **Storage**
2. Cliquer sur **New Bucket**
3. Paramètres :
   - Name : `site-images`
   - Public bucket : **Coché** (pour que les images soient accessibles publiquement)
   - File size limit : 5 MB (ou plus selon vos besoins)
4. Créer le bucket

### Configurer les Politiques de Sécurité du Bucket

Aller dans l'onglet **Policies** du bucket `site-images` et créer ces politiques :

**Politique 1 : Lecture publique**
```sql
-- Nom : Public can view site images
-- Operation : SELECT
-- Policy definition :
CREATE POLICY "Public can view site images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');
```

**Politique 2 : Upload pour utilisateurs authentifiés**
```sql
-- Nom : Authenticated users can upload site images
-- Operation : INSERT
-- Policy definition :
CREATE POLICY "Authenticated users can upload site images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images');
```

**Politique 3 : Suppression pour utilisateurs authentifiés**
```sql
-- Nom : Authenticated users can delete site images
-- Operation : DELETE
-- Policy definition :
CREATE POLICY "Authenticated users can delete site images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-images');
```

## 3. Exécuter la Migration de Base de Données

1. Dans le projet Supabase, aller dans **SQL Editor**
2. Créer une nouvelle requête
3. Copier tout le contenu du fichier `supabase/migrations/001_create_site_images.sql`
4. Coller et exécuter la requête
5. Vérifier que la table `site_images` a été créée dans **Table Editor**

## 4. Créer un Utilisateur Admin (Optionnel mais recommandé)

Pour l'authentification des administrateurs :

1. Aller dans **Authentication > Users**
2. Cliquer sur **Add user**
3. Créer un utilisateur :
   - Email : `admin@mlimmobilier.com`
   - Password : Choisir un mot de passe fort
   - Auto Confirm User : **Coché**

## 5. Configurer les Variables d'Environnement

Créer un fichier `.env` à la racine du projet `ml-immobilier/` :

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role-secrete
```

### Où trouver ces clés ?

Dans votre projet Supabase :
1. Aller dans **Settings > API**
2. Copier :
   - **Project URL** → `NUXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NUXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Ne jamais exposer côté client)

## 6. Ajouter .env au .gitignore

Vérifier que `.env` est bien dans le fichier `.gitignore` :

```
.env
.env.*
!.env.example
```

## 7. Structure de la Table site_images

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (auto-généré) |
| page | VARCHAR(50) | Page concernée ('home', 'about', 'services', etc.) |
| section | VARCHAR(100) | Section de la page ('hero_background', 'btp_section_image', etc.) |
| description | TEXT | Description lisible de l'image |
| image_url | TEXT | URL complète Supabase de l'image |
| storage_path | TEXT | Chemin dans le bucket ('site-images/hero-home.jpg') |
| alt_text | TEXT | Texte alternatif pour accessibilité |
| display_order | INTEGER | Ordre d'affichage (pour sections avec plusieurs images) |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de dernière mise à jour (auto) |

## 8. Images Pré-configurées

Après la migration, 6 images par défaut sont configurées :

### Page Accueil (home)
- `hero_background` : Arrière-plan du Hero

### Page Qui sommes-nous (about)
- `hero_background` : Arrière-plan du Hero
- `presentation_image` : Image de présentation

### Page Services (services)
- `btp_section_image` : Image section BTP
- `electrification_section_image` : Image section Électrification
- `gestion_section_image` : Image section Gestion

## 9. Tester la Configuration

Une fois tout configuré :

1. Redémarrer le serveur de développement Nuxt
2. Accéder à `/admin/images` dans l'interface d'administration
3. Tester l'upload d'une image
4. Vérifier que l'image apparaît sur la page publique correspondante

## 10. Sécurité - Points Importants

✅ **À FAIRE :**
- Utiliser les variables d'environnement pour les clés
- Ne JAMAIS commit le fichier `.env`
- Activer RLS (Row Level Security) sur toutes les tables
- Utiliser `anon key` côté client uniquement
- Utiliser `service_role key` côté serveur uniquement

❌ **À NE PAS FAIRE :**
- Exposer la `service_role key` côté client
- Désactiver RLS en production
- Utiliser des buckets publics sans politiques de sécurité
- Stocker des images en base64 dans la base de données

## Support

En cas de problème :
- Documentation Supabase : [https://supabase.com/docs](https://supabase.com/docs)
- Guide Storage : [https://supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage)
- Guide RLS : [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
