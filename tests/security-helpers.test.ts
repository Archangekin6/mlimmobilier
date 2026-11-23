import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import {
  createSignedQuoteLimitToken,
  parseSignedQuoteLimitToken
} from '../server/utils/quote-rate-limit-session.ts'
import { isAdminProfileForUser } from '../server/utils/admin-auth.ts'
import { validateSiteImageFile } from '../server/utils/image-validation.ts'
import { getPublicStoragePath } from '../server/utils/storage.ts'
import { isValidSiteSettingsString } from '../server/utils/site-settings-validation.ts'

const originalSupabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const originalTurnstileSecret = process.env.TURNSTILE_SECRET_KEY
const originalTurnstileHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME
const originalNodeEnv = process.env.NODE_ENV
process.env.NUXT_PUBLIC_SUPABASE_URL = 'https://project.example'
after(() => {
  if (originalSupabaseUrl === undefined) delete process.env.NUXT_PUBLIC_SUPABASE_URL
  else process.env.NUXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
  if (originalServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey
  if (originalTurnstileSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY
  else process.env.TURNSTILE_SECRET_KEY = originalTurnstileSecret
  if (originalTurnstileHostname === undefined) delete process.env.TURNSTILE_EXPECTED_HOSTNAME
  else process.env.TURNSTILE_EXPECTED_HOSTNAME = originalTurnstileHostname
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = originalNodeEnv
})

test('admin access requires a matching auth user and admin profile', () => {
  assert.equal(isAdminProfileForUser('user-1', { user_id: 'user-1' }), true)
  assert.equal(isAdminProfileForUser('user-1', { user_id: 'user-2' }), false)
  assert.equal(isAdminProfileForUser('user-1', null), false)
  assert.equal(isAdminProfileForUser(null, { user_id: 'user-1' }), false)
})

test('quote rate-limit tokens are signed and reject tampering', () => {
  const secret = 'a'.repeat(32)
  const id = '123e4567-e89b-12d3-a456-426614174000'
  const token = createSignedQuoteLimitToken(secret, id)

  assert.equal(parseSignedQuoteLimitToken(token, secret), id)
  assert.equal(parseSignedQuoteLimitToken(`${id}.${'0'.repeat(64)}`, secret), null)
  assert.equal(parseSignedQuoteLimitToken(token, 'short'), null)
})

test('Turnstile requires a successful response for the expected hostname', async () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret'
  process.env.TURNSTILE_EXPECTED_HOSTNAME = 'site.example'
  process.env.NODE_ENV = 'production'
  const { verifyTurnstile } = await import('../server/utils/supabase.ts')
  const originalFetch = globalThis.fetch
  let hostname = 'site.example'
  let success = true
  globalThis.fetch = async () => new Response(JSON.stringify({ success, hostname }), { status: 200 })

  try {
    delete process.env.TURNSTILE_SECRET_KEY
    await assert.rejects(verifyTurnstile('valid-token'))
    process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret'
    assert.equal(await verifyTurnstile('valid-token'), true)
    hostname = 'attacker.example'
    assert.equal(await verifyTurnstile('valid-token'), false)
    hostname = 'site.example'
    success = false
    assert.equal(await verifyTurnstile('expired-token'), false)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('image upload validation checks signature, MIME, extension, and size', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const validated = validateSiteImageFile({
    filename: 'site.png',
    type: 'image/png',
    data: png
  })
  assert.equal(validated.contentType, 'image/png')
  assert.equal(validated.extension, 'png')

  assert.throws(() => validateSiteImageFile({
    filename: 'site.png',
    type: 'image/jpeg',
    data: png
  }))
  assert.throws(() => validateSiteImageFile({
    filename: 'site.png',
    type: 'image/png',
    data: Buffer.alloc(5 * 1024 * 1024 + 1)
  }))
})

test('storage cleanup accepts only the configured project bucket URL', () => {
  assert.equal(
    getPublicStoragePath('project-images', 'https://project.example/storage/v1/object/public/project-images/a/cover.webp'),
    'a/cover.webp'
  )
  assert.equal(
    getPublicStoragePath('project-images', 'https://attacker.example/storage/v1/object/public/project-images/cover.webp'),
    null
  )
  assert.equal(
    getPublicStoragePath('project-images', 'https://project.example/storage/v1/object/public/project-images/%2e%2e/secret'),
    null
  )
})

test('long CMS text fields accept 4000 characters but reject longer values', () => {
  assert.equal(isValidSiteSettingsString('aboutPresentationText', 'a'.repeat(4000)), true)
  assert.equal(isValidSiteSettingsString('aboutLocationText', 'a'.repeat(4001)), false)
  assert.equal(isValidSiteSettingsString('aboutMissionText', 'a'.repeat(4000)), true)
  assert.equal(isValidSiteSettingsString('heroTitle', 'a'.repeat(2001)), false)
})
