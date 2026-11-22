import { uploadAdminSiteImage } from '~~/server/utils/site-images'

export default defineEventHandler(async (event) => {
  const imageId = getRouterParam(event, 'id')
  if (!imageId) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant d’image manquant' })
  }

  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier image manquant' })
  }

  const fileParts = parts.filter(part => part.name === 'file')
  const altTextParts = parts.filter(part => part.name === 'alt_text')

  if (
    fileParts.length !== 1 ||
    altTextParts.length > 1 ||
    parts.some(part => part.name !== 'file' && part.name !== 'alt_text')
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Formulaire d’image invalide' })
  }

  const file = fileParts[0]
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier image manquant' })
  }

  let altText: string | undefined
  const altTextPart = altTextParts[0]
  if (altTextPart) {
    altText = altTextPart.data.toString('utf8')
    if (altText.length > 5000) {
      throw createError({ statusCode: 400, statusMessage: 'Texte alternatif trop long' })
    }
  }

  const result = await uploadAdminSiteImage(event, imageId, file, altText)

  return {
    success: true,
    message: result.cleanupWarning
      ? `Image mise à jour. ${result.cleanupWarning}`
      : 'Image mise à jour avec succès',
    image: result.image,
    cleanupWarning: result.cleanupWarning
  }
})
