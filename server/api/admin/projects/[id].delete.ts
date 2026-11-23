import { supabaseAdmin } from '~~/server/utils/supabase'
import { getPublicStoragePath } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de projet invalide' })
  }
  const supabase = supabaseAdmin
  const { data: images, error: readError } = await supabase.from('project_images').select('storage_path, image_url').eq('project_id', id)
  if (readError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire les images du projet' })

  const { data: deleted, error } = await supabase.from('projects').delete().eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('Erreur de suppression du projet:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer le projet' })
  }
  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable' })

  const paths = (images || [])
    .filter(image => getPublicStoragePath('project-images', image.image_url) === image.storage_path)
    .map(image => image.storage_path)
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from('project-images').remove(paths)
    if (storageError) console.error('Suppression des images du projet impossible:', storageError.message)
  }
  return { success: true }
})
