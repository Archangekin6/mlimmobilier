import { createQuoteRateLimitSession } from '~~/server/utils/quote-rate-limit-session'

export default defineEventHandler((event) => {
  createQuoteRateLimitSession(event)
  return { success: true }
})
