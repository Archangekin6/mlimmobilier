# 🚀 Démarrage Rapide

## ⚡ Lancer le serveur

```bash
npm run dev
```

Le site sera accessible sur : **http://localhost:3000/**

## 🔗 Accès rapides

| Page | URL | Description |
|------|-----|-------------|
| 🏠 **Accueil** | http://localhost:3000/ | Page d'accueil du site public |
| 👤 **Qui sommes-nous** | http://localhost:3000/qui-sommes-nous | Présentation de l'entreprise |
| 🔧 **Services** | http://localhost:3000/services | Services proposés |
| 🎯 **Réalisations** | http://localhost:3000/realisations | Projets complétés |
| 💬 **Contact & Devis** | http://localhost:3000/contact | Formulaire de contact |
| ⚖️ **Mentions légales** | http://localhost:3000/mentions-legales | Infos légales |
| 🔐 **Admin - Connexion** | http://localhost:3000/admin/login | Login admin |
| ⚙️ **Admin - Réglages** | http://localhost:3000/admin/reglages | Paramètres du site |
| 📸 **Admin - Réalisations** | http://localhost:3000/admin/realisations | Gestion des projets |
| 📋 **Admin - Devis** | http://localhost:3000/admin/devis | Demandes de devis |

## 🔐 Identifiants

### Admin (accès total) :
```
Email : admin@mlimmobilier.com
Pass  : admin123
```

### Éditeur (accès limité) :
```
Email : editeur@mlimmobilier.com
Pass  : editeur123
```

## 📸 Gérer les images

### Logo de l'entreprise :
1. Allez sur : **http://localhost:3000/admin/reglages**
2. Connectez-vous d'abord si nécessaire
3. Trouvez le champ **"Logo de l'entreprise"**
4. Deux options :
   - **Lien URL** : Collez une URL externe
   - **Télécharger** : Uploadez depuis votre ordinateur
5. Cliquez sur **"Enregistrer"**

### Photos de projet :
1. Allez sur : **http://localhost:3000/admin/realisations**
2. Cliquez sur **"Nouveau Projet"** ou **"Modifier"**
3. Trouvez le champ **"Photo principal du projet"**
4. Même procédure que pour le logo
5. Cliquez sur **"Créer le projet"** ou **"Enregistrer"**

## 📂 Structure des uploads

Les fichiers uploadés sont stockés dans :
```
project/
└── public/
    └── uploads/
        ├── img-1734667890123-abc123.jpg
        ├── img-1734667891456-def456.png
        └── img-1734667892789-ghi789.webp
```

Accessibles via :
- `http://localhost:3000/uploads/img-1734667890123-abc123.jpg`

## 🎨 Personnalisation

### Paramètres du site (Admin → Réglages) :
- Logo de l'entreprise
- Raison sociale
- Sous-titre / Activité
- Adresse et coordonnées
- Téléphones (principal et secondaire)
- WhatsApp
- Email de contact
- Horaires d'ouverture
- Titre et sous-titre de l'accueil
- Texte du bouton principal
- Réseaux sociaux (Facebook, LinkedIn, Instagram)
- Bandeau d'alerte supérieur

### Réalisations (Admin → Réalisations) :
- Ajouter/modifier/supprimer des projets
- Télécharger ou coller des photos
- Catégoriser (BTP, Électrification, Gestion)
- Mettre en vedette à l'accueil
- Publier/masquer un projet

## 🧪 Test rapide

1. **Lancer le serveur** : `npm run dev`
2. **Accueil du site** : http://localhost:3000/
3. **Login admin** : http://localhost:3000/admin/login
4. **Credentials** : `admin@mlimmobilier.com` / `admin123`
5. **Changer le logo** : 
   - Aller sur `/admin/reglages`
   - Uploader une image
   - Retourner à l'accueil pour voir le changement

## 🛠️ Développement

### Hot Reload (Rechargement auto) :
Quand vous modifiez les fichiers, le navigateur se récharge automatiquement ✨

### Arrêter le serveur :
Tapez `q` ou `Ctrl+C` dans le terminal

### Rebuild complet :
```bash
npm run build
npm run preview
```

## 📚 Documentation

Pour plus de détails, lisez :
- `UPLOAD_IMAGES.md` - Gestion complète des images
- `MODIFICATIONS_LOGO.md` - Info sur le header
- `RECAPITULATIF_UPLOADS.md` - Récapitulatif technique

## ❓ FAQ Rapide

**Q: Comment uploader une image ?**
A: Utilisez le composant ImageUpload dans Admin → Réglages ou Réalisations

**Q: Où sont stockées les images ?**
A: Dans le dossier `public/uploads/`

**Q: Puis-je utiliser une URL externe ?**
A: Oui ! Cliquez sur l'onglet "Lien URL" et collez le lien

**Q: Les images sont supprimées en arrêtant le serveur ?**
A: Non, elles restent dans `public/uploads/`

**Q: Comment héberger en production ?**
A: Utilisez un service cloud (Supabase, Cloudinary, AWS S3, etc.)

---

💡 **Besoin d'aide ?** Consultez les fichiers `.md` du projet !

😊 Bon développement !
