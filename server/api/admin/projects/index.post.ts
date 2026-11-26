import { randomUUID } from 'node:crypto'
import { getPublicStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'
import { supabaseAdmin } from '~~/server/utils/supabase'

type ProjectBody = {
  title?: unknown
  category?: unknown
  location?: unknown
  date?: unknown
  description?: unknown
  fullDescription?: unknown
  client?: unknown
  imageUrl?: unknown
  imageStoragePath?: unknown
  published?: unknown
  featured?: unknown
  displayOrder?: unknown
  galleryImages?: unknown
}

function isProjectCategory(value: unknown): value is 'btp' | 'electrification' | 'gestion' {
  return value === 'btp' || value === 'electrification' || value === 'gestion'
}

function validateStoragePath(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  if (
    typeof value !== 'string' ||
    value.length > 1024 ||
    value.startsWith('/') ||
    value.includes('\\') ||
    value.includes('\0') ||
    value.split('/').some(part => !part || part === '.' || part === '..')
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Chemin Storage invalide' })
  }
  return value
}

function validateProjectDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00.000Z`) : null
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !date ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Date de réalisation invalide' })
  }
  return value
}

function validateGalleryImages(value: unknown): Array<{ image_url: string; storage_path: string }> {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Galerie invalide (20 images maximum)' })
  }
  return value.map((image) => {
    if (
      typeof image !== 'object' || image === null ||
      !('imageUrl' in image) || typeof image.imageUrl !== 'string' ||
      !('storagePath' in image) || typeof image.storagePath !== 'string'
    ) {
      throw createError({ statusCode: 400, statusMessage: 'Image de galerie invalide' })
    }
    const storagePath = validateStoragePath(image.storagePath)
    if (!storagePath || getPublicStoragePath('project-images', image.imageUrl) !== storagePath) {
      throw createError({ statusCode: 400, statusMessage: 'Image de galerie non autorisée' })
    }
    return { image_url: image.imageUrl, storage_path: storagePath }
  })
}

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const body = await readBody<ProjectBody>(event)
  if (
    typeof body?.title !== 'string' || !body.title.trim() || body.title.length > 200 ||
    (body.location !== undefined && body.location !== null && (typeof body.location !== 'string' || body.location.length > 200)) ||
    !isProjectCategory(body.category) ||
    typeof body.description !== 'string' || !body.description.trim() || body.description.length > 5000 ||
    (body.fullDescription !== undefined && body.fullDescription !== null && (typeof body.fullDescription !== 'string' || body.fullDescription.length > 5000)) ||
    (body.client !== undefined && body.client !== null && (typeof body.client !== 'string' || body.client.length > 200)) ||
    typeof body.imageUrl !== 'string' || !body.imageUrl.trim() ||
    (body.date !== undefined && body.date !== null && (typeof body.date !== 'string' || body.date.length > 100)) ||
    (body.published !== undefined && typeof body.published !== 'boolean') ||
    (body.featured !== undefined && typeof body.featured !== 'boolean') ||
    (body.displayOrder !== undefined && (!Number.isInteger(body.displayOrder) || typeof body.displayOrder !== 'number'))
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Données de projet invalides' })
  }

  const projectDate = validateProjectDate(body.date)
  const imageStoragePath = validateStoragePath(body.imageStoragePath)
  if (
    !imageStoragePath ||
    getPublicStoragePath('project-images', body.imageUrl) !== imageStoragePath
  ) {
    throw createError({ statusCode: 400, statusMessage: 'L’image ne correspond pas au bucket project-images' })
  }
  const galleryImages = validateGalleryImages(body.galleryImages)
  const slug = `${body.title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)}-${randomUUID().slice(0, 8)}`
  const supabase = supabaseAdmin
  const { data: project, error } = await supabase.from('projects').insert({
    title: body.title.trim(),
    slug,
    summary: body.description.trim(),
    description: typeof body.fullDescription === 'string' ? body.fullDescription.trim() : body.description.trim(),
    full_description: typeof body.fullDescription === 'string' ? body.fullDescription.trim() : null,
    service_type: body.category,
    location: typeof body.location === 'string' ? body.location.trim() || null : null,
    project_date: projectDate,
    client_name: typeof body.client === 'string' ? body.client.trim() : null,
    cover_image_url: body.imageUrl.trim(),
    published: body.published === true,
    featured: body.featured === true,
    display_order: typeof body.displayOrder === 'number' ? body.displayOrder : 0
  }).select('*').single()

  if (error) {
    console.error('Erreur de création du projet:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de créer le projet' })
  }

  const projectImages = [...galleryImages]
  if (!projectImages.some(image => image.storage_path === imageStoragePath)) {
    projectImages.unshift({
      image_url: body.imageUrl.trim(),
      storage_path: imageStoragePath
    })
  }
  if (projectImages.length) {
    const { error: imageError } = await supabase.from('project_images').insert(projectImages.map((image, index) => ({
      ...image,
      project_id: project.id,
      is_cover: image.storage_path === imageStoragePath,
      display_order: index
    })))
    if (imageError) {
      await supabase.from('projects').delete().eq('id', project.id)
      for (const image of projectImages) {
        const cleanup = await removeStorageFileIfUnused('project-images', image.storage_path)
        if (cleanup.warning) console.error(cleanup.warning)
      }
      console.error('Erreur d’enregistrement de la galerie du projet:', imageError.message)
      throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer l’image du projet' })
    }
  }

  return project
})
