<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSiteImages } from '~/composables/useSiteImages'

definePageMeta({
  layout: 'admin'
})

const {
  siteImages,
  isLoading,
  error,
  fetchSiteImages,
  updateSiteImage,
  resetSiteImage,
  updateAltText
} = useSiteImages()

// UI state
const selectedFile = ref<File | null>(null)
const selectedImageId = ref<string | null>(null)
const previewUrl = ref<string | null>(null)
const altTextEdit = ref<{ [key: string]: string }>({})
const uploadProgress = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const filterPage = ref<string>('all')

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

// Load images on mount
onMounted(async () => {
  await fetchSiteImages()
  // Initialize alt text edits
  siteImages.value.forEach(img => {
    altTextEdit.value[img.id] = img.alt_text || ''
  })
})

// Computed: Filtered images by page
const filteredImages = computed(() => {
  if (filterPage.value === 'all') {
    return siteImages.value
  }
  return siteImages.value.filter(img => img.page === filterPage.value)
})

// Computed: Group images by page
const imagesByPage = computed(() => {
  const groups: { [key: string]: typeof siteImages.value } = {}
  filteredImages.value.forEach(img => {
    const pageImages = groups[img.page] || (groups[img.page] = [])
    pageImages.push(img)
  })
  return groups
})

// Page labels
const pageLabels: { [key: string]: string } = {
  home: 'Page Accueil',
  about: 'Page Qui sommes-nous',
  services: 'Page Services',
  contact: 'Page Contact',
  realisations: 'Page Réalisations'
}

// Handle file selection
const onFileSelect = (event: Event, imageId: string) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Le fichier doit être une image'
      return
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      errorMessage.value = 'L\'image doit peser moins de 5 MB'
      return
    }
    
    selectedFile.value = file
    selectedImageId.value = imageId
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    errorMessage.value = null
  }
}

// Upload image
const handleUpload = async () => {
  if (!selectedFile.value || !selectedImageId.value) return
  
  uploadProgress.value = true
  errorMessage.value = null
  successMessage.value = null
  
  try {
    const result = await updateSiteImage(
      selectedImageId.value,
      selectedFile.value,
      altTextEdit.value[selectedImageId.value]
    )
    
    if (result.success) {
      successMessage.value = result.message
      selectedFile.value = null
      selectedImageId.value = null
      previewUrl.value = null
      
      // Scroll to top to show success message
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        successMessage.value = null
      }, 5000)
    } else {
      errorMessage.value = result.message
    }
  } catch (err: unknown) {
    errorMessage.value = getErrorMessage(err, 'Erreur lors du téléchargement')
  } finally {
    uploadProgress.value = false
  }
}

// Cancel upload
const cancelUpload = () => {
  selectedFile.value = null
  selectedImageId.value = null
  previewUrl.value = null
  errorMessage.value = null
}

// Reset image to default
const handleReset = async (imageId: string) => {
  if (!confirm('Voulez-vous vraiment réinitialiser cette image ?')) {
    return
  }
  
  uploadProgress.value = true
  errorMessage.value = null
  successMessage.value = null
  
  try {
    const result = await resetSiteImage(imageId)
    
    if (result.success) {
      successMessage.value = result.message
      setTimeout(() => {
        successMessage.value = null
      }, 5000)
    } else {
      errorMessage.value = result.message
    }
  } catch (err: unknown) {
    errorMessage.value = getErrorMessage(err, 'Erreur lors de la réinitialisation')
  } finally {
    uploadProgress.value = false
  }
}

