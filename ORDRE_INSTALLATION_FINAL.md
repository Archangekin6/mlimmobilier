# Ordre de finalisation Supabase / Render

Ce guide remplace l'ancien ordre d'installation, qui ne doit pas servir à
rejouer des migrations ou à créer des données par défaut.

1. Dans Supabase, vérifier l'historique réel des migrations et le schéma.
   Appliquer uniquement les migrations manquantes, dans l'ordre 001 à 007.
   Selon les confirmations reçues, 001 et 005 ont déjà été exécutées : ne pas
   les relancer à l'aveugle.
2. Vérifier les tables, les fonctions RPC, les politiques RLS et les buckets
   Storage. Le détail des migrations et des dépendances est dans
   `supabase/migrations/`.
3. Créer le compte admin dans Supabase Auth et son profil `admin_profiles`
   associé à `user_id`. L'inscription publique n'est pas activée.
4. Configurer les variables Supabase, Turnstile et rate-limit dans Render,
   avec les clés secrètes dans des variables serveur seulement.
5. Après déploiement, tester la connexion admin, les modifications des données,
   les uploads et l'envoi d'un devis sur le domaine de production.
6. Vérifier que le service Render exécute Nuxt en SSR (et non `nuxt generate`),
   que les réponses HTML et `/api/site-data` portent `Cache-Control: no-store`,
   et purger une fois tout cache CDN/proxy configuré devant le domaine.

Voir [SUPABASE_READY.md](./SUPABASE_READY.md) pour les variables exactes,
les prérequis, les tests locaux et les limites de validation distante. À ce
jour, aucune migration distante ni configuration Render n'a été vérifiée
depuis l'environnement de développement.
