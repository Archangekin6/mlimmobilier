# Récapitulatif des uploads

Les nouveaux uploads administratifs utilisent Supabase Storage, et non le
système historique `public/uploads/`.

| Usage | Bucket | API d'upload |
|---|---|---|
| Logo et images de sections | `site-images` | `/api/admin/upload` et routes admin d'images |
| Images et galeries de projets | `project-images` | `/api/admin/upload` |

Les routes vérifient l'authentification Supabase et le profil
`admin_profiles.user_id`, puis contrôlent le type MIME, la signature du fichier,
l'extension et la taille. Les URL résultantes sont persistées dans Supabase ;
les données métier ne dépendent pas de `localStorage`.

La migration `supabase/migrations/007_admin_data_and_storage.sql` prépare les
deux buckets. Vérifier l'historique du projet Supabase et appliquer uniquement
les migrations manquantes, dans l'ordre. Selon les confirmations disponibles,
001 et 005 ont déjà été exécutées : ne pas les rejouer à l'aveugle.

Les anciens fichiers de `public/uploads/` ne sont pas supprimés par le code.
Examiner leurs références et effectuer tout nettoyage séparément.
