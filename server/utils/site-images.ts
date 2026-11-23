import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { supabaseAdmin } from '~~/server/utils/supabase'
import { validateSiteImageFile, type MultipartImagePart } from '~~/server/utils/image-validation'

const DEFAULT_SITE_IMAGES = [
  {
    page: 'home',
    section: 'hero_background',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    alt_text: 'Architecture contemporaine ML Immobilier'
  },
  {
    page: 'about',
    section: 'hero_background',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80',
    alt_text: 'Architecture moderne Abidjan'
  },
  {
    page: 'about',
    section: 'presentation_image',
    image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
    alt_text: 'Équipe technique ML Immobilier SARL'
  },
  {
    page: 'services',
    section: 'btp_section_image',
    image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    alt_text: 'Travaux de construction BTP ML Immobilier'
  },
  {
    page: 'services',
    section: 'electrification_section_image',
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80',
    alt_text: 'Travaux d’Électrification et réseau HTA/BTA'
  },
  {
    page: 'services',
    section: 'gestion_section_image',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
    alt_text: 'Gestion immobilière à Abidjan ML Immobilier'
  }
] as const

export async function getAdminSiteImage(event: H3Event, imageId: string) {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(imageId)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant d’image invalide' })
  }

  const supabase = supabaseAdmin
  const { data: image, error } = await supabase
    .from('site_images')
    .select('*')
    .eq('id', imageId)
    .maybeSingle()

  if (error) {
    console.error('Erreur de lecture de l’image du site:', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de lire l’image' })
  }

  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'Image non trouvée' })
  }

  return { supabase, image }
}

function findDefaultSiteImage(page: string, section: string) {
  return DEFAULT_SITE_IMAGES.find(image => image.page === page && image.section === section)
}

function isSafeStoragePath(storagePath: string): boolean {
  return Boolean(
    storagePath &&
    storagePath.length <= 1024 &&
    !storagePath.startsWith('/') &&
    !storagePath.includes('\\') &&
    !storagePath.includes('\0') &&
    storagePath.split('/').every(segment => segment && segment !== '.' && segment !== '..')
  )
}

export async function resetAdminSiteImage(
  event: H3Event,
  imageId: string,
  resetAltText: boolean
) {
  const { supabase, image } = await getAdminSiteImage(event, imageId)
  const defaults = findDefaultSiteImage(image.page, image.section)

  if (!defaults) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Aucune image par défaut connue pour cet emplacement'
    })
  }

  const update = {
    image_url: defaults.image_url,
    storage_path: '',
    ...(resetAltText ? { alt_text: defaults.alt_text } : {})
  }

  const { data: updatedImage, error: updateError } = await supabase
    .from('site_images')
    .update(update)
    .eq('id', image.id)
    .eq('storage_path', image.storage_path)
    .select('*')
    .maybeSingle()

  if (updateError) {
    console.error('Erreur de réinitialisation de l’image du site:', updateError)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de réinitialiser l’image' })
  }

  if (!updatedImage) {
    throw createError({
      statusCode: 409,
      statusMessage: 'L’image a été modifiée entre-temps. Rechargez la page et réessayez.'
    })
  }

  let cleanupWarning: string | undefined
  if (image.storage_path) {
    if (!isSafeStoragePath(image.storage_path)) {
      cleanupWarning = 'Le fichier précédent n’a pas pu être supprimé automatiquement.'
      console.error('Chemin Storage invalide ignoré lors de la réinitialisation:', image.storage_path)
    } else {
      const { error: removeError } = await supabase.storage
        .from('site-images')
        .remove([image.storage_path])

      if (removeError) {
        cleanupWarning = 'Le fichier précédent n’a pas pu être supprimé automatiquement.'
        console.error('Erreur de suppression de l’ancienne image:', removeError)
      }
    }
  }

  return { image: updatedImage, cleanupWarning }
}

