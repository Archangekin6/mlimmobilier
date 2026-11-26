import { supabaseAdmin } from '~~/server/utils/supabase'
import { validateTestimonialPayload } from '~~/server/utils/testimonial-validation'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const body = validateTestimonialPayload(await readBody(event))
  const supabase = supabaseAdmin
  const { data: lastTestimonial, error: orderError } = await supabase
    .from('testimonials')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (orderError) {
    console.error('Erreur de calcul de l’ordre des témoignages:', orderError.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de préparer le nouvel ordre du témoignage' })
  }

  const { data, error } = await supabase
    .from('testimonials')
    .insert({ ...body, display_order: (lastTestimonial?.display_order ?? -1) + 1 })
    .select('*')
    .single()
  if (error) {
    console.error('Erreur de création du témoignage:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de créer le témoignage' })
  }
  return data
})
