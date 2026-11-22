# Guide Complet - Système de Gestion d'Images ML Immobilier

## Vue d'Ensemble

Ce système permet de gérer dynamiquement toutes les images des pages publiques du site ML Immobilier SARL depuis l'interface d'administration, sans modifier le code source.

### Images Gérées (6 au total)

| Page | Section | Description |
|------|---------|-------------|
| **Accueil** | Hero Background | Image de fond de la section d'introduction |
| **Qui sommes-nous** | Hero Background | Image de fond de la section d'introduction |
| **Qui sommes-nous** | Presentation Image | Image de présentation de l'entreprise |
| **Services** | BTP Section | Image illustrant les services BTP |
| **Services** | Électrification Section | Image illustrant les services électriques |
| **Services** | Gestion Section | Image illustrant la gestion immobilière |

---

## Installation et Configuration

### Étape 1 : Configuration Supabase

Suivre les instructions détaillées dans **`SUPABASE_SETUP.md`** :

1. Créer un projet Supabase
2. Créer le bucket de stockage `site-images`
3. Configurer les politiques RLS du bucket
4. Exécuter la migration SQL (créer la table `site_images`)
5. Récupérer les clés API

### Étape 2 : Variables d'Environnement

Créer le fichier `.env` à la racine du projet :

```bash
# Copier le template
cp .env.example .env
```

Éditer `.env` et remplir avec vos vraies clés Supabase :

```env
NUXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important** : Ne jamais commit le fichier `.env` dans Git !

### Étape 3 : Installation des Dépendances

```bash
cd ml-immobilier
npm install
```

Le package `@supabase/supabase-js` est déjà installé.

### Étape 4 : Démarrer le Serveur

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

---

## Utilisation de l'Interface d'Administration

### Accéder à la Gestion des Images

1. Se connecter à l'administration : `/admin/login`
   - Email : `admin@mlimmobilier.com`
   - Mot de passe : `admin123`

2. Dans le menu latéral, cliquer sur **"Images du site"**

### Interface de Gestion

L'interface `/admin/images` affiche :

#### Filtres par Page
- **Toutes les pages** : Afficher toutes les images
- **Accueil** : Images de la page d'accueil
- **Qui sommes-nous** : Images de la page À propos
- **Services** : Images de la page Services

#### Carte d'Image

Chaque image affiche :
- **Nom de la page** et **section**
- **Description** de l'utilisation
- **Aperçu** de l'image actuelle
- **Champ texte alternatif** (ALT) pour l'accessibilité
- **Bouton "Remplacer l'image"**
- **Bouton "Réinitialiser"** (revenir à l'image par défaut)

---

## Workflow de Remplacement d'Image

### Scénario : Changer le Hero de la Page Accueil

1. **Naviguer** vers `/admin/images`

2. **Filtrer** par "Accueil" (optionnel)

3. **Localiser** la carte "Image d'arrière-plan de la section Hero de la page d'accueil"

4. **Cliquer** sur le bouton **"Remplacer l'image"**

5. **Sélectionner** une image depuis votre ordinateur :
   - Formats acceptés : JPG, PNG, WebP
   - Taille maximale : 5 MB
   - Dimensions recommandées : 2000x1200px minimum pour les hero backgrounds

6. **Prévisualiser** : L'aperçu s'affiche immédiatement dans la carte

7. **Modifier le texte ALT** (optionnel mais recommandé) :
   - Exemple : "Nouveau siège social ML Immobilier à Yopougon"

8. **Confirmer** en cliquant sur **"Confirmer le remplacement"**

9. **Attendre** la confirmation : Un message vert "Image mise à jour avec succès" apparaît

10. **Vérifier** sur le site public :
    - Ouvrir `/` dans un nouvel onglet
    - L'image du Hero doit être remplacée
    - Actualiser la page pour confirmer la persistance

---

## Fonctionnalités Avancées

### Modifier Uniquement le Texte Alternatif

1. Dans la carte de l'image, modifier le champ **"Texte alternatif (ALT)"**
2. Cliquer sur l'icône **✓** (check) à droite du champ
3. Le texte est sauvegardé instantanément

Le texte alternatif améliore :
- **Accessibilité** : Les lecteurs d'écran lisent cette description
- **SEO** : Les moteurs de recherche indexent ce texte
- **UX** : Affiché si l'image ne charge pas

### Réinitialiser une Image

Si vous souhaitez revenir à l'image par défaut (Unsplash) :

1. Cliquer sur **"Réinitialiser"**
2. Confirmer dans la boîte de dialogue
3. L'image uploadée est supprimée de Supabase Storage
4. L'image par défaut réapparaît automatiquement

### Annuler un Upload

Si vous avez sélectionné la mauvaise image :

1. Cliquer sur **"Annuler"** dans la zone bleue
2. Sélectionner une autre image si nécessaire

---

## Architecture Technique

### Structure des Fichiers

```
ml-immobilier/
├── .env                           # Variables d'environnement (à créer)
├── .env.example                   # Template des variables
├── SUPABASE_SETUP.md             # Instructions Supabase détaillées
├── GESTION_IMAGES_GUIDE.md       # Ce guide
│
├── lib/
│   └── supabase.ts               # Client Supabase + helpers
│
├── app/
│   ├── composables/
│   │   └── useSiteImages.ts      # Composable de gestion des images
│   │
│   ├── layouts/
│   │   └── admin.vue             # Layout admin (menu mis à jour)
│   │
│   └── pages/
│       ├── admin/
│       │   └── images.vue        # Interface d'administration
│       │
│       ├── index.vue             # Page Accueil (hero dynamique)
│       ├── qui-sommes-nous.vue   # Page À propos (hero + présentation)
│       └── services/
│           └── index.vue         # Page Services (3 images)
│
└── supabase/
    └── migrations/
        └── 001_create_site_images.sql  # Migration SQL
