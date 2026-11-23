import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const body = await readBody<Record<string, unknown>>(event)
  if (
    !body ||
    typeof body.client_name !== 'string' || !body.client_name.trim() || body.client_name.length > 200 ||
    typeof body.testimonial_text !== 'string' || !body.testimonial_text.trim() || body.testimonial_text.length > 5000
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Nom et témoignage sont requis' })
  }
  const allowed = ['client_name', 'client_function', 'client_company', 'client_location', 'testimonial_text', 'service_type', 'rating', 'photo_url', 'testimonial_date', 'published', 'featured', 'display_order']
  if (Object.keys(body).some(key => !allowed.includes(key))) throw createError({ statusCode: 400, statusMessage: 'Champ inattendu' })
  const nullableTextFields = ['client_function', 'client_company', 'client_location', 'service_type', 'photo_url']
  for (const field of nullableTextFields) {
    const value = body[field]
    if (value !== undefined && value !== null && typeof value !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${field}` })
    }
    if (typeof value === 'string' && value.length > 2000) {
      throw createError({ statusCode: 400, statusMessage: `Valeur trop longue pour ${field}` })
    }
  }
  if (
    body.service_type !== undefined && body.service_type !== null &&
    !['btp', 'electrification', 'gestion', 'autre'].includes(String(body.service_type))
  ) throw createError({ statusCode: 400, statusMessage: 'Type de prestation invalide' })
  if (body.testimonial_date !== undefined && body.testimonial_date !== null && (
    typeof body.testimonial_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.testimonial_date) ||
    Number.isNaN(Date.parse(`${body.testimonial_date}T00:00:00Z`))
  )) throw createError({ statusCode: 400, statusMessage: 'Date de témoignage invalide' })
  if (body.display_order !== undefined && (
    typeof body.display_order !== 'number' || !Number.isInteger(body.display_order) || body.display_order < 0
  )) throw createError({ statusCode: 400, statusMessage: 'Ordre d’affichage invalide' })
  if (body.rating !== undefined && body.rating !== null && (typeof body.rating !== 'number' || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5)) {
    throw createError({ statusCode: 400, statusMessage: 'La note doit être comprise entre 1 et 5' })
  }
  for (const key of ['published', 'featured']) {
    if (body[key] !== undefined && typeof body[key] !== 'boolean') throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${key}` })
  }
  const supabase = supabaseAdmin
  const { data, error } = await supabase.from('testimonials').insert(body).select('*').single()
  if (error) {
    console.error('Erreur de création du témoignage:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de créer le témoignage' })
  }
  return data
})
