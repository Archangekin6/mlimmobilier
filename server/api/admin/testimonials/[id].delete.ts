import { getPublicStoragePath } from '~~/server/utils/storage'
import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  const supabase = supabaseAdmin
  const { data: current, error: readError } = await supabase.from('testimonials').select('photo_url').eq('id', id).maybeSingle()
  if (readError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire le témoignage' })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Témoignage introuvable' })
  const { data, error } = await supabase.from('testimonials').delete().eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('Erreur de suppression du témoignage:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer le témoignage' })
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Témoignage introuvable' })
  let cleanupWarning: string | undefined
  const photoPath = current.photo_url ? getPublicStoragePath('site-images', current.photo_url) : null
  if (photoPath) {
    const { error: removeError } = await supabase.storage.from('site-images').remove([photoPath])
    if (removeError) {
      console.error('Suppression de la photo du témoignage impossible:', removeError.message)
      cleanupWarning = 'Le témoignage est supprimé, mais sa photo n’a pas pu être supprimée du stockage.'
    }
  }
  return { success: true, cleanupWarning }
})
