# Gestion des images

## Architecture actuelle

Les fichiers envoyés depuis l'administration sont stockés dans Supabase Storage :

- `site-images` : logo et images des sections du site ;
- `project-images` : images principales et galeries de projets.

Les créations, remplacements et suppressions passent par les API `/api/admin/*`.
Ces routes exigent une session Supabase Auth associée à un profil
`admin_profiles.user_id`. La clé `SUPABASE_SERVICE_ROLE_KEY` reste côté serveur.

Les uploads vérifient le type MIME, la signature binaire, l'extension et une
taille maximale de 5 Mo. Les buckets sont publics en lecture pour afficher les
images sur le site ; les écritures sont effectuées par les API serveur.

## Utilisation

Dans `/admin/reglages` ou `/admin/realisations`, l'administrateur peut envoyer
une image depuis son appareil. Le composant `ImageUpload` conserve aussi la
possibilité de fournir une URL externe.

## Configuration et migration

La migration `supabase/migrations/007_admin_data_and_storage.sql` configure
les buckets `site-images` et `project-images` après les migrations prérequises
001 à 006. Vérifier l'historique Supabase avant d'exécuter toute migration ;
les migrations 001 et 005 ont déjà été exécutées selon les confirmations
disponibles et ne doivent pas être relancées à l'aveugle.

L'ancienne route `/api/upload` et l'écriture dans `public/uploads/` ne sont
plus utilisées. Les fichiers déjà présents dans `public/uploads/` ne sont pas
supprimés automatiquement et doivent être examinés avant tout nettoyage.
