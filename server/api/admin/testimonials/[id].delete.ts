import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  const supabase = supabaseAdmin
  const { data, error } = await supabase.from('testimonials').delete().eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('Erreur de suppression du témoignage:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer le témoignage' })
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Témoignage introuvable' })
  return { success: true }
})
