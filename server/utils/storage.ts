export function getPublicStoragePath(
  bucket: 'site-images' | 'project-images',
  imageUrl: string
): string | null {
  const configuredUrl = process.env.NUXT_PUBLIC_SUPABASE_URL?.trim()
  if (!configuredUrl) return null

  try {
    const url = new URL(imageUrl)
    const supabaseUrl = new URL(configuredUrl)
    const prefix = `/storage/v1/object/public/${bucket}/`
    if (url.origin !== supabaseUrl.origin || !url.pathname.startsWith(prefix)) return null
    const path = decodeURIComponent(url.pathname.slice(prefix.length))
    if (
      !path ||
      path.length > 1024 ||
      path.startsWith('/') ||
      path.includes('\\') ||
      path.includes('\0') ||
      path.split('/').some(part => !part || part === '.' || part === '..')
    ) return null
    return path
  } catch {
    return null
  }
}

export function isSafeStoragePath(storagePath: string): boolean {
  return Boolean(
    storagePath &&
    storagePath.length <= 1024 &&
    !storagePath.startsWith('/') &&
    !storagePath.includes('\\') &&
    !storagePath.includes('\0') &&
    storagePath.split('/').every(segment => segment && segment !== '.' && segment !== '..')
  )
}

interface StorageQueryResult {
  data: unknown[] | null
  error: { message: string } | null
}

export interface StorageCleanupClient {
  from(table: 'site_images' | 'project_images' | 'projects' | 'testimonials' | 'site_settings'): {
    select(columns: 'id'): {
      eq(column: string, value: string): {
        limit(count: number): PromiseLike<StorageQueryResult>
      }
    }
  }
  storage: {
    from(bucket: 'site-images' | 'project-images'): {
      getPublicUrl(path: string): { data: { publicUrl: string } }
      remove(paths: string[]): PromiseLike<{ error: { message: string } | null }>
    }
  }
}

export async function removeStorageFileIfUnused(
  bucket: 'site-images' | 'project-images',
  storagePath: string,
  client?: StorageCleanupClient
): Promise<{ removed: boolean; referenced: boolean; warning?: string }> {
  if (!isSafeStoragePath(storagePath)) {
    return { removed: false, referenced: false, warning: 'Chemin Storage invalide.' }
  }

  const supabase = client || (await import('~~/server/utils/supabase')).supabaseAdmin
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl
  const [siteImageRefs, siteImageUrlRefs, projectImageRefs, projectImageUrlRefs, projectCoverRefs, testimonialRefs, logoRefs] = await Promise.all([
    supabase.from('site_images').select('id').eq('storage_path', storagePath).limit(1),
    supabase.from('site_images').select('id').eq('image_url', publicUrl).limit(1),
    supabase.from('project_images').select('id').eq('storage_path', storagePath).limit(1),
    supabase.from('project_images').select('id').eq('image_url', publicUrl).limit(1),
    supabase.from('projects').select('id').eq('cover_image_url', publicUrl).limit(1),
    supabase.from('testimonials').select('id').eq('photo_url', publicUrl).limit(1),
    supabase.from('site_settings').select('id').eq('logo_url', publicUrl).limit(1)
  ])
  const referenceResults = [
    siteImageRefs,
    siteImageUrlRefs,
    projectImageRefs,
    projectImageUrlRefs,
    projectCoverRefs,
    testimonialRefs,
    logoRefs
  ]

  if (referenceResults.some(result => result.error)) {
    console.error('Vérification des références Storage impossible:', referenceResults.find(result => result.error)?.error)
    return { removed: false, referenced: false, warning: 'Le fichier a été conservé car ses références n’ont pas pu être vérifiées.' }
  }

  if (referenceResults.some(result => result.data?.length)) {
    return { removed: false, referenced: true }
  }

  const { error } = await supabase.storage.from(bucket).remove([storagePath])
  if (error) {
    console.error('Suppression du fichier Storage impossible:', error.message)
    return { removed: false, referenced: false, warning: 'Le fichier n’a pas pu être supprimé du stockage.' }
  }

  return { removed: true, referenced: false }
}