// Save alt text
const saveAltText = async (imageId: string) => {
  uploadProgress.value = true
  errorMessage.value = null
  successMessage.value = null
  
  try {
    const result = await updateAltText(imageId, altTextEdit.value[imageId] ?? '')
    
    if (result.success) {
      successMessage.value = 'Texte alternatif mis à jour'
      setTimeout(() => {
        successMessage.value = null
      }, 3000)
    } else {
      errorMessage.value = result.message
    }
  } catch (err: unknown) {
    errorMessage.value = getErrorMessage(err, 'Erreur lors de la mise à jour')
  } finally {
    uploadProgress.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
          Gestion des Images du Site
        </h2>
        <p class="text-xs text-neutral-500 mt-0.5">
          Gérer toutes les images des pages publiques depuis cette interface.
        </p>
      </div>

      <NuxtLink
        to="/admin"
        class="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-semibold text-xs uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-xs"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5 text-neutral-700" />
        <span>Retour au tableau de bord</span>
      </NuxtLink>
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="p-4 rounded-sm bg-emerald-50 text-emerald-950 border border-emerald-200 flex items-start gap-3">
      <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <div>
        <div class="font-bold text-sm text-emerald-800">Succès</div>
        <div class="text-xs text-emerald-800/90 mt-0.5">{{ successMessage }}</div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="p-4 rounded-sm bg-red-50 text-red-950 border border-red-200 flex items-start gap-3">
      <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <div class="font-bold text-sm text-red-800">Erreur</div>
        <div class="text-xs text-red-800/90 mt-0.5">{{ errorMessage }}</div>
      </div>
    </div>

    <!-- Filter by Page -->
    <div class="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 border border-neutral-200 rounded-sm w-fit">
      <button
        type="button"
        @click="filterPage = 'all'"
        :class="filterPage === 'all' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
        class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
      >
        Toutes les pages
      </button>
      <button
        type="button"
        @click="filterPage = 'home'"
        :class="filterPage === 'home' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
        class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
      >
        Accueil
      </button>
      <button
        type="button"
        @click="filterPage = 'about'"
        :class="filterPage === 'about' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
        class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
      >
        Qui sommes-nous
      </button>
      <button
        type="button"
        @click="filterPage = 'services'"
        :class="filterPage === 'services' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
        class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
      >
        Services
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !uploadProgress" class="text-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-2" />
      <p class="text-xs text-neutral-500 uppercase tracking-wider">Chargement des images...</p>
    </div>

    <!-- Images by Page -->
    <div v-else class="space-y-8">
      <div v-for="(images, page) in imagesByPage" :key="page" class="space-y-4">
        <!-- Page Title -->
        <h3 class="text-lg font-bold text-neutral-950 uppercase tracking-wider border-b border-neutral-200 pb-2">
          {{ pageLabels[page] || page }}
        </h3>

        <!-- Images Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="image in images"
            :key="image.id"
            class="bg-white border border-neutral-200 rounded-md p-5 space-y-4 shadow-xs hover:border-neutral-300 transition-all"
          >
            <!-- Image Info -->
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-neutral-950 text-sm">{{ image.description }}</h4>
                <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-sm border border-neutral-200">
                  {{ image.section }}
                </span>
              </div>
            </div>

            <!-- Image Preview -->
            <div class="relative rounded-sm overflow-hidden bg-neutral-100 border border-neutral-200 h-48">
              <img
                :src="selectedImageId === image.id && previewUrl ? previewUrl : image.image_url"
                :alt="image.alt_text || image.description"
                class="w-full h-full object-cover"
              />
              <div v-if="selectedImageId === image.id && previewUrl" class="absolute top-2 right-2">
                <span class="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                  Aperçu
                </span>
              </div>
            </div>

            <!-- Alt Text -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider">
                Texte alternatif (ALT)
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model="altTextEdit[image.id]"
                  type="text"
                  :placeholder="`Description de l'image pour l'accessibilité`"
                  class="flex-1 px-3 py-2 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none"
                />
                <button
                  type="button"
                  @click="saveAltText(image.id)"
                  :disabled="uploadProgress"
                  class="px-3 py-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900 font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <UIcon name="i-heroicons-check" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-2 pt-2 border-t border-neutral-100">
              <!-- Upload Section -->
              <div v-if="selectedImageId === image.id && selectedFile" class="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-sm">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-semibold text-blue-900">
                    Image sélectionnée : {{ selectedFile.name }}
                  </div>
                  <button
                    type="button"
                    @click="cancelUpload"
                    class="text-xs text-blue-700 hover:text-blue-900 font-semibold uppercase tracking-wider"
                  >
                    Annuler
                  </button>
                </div>
                <button
                  type="button"
                  @click="handleUpload"
                  :disabled="uploadProgress"
                  class="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-sm transition-all"
                >
                  <UIcon v-if="!uploadProgress" name="i-heroicons-arrow-up-tray" class="w-4 h-4 text-white" />
                  <UIcon v-else name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-white" />
                  <span>{{ uploadProgress ? 'Téléchargement...' : 'Confirmer le remplacement' }}</span>
                </button>
              </div>

              <!-- File Input -->
              <div v-else class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label class="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="(e) => onFileSelect(e, image.id)"
                    :disabled="uploadProgress"
                  />
                  <div class="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-sm transition-all text-center">
                    <UIcon name="i-heroicons-photo" class="w-4 h-4 text-white" />
                    <span>Remplacer l'image</span>
                  </div>
                </label>

                <button
                  type="button"
                  @click="handleReset(image.id)"
                  :disabled="uploadProgress || !image.storage_path"
                  class="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 disabled:opacity-50 text-neutral-800 border border-neutral-300 font-semibold text-xs uppercase tracking-wider py-2.5 px-4 rounded-sm transition-colors"
                >
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-neutral-700" />
                  <span>Réinitialiser</span>
                </button>
              </div>

              <p class="text-[10px] text-neutral-500 uppercase tracking-wider">
                Format : JPG, PNG, WebP • Taille max : 5 MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredImages.length === 0" class="text-center py-16 bg-neutral-50 rounded-md border border-neutral-200">
      <UIcon name="i-heroicons-photo" class="w-10 h-10 text-neutral-400 mx-auto mb-2" />
      <h3 class="text-sm font-bold text-neutral-900 uppercase tracking-wider">Aucune image trouvée</h3>
      <p class="text-xs text-neutral-500 mt-1">Changez le filtre ou configurez Supabase.</p>
    </div>
  </div>
</template>
