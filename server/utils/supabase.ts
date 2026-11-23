import { createHmac } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { createError, type H3Event } from 'h3'

// Server-side Supabase client with service role key
// This client bypasses RLS and should only be used for trusted server operations

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Server Supabase configuration is incomplete: NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  )
}

// Service role client (bypasses RLS - use with caution!)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Verify Cloudflare Turnstile token
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!token.trim()) {
    return false
  }

  if (!secretKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Turnstile secret key is not configured; bypassing verification outside production')
      return true
    }

    console.error('Turnstile secret key is not configured in production')
    throw createError({
      statusCode: 503,
      statusMessage: 'La vérification Turnstile n’est pas configurée sur le serveur'
    })
  }

  const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME?.trim().toLowerCase()
  if (process.env.NODE_ENV === 'production' && !expectedHostname) {
    console.error('Turnstile expected hostname is not configured in production')
    throw createError({
      statusCode: 503,
      statusMessage: 'Le domaine Turnstile n’est pas configuré sur le serveur'
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      console.error(`Turnstile verification endpoint returned HTTP ${response.status}`)
      throw createError({
        statusCode: 503,
        statusMessage: 'Le service de vérification Turnstile est temporairement indisponible'
      })
    }

    const data: unknown = await response.json()
    if (typeof data !== 'object' || data === null || !('success' in data) || data.success !== true) {
      return false
    }

    if (expectedHostname) {
      if (!('hostname' in data) || typeof data.hostname !== 'string') {
        return false
      }

      return data.hostname.trim().toLowerCase() === expectedHostname
    }

    return true
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      error.statusCode === 503
    ) {
      throw error
    }

    console.error('Turnstile verification request failed')
    throw createError({
      statusCode: 503,
      statusMessage: 'Le service de vérification Turnstile est temporairement indisponible'
    })
  } finally {
    clearTimeout(timeout)
  }
}

export function hashRateLimitIdentifier(identifier: string, action: string): string {
  const secret = process.env.RATE_LIMIT_SECRET

  if (!secret || secret.length < 32) {
    console.error('Rate limit HMAC secret is missing or too short')
    throw createError({
      statusCode: 503,
      message: 'La protection anti-abus est temporairement indisponible'
    })
  }

  if (!identifier.trim() || identifier.trim().toLowerCase() === 'unknown') {
    throw createError({
      statusCode: 503,
      message: 'La protection anti-abus est temporairement indisponible'
    })
  }

  return createHmac('sha256', secret)
    .update(`${identifier.trim()}:${action}`)
    .digest('hex')
}

export type RateLimitCheck =
  | {
      available: true
      allowed: boolean
      count: number
      limit: number
      remaining: number
      resetAt: string
    }
  | { available: false }

function isRateLimitDecision(
  value: unknown
): value is Omit<Extract<RateLimitCheck, { available: true }>, 'available'> {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  if (
    !('allowed' in value) ||
    typeof value.allowed !== 'boolean' ||
    !('count' in value) ||
    typeof value.count !== 'number' ||
    !Number.isInteger(value.count) ||
    !('limit' in value) ||
    typeof value.limit !== 'number' ||
    !Number.isInteger(value.limit) ||
    !('remaining' in value) ||
    typeof value.remaining !== 'number' ||
    !Number.isInteger(value.remaining) ||
    !('resetAt' in value) ||
    typeof value.resetAt !== 'string' ||
    !Number.isFinite(Date.parse(value.resetAt))
  ) {
    return false
  }

  return true
}

export async function checkRateLimit(
  identifierHash: string,
  action: string,
  maxCount: number,
  windowMinutes: number
): Promise<RateLimitCheck> {
  try {
    if (!/^[\da-f]{64}$/.test(identifierHash)) {
      console.error('Rate limit identifier hash is invalid')
      return { available: false }
    }

    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_identifier_hash: identifierHash,
      p_action: action,
      p_max_count: maxCount,
      p_window_minutes: windowMinutes
    })

    if (error) {
      console.error('Rate limit check failed:', error.message)
      return { available: false }
    }

    if (!isRateLimitDecision(data)) {
      console.error('Rate limit check returned an invalid response')
      return { available: false }
    }

    return { ...data, available: true }
  } catch (err) {
    console.error('Rate limit check exception:', err)
    return { available: false }
  }
}

/**
 * Get user agent from request
 */
export function getUserAgent(event: H3Event): string {
  return event.node.req.headers['user-agent'] || 'unknown'
}

/**
 * Sanitize text input (remove HTML, trim whitespace)
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Limit length
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000)
  }
  
  return sanitized
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validate Côte d'Ivoire phone number
 */
export function isValidCIPhone(phone: string): boolean {
  const normalized = phone.replace(/[\s().-]/g, '')
  return /^\+?225\d{10}$/.test(normalized)
}
