import { resetAdminSiteImage } from '~~/server/utils/site-images'

export default defineEventHandler(async (event) => {
  const imageId = getRouterParam(event, 'id')
  if (!imageId) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant d’image manquant' })
  }

  const result = await resetAdminSiteImage(event, imageId, false)

  return {
    success: true,
    message: result.cleanupWarning
      ? `Image supprimée du stockage. ${result.cleanupWarning}`
      : 'Image supprimée du stockage',
    image: result.image,
    cleanupWarning: result.cleanupWarning
  }
})
