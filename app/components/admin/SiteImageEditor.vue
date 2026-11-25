<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useSiteImages } from '~/composables/useSiteImages'

const props = defineProps<{
  page: string
  section: string
  title: string
}>()

const {
  getImageBySection,
  fetchSiteImages,
  error: fetchError,
  updateSiteImage,
  deleteSiteImage,
  updateAltText
} = useSiteImages()

const image = computed(() => getImageBySection(props.page, props.section))
const altText = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const isSaving = ref(false)
const message = ref('')
const errorMessage = ref('')

watch(image, (current) => {
  altText.value = current?.alt_text || ''
}, { immediate: true })

const clearPreview = () => {
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

onUnmounted(clearPreview)

const onFileSelect = (event: Event) => {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  errorMessage.value = ''
  message.value = ''
  selectedFile.value = null
  clearPreview()
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Sélectionnez un fichier image valide.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'L’image doit peser au maximum 5 Mo.'
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const chooseFile = () => {
  if (isSaving.value || !fileInput.value) return
  fileInput.value.value = ''
  fileInput.value.click()
}

const cancelUpload = () => {
  selectedFile.value = null
  clearPreview()
  errorMessage.value = ''
}

const saveImage = async () => {
  if (!image.value || !selectedFile.value || isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const result = await updateSiteImage(image.value.id, selectedFile.value, altText.value)
    if (!result.success) {
      errorMessage.value = result.message
      return
    }

    selectedFile.value = null
    clearPreview()
    message.value = result.message
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Impossible d’enregistrer l’image.'
  } finally {
    isSaving.value = false
  }
}

const saveAltText = async () => {
  if (!image.value || isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const result = await updateAltText(image.value.id, altText.value)
    if (result.success) message.value = result.message
    else errorMessage.value = result.message
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Impossible d’enregistrer le texte alternatif.'
  } finally {
    isSaving.value = false
  }
}

const removeImage = async () => {
  if (!image.value?.image_url || isSaving.value) return
  if (!window.confirm(`Supprimer l’image « ${props.title} » ?`)) return

  isSaving.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const result = await deleteSiteImage(image.value.id)
    if (result.success) message.value = result.message
    else errorMessage.value = result.message
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Impossible de supprimer l’image.'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await fetchSiteImages()
})
</script>

<template>
  <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
    <div>
      <h3 class="text-sm font-bold text-neutral-950">{{ title }}</h3>
      <p class="mt-1 text-[11px] text-neutral-500">
        Prévisualisez puis enregistrez l’image dans Supabase Storage.
      </p>
    </div>

    <p v-if="fetchError" role="alert" class="text-xs text-red-700">
      Impossible de charger cet emplacement d’image : {{ fetchError }}
    </p>

    <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
      <div class="flex min-h-40 items-center justify-center overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100">
        <img
        v-if="previewUrl || image?.image_url"
        :src="previewUrl || image?.image_url || ''"
          :alt="altText"
          class="max-h-64 w-full object-contain"
        />
        <p v-else class="p-4 text-center text-xs text-neutral-500">Aucune image définie</p>
      </div>

      <div class="space-y-3">
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          class="hidden"
          :disabled="isSaving"
          @change="onFileSelect"
        >

        <label class="block text-xs font-semibold text-neutral-700">
          Texte alternatif
          <input
            v-model="altText"
            type="text"
            maxlength="5000"
            class="mt-1 w-full rounded-sm border border-neutral-300 px-3 py-2 text-xs"
            :disabled="isSaving || !image"
          />
        </label>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            v-if="!selectedFile"
            class="rounded-sm bg-neutral-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            :disabled="!image || isSaving"
            @click="chooseFile"
          >
            {{ image?.image_url ? 'Remplacer l’image' : '+ Ajouter une image' }}
          </button>
          <button
            v-if="selectedFile"
            type="button"
            class="rounded-sm bg-neutral-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            :disabled="!image || isSaving"
            @click="saveImage"
          >
            {{ isSaving ? 'Enregistrement…' : (image?.image_url ? 'Confirmer le remplacement' : 'Enregistrer l’image') }}
          </button>
          <button
            v-if="selectedFile"
            type="button"
            class="rounded-sm border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 disabled:opacity-50"
            :disabled="isSaving"
            @click="cancelUpload"
          >
            Annuler
          </button>
          <button
            type="button"
            class="rounded-sm border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 disabled:opacity-50"
            :disabled="!image || isSaving"
            @click="saveAltText"
          >
            Enregistrer le texte
          </button>
          <button
            v-if="image?.image_url && !selectedFile"
            type="button"
            class="rounded-sm border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
            :disabled="isSaving"
            @click="removeImage"
          >
            Supprimer l’image
          </button>
        </div>
      </div>
    </div>

    <p v-if="message" role="status" class="text-xs text-emerald-700">{{ message }}</p>
    <p v-if="errorMessage" role="alert" class="text-xs text-red-700">{{ errorMessage }}</p>
    <p v-if="!image" class="text-xs text-amber-700">
      Emplacement absent de Supabase. Vérifiez la présence de la ligne « {{ page }} / {{ section }} ».
    </p>
  </section>
</template>
