import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const { data, error } = await supabaseAdmin
    .from('site_services')
    .select('slug, home_title, detail_title, badge, home_description, home_highlights, detail_description, detail_items, display_order, published')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Erreur de chargement des services administratifs:', error.message)
    throw createError({ statusCode: 503, statusMessage: 'Les services sont temporairement indisponibles' })
  }

  return data
})
