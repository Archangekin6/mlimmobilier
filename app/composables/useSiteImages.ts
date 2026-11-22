export interface SiteImage {
  id: string
  page: string
  section: string
  description: string
  image_url: string
  storage_path: string
  alt_text: string | null
  display_order: number | null
  created_at: string
  updated_at: string
}

interface ApiResult {
  success: boolean
  message?: string
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = error.data
    if (typeof data === 'object' && data !== null && 'statusMessage' in data) {
      const { statusMessage } = data
      if (typeof statusMessage === 'string') {
        return statusMessage
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function useSiteImages() {
  const supabase = useSupabaseClient()
  const siteImages = useState<SiteImage[]>('site-images', () => [])
  const isLoading = useState<boolean>('site-images-loading', () => false)
  const error = useState<string | null>('site-images-error', () => null)
  const isFetched = useState<boolean>('site-images-fetched', () => false)

  const fetchSiteImages = async (forceRefresh = false) => {
    if (isFetched.value && !forceRefresh) {
      return siteImages.value
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('site_images')
        .select('*')
        .order('page', { ascending: true })
        .order('display_order', { ascending: true })

      if (fetchError) {
        error.value = fetchError.message
        console.error('Error fetching site images:', fetchError)
        return []
      }

      siteImages.value = data || []
      isFetched.value = true
      return siteImages.value
    } catch (fetchError: unknown) {
      const message = getErrorMessage(fetchError, 'Erreur lors du chargement des images')
      error.value = message
      console.error('Exception fetching site images:', fetchError)
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getImageBySection = (page: string, section: string): SiteImage | null => {
    return siteImages.value.find(image => image.page === page && image.section === section) || null
  }

  const getImagesByPage = (page: string): SiteImage[] => {
    return siteImages.value.filter(image => image.page === page)
  }

  const updateSiteImage = async (
    imageId: string,
    file: File,
    altText?: string
  ): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (altText !== undefined) {
        formData.append('alt_text', altText)
      }

      const result = await $fetch<ApiResult>(
        `/api/admin/site-images/${encodeURIComponent(imageId)}/image`,
        { method: 'POST', body: formData }
      )

      await fetchSiteImages(true)
      return {
        success: result.success,
        message: result.message || 'Image mise à jour avec succès'
      }
    } catch (updateError: unknown) {
      const message = getErrorMessage(updateError, 'Erreur lors de la mise à jour')
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteSiteImage = async (
    imageId: string
  ): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await $fetch<ApiResult>(
        `/api/admin/site-images/${encodeURIComponent(imageId)}/image`,
        { method: 'DELETE' }
      )

      await fetchSiteImages(true)
      return {
        success: result.success,
        message: result.message || 'Image supprimée du stockage'
      }
    } catch (deleteError: unknown) {
      const message = getErrorMessage(deleteError, 'Erreur lors de la suppression')
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const resetSiteImage = async (
    imageId: string
  ): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await $fetch<ApiResult>(
        `/api/admin/site-images/${encodeURIComponent(imageId)}/reset`,
        { method: 'POST' }
      )

      await fetchSiteImages(true)
      return {
        success: result.success,
        message: result.message || 'Image réinitialisée avec succès'
      }
    } catch (resetError: unknown) {
      const message = getErrorMessage(resetError, 'Erreur lors de la réinitialisation')
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const updateAltText = async (
    imageId: string,
    altText: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await $fetch<ApiResult>(`/api/admin/site-images/${encodeURIComponent(imageId)}`, {
        method: 'PATCH',
        body: { alt_text: altText }
      })

      await fetchSiteImages(true)
      return { success: true, message: 'Texte alternatif mis à jour' }
    } catch (updateError: unknown) {
      const message = getErrorMessage(updateError, 'Erreur lors de la mise à jour')
      error.value = message
      return { success: false, message }
    }
  }

  return {
    siteImages,
    isLoading,
    error,
    fetchSiteImages,
    getImageBySection,
    getImagesByPage,
    updateSiteImage,
    deleteSiteImage,
    resetSiteImage,
    updateAltText
  }
}
