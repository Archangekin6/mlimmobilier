import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    // Récupérer le fichier du formulaire
    const files = await readMultipartFormData(event)
    const file = files?.find(part => part.name === 'file')

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Aucun fichier fourni'
      })
    }

    // Validation du type de fichier
    if (!file.type?.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le fichier doit être une image'
      })
    }

    // Validation de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'L\'image doit peser moins de 5MB'
      })
    }

    // Créer un nom de fichier unique
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.filename?.split('.').pop() || 'jpg'
    const filename = `img-${timestamp}-${randomStr}.${ext}`

    // Créer le dossier s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Sauvegarder le fichier
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, file.data)

    // Retourner l'URL publique
    return {
      success: true,
      url: `/uploads/${filename}`,
      filename
    }
  } catch (error) {
    console.error('Erreur upload:', error)
    
    if (error instanceof H3Error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du téléchargement'
    })
  }
})
