# 🔍 Guide de Surveillance - Supabase FREE Tier

**Date** : 19 novembre 2026  
**Projet** : ML Immobilier SARL  
**Offre** : Supabase FREE (offre gratuite permanente)

---

## ⚠️ AVERTISSEMENT IMPORTANT

### Limite Supabase FREE

Les projets sur l'offre gratuite de Supabase sont **mis en pause automatiquement après 7 jours consécutifs sans activité**.

**Ce que cela signifie** :

- ✅ Le projet reste sauvegardé (données intactes)
- ❌ Le site devient inaccessible (erreur 500)
- ❌ La base de données ne répond plus
- ❌ Les API endpoints renvoient des erreurs

**Ce qu'un monitoring externe PEUT faire** :

- ✅ Vous alerter que le site est down
- ✅ Vous avertir d'une erreur Supabase
- ✅ Vous notifier par email/SMS

**Ce qu'un monitoring externe NE PEUT PAS faire** :

- ❌ Réveiller automatiquement le projet Supabase
- ❌ Empêcher la mise en pause
- ❌ Accéder au dashboard Supabase pour vous

**Réveil manuel obligatoire** : Vous devez vous connecter à https://supabase.com et cliquer sur "Resume" dans votre projet.

---

## 🎯 Stratégies de Surveillance

### Stratégie 1 : Monitoring Externe (Simple)

**Avantages** :

- ✅ Gratuit
- ✅ Facile à configurer
- ✅ Aucune dépendance au code

**Inconvénients** :

- ❌ Alerte uniquement (réveil manuel requis)
- ❌ Ne maintient PAS le projet actif

**Outils recommandés** :

1. **UptimeRobot** (50 monitors gratuits)
2. **Pingdom Free** (10 checks gratuits)
3. **Healthchecks.io** (gratuit)

**Configuration UptimeRobot** :

```
Monitor Type: HTTP(s)
URL: https://votre-site.com
Interval: 5 minutes
Alert Contacts: votre-email@example.com
```

### Stratégie 2 : Keep-Alive Automatique (Recommandé)

**Principe** : Effectuer une requête de lecture vers Supabase chaque jour pour maintenir l'activité.

**Avantages** :

- ✅ Évite la mise en pause automatique
- ✅ 100% gratuit (pas de limite sur les lectures Supabase)
- ✅ Automatique (zéro maintenance)

**Inconvénients** :

- ❌ Nécessite un cron job externe
- ❌ Légère complexité de setup initial

**Implémentation détaillée ci-dessous** ⬇️

---

## 🚀 Implémentation Keep-Alive (Recommandé)

### Étape 1 : Créer l'Endpoint API

**Fichier** : `server/api/cron/keep-alive.ts`

```typescript
// Endpoint protégé pour le cron keep-alive
// Effectue une simple lecture dans Supabase pour maintenir l'activité

import { supabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  // Vérification du token secret
  const cronToken = getHeader(event, 'x-cron-token')
  
  if (!cronToken || cronToken !== process.env.CRON_SECRET_TOKEN) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid cron token'
    })
  }
  
  try {
    // Lecture simple pour maintenir Supabase actif
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('id, company_name')
      .single()
    
    if (error) {
      console.error('Keep-alive DB check failed:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
    
    // Succès
    return {
      success: true,
      message: 'Supabase keep-alive successful',
      company: data.company_name,
      timestamp: new Date().toISOString()
    }
    
  } catch (err: any) {
    console.error('Keep-alive exception:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Keep-alive check failed'
    })
  }
})
```

### Étape 2 : Ajouter la Variable d'Environnement

**Fichier** : `.env`

```env
# Token secret pour protéger l'endpoint keep-alive
CRON_SECRET_TOKEN=votre-token-secret-aleatoire-ici
```

**Générer un token sécurisé** :

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Résultat exemple :
# a3f9c8e2d1b4a7f6e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0
```

### Étape 3 : Configurer le Cron Job

#### Option A : GitHub Actions (Gratuit, Recommandé)

**Fichier** : `.github/workflows/keep-alive.yml`

```yaml
name: Keep Supabase Alive

on:
  schedule:
    # Tous les jours à 3h00 UTC (4h00 heure ivoirienne)
    - cron: '0 3 * * *'
  
  # Permettre le déclenchement manuel
  workflow_dispatch:

jobs:
  ping-supabase:
    runs-on: ubuntu-latest
    
    steps:
      - name: Ping Keep-Alive Endpoint
        run: |
          response=$(curl -s -w "\n%{http_code}" -X POST \
            https://votre-site.com/api/cron/keep-alive \
            -H "x-cron-token: ${{ secrets.CRON_SECRET_TOKEN }}")
          
          http_code=$(echo "$response" | tail -n1)
          body=$(echo "$response" | sed '$d')
          
          echo "HTTP Status: $http_code"
          echo "Response: $body"
          
          if [ "$http_code" -ne 200 ]; then
            echo "❌ Keep-alive failed!"
            exit 1
          fi
          
          echo "✅ Keep-alive successful"
      
      - name: Notify on Failure
        if: failure()
        run: |
          echo "⚠️ Keep-alive check failed - Supabase might be paused or site is down"
```

**Configuration** :

1. Aller sur GitHub > Votre repo > **Settings** > **Secrets and variables** > **Actions**
2. Cliquer sur **New repository secret**
3. Name : `CRON_SECRET_TOKEN`
4. Secret : Copier votre token généré à l'étape 2
5. **Add secret**

#### Option B : Vercel Cron (Si déployé sur Vercel)

**Fichier** : `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Configuration** :

