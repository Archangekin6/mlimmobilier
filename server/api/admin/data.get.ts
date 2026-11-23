import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const supabase = supabaseAdmin
  const [settingsResult, projectsResult, testimonialsResult, quotesResult, projectImagesResult] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', '00000000-0000-0000-0000-000000000001').maybeSingle(),
    supabase.from('projects').select('*').order('display_order', { ascending: true }),
    supabase.from('testimonials').select('*').order('display_order', { ascending: true }),
    supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('project_images').select('*').order('display_order', { ascending: true })
  ])

  for (const result of [settingsResult, projectsResult, testimonialsResult, quotesResult, projectImagesResult]) {
    if (result.error) {
      console.error('Erreur de chargement des données administratives:', result.error.message)
      throw createError({ statusCode: 503, statusMessage: 'Les données administratives sont temporairement indisponibles' })
    }
  }

  return {
    settings: settingsResult.data,
    projects: projectsResult.data,
    testimonials: testimonialsResult.data,
    quotes: quotesResult.data,
    projectImages: projectImagesResult.data
  }
})
