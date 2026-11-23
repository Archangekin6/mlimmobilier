# 🔐 Système d'Authentification Admin - ML Immobilier SARL

> **État actuel :** l'accès admin utilise Supabase Auth et un profil lié par
> `admin_profiles.user_id`. Les étapes de migration `localStorage` ci-dessous
> sont historiques ; elles ne décrivent pas la source de données actuelle.
> Consulter [SUPABASE_READY.md](./SUPABASE_READY.md) pour la configuration
> effective et les prérequis de déploiement.

**Date** : 19 novembre 2026  
**Type** : Admin uniquement - PAS d'inscription publique  
**Sécurité** : Maximum

---

## 📋 Principes de Sécurité

### Règles Strictes

1. **PAS d'inscription publique** : Aucun visiteur ne peut créer de compte
2. **Admin uniquement** : Seuls les administrateurs autorisés ont accès
3. **Création manuelle** : Les comptes admin sont créés manuellement dans Supabase
4. **Vérification double** : Auth Supabase + Profil admin_profiles obligatoire
5. **Protection serveur** : Toutes les routes /api/admin/* protégées côté serveur

### Architecture Sécurisée

```
┌──────────────────────────────────────────────────┐
│  Visiteur tente d'accéder à /admin              │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│  Middleware: Vérifier session Supabase Auth     │
└─────────────────┬────────────────────────────────┘
                  │
         Non connecté │ Connecté
                  │   │
                  ▼   ▼
      ┌───────────┐  ┌────────────────────────────┐
      │ Redirection│  │ Vérifier profil admin      │
      │ → /login  │  │ dans table admin_profiles  │
      └───────────┘  └──────────┬─────────────────┘
                                 │
                        Profil trouvé │ Pas de profil
                                 │     │
                                 ▼     ▼
                    ┌──────────────┐  ┌─────────────┐
                    │ Accès autorisé│  │ Déconnexion │
                    │ → Dashboard   │  │ → /login    │
                    └──────────────┘  └─────────────┘
```

---

## 🗂️ Fichiers Créés

### 1. Composable Auth (`app/composables/useAuth.ts`)

**Fonctionnalités** :
- `login(email, password)` : Connexion admin
- `logout()` : Déconnexion
- `requestPasswordReset(email)` : Demande de réinitialisation
- `updatePassword(newPassword)` : Changement de mot de passe
- `updateProfile(updates)` : Mise à jour du profil
- `fetchAdminProfile()` : Récupération du profil admin
- `initialize()` : Initialisation au chargement

**États réactifs** :
- `user` : Utilisateur Supabase Auth
- `adminProfile` : Profil admin complet
- `isAuthenticated` : Booléen authentification
- `isAdmin` : Booléen role admin
- `isEditeur` : Booléen role éditeur

### 2. Middleware Global (`app/middleware/auth.global.ts`)

**Protection côté client** :
- Protège toutes les routes `/admin/*`
- Exclut `/admin/login`, `/admin/forgot-password`, `/admin/reset-password`
- Redirige vers `/admin/login` si non authentifié

### 3. Middleware Serveur (`server/middleware/auth-check.ts`)

**Protection côté serveur** :
- Protège toutes les routes `/api/admin/*`
- Vérifie la session Supabase Auth
- Vérifie l'existence du profil `admin_profiles`
- Retourne 401 si non authentifié
- Retourne 403 si pas de profil admin

### 4. Pages Auth

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/admin/login` | Connexion admin |
| **Forgot Password** | `/admin/forgot-password` | Demande de réinitialisation |
| **Reset Password** | `/admin/reset-password` | Nouveau mot de passe |

---

## 🚀 Workflow de Connexion

### Étape 1 : Utilisateur arrive sur `/admin`

```
1. Middleware global détecte route /admin
2. Vérifie session Supabase Auth
3. Si pas de session → Redirection /admin/login
4. Si session → Continue vers le layout admin
```

### Étape 2 : Layout Admin vérifie le profil

```
1. onMounted() appelle initialize()
2. initialize() appelle fetchAdminProfile()
3. fetchAdminProfile() récupère le profil dans admin_profiles
4. Si profil trouvé → Accès autorisé
5. Si pas de profil → Redirection /admin/login
```

### Étape 3 : Accès aux API Admin

```
1. Requête vers /api/admin/quelquechose
2. Middleware serveur intercepte
3. Vérifie session + profil admin
4. Si OK → Continue vers l'API
5. Si KO → 401 ou 403
```

---

## 👤 Création d'un Administrateur

### Procédure Sécurisée (Manuelle)

**Étape 1 : Créer le compte dans Supabase Auth**

1. Se connecter à https://supabase.com/dashboard
2. Sélectionner le projet ML Immobilier
3. Aller dans **Authentication** > **Users**
4. Cliquer sur **"Add user"** > **"Create new user"**
5. Remplir :
   ```
   Email: admin@mlimmobilier.com
   Password: [Générer un mot de passe fort]
   Auto Confirm User: ✅ Coché
   ```
6. Cliquer sur **"Create user"**
7. **Noter l'UUID** généré (visible dans la colonne ID)

**Étape 2 : Créer le profil admin**

1. Ouvrir **SQL Editor** dans Supabase
2. Exécuter la requête suivante :

```sql
INSERT INTO admin_profiles (id, full_name, role)
VALUES (
  'uuid-du-user-ici',           -- UUID copié de l'étape 1
  'Nom Prénom de l'admin',      -- Nom complet
  'admin'                        -- 'admin' ou 'editeur'
);
```

3. Vérifier dans **Table Editor** > `admin_profiles` : 1 ligne créée

**Étape 3 : Tester la connexion**

1. Aller sur `https://votre-site.com/admin/login`
2. Se connecter avec l'email et le mot de passe créés
3. Vérifier l'accès au dashboard admin

---

## 🔑 Réinitialisation de Mot de Passe

### Workflow Complet

**1. Administrateur oublie son mot de passe**

```
1. Cliquer sur "Mot de passe oublié ?" sur /admin/login
2. Entrer son email
3. Cliquer sur "Envoyer le lien"
```

**2. Supabase envoie l'email de réinitialisation**

```
1. Email contient un lien magique
2. Format : https://votre-site.com/admin/reset-password?token=...
3. Token valide 1 heure
```

**3. Administrateur clique sur le lien**

```
1. Redirigé vers /admin/reset-password
2. Token automatiquement validé par Supabase
3. Peut entrer un nouveau mot de passe
```

**4. Nouveau mot de passe enregistré**

```
1. Mot de passe mis à jour dans Supabase Auth
2. Redirection vers /admin/login après 2 secondes
3. Peut se reconnecter avec le nouveau mot de passe
```

### Configuration Email Supabase

**Template d'email par défaut** :

1. Aller dans **Authentication** > **Email Templates**
2. Sélectionner **"Reset Password"**
3. Personnaliser le template :

```html
<h2>Réinitialisation de mot de passe</h2>
<p>Bonjour,</p>
<p>Vous avez demandé la réinitialisation de votre mot de passe administrateur ML Immobilier SARL.</p>
<p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
<p>Ce lien est valide 1 heure.</p>
<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
```

---

## 🛡️ Sécurité des Routes API

### Protection Automatique

Toutes les routes sous `/api/admin/*` sont automatiquement protégées par le middleware serveur.

**Exemple d'utilisation dans une API** :

```typescript
// server/api/admin/stats.get.ts
export default defineEventHandler(async (event) => {
  // Le middleware a déjà vérifié l'auth
  // Les infos admin sont disponibles dans event.context
  
  const adminProfile = event.context.adminProfile
  const adminUser = event.context.adminUser
  
  // Vérification role si nécessaire
  if (adminProfile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Action réservée aux administrateurs'
    })
  }
  
  // Logique métier ici
  return {
    success: true,
    data: { /* ... */ }
  }
})
```

### Vérification Manuelle (Optionnelle)

Si besoin de protéger une route non-admin :

```typescript
import { getSupabaseUser } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const supabase = getSupabaseUser(event)
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }
  
  // Suite de la logique
})
```

---

## 🎯 Vérifications de Sécurité

### Checklist Audit

- [ ] Aucune page d'inscription publique (`/signup`, `/register`) n'existe
- [ ] Aucune route API de création de compte admin publique
- [ ] Middleware global protège toutes les routes `/admin/*`
- [ ] Middleware serveur protège toutes les routes `/api/admin/*`
- [ ] Création admin uniquement via SQL manuel dans Supabase
- [ ] Les user_metadata ne sont JAMAIS utilisés pour déterminer les permissions
- [ ] La table `admin_profiles` est la seule source de vérité des permissions
- [ ] Le service_role key n'est jamais exposé côté client
- [ ] Toutes les actions admin sont vérifiées côté serveur
- [ ] Les visiteurs ne peuvent PAS modifier les données du site

### Tests de Sécurité

**Test 1 : Accès direct à /admin sans connexion**

```bash
# Doit rediriger vers /admin/login
curl -I https://votre-site.com/admin
```

**Test 2 : Appel API admin sans auth**

```bash
# Doit retourner 401
curl -X GET https://votre-site.com/api/admin/stats
```

**Test 3 : Tentative de création de compte**

```bash
# Aucune route ne doit exister
curl -X POST https://votre-site.com/api/auth/signup
# Attendu : 404 Not Found
```

**Test 4 : User sans profil admin**

```sql
-- Créer un user auth sans profil admin
INSERT INTO auth.users (email, encrypted_password)
VALUES ('test@example.com', 'hash...');

-- Essayer de se connecter → Doit être rejeté
```

---

## 🔄 Migration depuis localStorage

Si vous aviez un système de login localStorage avant :

### Étapes de Migration

1. **Supprimer l'ancien système**

```typescript
// Supprimer de useSiteData.ts :
// - login()
// - logout()
// - currentAdmin
// - localStorage.setItem('ml_admin_user')
```

2. **Créer les comptes admin réels**

Pour chaque admin fictif, créer un vrai compte Supabase (procédure ci-dessus).

3. **Mettre à jour les composants**

```vue
<!-- Remplacer -->
<script setup>
const { currentAdmin } = useSiteData()
</script>

<!-- Par -->
<script setup>
const { adminProfile } = useAuth()
</script>
```

4. **Tester la migration**

- Déconnecter tous les admins
- Vider localStorage
- Réessayer la connexion avec les vrais comptes

---

## 📞 Support et Dépannage

### Problème : "Accès non autorisé" après connexion

**Cause** : L'utilisateur Auth n'a pas de profil dans `admin_profiles`

**Solution** :

```sql
-- Vérifier si le profil existe
SELECT * FROM admin_profiles WHERE id = 'uuid-du-user';

-- Si vide, créer le profil
INSERT INTO admin_profiles (id, full_name, role)
VALUES ('uuid-du-user', 'Nom Admin', 'admin');
```

### Problème : Email de réinitialisation non reçu

**Causes possibles** :
1. Email dans les spams
2. SMTP Supabase non configuré (utilise l'email par défaut)
3. Email non confirmé dans Auth

**Solution** :

1. Vérifier **Authentication** > **Settings** > **Email**
2. Configurer un SMTP personnalisé si nécessaire
3. Ou réinitialiser manuellement :

```sql
-- Changer le mot de passe directement (temporaire)
UPDATE auth.users
SET encrypted_password = crypt('nouveau-mot-de-passe', gen_salt('bf'))
WHERE email = 'admin@mlimmobilier.com';
```

### Problème : Déconnexion automatique

**Causes** :
- Session expirée (7 jours par défaut)
- Token refresh échoué

**Solution** :

Configurer dans Supabase **Authentication** > **Settings** :
- Session lifetime : 7 jours (par défaut)
- Refresh token lifetime : 30 jours

---

## 📚 Ressources

### Documentation Supabase

- Auth : https://supabase.com/docs/guides/auth
- RLS : https://supabase.com/docs/guides/auth/row-level-security
- Email Auth : https://supabase.com/docs/guides/auth/auth-email

### Fichiers du Projet

- Composable : `app/composables/useAuth.ts`
- Middleware client : `app/middleware/auth.global.ts`
- Middleware serveur : `server/middleware/auth-check.ts`
- Login : `app/pages/admin/login.vue`
- Forgot Password : `app/pages/admin/forgot-password.vue`
- Reset Password : `app/pages/admin/reset-password.vue`

---

**Document créé le** : 19 novembre 2026  
**Version** : 1.0  
**Statut** : ✅ Système sécurisé opérationnel

