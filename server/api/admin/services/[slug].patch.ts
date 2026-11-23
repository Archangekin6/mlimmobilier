import { supabaseAdmin } from '~~/server/utils/supabase'

const serviceSlugs = new Set(['btp', 'electrification', 'gestion'])
const stringLimits = {
  home_title: 160,
  detail_title: 160,
  badge: 100,
  home_description: 2000,
  detail_description: 2000
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseStringList(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.length > 8 || value.some(item =>
    typeof item !== 'string' || item.trim().length === 0 || item.length > 240
  )) {
    throw createError({ statusCode: 400, statusMessage: `Liste invalide pour ${field}` })
  }
  return value.map(item => (item as string).trim())
}

function parseDetailItems(value: unknown) {
  if (!Array.isArray(value) || value.length > 8) {
    throw createError({ statusCode: 400, statusMessage: 'Liste de détails invalide' })
  }

  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.title !== 'string' ||
      !item.title.trim() ||
      item.title.length > 120 ||
      typeof item.text !== 'string' ||
      !item.text.trim() ||
      item.text.length > 500
    ) {
      throw createError({ statusCode: 400, statusMessage: 'Un élément de détail est invalide' })
    }

    return { title: item.title.trim(), text: item.text.trim() }
  })
}

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const slug = getRouterParam(event, 'slug')
  if (!slug || !serviceSlugs.has(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Service non trouvé' })
  }

  const body: unknown = await readBody(event)
  if (!isRecord(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })
  }

  const update: Record<string, string | number | boolean | string[] | { title: string; text: string }[]> = {}
  for (const [field, maxLength] of Object.entries(stringLimits)) {
    const value = body[field]
    if (value === undefined) continue
    if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
      throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${field}` })
    }
    update[field] = value.trim()
  }

  if (body.home_highlights !== undefined) {
    update.home_highlights = parseStringList(body.home_highlights, 'home_highlights')
  }
  if (body.detail_items !== undefined) {
    update.detail_items = parseDetailItems(body.detail_items)
  }
  if (body.display_order !== undefined) {
    if (
      typeof body.display_order !== 'number' ||
      !Number.isInteger(body.display_order) ||
      body.display_order < 0 ||
      body.display_order > 1000
    ) {
      throw createError({ statusCode: 400, statusMessage: 'Ordre d’affichage invalide' })
    }
    update.display_order = body.display_order
  }
  if (body.published !== undefined) {
    if (typeof body.published !== 'boolean') {
      throw createError({ statusCode: 400, statusMessage: 'Visibilité invalide' })
    }
    update.published = body.published
  }

  const allowedFields = new Set([
    ...Object.keys(stringLimits),
    'home_highlights',
    'detail_items',
    'display_order',
    'published'
  ])
  if (
    Object.keys(update).length === 0 ||
    Object.keys(body).some(field => !allowedFields.has(field))
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Modifications de service invalides' })
  }

  const { data, error } = await supabaseAdmin
    .from('site_services')
    .update(update)
    .eq('slug', slug)
    .select('slug, home_title, detail_title, badge, home_description, home_highlights, detail_description, detail_items, display_order, published')
    .maybeSingle()

  if (error) {
    console.error('Erreur d’enregistrement du service:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer le service' })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Service non trouvé dans Supabase' })
  }

  return data
})