export async function deleteAdminSiteImage(event: H3Event, imageId: string) {
  const { supabase, image } = await getAdminSiteImage(event, imageId)
  const { data: updatedImage, error: updateError } = await supabase
    .from('site_images')
    .update({ image_url: '', storage_path: '' })
    .eq('id', image.id)
    .eq('storage_path', image.storage_path)
    .select('*')
    .maybeSingle()

  if (updateError) {
    console.error('Erreur de suppression de la référence d’image:', updateError)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de supprimer l’image' })
  }
  if (!updatedImage) {
    throw createError({
      statusCode: 409,
      statusMessage: 'L’image a été modifiée entre-temps. Rechargez la page et réessayez.'
    })
  }

  let cleanupWarning: string | undefined
  if (image.storage_path) {
    if (!isSafeStoragePath(image.storage_path)) {
      cleanupWarning = 'Le fichier précédent n’a pas pu être supprimé automatiquement.'
      console.error('Chemin Storage invalide ignoré lors de la suppression:', image.storage_path)
    } else {
      const { error: removeError } = await supabase.storage
        .from('site-images')
        .remove([image.storage_path])

      if (removeError) {
        cleanupWarning = 'Le fichier précédent n’a pas pu être supprimé automatiquement.'
        console.error('Erreur de suppression de l’ancienne image:', removeError)
      }
    }
  }

  return { image: updatedImage, cleanupWarning }
}

export async function uploadAdminSiteImage(
  event: H3Event,
  imageId: string,
  file: MultipartImagePart,
  altText?: string
) {
  const { supabase, image } = await getAdminSiteImage(event, imageId)
  const validatedImage = validateSiteImageFile(file)
  const storagePath = `${randomUUID()}.${validatedImage.extension}`

  const { data: uploadedFile, error: uploadError } = await supabase.storage
    .from('site-images')
    .upload(storagePath, validatedImage.data, {
      cacheControl: '3600',
      contentType: validatedImage.contentType,
      upsert: false
    })

  if (uploadError) {
    console.error('Erreur de téléchargement de l’image:', uploadError)
    throw createError({ statusCode: 502, statusMessage: 'Échec du téléchargement de l’image' })
  }

  const imageUrl = supabase.storage.from('site-images').getPublicUrl(uploadedFile.path).data.publicUrl
  const update = {
    image_url: imageUrl,
    storage_path: uploadedFile.path,
    ...(altText !== undefined ? { alt_text: altText } : {})
  }

  const { data: updatedImage, error: updateError } = await supabase
    .from('site_images')
    .update(update)
    .eq('id', image.id)
    .eq('storage_path', image.storage_path)
    .select('*')
    .maybeSingle()

  if (updateError || !updatedImage) {
    const { error: rollbackError } = await supabase.storage
      .from('site-images')
      .remove([uploadedFile.path])

    if (rollbackError) {
      console.error('Échec du nettoyage de l’image téléversée après erreur de mise à jour:', rollbackError)
    }

    if (updateError) {
      console.error('Erreur de mise à jour de la référence d’image:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Échec de la mise à jour de la base de données'
      })
    }

    throw createError({
      statusCode: 409,
      statusMessage: 'L’image a été modifiée entre-temps. Rechargez la page et réessayez.'
    })
  }

  let cleanupWarning: string | undefined
  if (image.storage_path) {
    if (!isSafeStoragePath(image.storage_path)) {
      cleanupWarning = 'L’ancienne image n’a pas pu être supprimée automatiquement.'
      console.error('Chemin Storage invalide ignoré lors du remplacement:', image.storage_path)
    } else {
      const { error: removeError } = await supabase.storage
        .from('site-images')
        .remove([image.storage_path])

      if (removeError) {
        cleanupWarning = 'L’ancienne image n’a pas pu être supprimée automatiquement.'
        console.error('Erreur de suppression de l’ancienne image:', removeError)
      }
    }
  }

  return { image: updatedImage, cleanupWarning }
}
