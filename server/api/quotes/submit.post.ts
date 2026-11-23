import { type H3Event } from 'h3'
import {
  supabaseAdmin,
  verifyTurnstile,
  checkRateLimit,
  hashRateLimitIdentifier,
  getUserAgent,
  sanitizeText,
  isValidEmail,
  isValidCIPhone
} from '~~/server/utils/supabase'
import { getQuoteRateLimitIdentifier } from '~~/server/utils/quote-rate-limit-session'

const MAX_BODY_BYTES = 16 * 1024
const allowedFields = new Set([
  'service',
  'full_name',
  'phone',
  'email',
  'location',
  'budget',
  'timeline',
  'description',
  'turnstile_token'
])

type QuoteService = 'btp' | 'electrification' | 'gestion' | 'autre'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isQuoteService(value: unknown): value is QuoteService {
  return value === 'btp' ||
    value === 'electrification' ||
    value === 'gestion' ||
    value === 'autre'
}

async function readJsonBodyWithLimit(event: H3Event): Promise<unknown> {
  const request = event.node.req
  const contentType = request.headers['content-type']
  if (
    typeof contentType !== 'string' ||
    contentType.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json'
  ) {
    throw createError({ statusCode: 415, message: 'Format de requête non pris en charge' })
  }

  const contentLength = request.headers['content-length']
  if (contentLength !== undefined) {
    if (typeof contentLength !== 'string' || !/^\d+$/.test(contentLength)) {
      throw createError({ statusCode: 400, message: 'Taille de requête invalide' })
    }

    if (Number(contentLength) > MAX_BODY_BYTES) {
      request.resume()
      throw createError({ statusCode: 413, message: 'La demande est trop volumineuse' })
    }
  }

  const chunks: Buffer[] = []
  let totalBytes = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalBytes += buffer.byteLength
    if (totalBytes > MAX_BODY_BYTES) {
      request.resume()
      throw createError({ statusCode: 413, message: 'La demande est trop volumineuse' })
    }
    chunks.push(buffer)
  }

  if (totalBytes === 0) {
    throw createError({ statusCode: 400, message: 'Données de demande invalides' })
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch {
    throw createError({ statusCode: 400, message: 'Données de demande invalides' })
  }
}

