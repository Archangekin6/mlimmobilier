import { getPublicStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'
import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  const body = await readBody<Record<string, unknown>>(event)
  const allowed = ['client_name', 'client_function', 'client_company', 'client_location', 'testimonial_text', 'service_type', 'rating', 'photo_url', 'testimonial_date', 'published', 'featured', 'display_order']
  if (!body || typeof body !== 'object' || Object.keys(body).some(key => !allowed.includes(key))) throw createError({ statusCode: 400, statusMessage: 'Données de témoignage invalides' })
  if (body.client_name !== undefined && (typeof body.client_name !== 'string' || !body.client_name.trim())) throw createError({ statusCode: 400, statusMessage: 'Nom invalide' })
  if (body.testimonial_text !== undefined && (typeof body.testimonial_text !== 'string' || !body.testimonial_text.trim() || body.testimonial_text.length > 5000)) throw createError({ statusCode: 400, statusMessage: 'Témoignage invalide' })
  if (body.rating !== undefined && body.rating !== null && (typeof body.rating !== 'number' || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5)) throw createError({ statusCode: 400, statusMessage: 'Note invalide' })
  for (const key of ['published', 'featured']) if (body[key] !== undefined && typeof body[key] !== 'boolean') throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${key}` })
  for (const field of ['client_function', 'client_company', 'client_location', 'service_type', 'photo_url']) {
    const value = body[field]
    if (value !== undefined && value !== null && typeof value !== 'string') throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${field}` })
    if (typeof value === 'string' && value.length > 2000) throw createError({ statusCode: 400, statusMessage: `Valeur trop longue pour ${field}` })
  }
  if (body.service_type !== undefined && body.service_type !== null && !['btp', 'electrification', 'gestion', 'autre'].includes(String(body.service_type))) {
    throw createError({ statusCode: 400, statusMessage: 'Type de prestation invalide' })
  }
  if (body.testimonial_date !== undefined && body.testimonial_date !== null && (
    typeof body.testimonial_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.testimonial_date) ||
    Number.isNaN(Date.parse(`${body.testimonial_date}T00:00:00Z`))
  )) throw createError({ statusCode: 400, statusMessage: 'Date de témoignage invalide' })
  if (body.display_order !== undefined && (
    typeof body.display_order !== 'number' || !Number.isInteger(body.display_order) || body.display_order < 0
  )) throw createError({ statusCode: 400, statusMessage: 'Ordre d’affichage invalide' })

  const supabase = supabaseAdmin
  let oldPhotoUrl: string | null = null
  if (Object.hasOwn(body, 'photo_url')) {
    const { data: current, error: currentError } = await supabase
      .from('testimonials').select('photo_url').eq('id', id).maybeSingle()
    if (currentError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire la photo actuelle' })
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Témoignage introuvable' })
    oldPhotoUrl = current.photo_url
  }
  const { data, error } = await supabase.from('testimonials').update(body).eq('id', id).select('*').maybeSingle()
  if (error) {
    console.error('Erreur de mise à jour du témoignage:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de modifier le témoignage' })
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Témoignage introuvable' })
  let cleanupWarning: string | undefined
  if (oldPhotoUrl && body.photo_url !== oldPhotoUrl) {
    const oldPath = getPublicStoragePath('site-images', oldPhotoUrl)
    if (oldPath) {
      const cleanup = await removeStorageFileIfUnused('site-images', oldPath)
      cleanupWarning = cleanup.warning
    }
  }
  return { ...data, cleanupWarning }
})
