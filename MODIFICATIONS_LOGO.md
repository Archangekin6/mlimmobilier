# Modifications - Logo dans le Header

## Résumé des changements

Le header a été modifié pour afficher **uniquement le logo de l'entreprise** au lieu du nom et de l'icône. Le logo est maintenant paramétrable depuis la page d'administration.

## Fichiers modifiés

### 1. `app/composables/useSiteData.ts`

**Ajout du champ `logoUrl` dans l'interface `SiteSettings`** :
```typescript
export interface SiteSettings {
  companyName: string
  logoUrl: string  // ← NOUVEAU CHAMP
  tagline: string
  // ... autres champs
}
```

**Valeur par défaut ajoutée** :
```typescript
const defaultSettings: SiteSettings = {
  companyName: 'ML Immobilier SARL',
  logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
  // ... autres valeurs
}
```

### 2. `app/components/layout/AppHeader.vue`

**Le logo a été remplacé** :

**AVANT** (icône + texte) :
```vue
<NuxtLink to="/" class="flex items-center gap-3 group">
  <div class="w-10 h-10 rounded-sm bg-neutral-900">
    <UIcon name="i-heroicons-building-office-2" />
  </div>
  <div>
    <div class="text-lg font-black">ML IMMOBILIER</div>
    <div class="text-[10px]">SARL • BTP & Énergie Abidjan</div>
  </div>
</NuxtLink>
```

**APRÈS** (image du logo) :
```vue
<NuxtLink to="/" class="flex items-center group">
  <img 
    v-if="settings.logoUrl" 
    :src="settings.logoUrl" 
    :alt="`Logo ${settings.companyName}`"
    class="h-14 w-auto object-contain transition-transform group-hover:scale-105"
  />
  <div 
    v-else 
    class="w-10 h-10 rounded-sm bg-neutral-900 flex items-center justify-center text-white"
  >
    <UIcon name="i-heroicons-building-office-2" />
  </div>
</NuxtLink>
```

**Caractéristiques** :
- Le logo a une hauteur fixe de **56px** (h-14)
- La largeur s'adapte automatiquement pour conserver les proportions
- Animation au survol (scale-105)
- Si aucun logo n'est défini, une icône par défaut s'affiche

### 3. `app/pages/admin/reglages.vue`

**Ajout du champ de configuration du logo** dans la section "Coordonnées & Siège" :

```vue
<div>
  <label>Logo de l'entreprise (URL)</label>
  <p class="text-[10px] text-neutral-500 mb-2">
    Entrez l'URL complète du logo qui sera affiché dans le header. 
    Recommandé : format PNG/SVG transparent, hauteur 56px.
  </p>
  <div class="flex gap-3 items-start">
    <input
      v-model="form.logoUrl"
      type="url"
      placeholder="https://exemple.com/logo.png"
    />
    <!-- Aperçu du logo en temps réel -->
    <div v-if="form.logoUrl" class="w-20 h-14 border rounded-xs">
      <img :src="form.logoUrl" alt="Aperçu du logo" />
    </div>
  </div>
</div>
```

**Fonctionnalités** :
- Champ de saisie pour l'URL du logo
- Aperçu en temps réel du logo à droite du champ
- Instructions claires pour les dimensions recommandées

## Comment utiliser

### Pour l'administrateur :

1. Se connecter à l'interface d'administration : `/admin/login`
2. Aller dans **Réglages** : `/admin/reglages`
3. Dans la section "Coordonnées & Siège", trouver le champ **"Logo de l'entreprise (URL)"**
4. Entrer l'URL complète du logo (exemple : `https://exemple.com/monlogo.png`)
5. Vérifier l'aperçu à droite du champ
6. Cliquer sur **"Enregistrer"**
7. Le logo s'affiche immédiatement dans le header du site public

### Recommandations pour le logo :

- **Format** : PNG avec transparence ou SVG
- **Hauteur** : 56px (environ)
- **Largeur** : proportionnelle (s'adapte automatiquement)
- **Fond** : Transparent de préférence
- **Couleurs** : Contrastées pour une bonne visibilité
- **Qualité** : Image haute résolution pour éviter le flou

### Hébergement du logo :

Plusieurs options pour héberger le logo :

1. **Serveur de fichiers de l'entreprise**
2. **Service d'hébergement d'images** (Cloudinary, ImgBB, etc.)
3. **GitHub** (si le site est sur GitHub)
4. **Dossier public du projet** : placer le logo dans `/public/logo.png` et utiliser l'URL `/logo.png`

## Test

Pour tester les modifications :

```bash
# Démarrer le serveur de développement
npm run dev
```

Puis :
1. Aller sur `http://localhost:3000` pour voir le header avec le logo
2. Aller sur `http://localhost:3000/admin/login` pour accéder à l'admin
3. Aller sur `http://localhost:3000/admin/reglages` pour modifier le logo

## Notes importantes

- Le logo est stocké dans le **localStorage** du navigateur tant qu'une vraie base de données n'est pas configurée
- La modification du logo est **immédiate** et **sans rechargement de page**
- Si aucune URL n'est fournie, une icône par défaut s'affiche
- Le logo s'adapte automatiquement aux différentes tailles d'écran (responsive)

## Prochaines étapes suggérées

1. **Upload de fichier** : Ajouter la possibilité d'uploader directement le logo depuis l'admin (au lieu de saisir une URL)
2. **Gestion des fichiers** : Intégrer un système de stockage de fichiers (Supabase Storage, Cloudinary, etc.)
3. **Multiple formats** : Permettre différents logos (desktop, mobile, favicon)
4. **Optimisation** : Compression automatique des images

---

✅ Les modifications sont terminées et fonctionnelles !
