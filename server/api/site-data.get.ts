import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0, must-revalidate')

  const supabase = supabaseAdmin
  const [settingsResult, projectsResult, testimonialsResult, servicesResult, projectImagesResult, siteImagesResult] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', '00000000-0000-0000-0000-000000000001').maybeSingle(),
    supabase.from('projects')
      .select('id, title, slug, summary, description, full_description, service_type, location, project_date, start_date, end_date, client_name, cover_image_url, published, featured, display_order')
      .eq('published', true)
      .order('display_order', { ascending: true }),
    supabase.from('testimonials')
      .select('id, client_name, client_function, client_company, client_location, testimonial_text, service_type, rating, photo_url, testimonial_date, published, featured, display_order')
      .eq('published', true)
      .order('display_order', { ascending: true }),
    supabase.from('site_services')
      .select('slug, home_title, detail_title, badge, home_description, home_highlights, detail_description, detail_items, display_order, published')
      .eq('published', true)
      .order('display_order', { ascending: true }),
    supabase.from('project_images')
      .select('id, project_id, image_url, alt_text, is_cover, display_order')
      .order('display_order', { ascending: true }),
    supabase.from('site_images')
      .select('id, page, section, description, image_url, storage_path, alt_text, display_order, created_at, updated_at')
      .order('page', { ascending: true })
      .order('display_order', { ascending: true })
  ])

  for (const result of [settingsResult, projectsResult, testimonialsResult, servicesResult, projectImagesResult, siteImagesResult]) {
    if (result.error) {
      console.error('Erreur de chargement des données publiques Supabase:', result.error.message)
      throw createError({ statusCode: 503, statusMessage: 'Les données du site sont temporairement indisponibles' })
    }
  }

  const projects = projectsResult.data || []
  const projectImages = projectImagesResult.data || []
  return {
    settings: settingsResult.data,
    projects,
    testimonials: testimonialsResult.data,
    services: servicesResult.data,
    siteImages: siteImagesResult.data,
    projectImages: projectImages.filter(image =>
      projects.some(project => project.id === image.project_id)
    )
  }
})
