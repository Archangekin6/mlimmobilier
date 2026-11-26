import assert from 'node:assert/strict'
import test from 'node:test'
import { validateTestimonialPayload } from '../server/utils/testimonial-validation.ts'

test('testimonial creation accepts the managed fields and leaves optional values unset', () => {
  const payload = {
    client_name: 'Client',
    client_location: 'Abidjan',
    service_type: 'btp',
    rating: 5,
    testimonial_text: 'Avis transmis par le client.',
    published: false,
    featured: false
  }

  assert.deepEqual(validateTestimonialPayload(payload), payload)
})

test('testimonial updates allow publication and featured flags as partial changes', () => {
  assert.deepEqual(validateTestimonialPayload({ published: true }, true), { published: true })
  assert.deepEqual(validateTestimonialPayload({ featured: false }, true), { featured: false })
})

test('testimonial validation rejects invalid ratings and fields removed from the editor', () => {
  assert.throws(() => validateTestimonialPayload({
    client_name: 'Client',
    testimonial_text: 'Avis.',
    rating: 6
  }), { statusCode: 400 })
  assert.throws(() => validateTestimonialPayload({
    client_name: 'Client',
    testimonial_text: 'Avis.',
    id: 'existing-id'
  }), { statusCode: 400 })
  assert.throws(() => validateTestimonialPayload({
    client_name: 'Client',
    testimonial_text: 'Avis.',
    display_order: 2
  }), { statusCode: 400 })
})
