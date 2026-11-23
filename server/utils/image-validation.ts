import { extname } from 'node:path'
import { createError } from 'h3'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export interface MultipartImagePart {
  data: Buffer
  name?: string
  filename?: string
  type?: string
}

export interface ValidatedImage {
  data: Buffer
  contentType: string
  extension: string
}

function detectImageType(data: Buffer): { contentType: string; extensions: string[] } | null {
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) return { contentType: 'image/png', extensions: ['png'] }

  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { contentType: 'image/jpeg', extensions: ['jpg', 'jpeg'] }
  }

  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) return { contentType: 'image/webp', extensions: ['webp'] }

  if (data.length >= 6 && ['GIF87a', 'GIF89a'].includes(data.toString('ascii', 0, 6))) {
    return { contentType: 'image/gif', extensions: ['gif'] }
  }

  if (data.length >= 16 && data.toString('ascii', 4, 8) === 'ftyp') {
    const brands: string[] = [data.toString('ascii', 8, 12)]
    for (let offset = 16; offset + 4 <= Math.min(data.length, 64); offset += 4) {
      brands.push(data.toString('ascii', offset, offset + 4))
    }
    if (brands.some(brand => brand === 'avif' || brand === 'avis')) {
      return { contentType: 'image/avif', extensions: ['avif'] }
    }
  }

  return null
}

export function validateSiteImageFile(file: MultipartImagePart): ValidatedImage {
  if (!file.filename) throw createError({ statusCode: 400, statusMessage: 'Nom de fichier manquant' })
  if (file.data.length === 0) throw createError({ statusCode: 400, statusMessage: 'Le fichier image est vide' })
  if (file.data.length > MAX_IMAGE_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'L’image dépasse la limite de 5 Mo' })
  }

  const detectedType = detectImageType(file.data)
  const declaredType = file.type?.toLowerCase()
  const extension = extname(file.filename).slice(1).toLowerCase()
  if (
    !detectedType ||
    declaredType !== detectedType.contentType ||
    !detectedType.extensions.includes(extension)
  ) {
    throw createError({
      statusCode: 415,
      statusMessage: 'Format d’image non autorisé ou incohérent'
    })
  }

  return { data: file.data, contentType: detectedType.contentType, extension }
}
