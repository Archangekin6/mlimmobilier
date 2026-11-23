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
