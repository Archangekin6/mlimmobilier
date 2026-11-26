import { getPublicStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'
import { validateProjectUpdatePayload } from '~~/server/utils/project-validation'
import { supabaseAdmin } from '~~/server/utils/supabase'

const uuidPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const id = getRouterParam(event, 'id')
  if (!id || !uuidPattern.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de projet invalide' })
  }

  const body = validateProjectUpdatePayload(await readBody<unknown>(event))
  const update: Record<string, string | boolean | null> = {}

  if (body.title !== undefined) update.title = body.title
  if (body.category !== undefined) update.service_type = body.category
  if (body.location !== undefined) update.location = body.location || null
  if (body.description !== undefined) update.summary = body.description
  for (const field of ['published', 'featured'] as const) {
    if (body[field] !== undefined) update[field] = body[field]
  }

  const hasImageUrl = Object.prototype.hasOwnProperty.call(body, 'imageUrl')
  const nextImageUrl = body.imageUrl
  const nextImageStoragePath = body.imageStoragePath
  if (hasImageUrl) {
    update.cover_image_url = nextImageUrl ?? null
  }

  const supabase = supabaseAdmin
  const { data: current, error: currentError } = await supabase
    .from('projects')
    .select('id, cover_image_url')
    .eq('id', id)
    .maybeSingle()
  if (currentError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire le projet' })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable' })

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from('projects').update(update).eq('id', id)
    if (error) {
      console.error('Erreur de mise à jour du projet:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Impossible de modifier le projet' })
    }
  }

  if (hasImageUrl) {
    const { data: oldImages, error: readError } = await supabase
      .from('project_images')
      .select('id, storage_path, is_cover')
      .eq('project_id', id)
    if (readError) {
      throw createError({ statusCode: 500, statusMessage: 'Impossible de lire les photos du projet' })
    }

    const oldCoverRows = oldImages || []
    const currentCoverPath = current.cover_image_url
      ? getPublicStoragePath('project-images', current.cover_image_url)
      : null
    const pathsToClean = new Set<string>()
    if (currentCoverPath && currentCoverPath !== nextImageStoragePath) pathsToClean.add(currentCoverPath)
    for (const image of oldCoverRows) {
      if (image.is_cover && image.storage_path !== nextImageStoragePath) {
        pathsToClean.add(image.storage_path)
      }
    }

    const matchingImage = nextImageStoragePath
      ? oldCoverRows.find(image => image.storage_path === nextImageStoragePath)
      : undefined
    const obsoleteCoverIds = oldCoverRows
      .filter(image => image.is_cover && image.storage_path !== nextImageStoragePath)
      .map(image => image.id)

    if (obsoleteCoverIds.length) {
      const { error } = await supabase
        .from('project_images')
        .delete()
        .eq('project_id', id)
        .in('id', obsoleteCoverIds)
      if (error) {
        console.error('Erreur de remplacement de la photo principale:', error.message)
        throw createError({ statusCode: 500, statusMessage: 'Impossible de remplacer la photo principale' })
      }
    }

    if (nextImageUrl && nextImageStoragePath) {
      if (matchingImage) {
        const { error } = await supabase.from('project_images').update({
          image_url: nextImageUrl,
          is_cover: true,
          display_order: 0
        }).eq('id', matchingImage.id)
        if (error) {
          console.error('Erreur d’association de la photo principale:', error.message)
          throw createError({ statusCode: 500, statusMessage: 'Impossible d’associer la photo principale' })
        }
      } else {
        const { error } = await supabase.from('project_images').insert({
          project_id: id,
          image_url: nextImageUrl,
          storage_path: nextImageStoragePath,
          is_cover: true,
          display_order: 0
        })
        if (error) {
          console.error('Erreur d’association de la photo principale:', error.message)
          throw createError({ statusCode: 500, statusMessage: 'Impossible d’associer la photo principale' })
        }
      }
    }

    for (const storagePath of pathsToClean) {
      const cleanup = await removeStorageFileIfUnused('project-images', storagePath)
      if (cleanup.warning) console.error(cleanup.warning)
    }
  }

  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Impossible de relire le projet modifié' })
  return data
})
