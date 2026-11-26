import { createError } from 'h3'

const allowedFields = [
  'client_name',
  'client_function',
  'client_company',
  'client_location',
  'testimonial_text',
  'service_type',
  'rating',
  'photo_url',
  'published',
  'featured'
]

const nullableTextFields = [
  'client_function',
  'client_company',
  'client_location',
  'service_type',
  'photo_url'
]

export function validateTestimonialPayload(body: unknown, partial = false): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Données de témoignage invalides' })
  }

  const payload = body as Record<string, unknown>
  if (Object.keys(payload).length === 0 || Object.keys(payload).some(key => !allowedFields.includes(key))) {
    throw createError({ statusCode: 400, statusMessage: 'Champ de témoignage inattendu ou manquant' })
  }

  if (!partial || payload.client_name !== undefined) {
    if (typeof payload.client_name !== 'string' || !payload.client_name.trim() || payload.client_name.length > 200) {
      throw createError({ statusCode: 400, statusMessage: 'Nom du client invalide' })
    }
  }
  if (!partial || payload.testimonial_text !== undefined) {
    if (typeof payload.testimonial_text !== 'string' || !payload.testimonial_text.trim() || payload.testimonial_text.length > 5000) {
      throw createError({ statusCode: 400, statusMessage: 'Témoignage invalide' })
    }
  }

  for (const field of nullableTextFields) {
    const value = payload[field]
    if (value !== undefined && value !== null && typeof value !== 'string') {
      throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${field}` })
    }
    if (typeof value === 'string' && value.length > (field === 'client_location' ? 200 : 2000)) {
      throw createError({ statusCode: 400, statusMessage: `Valeur trop longue pour ${field}` })
    }
  }

  if (
    payload.service_type !== undefined &&
    payload.service_type !== null &&
    !['btp', 'electrification', 'gestion', 'autre'].includes(String(payload.service_type))
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Type de prestation invalide' })
  }

  if (payload.rating !== undefined && payload.rating !== null && (
    typeof payload.rating !== 'number' || !Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5
  )) {
    throw createError({ statusCode: 400, statusMessage: 'La note doit être comprise entre 1 et 5' })
  }

  for (const field of ['published', 'featured']) {
    if (payload[field] !== undefined && typeof payload[field] !== 'boolean') {
      throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${field}` })
    }
  }

  return payload
}
