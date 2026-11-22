import { getAdminSiteImage } from '~~/server/utils/site-images'

export default defineEventHandler(async (event) => {
  const imageId = getRouterParam(event, 'id')
  if (!imageId) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant d’image manquant' })
  }

  const body = await readBody<{ alt_text?: unknown }>(event)
  if (typeof body?.alt_text !== 'string' || body.alt_text.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Texte alternatif invalide' })
  }

  const { supabase, image } = await getAdminSiteImage(event, imageId)
  const { data, error } = await supabase
    .from('site_images')
    .update({ alt_text: body.alt_text })
    .eq('id', image.id)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('Erreur de mise à jour du texte alternatif:', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de mettre à jour le texte alternatif' })
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Image non trouvée' })
  }

  return { success: true, image: data }
})