```

### Composable `useSiteImages()`

**Fonctions disponibles :**

```typescript
// Charger toutes les images
await fetchSiteImages()

// Récupérer une image spécifique
const image = getImageBySection('home', 'hero_background')

// Récupérer toutes les images d'une page
const images = getImagesByPage('services')

// Mettre à jour une image
await updateSiteImage(imageId, file, altText)

// Réinitialiser une image
await resetSiteImage(imageId)

// Mettre à jour le texte alternatif
await updateAltText(imageId, altText)
```

### Table `site_images` (Supabase)

**Colonnes :**
- `id` : UUID unique
- `page` : Nom de la page ('home', 'about', 'services')
- `section` : Identifiant de section ('hero_background', 'btp_section_image')
- `description` : Description lisible
- `image_url` : URL complète de l'image
- `storage_path` : Chemin dans le bucket Supabase
- `alt_text` : Texte alternatif
- `display_order` : Ordre d'affichage
- `created_at` / `updated_at` : Horodatages

### Bucket Supabase `site-images`

**Configuration :**
- **Public** : Oui (les images sont accessibles publiquement)
- **Taille max** : 5 MB par fichier
- **Politiques RLS** :
  - Lecture publique (tout le monde peut voir)
  - Upload/suppression : utilisateurs authentifiés uniquement

---

## Images de Secours (Fallback)

Si Supabase n'est pas configuré ou si une image n'existe pas, le système utilise automatiquement les images Unsplash d'origine :

| Section | URL de Secours |
|---------|---------------|
| Hero Accueil | `photo-1486406146926-c627a92ad1ab` |
| Hero Qui sommes-nous | `photo-1545324418-cc1a3fa10c00` |
| Présentation Qui sommes-nous | `photo-1503387762-592deb58ef4e` |
| BTP Services | `photo-1504307651254-35680f356dfd` |
| Électrification Services | `photo-1473341304170-971dccb5ac1e` |
| Gestion Services | `photo-1560518883-ce09059eeffa` |

Cela garantit que le site fonctionne toujours, même sans Supabase.

---

## Dépannage

### Problème : Les images ne se chargent pas

**Vérifications :**

1. **Variables d'environnement** : Vérifier que `.env` existe et contient les bonnes clés
   ```bash
   cat .env
   ```

2. **Bucket Supabase** : Vérifier que le bucket `site-images` est public
   - Aller dans Supabase > Storage > `site-images` > Settings
   - "Public bucket" doit être coché

3. **Politiques RLS** : Vérifier les politiques du bucket
   - Au minimum : une politique de lecture publique

4. **Console navigateur** : Ouvrir les DevTools (F12) et chercher les erreurs

### Problème : "Échec du téléchargement de l'image"

**Causes possibles :**

1. **Fichier trop volumineux** : Maximum 5 MB
   - Compresser l'image avec TinyPNG ou Squoosh

2. **Format non supporté** : Utiliser JPG, PNG ou WebP uniquement

3. **Permissions Supabase** : Vérifier que l'utilisateur admin est authentifié
   - Se déconnecter et se reconnecter

4. **Quota Supabase dépassé** : Vérifier l'espace de stockage disponible
   - Aller dans Supabase > Settings > Usage

### Problème : L'image est uploadée mais n'apparaît pas sur le site

1. **Actualiser** la page publique (Ctrl + F5 pour vider le cache)

2. **Vérifier la base de données** :
   - Aller dans Supabase > Table Editor > `site_images`
   - Vérifier que `image_url` et `storage_path` sont remplis

3. **Vérifier le fichier** :
   - Aller dans Supabase > Storage > `site-images`
   - Le fichier doit être visible dans la liste

### Problème : "Error fetching site images"

**Solution :**

1. Vérifier la connexion Internet
2. Vérifier que le projet Supabase est actif (pas en pause)
3. Vérifier les clés API dans `.env`
4. Consulter les logs du navigateur pour plus de détails

---

## Bonnes Pratiques

### Choix des Images

✅ **Recommandations :**
- **Résolution** : Minimum 2000x1200px pour les hero backgrounds
- **Format** : WebP pour le meilleur compromis qualité/poids, sinon JPG
- **Poids** : Compresser à moins de 500 KB (idéal) ou 1 MB max
- **Sujet** : Architecture, bâtiments, chantiers professionnels
- **Style** : Photographique, lumière naturelle, moderne

❌ **À éviter :**
- Images génériques de banque d'images trop visibles
- Photos floues ou mal cadrées
- Images avec texte incrusté
- Couleurs trop saturées ou filtres excessifs

### Texte Alternatif

✅ **Bonnes pratiques :**
- Décrire le contenu visuel de manière concise
- 100-125 caractères maximum
- Ne pas commencer par "Image de..." ou "Photo de..."
- Inclure le contexte si pertinent

**Exemples :**
- ✅ "Construction d'un immeuble moderne R+4 à Abidjan Cocody"
- ✅ "Installation d'un poste transformateur HTA/BTA"
- ❌ "Image de construction"
- ❌ "Photo très belle bâtiment"

### Sécurité

🔒 **Important :**
- Ne **jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- Ne **jamais** commit le fichier `.env` dans Git
- Utiliser des images libres de droits ou propriétaires
- Activer l'authentification forte pour les admins en production

### Performance

⚡ **Optimisations :**
- Compresser les images avant upload (TinyPNG, Squoosh)
- Utiliser le format WebP quand possible
- Dimensions adaptées à l'utilisation finale
- Activer le CDN Supabase (inclus par défaut)

---

## Prochaines Étapes Possibles

### Améliorations Futures

1. **Recadrage d'image** : Permettre de recadrer directement dans l'interface
2. **Historique** : Garder un historique des images remplacées
3. **Variantes responsive** : Upload d'images différentes pour mobile/desktop
4. **Optimisation automatique** : Compression et conversion WebP côté serveur
5. **Galerie d'images** : Bibliothèque d'images réutilisables
6. **Prévisualisation temps réel** : Voir l'image sur la page avant validation

### Extension du Système

Pour ajouter de nouvelles images gérables :

1. **Ajouter une entrée** dans la table `site_images` via SQL :
   ```sql
   INSERT INTO site_images (page, section, description, image_url, storage_path, alt_text)
   VALUES ('contact', 'hero_background', 'Image du Hero Contact', 'url_defaut', '', 'Description');
   ```

2. **Modifier la page publique** pour utiliser l'image dynamique :
   ```vue
   <script setup>
   const heroImage = computed(() => {
     const img = getImageBySection('contact', 'hero_background')
     return {
       url: img?.image_url || 'fallback_url',
       alt: img?.alt_text || 'default alt'
     }
   })
   </script>
   
   <template>
     <img :src="heroImage.url" :alt="heroImage.alt" />
   </template>
   ```

---

## Support et Documentation

### Ressources

- **Documentation Supabase** : [https://supabase.com/docs](https://supabase.com/docs)
- **Documentation Nuxt 3** : [https://nuxt.com/docs](https://nuxt.com/docs)
- **Guide Supabase Storage** : [https://supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage)

### Fichiers de Documentation du Projet

- `SUPABASE_SETUP.md` : Configuration initiale de Supabase
- `GESTION_IMAGES_GUIDE.md` : Ce guide complet
- `README.md` : Documentation générale du projet

### Contact

Pour toute question technique sur ce système, consulter les fichiers de code source :
- `lib/supabase.ts` : Configuration Supabase
- `app/composables/useSiteImages.ts` : Logique métier
- `app/pages/admin/images.vue` : Interface d'administration

---

## Résumé Rapide

### Pour l'Administrateur

1. Aller sur `/admin/images`
2. Cliquer sur "Remplacer l'image"
3. Choisir une image (max 5 MB)
4. Confirmer le remplacement
5. Vérifier sur le site public

### Pour le Développeur

1. Configurer Supabase (voir `SUPABASE_SETUP.md`)
2. Créer le fichier `.env` avec les clés API
3. Exécuter la migration SQL
4. Démarrer le serveur : `npm run dev`
5. Tester le workflow complet

---

**Système créé le 19 novembre 2026**
**Version 1.0 - ML Immobilier SARL**
