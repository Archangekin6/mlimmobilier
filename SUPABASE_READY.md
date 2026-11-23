# État de préparation Supabase

## Code local

L'application Nuxt utilise Supabase Auth avec cookies SSR, les clés publiques
dans le client, et `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur. Les
opérations administratives utilisent des API Nuxt qui vérifient l'utilisateur
Auth et son entrée `admin_profiles.user_id`.

Les paramètres, projets, témoignages et demandes de devis sont lus et modifiés
via Supabase. Les images administratives sont envoyées vers les buckets Storage
`site-images` et `project-images`. Les nouvelles demandes de devis nécessitent
Turnstile en production ; les limites horaires et quotidiennes sont appliquées
aux identifiants de navigateur signés et aux numéros normalisés, sans faire
confiance à un en-tête IP client.

## Migrations

Migrations présentes dans `supabase/migrations/` : 001 à 007. Selon les
confirmations de l'utilisateur, 001 et 005 ont déjà été exécutées. L'historique
réel du projet distant et l'exécution des autres migrations n'ont pas pu être
vérifiés depuis cette session.

Avant déploiement, consulter l'historique des migrations dans Supabase et
appliquer uniquement les migrations manquantes, dans l'ordre. Ne pas réexécuter
001 ni 005 à l'aveugle. La migration 007 dépend des migrations 001 à 006 et
configure les deux buckets Storage. Elle doit être exécutée seulement après
confirmation de ses prérequis.

## Actions manuelles Supabase

1. Vérifier l'historique et l'état réel du schéma ; appliquer les migrations
   manquantes 002, 003, 004, 006 et 007 dans cet ordre, en omettant celles déjà
   exécutées. Ne pas rejouer 001 ou 005.
2. Vérifier les tables, les fonctions RPC `check_rate_limit` et
   `cleanup_rate_limits`, les politiques RLS et les buckets `site-images` et
   `project-images`.
3. Créer le compte administrateur dans Supabase Auth, puis créer son profil
   `admin_profiles` lié à son `user_id`. Aucun endpoint d'inscription publique
   n'est fourni.

## Actions manuelles Render

Configurer les variables sans les exposer dans le navigateur :

- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_KEY` (clé publique/publishable seulement)
- `SUPABASE_SERVICE_ROLE_KEY` (secret serveur uniquement)
- `NUXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_EXPECTED_HOSTNAME` (hostname exact de production)
- `RATE_LIMIT_SECRET` (au moins 32 caractères aléatoires)
- `CRON_SECRET_TOKEN` si l'endpoint de nettoyage planifié est utilisé

Dans Turnstile, enregistrer le hostname de production. L'application refuse les
soumissions en production si Turnstile ou la limitation de débit n'est pas
configuré. Ne jamais copier une clé secrète dans `NUXT_PUBLIC_*`.

## Validation locale

- `npx nuxt prepare` : réussi
- `npx nuxt typecheck` : réussi
- `npm test` : réussi (4 tests unitaires)
- `npm run build` : réussi

Ces contrôles ne remplacent pas les tests d'intégration après configuration
réelle de Supabase et Render. La connexion distante, les migrations appliquées,
les buckets, les clés et les tests de bout en bout restent à confirmer.
