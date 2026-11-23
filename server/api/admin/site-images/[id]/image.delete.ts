import { deleteAdminSiteImage } from '~~/server/utils/site-images'

export default defineEventHandler(async (event) => {
  const imageId = getRouterParam(event, 'id')
  if (!imageId) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant d’image manquant' })
  }

  const result = await deleteAdminSiteImage(event, imageId)

  return {
    success: true,
    message: result.cleanupWarning
      ? `Référence supprimée. ${result.cleanupWarning}`
      : 'Image supprimée',
    image: result.image,
    cleanupWarning: result.cleanupWarning
  }
})
