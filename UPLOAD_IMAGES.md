# Gestion des Uploads d'Images

## 🎯 Vue d'ensemble

Le site supporte maintenant **deux méthodes** pour ajouter des images :

1. **Télécharger une image** depuis votre ordinateur (via le composant `ImageUpload`)
2. **Coller une URL** d'image externe (lien direct)

## 📁 Architecture

### Fichiers ajoutés

#### 1. **Composant `ImageUpload.vue`**
```
app/components/common/ImageUpload.vue
```
- Composant réutilisable pour tous les formulaires d'images
- Support du drag & drop
- Aperçu en temps réel
- Validation de fichier (type, taille)
- Deux onglets : "Lien URL" et "Télécharger"

#### 2. **Endpoint API `upload.post.ts`**
```
server/api/upload.post.ts
```
- Route POST pour traiter les uploads
- Génère des noms de fichier uniques (horodatage + nombre aléatoire)
- Sauvegarde les fichiers dans `public/uploads/`
- Validation : type d'image et taille max 5MB
- Retourne l'URL publique du fichier uploadé

#### 3. **Dossier de stockage**
```
public/uploads/
```
- Créé automatiquement lors du premier upload
- Les images y sont stockées de manière permanente
- Accessibles via `/uploads/nom-du-fichier.ext`

### Fichiers modifiés

1. **app/pages/admin/reglages.vue**
   - Remplacement du champ URL du logo par le composant `ImageUpload`

2. **app/pages/admin/realisations.vue**
   - Remplacement du champ URL de la photo par le composant `ImageUpload`

## 🚀 Utilisation

### Pour l'administrateur

#### Ajouter/modifier le logo :

1. Aller sur `/admin/reglages`
2. Dans la section "Coordonnées & Siège", trouve le champ "Logo de l'entreprise"
3. **Deux options** :
   - **Onglet "Lien URL"** : Colle une URL complète
   - **Onglet "Télécharger"** : Clique sur la zone ou glisse-dépose une image
4. L'aperçu s'affiche instantanément
5. Clique sur "Enregistrer"

#### Ajouter/modifier une réalisation :

1. Aller sur `/admin/realisations`
2. Clique sur "Nouveau Projet" ou "Modifier"
3. Dans le formulaire, trouve le champ "Photo principal du projet"
4. Même procédure que pour le logo
5. Clique sur "Créer le projet" ou "Enregistrer"

## 📊 Specifications techniques

### Composant `ImageUpload`

**Props** :
```typescript
modelValue: string          // URL de l'image actuelle
label?: string             // Label du champ (défaut: "Image")
hint?: string              // Texte d'aide
previewSize?: 'small' | 'medium' | 'large'  // Taille de l'aperçu
acceptedFormats?: string   // Types acceptés (défaut: image/*)
maxFileSize?: number       // Taille max en MB (défaut: 5)
```

**Événements** :
```typescript
@update:modelValue  // Émis quand l'image change
```

### Validation

**Pour les uploads de fichiers** :
- ✅ Format : image/* (PNG, JPG, GIF, WebP, etc.)
- ✅ Taille max : 5MB (configurable)
- ✅ Nom de fichier unique généré automatiquement
- ✅ Sauvegarde en `public/uploads/`

**Pour les URLs** :
- ✅ Validation de format URL
- ✅ Pas de limite de taille (selon le serveur externe)

## 🖼️ Format des images recommandé

### Pour le logo :
- Format : PNG/SVG avec transparence
- Hauteur : ~56px
- Largeur : proportionnelle
- Fond : transparent
- Taille fichier : < 100KB

### Pour les photos de projet :
- Format : JPG/PNG
- Résolution : 1200x800px minimum
- Taille fichier : < 2MB (recommandé)
- Aspect ratio : 3:2 ou 16:10

## 🔗 Exemples

### Utiliser le composant dans un formulaire :

```vue
<script setup>
import { ref } from 'vue'

const imageUrl = ref('')
</script>

<template>
  <ImageUpload
    v-model="imageUrl"
    label="Ma photo"
    hint="Téléchargez ou collez un lien"
    previewSize="medium"
    maxFileSize="5"
  />
</template>
```

### Structure des fichiers uploadés :

```
/public/uploads/
├── img-1734667890123-abc123.jpg
├── img-1734667891456-def456.png
└── img-1734667892789-ghi789.webp
```

URLs générées :
- `http://localhost:3000/uploads/img-1734667890123-abc123.jpg`
- `http://localhost:3000/uploads/img-1734667891456-def456.png`

## 📝 Notes importantes

1. **Stockage persistant** : Les images uploadées restent dans `public/uploads/` même après redémarrage du serveur
2. **Pas de base de données** : Les URLs sont stockées dans localStorage (à remplacer par une vraie DB si nécessaire)
3. **Hébergement en production** : Il faudra configurer un service de stockage cloud (Supabase, Cloudinary, AWS S3, etc.)
4. **Nettoyage** : Les anciens fichiers ne sont pas supprimés automatiquement

## 🔧 Prochaines améliorations

- [ ] Compression automatique des images côté serveur
- [ ] Génération de vignettes (thumbnails)
- [ ] Support du crop/redimensionnement
- [ ] Gestion de la galerie (multiple uploads)
- [ ] Suppression des fichiers orphelins
- [ ] Intégration Supabase Storage pour la production
- [ ] CDN/cache optimization

## ❓ Troubleshooting

### L'upload échoue
- Vérifiez que le dossier `public/uploads/` existe ou peut être créé
- Vérifiez la taille du fichier (< 5MB)
- Vérifiez que c'est un format image valide

### Le fichier est uploadé mais le lien ne fonctionne pas
- Vérifiez que le chemin `/uploads/` est accessible
- Vérifiez que le serveur Nuxt est lancé
- Vérifiez dans DevTools que l'URL commence par `/uploads/`

### Je veux utiliser ma propre URL
- Cliquez sur l'onglet "Lien URL"
- Collez l'URL complète (commençant par `http://` ou `https://`)
- Vérifiez que le serveur externe autorise les hotlinks (CORS)

---

✅ Les uploads d'images sont maintenant fonctionnels !
