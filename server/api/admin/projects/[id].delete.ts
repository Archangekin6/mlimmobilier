import { supabaseAdmin } from '~~/server/utils/supabase'
import { getPublicStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de projet invalide' })
  }
  const supabase = supabaseAdmin
  const [{ data: images, error: imageReadError }, { data: project, error: projectReadError }] = await Promise.all([
    supabase.from('project_images').select('storage_path, image_url').eq('project_id', id),
    supabase.from('projects').select('id, cover_image_url').eq('id', id).maybeSingle()
  ])
  const readError = imageReadError || projectReadError
  if (readError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire les images du projet' })
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable' })

  const { data: deleted, error } = await supabase.from('projects').delete().eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('Erreur de suppression du projet:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer le projet' })
  }
  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable' })

  const paths = new Set((images || [])
    .filter(image => getPublicStoragePath('project-images', image.image_url) === image.storage_path)
    .map(image => image.storage_path))
  const coverPath = project.cover_image_url
    ? getPublicStoragePath('project-images', project.cover_image_url)
    : null
  if (coverPath) paths.add(coverPath)
  for (const storagePath of paths) {
    const cleanup = await removeStorageFileIfUnused('project-images', storagePath)
    if (cleanup.warning) console.error(cleanup.warning)
  }
  return { success: true }
})