1. Aller sur Vercel Dashboard > Votre projet > **Settings** > **Environment Variables**
2. Ajouter `CRON_SECRET_TOKEN` avec votre token
3. Redéployer le projet

**Note** : Vercel Cron nécessite un plan Pro ($20/mois). Alternative gratuite : GitHub Actions.

#### Option C : Cron-job.org (Gratuit)

1. Créer un compte sur https://cron-job.org
2. Créer un nouveau cron job :
   - **URL** : `https://votre-site.com/api/cron/keep-alive`
   - **Schedule** : `0 3 * * *` (tous les jours à 3h)
   - **HTTP Method** : POST
   - **Headers** : Ajouter `x-cron-token: votre-token-secret`
3. Sauvegarder

### Étape 4 : Tester le Keep-Alive

**Test manuel** :

```bash
# Remplacer par votre URL et token
curl -X POST https://votre-site.com/api/cron/keep-alive \
  -H "x-cron-token: votre-token-secret"

# Réponse attendue :
# {
#   "success": true,
#   "message": "Supabase keep-alive successful",
#   "company": "ML Immobilier SARL",
#   "timestamp": "2026-11-19T03:00:00.000Z"
# }
```

**Test avec mauvais token** :

```bash
curl -X POST https://votre-site.com/api/cron/keep-alive \
  -H "x-cron-token: mauvais-token"

# Réponse attendue (401) :
# {
#   "statusCode": 401,
#   "statusMessage": "Unauthorized: Invalid cron token"
# }
```

---

## 📊 Monitoring Complémentaire

### Monitoring Frontend (UptimeRobot)

**Setup** :

1. Créer un compte sur https://uptimerobot.com
2. Cliquer sur **Add New Monitor**
3. Paramètres :
   - **Monitor Type** : HTTP(s)
   - **Friendly Name** : ML Immobilier Site
   - **URL** : `https://votre-site.com`
   - **Monitoring Interval** : 5 minutes
4. **Alert Contacts** : Ajouter votre email
5. **Create Monitor**

**Avantages** :

- Vérifie que le site répond (code HTTP 200)
- Alerte immédiate si le site est down
- Monitoring public pages (pas besoin d'authentification)

### Monitoring Supabase Status

**Endpoint Supabase Status** : https://status.supabase.com

- Vérifier les incidents Supabase en cours
- S'abonner aux alertes de maintenance

### Monitoring Quotas

**Dashboard Supabase** : https://supabase.com/dashboard

1. Aller dans votre projet
2. **Settings** > **Usage**
3. Surveiller :
   - **Database size** : 500 MB max (FREE)
   - **Storage size** : 1 GB max (FREE)
   - **Bandwidth** : 2 GB/mois max (FREE)

**Alertes** :

- Configurer des alertes à 80% de chaque quota
- Nettoyer les anciennes données si proche de la limite

---

## ✅ Checklist Surveillance

### Setup Initial

- [ ] Créer l'endpoint `/api/cron/keep-alive`
- [ ] Générer un token secret aléatoire
- [ ] Ajouter `CRON_SECRET_TOKEN` au `.env`
- [ ] Tester l'endpoint manuellement
- [ ] Configurer GitHub Actions ou cron-job.org
- [ ] Tester le déclenchement automatique

### Monitoring Externe

- [ ] Créer un compte UptimeRobot
- [ ] Ajouter le monitor sur `https://votre-site.com`
- [ ] Vérifier réception des alertes email
- [ ] (Optionnel) Ajouter alertes SMS

### Documentation

- [ ] Noter l'URL du dashboard Supabase
- [ ] Noter l'URL du dashboard UptimeRobot
- [ ] Créer une procédure de réveil si pause
- [ ] Partager les accès avec l'équipe

---

## 🚨 Procédure de Réveil (Si Pause)

### Symptômes

- Site retourne une erreur 500
- UptimeRobot envoie une alerte "Site down"
- API endpoints Supabase ne répondent plus

### Étapes de Réveil

1. **Se connecter à Supabase** : https://supabase.com
2. **Aller dans votre projet** : Sélectionner "ML Immobilier"
3. **Vérifier le statut** : 
   - Si "Paused" ou "Inactive" visible
4. **Cliquer sur "Resume"** ou "Restore"
5. **Attendre 1-2 minutes** : Le projet redémarre
6. **Vérifier le site** : `https://votre-site.com` doit refonctionner
7. **Vérifier le keep-alive** : S'assurer que le cron fonctionne

---

## 📈 Migration vers Supabase Pro (Si Nécessaire)

### Quand Migrer ?

- Projet atteint 80% des quotas FREE
- Besoin de pas de pause automatique
- Besoin de support prioritaire
- Besoin de backups automatiques quotidiens

### Coût Supabase Pro

- **$25/mois** (base)
- Database : 8 GB inclus
- Storage : 100 GB inclus
- Bandwidth : 250 GB/mois inclus
- Pas de pause automatique
- Support prioritaire

### Avantages Pro

- ✅ Pas de mise en pause
- ✅ Backups quotidiens automatiques
- ✅ Plus de ressources (8x database, 100x storage)
- ✅ Support technique prioritaire
- ✅ Possibilité d'utiliser pg_cron pour cleanup automatique

---

## 📞 Support

### Supabase Support

- Documentation : https://supabase.com/docs
- Community Discord : https://discord.supabase.com
- GitHub : https://github.com/supabase/supabase

### Monitoring Support

- UptimeRobot : https://uptimerobot.com/support
- Cron-job.org : https://cron-job.org/en/faq

---

**Document créé le** : 19 novembre 2026  
**Version** : 1.0  
**Projet** : ML Immobilier SARL

