import { supabaseAdmin } from '~~/server/utils/supabase'
import { getPublicStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'
import { validateTestimonialPayload } from '~~/server/utils/testimonial-validation'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  const body = validateTestimonialPayload(await readBody(event), true)

  const supabase = supabaseAdmin
  let oldPhotoUrl: string | null = null
  if (Object.hasOwn(body, 'photo_url')) {
    const { data: current, error: currentError } = await supabase
      .from('testimonials').select('photo_url').eq('id', id).maybeSingle()
    if (currentError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire la photo actuelle' })
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Témoignage introuvable' })
    oldPhotoUrl = current.photo_url
  }
  const { data, error } = await supabase.from('testimonials').update(body).eq('id', id).select('*').maybeSingle()
  if (error) {
    console.error('Erreur de mise à jour du témoignage:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de modifier le témoignage' })
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Témoignage introuvable' })
  let cleanupWarning: string | undefined
  if (oldPhotoUrl && body.photo_url !== oldPhotoUrl) {
    const oldPath = getPublicStoragePath('site-images', oldPhotoUrl)
    if (oldPath) {
      const cleanup = await removeStorageFileIfUnused('site-images', oldPath)
      cleanupWarning = cleanup.warning
    }
  }
  return { ...data, cleanupWarning }
})
