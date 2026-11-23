import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { createError, getCookie, setCookie, type H3Event } from 'h3'

const QUOTE_LIMIT_COOKIE = 'ml_quote_limit'

export function createSignedQuoteLimitToken(secret: string, id = randomUUID()): string {
  const signature = createHmac('sha256', secret).update(`quote-limit:${id}`).digest('hex')
  return `${id}.${signature}`
}

export function parseSignedQuoteLimitToken(token: string, secret: string): string | null {
  if (!secret || secret.length < 32) return null
  const [id, signature, extra] = token.split('.')
  if (!id || !signature || extra || !/^[\da-f-]{36}$/i.test(id)) return null

  const expected = createHmac('sha256', secret).update(`quote-limit:${id}`).digest()
  const received = Buffer.from(signature, 'hex')
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null
  return id
}

export function getQuoteRateLimitIdentifier(event: H3Event): string {
  const secret = process.env.RATE_LIMIT_SECRET
  if (!secret || secret.length < 32) {
    throw createError({
      statusCode: 503,
      statusMessage: 'La protection anti-abus est temporairement indisponible'
    })
  }

  const token = getCookie(event, QUOTE_LIMIT_COOKIE)
  const id = token ? parseSignedQuoteLimitToken(token, secret) : null
  if (!id) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Session de formulaire invalide. Rechargez la page et réessayez.'
    })
  }
  return id
}

export function createQuoteRateLimitSession(event: H3Event): void {
  const secret = process.env.RATE_LIMIT_SECRET
  if (!secret || secret.length < 32) {
    throw createError({
      statusCode: 503,
      statusMessage: 'La protection anti-abus est temporairement indisponible'
    })
  }

  const existing = getCookie(event, QUOTE_LIMIT_COOKIE)
  if (existing && parseSignedQuoteLimitToken(existing, secret)) return

  setCookie(event, QUOTE_LIMIT_COOKIE, createSignedQuoteLimitToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/quotes',
    maxAge: 60 * 60 * 24 * 30
  })
}
