import { createError } from 'h3'
import { getPublicStoragePath, isSafeStoragePath } from './storage.ts'

export type ProjectCategory = 'btp' | 'electrification' | 'gestion'

export interface ProjectCreatePayload {
  title: string
  category: ProjectCategory
  location: string
  description: string
  imageUrl: string
  imageStoragePath: string
  featured: boolean
  published: true
}

export interface ProjectUpdatePayload {
  title?: string
  category?: ProjectCategory
  location?: string | null
  description?: string
  published?: boolean
  featured?: boolean
  imageUrl?: string | null
  imageStoragePath?: string | null
}

const createFields = new Set([
  'title',
  'category',
  'location',
  'description',
  'imageUrl',
  'imageStoragePath',
  'featured'
])
const updateFields = new Set([
  'title',
  'category',
  'location',
  'description',
  'published',
  'featured',
  'imageUrl',
  'imageStoragePath'
])
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isProjectCategory(value: unknown): value is ProjectCategory {
  return value === 'btp' || value === 'electrification' || value === 'gestion'
}

function validateStorageImage(urlValue: unknown, pathValue: unknown): { imageUrl: string; imageStoragePath: string } {
  if (
    typeof urlValue !== 'string' ||
    typeof pathValue !== 'string' ||
    !urlValue.trim() ||
    !isSafeStoragePath(pathValue) ||
    getPublicStoragePath('project-images', urlValue.trim()) !== pathValue
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Photo principale non autorisée' })
  }
  return { imageUrl: urlValue.trim(), imageStoragePath: pathValue }
}

export function validateProjectCreatePayload(body: unknown): ProjectCreatePayload {
  if (!isObject(body) || Object.keys(body).some(field => !createFields.has(field))) {
    throw createError({ statusCode: 400, statusMessage: 'Données de projet invalides' })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const location = body.location === undefined || body.location === null
    ? ''
    : typeof body.location === 'string' ? body.location.trim() : null
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const featured = body.featured === undefined ? false : body.featured
  const image = validateStorageImage(body.imageUrl, body.imageStoragePath)

  if (
    !title ||
    title.length > 200 ||
    typeof location !== 'string' ||
    location.length > 200 ||
    !isProjectCategory(body.category) ||
    !description ||
    description.length > 5000 ||
    typeof featured !== 'boolean'
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Données de projet invalides' })
  }

  return {
    title,
    category: body.category,
    location,
    description,
    ...image,
    featured,
    published: true
  }
}

export function validateProjectUpdatePayload(body: unknown): ProjectUpdatePayload {
  if (!isObject(body) || Object.keys(body).length === 0 || Object.keys(body).some(field => !updateFields.has(field))) {
    throw createError({ statusCode: 400, statusMessage: 'Données de projet invalides' })
  }

  const payload: ProjectUpdatePayload = {}
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 200) {
      throw createError({ statusCode: 400, statusMessage: 'Titre invalide' })
    }
    payload.title = body.title.trim()
  }
  if (body.category !== undefined) {
    if (!isProjectCategory(body.category)) {
      throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
    }
    payload.category = body.category
  }
  if (body.location !== undefined) {
    if (body.location !== null && typeof body.location !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Localisation invalide' })
    }
    const location = typeof body.location === 'string' ? body.location.trim() : ''
    if (location.length > 200) throw createError({ statusCode: 400, statusMessage: 'Localisation trop longue' })
    payload.location = location || null
  }
  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || !body.description.trim() || body.description.trim().length > 5000) {
      throw createError({ statusCode: 400, statusMessage: 'Description invalide' })
    }
    payload.description = body.description.trim()
  }
  for (const field of ['published', 'featured'] as const) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: `${field} invalide` })
      }
      payload[field] = body[field]
    }
  }

  const hasImageUrl = Object.prototype.hasOwnProperty.call(body, 'imageUrl')
  const hasImageStoragePath = Object.prototype.hasOwnProperty.call(body, 'imageStoragePath')
  if (hasImageUrl !== hasImageStoragePath) {
    throw createError({ statusCode: 400, statusMessage: 'Référence de photo principale incomplète' })
  }
  if (hasImageUrl) {
    const isRemoval =
      (body.imageUrl === null || body.imageUrl === '') &&
      (body.imageStoragePath === null || body.imageStoragePath === '')
    if (isRemoval) {
      payload.imageUrl = null
      payload.imageStoragePath = null
    } else {
      const image = validateStorageImage(body.imageUrl, body.imageStoragePath)
      payload.imageUrl = image.imageUrl
      payload.imageStoragePath = image.imageStoragePath
    }
  }

  return payload
}
