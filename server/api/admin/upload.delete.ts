import { isSafeStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const body = await readBody<{ bucket?: unknown; storagePath?: unknown }>(event)
  if (
    (body?.bucket !== 'site-images' && body?.bucket !== 'project-images') ||
    typeof body.storagePath !== 'string' ||
    !isSafeStoragePath(body.storagePath)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Référence Storage invalide' })
  }

  const result = await removeStorageFileIfUnused(body.bucket, body.storagePath)
  return {
    success: true,
    removed: result.removed,
    message: result.warning || (result.referenced
      ? 'Le fichier est toujours utilisé et a été conservé.'
      : result.removed ? 'Image supprimée du stockage.' : 'Aucune suppression nécessaire.')
  }
})
