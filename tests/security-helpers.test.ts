import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import {
  createSignedQuoteLimitToken,
  parseSignedQuoteLimitToken
} from '../server/utils/quote-rate-limit-session.ts'
import { isAdminProfileForUser } from '../server/utils/admin-auth.ts'
import { validateSiteImageFile } from '../server/utils/image-validation.ts'
import {
  getPublicStoragePath,
  isSafeStoragePath,
  removeStorageFileIfUnused,
  type StorageCleanupClient
} from '../server/utils/storage.ts'
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

test('image upload validation accepts every configured format up to the exact size limit', () => {
  const samples = [
    { filename: 'image.jpg', type: 'image/jpeg', data: Buffer.from([0xff, 0xd8, 0xff]) },
    { filename: 'image.jpeg', type: 'image/jpeg', data: Buffer.from([0xff, 0xd8, 0xff]) },
    { filename: 'image.webp', type: 'image/webp', data: Buffer.from('RIFF0000WEBP') },
    { filename: 'image.gif', type: 'image/gif', data: Buffer.from('GIF89a') },
    { filename: 'image.avif', type: 'image/avif', data: Buffer.from('0000ftypavif0000') }
  ]

  for (const sample of samples) {
    assert.equal(validateSiteImageFile(sample).contentType, sample.type)
  }

  const exactLimitPng = Buffer.alloc(5 * 1024 * 1024)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(exactLimitPng)
  assert.equal(validateSiteImageFile({
    filename: 'limit.png',
    type: 'image/png',
    data: exactLimitPng
  }).extension, 'png')

  assert.throws(() => validateSiteImageFile({
    filename: 'image.svg',
    type: 'image/svg+xml',
    data: Buffer.from('<svg></svg>')
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

test('storage cleanup validates paths and preserves files with shared references', async () => {
  assert.equal(isSafeStoragePath('gallery/photo.webp'), true)
  assert.equal(isSafeStoragePath('../photo.webp'), false)
  assert.equal(isSafeStoragePath('folder\\photo.webp'), false)

  const removed: string[] = []
  const client: StorageCleanupClient = {
    from(table) {
      return {
        select() {
          return {
            eq(column, value) {
              return {
                async limit() {
                  const referenced = table === 'project_images' &&
                    column === 'storage_path' &&
                    value === 'shared/photo.webp'
                  return { data: referenced ? [{ id: 'image-1' }] : [], error: null }
                }
              }
            }
          }
        }
      }
    },
    storage: {
      from() {
        return {
          getPublicUrl(path) {
            return { data: { publicUrl: `https://project.example/storage/v1/object/public/project-images/${path}` } }
          },
          async remove(paths) {
            removed.push(...paths)
            return { error: null }
          }
        }
      }
    }
  }

  const result = await removeStorageFileIfUnused('project-images', 'shared/photo.webp', client)
  assert.equal(result.referenced, true)
  assert.equal(result.removed, false)
  assert.deepEqual(removed, [])
})

test('storage cleanup deletes unreferenced files and retains files when reference checks fail', async () => {
  const removed: string[] = []
  let lookupFails = false
  const client: StorageCleanupClient = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                async limit() {
                  return { data: [], error: lookupFails ? { message: 'lookup failed' } : null }
                }
              }
            }
          }
        }
      }
    },
    storage: {
      from() {
        return {
          getPublicUrl(path) {
            return { data: { publicUrl: `https://project.example/storage/${path}` } }
          },
          async remove(paths) {
            removed.push(...paths)
            return { error: null }
          }
        }
      }
    }
  }

  const result = await removeStorageFileIfUnused('site-images', 'unused/photo.webp', client)
  assert.equal(result.removed, true)
  assert.deepEqual(removed, ['unused/photo.webp'])

  lookupFails = true
  const failedLookup = await removeStorageFileIfUnused('site-images', 'unknown/photo.webp', client)
  assert.equal(failedLookup.removed, false)
  assert.match(failedLookup.warning || '', /conservé/)
  assert.deepEqual(removed, ['unused/photo.webp'])
})

test('long CMS text fields accept 4000 characters but reject longer values', () => {
  assert.equal(isValidSiteSettingsString('aboutPresentationText', 'a'.repeat(4000)), true)
  assert.equal(isValidSiteSettingsString('aboutLocationText', 'a'.repeat(4001)), false)
  assert.equal(isValidSiteSettingsString('aboutMissionText', 'a'.repeat(4000)), true)
  assert.equal(isValidSiteSettingsString('heroTitle', 'a'.repeat(2001)), false)
})
