import { randomUUID } from 'node:crypto'
import { validateSiteImageFile } from '~~/server/utils/image-validation'
import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const parts = await readMultipartFormData(event)
  const files = parts?.filter(part => part.name === 'file') ?? []
  const buckets = parts?.filter(part => part.name === 'bucket') ?? []
  if (files.length !== 1 || buckets.length !== 1 || parts?.some(part => !['file', 'bucket'].includes(part.name || ''))) {
    throw createError({ statusCode: 400, statusMessage: 'Formulaire d’image invalide' })
  }

  const bucketName = buckets[0]?.data.toString('utf8')
  if (bucketName !== 'site-images' && bucketName !== 'project-images') {
    throw createError({ statusCode: 400, statusMessage: 'Bucket d’image non autorisé' })
  }

  const file = files[0]
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Fichier image manquant' })
  const validated = validateSiteImageFile(file)
  const storagePath = `${randomUUID()}.${validated.extension}`
  const supabase = supabaseAdmin
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, validated.data, {
      cacheControl: '3600',
      contentType: validated.contentType,
      upsert: false
    })

  if (error) {
    console.error('Erreur d’upload Supabase Storage:', error.message)
    throw createError({ statusCode: 502, statusMessage: 'Échec du téléchargement de l’image' })
  }

  return {
    success: true,
    url: supabase.storage.from(bucketName).getPublicUrl(data.path).data.publicUrl,
    storagePath: data.path
  }
})
