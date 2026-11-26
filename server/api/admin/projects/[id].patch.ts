import { getPublicStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'
import { supabaseAdmin } from '~~/server/utils/supabase'

const uuidPattern = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i
const fields: Record<string, string> = {
  title: 'title',
  category: 'service_type',
  location: 'location',
  date: 'project_date',
  description: 'summary',
  fullDescription: 'full_description',
  client: 'client_name',
  imageUrl: 'cover_image_url',
  published: 'published',
  featured: 'featured',
  displayOrder: 'display_order'
}

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !uuidPattern.test(id)) throw createError({ statusCode: 400, statusMessage: 'Identifiant de projet invalide' })

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !(key in fields) && !['imageStoragePath', 'galleryImages'].includes(key))) {
    throw createError({ statusCode: 400, statusMessage: 'Données de projet invalides' })
  }
  const update: Record<string, string | number | boolean | null> = {}
  for (const [field, column] of Object.entries(fields)) {
    const value = body[field]
    if (value === undefined) continue
    if (['published', 'featured'].includes(field)) {
      if (typeof value !== 'boolean') throw createError({ statusCode: 400, statusMessage: `${field} invalide` })
      update[column] = value
    } else if (field === 'displayOrder') {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) throw createError({ statusCode: 400, statusMessage: 'Ordre invalide' })
      update[column] = value
    } else if (field === 'category') {
      if (!['btp', 'electrification', 'gestion'].includes(String(value))) throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
      update[column] = String(value)
    } else if (value === null || typeof value === 'string') {
      if (typeof value === 'string' && value.length > (field === 'fullDescription' || field === 'description' ? 5000 : 500)) {
        throw createError({ statusCode: 400, statusMessage: `Valeur trop longue pour ${field}` })
      }
      const trimmedValue = typeof value === 'string' ? value.trim() : null
      if (field === 'description' && !trimmedValue) {
        throw createError({ statusCode: 400, statusMessage: 'La description est requise' })
      }
      if (field === 'date' && trimmedValue) {
        const date = new Date(`${trimmedValue}T00:00:00.000Z`)
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue) ||
          !Number.isFinite(date.getTime()) ||
          date.toISOString().slice(0, 10) !== trimmedValue
        ) {
          throw createError({ statusCode: 400, statusMessage: 'Date de réalisation invalide' })
        }
      }
      update[column] = trimmedValue || (['location', 'date', 'client', 'fullDescription'].includes(field) ? null : '')
    } else {
      throw createError({ statusCode: 400, statusMessage: `${field} invalide` })
    }
  }
  if (typeof body.title === 'string' && !body.title.trim()) throw createError({ statusCode: 400, statusMessage: 'Le titre est requis' })

  const nextPath = body.imageStoragePath === undefined
    ? undefined
    : body.imageStoragePath === null || body.imageStoragePath === ''
      ? null
      : typeof body.imageStoragePath === 'string' &&
          body.imageStoragePath.length <= 1024 &&
          !body.imageStoragePath.startsWith('/') &&
          !body.imageStoragePath.includes('\\') &&
          body.imageStoragePath.split('/').every(part => part && part !== '.' && part !== '..')
        ? body.imageStoragePath
        : (() => { throw createError({ statusCode: 400, statusMessage: 'Chemin Storage invalide' }) })()
  if (
    nextPath &&
    (typeof body.imageUrl !== 'string' || getPublicStoragePath('project-images', body.imageUrl) !== nextPath)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'L’image ne correspond pas au bucket project-images' })
  }
  const galleryImages: Array<{ image_url: string; storage_path: string }> = []
  if (body.galleryImages !== undefined) {
    if (!Array.isArray(body.galleryImages) || body.galleryImages.length > 20) {
      throw createError({ statusCode: 400, statusMessage: 'Galerie invalide (20 images maximum)' })
    }
    const rawGalleryImages: unknown[] = body.galleryImages
    for (const image of rawGalleryImages) {
      if (
        typeof image !== 'object' || image === null ||
        !('imageUrl' in image) || typeof image.imageUrl !== 'string' ||
        !('storagePath' in image) || typeof image.storagePath !== 'string' ||
        image.storagePath.length > 1024 ||
        image.storagePath.startsWith('/') ||
        image.storagePath.includes('\\') ||
        image.storagePath.split('/').some(part => !part || part === '.' || part === '..') ||
        getPublicStoragePath('project-images', image.imageUrl) !== image.storagePath
      ) {
        throw createError({ statusCode: 400, statusMessage: 'Image de galerie non autorisée' })
      }
      galleryImages.push({ image_url: image.imageUrl, storage_path: image.storagePath })
    }
  }

  const supabase = supabaseAdmin
  const { data: current, error: currentError } = await supabase
    .from('projects').select('id, cover_image_url').eq('id', id).maybeSingle()
  if (currentError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire le projet' })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable' })

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from('projects').update(update).eq('id', id)
    if (error) {
      console.error('Erreur de mise à jour du projet:', error.message)
      throw createError({ statusCode: 500, statusMessage: 'Impossible de modifier le projet' })
    }
  }

  if (nextPath !== undefined || body.galleryImages !== undefined) {
    const { data: oldImages, error: readError } = await supabase
      .from('project_images').select('storage_path, image_url, is_cover').eq('project_id', id)
    if (readError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire les images du projet' })
    const coverPath = nextPath !== undefined
      ? nextPath
      : oldImages?.find(image => image.is_cover)?.storage_path || null
    const imagesToSave = [...galleryImages]
    if (
      nextPath &&
      typeof body.imageUrl === 'string' &&
      !imagesToSave.some(image => image.storage_path === nextPath)
    ) {
      imagesToSave.unshift({ image_url: body.imageUrl.trim(), storage_path: nextPath })
    }
    const { error: deleteError } = await supabase.from('project_images').delete().eq('project_id', id)
    if (deleteError) throw createError({ statusCode: 500, statusMessage: 'Impossible de remplacer les images du projet' })
    if (imagesToSave.length) {
      const { error: insertError } = await supabase.from('project_images').insert(imagesToSave.map((image, index) => ({
        ...image,
        project_id: id,
        is_cover: image.storage_path === coverPath,
        display_order: index
      })))
      if (insertError) throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer l’image du projet' })
    }
    const paths = new Set((oldImages || [])
      .filter(image => getPublicStoragePath('project-images', image.image_url) === image.storage_path)
      .map(image => image.storage_path)
      .filter(path => !imagesToSave.some(image => image.storage_path === path)))
    const oldCoverPath = current.cover_image_url
      ? getPublicStoragePath('project-images', current.cover_image_url)
      : null
    const nextCoverUrl = typeof update.cover_image_url === 'string'
      ? update.cover_image_url
      : current.cover_image_url
    const nextCoverPath = nextCoverUrl
      ? getPublicStoragePath('project-images', nextCoverUrl)
      : null
    if (oldCoverPath && oldCoverPath !== nextCoverPath) paths.add(oldCoverPath)
    for (const storagePath of paths) {
      const cleanup = await removeStorageFileIfUnused('project-images', storagePath)
      if (cleanup.warning) console.error(cleanup.warning)
    }
  }

  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Impossible de relire le projet modifié' })
  return data
})