export default defineEventHandler(async (event) => {
  try {
    const bodyValue = await readJsonBodyWithLimit(event)
    if (!isRecord(bodyValue)) {
      throw createError({ statusCode: 400, message: 'Données de demande invalides' })
    }

    const body = bodyValue
    if (Object.keys(body).some(field => !allowedFields.has(field))) {
      throw createError({ statusCode: 400, message: 'La demande contient des champs inattendus' })
    }

    const errors: string[] = []
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const service = body.service
    const email = typeof body.email === 'string' ? body.email.trim() : ''

    if (fullName.length < 2) {
      errors.push('Le nom complet est requis (minimum 2 caractères)')
    } else if (fullName.length > 100) {
      errors.push('Le nom complet ne peut pas dépasser 100 caractères')
    }
    if (body.full_name !== undefined && typeof body.full_name !== 'string') {
      errors.push('Le nom complet est invalide')
    }

    if (!phone) {
      errors.push('Le numéro de téléphone est requis')
    } else if (phone.length > 25 || !isValidCIPhone(phone)) {
      errors.push('Le numéro doit être un numéro ivoirien valide au format +225 XX XX XX XX XX')
    }
    if (body.phone !== undefined && typeof body.phone !== 'string') {
      errors.push('Le numéro de téléphone est invalide')
    }

    if (description.length < 10) {
      errors.push('La description est requise (minimum 10 caractères)')
    } else if (description.length > 5000) {
      errors.push('La description ne peut pas dépasser 5000 caractères')
    }
    if (body.description !== undefined && typeof body.description !== 'string') {
      errors.push('La description est invalide')
    }

    if (!isQuoteService(service)) {
      errors.push('Le type de service est invalide')
    }

    if (body.email !== undefined && body.email !== null && typeof body.email !== 'string') {
      errors.push('Format d’email invalide')
    } else if (email.length > 254 || (email && !isValidEmail(email))) {
      errors.push('Format d’email invalide')
    }

    const optionalFieldLimits = {
      location: 200,
      budget: 100,
      timeline: 100
    } as const

    for (const [field, maxLength] of Object.entries(optionalFieldLimits)) {
      const value = body[field]
      if (value !== undefined && value !== null && typeof value !== 'string') {
        errors.push(`Le champ ${field} est invalide`)
      } else if (typeof value === 'string' && value.trim().length > maxLength) {
        errors.push(`Le champ ${field} ne peut pas dépasser ${maxLength} caractères`)
      }
    }

    if (body.turnstile_token !== undefined && typeof body.turnstile_token !== 'string') {
      errors.push('Jeton de vérification invalide')
    }
    const turnstileToken = typeof body.turnstile_token === 'string'
      ? body.turnstile_token.trim()
      : ''
    if (turnstileToken.length > 2048) {
      errors.push('Jeton de vérification invalide')
    }

    if (errors.length > 0) {
      throw createError({ statusCode: 400, message: errors.join(', ') })
    }
    if (!isQuoteService(service)) {
      throw createError({ statusCode: 400, message: 'Le type de service est invalide' })
    }

    const visitorId = getQuoteRateLimitIdentifier(event)
    const userAgent = getUserAgent(event)

    const enforceRateLimit = async (
      action: string,
      maxCount: number,
      windowMinutes: number,
      exceededMessage: string,
      identifier: string
    ) => {
      const identifierHash = hashRateLimitIdentifier(identifier, action)
      const result = await checkRateLimit(identifierHash, action, maxCount, windowMinutes)

      if (!result.available) {
        if (process.env.NODE_ENV === 'production') {
          throw createError({
            statusCode: 503,
            message: 'La protection anti-abus est temporairement indisponible'
          })
        }

        console.warn(`Rate limit unavailable in development for action "${action}"`)
        return
      }

      if (!result.allowed) {
        const retryMinutes = Math.max(
          1,
          Math.ceil((Date.parse(result.resetAt) - Date.now()) / 60_000)
        )
        throw createError({
          statusCode: 429,
          message: `${exceededMessage} Réessayez dans environ ${retryMinutes} minute(s).`
        })
      }
    }

    if (turnstileToken) {
      const isTurnstileValid = await verifyTurnstile(turnstileToken)
      if (!isTurnstileValid) {
        throw createError({
          statusCode: 403,
          message: 'La vérification de sécurité a échoué ou est indisponible'
        })
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw createError({
        statusCode: 400,
        message: 'Vérification de sécurité requise'
      })
    }

    const rateLimitSubjects = [
      { kind: 'visitor', identifier: visitorId },
      { kind: 'phone', identifier: `phone:${phone.replace(/\D/g, '')}` }
    ]
    for (const { kind, identifier } of rateLimitSubjects) {
      await enforceRateLimit(
        `quote_submission_hourly_${kind}`,
        3,
        60,
        'Trop de demandes sur la dernière heure.',
        identifier
      )
      await enforceRateLimit(
        `quote_submission_daily_${kind}`,
        10,
        1440,
        'La limite quotidienne de demandes est atteinte.',
        identifier
      )
    }

    const quoteData = {
      service,
      full_name: sanitizeText(fullName),
      phone: sanitizeText(phone),
      email: email ? sanitizeText(email) : null,
      location: typeof body.location === 'string' && body.location.trim()
        ? sanitizeText(body.location)
        : null,
      budget: typeof body.budget === 'string' && body.budget.trim()
        ? sanitizeText(body.budget)
        : null,
      timeline: typeof body.timeline === 'string' && body.timeline.trim()
        ? sanitizeText(body.timeline)
        : null,
      description: sanitizeText(description),
      status: 'nouveau',
      user_agent: userAgent
    }

    const { data, error } = await supabaseAdmin
      .from('quote_requests')
      .insert([quoteData])
      .select('id')
      .single()

    if (error) {
      console.error('Quote request database insert failed:', error.message)
      throw createError({
        statusCode: 500,
        message: 'Erreur lors de l’enregistrement de votre demande. Veuillez réessayer.'
      })
    }

    return {
      success: true,
      message: 'Votre demande de devis a été envoyée avec succès. Nous vous contacterons sous 24-48 heures.',
      quote_id: data.id
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
    ) {
      throw error
    }

    console.error('Quote submission failed:', error)
    throw createError({
      statusCode: 500,
      message: 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement.'
    })
  }
})
