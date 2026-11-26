import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateProjectCreatePayload,
  validateProjectUpdatePayload
} from '../server/utils/project-validation.ts'

const supabaseUrl = 'https://mlimmobilier.supabase.co'
const imageUrl = `${supabaseUrl}/storage/v1/object/public/project-images/cover.webp`
const imageStoragePath = 'cover.webp'

test('new projects accept only the simplified fields and are always published', () => {
  process.env.NUXT_PUBLIC_SUPABASE_URL = supabaseUrl
  assert.deepEqual(validateProjectCreatePayload({
    title: '  Réalisation  ',
    category: 'btp',
    location: '  Abidjan  ',
    description: '  Description courte.  ',
    imageUrl,
    imageStoragePath,
    featured: false
  }), {
    title: 'Réalisation',
    category: 'btp',
    location: 'Abidjan',
    description: 'Description courte.',
    imageUrl,
    imageStoragePath,
    featured: false,
    published: true
  })
})

test('new project validation rejects removed form fields and mismatched image paths', () => {
  process.env.NUXT_PUBLIC_SUPABASE_URL = supabaseUrl
  const payload = {
    title: 'Réalisation',
    category: 'btp',
    location: '',
    description: 'Description.',
    imageUrl,
    imageStoragePath
  }

  assert.throws(() => validateProjectCreatePayload({ ...payload, published: false }), { statusCode: 400 })
  assert.throws(() => validateProjectCreatePayload({ ...payload, date: '2024-01-01' }), { statusCode: 400 })
  assert.throws(() => validateProjectCreatePayload({ ...payload, galleryImages: [] }), { statusCode: 400 })
  assert.throws(() => validateProjectCreatePayload({ ...payload, imageStoragePath: 'another.webp' }), { statusCode: 400 })
})

test('project updates accept publication toggles and confirmed cover removal', () => {
  assert.deepEqual(validateProjectUpdatePayload({ published: false }), { published: false })
  assert.deepEqual(validateProjectUpdatePayload({ featured: true }), { featured: true })
  assert.deepEqual(validateProjectUpdatePayload({ imageUrl: null, imageStoragePath: null }), {
    imageUrl: null,
    imageStoragePath: null
  })
  assert.throws(() => validateProjectUpdatePayload({ imageUrl }), { statusCode: 400 })
  assert.throws(() => validateProjectUpdatePayload({ galleryImages: [] }), { statusCode: 400 })
})
