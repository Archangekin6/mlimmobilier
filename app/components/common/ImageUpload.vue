<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

interface Props {
  modelValue: string
  label?: string
  hint?: string
  previewSize?: 'small' | 'medium' | 'large'
  acceptedFormats?: string
  maxFileSize?: number
  bucket?: 'site-images' | 'project-images'
  compact?: boolean
  disabled?: boolean
  onUploadComplete?: (value: { url: string; storagePath: string }) => void | Promise<void>
  onDeleteComplete?: (value: { url: string }) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Image',
  hint: 'Ajoutez une image depuis votre ordinateur.',
  previewSize: 'medium',
  acceptedFormats: 'image/jpeg,image/png,image/webp,image/gif,image/avif',
  maxFileSize: 5,
  bucket: 'project-images',
  compact: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  uploaded: [value: { url: string; storagePath: string }]
  uploading: [value: boolean]
  delete: [value: { url: string }]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const selectedPreviewUrl = ref('')
const isUploading = ref(false)
const uploadError = ref('')

const clearSelectedPreview = () => {
  if (selectedPreviewUrl.value.startsWith('blob:')) URL.revokeObjectURL(selectedPreviewUrl.value)
  selectedPreviewUrl.value = ''
}

onUnmounted(clearSelectedPreview)

const previewSizeClasses = {
  small: 'w-full h-32',
  medium: 'w-full h-48',
  large: 'w-full h-64'
}

const previewClasses = computed(() => previewSizeClasses[props.previewSize])

const openFilePicker = () => {
  if (props.disabled || isUploading.value) return
  if (fileInput.value) fileInput.value.value = ''
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  uploadError.value = ''
  const allowedTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ])
  if (!allowedTypes.has(file.type)) {
    uploadError.value = 'Format refusé. Utilisez un fichier JPG, PNG, WebP, GIF ou AVIF.'
    return
  }
  if (file.size > props.maxFileSize * 1024 * 1024) {
    uploadError.value = `L’image doit peser au maximum ${props.maxFileSize} Mo.`
    return
  }

  clearSelectedPreview()
  selectedFile.value = file
  selectedPreviewUrl.value = URL.createObjectURL(file)
}

const cancelSelection = () => {
  selectedFile.value = null
  clearSelectedPreview()
  uploadError.value = ''
}

const uploadFile = async () => {
  if (!selectedFile.value || isUploading.value || props.disabled) return

  isUploading.value = true
  uploadError.value = ''
  emit('uploading', true)

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('bucket', props.bucket)
    const response = await $fetch<{ url: string; storagePath: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    if (!response.url || !response.storagePath) {
      throw new Error('Le serveur n’a pas confirmé le chemin de l’image téléversée.')
    }
    const uploaded = { url: response.url, storagePath: response.storagePath }
    await props.onUploadComplete?.(uploaded)
    emit('uploaded', uploaded)
    emit('update:modelValue', response.url)
    selectedFile.value = null
    clearSelectedPreview()
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'data' in error) {
      const data = error.data
      if (typeof data === 'object' && data !== null && 'statusMessage' in data && typeof data.statusMessage === 'string') {
        uploadError.value = data.statusMessage
      } else {
        uploadError.value = 'Erreur lors du téléchargement de l’image.'
      }
    } else if (error instanceof Error && error.message) {
      uploadError.value = error.message
    } else {
      uploadError.value = 'Erreur lors du téléchargement de l’image.'
    }
    console.error(error)
  } finally {
    isUploading.value = false
    emit('uploading', false)
  }
}

const deleteImage = async () => {
  if (!props.modelValue || props.disabled || isUploading.value) return
  if (!window.confirm(`Supprimer l’image « ${props.label} » ?`)) return
  uploadError.value = ''
  isUploading.value = true
  emit('uploading', true)
  try {
    const deleted = { url: props.modelValue }
    await props.onDeleteComplete?.(deleted)
    emit('delete', deleted)
    emit('update:modelValue', '')
  } catch (error: unknown) {
    uploadError.value = error instanceof Error && error.message
      ? error.message
      : 'Impossible de supprimer cette image.'
    console.error(error)
  } finally {
    isUploading.value = false
    emit('uploading', false)
  }
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="block text-[11px] font-bold text-black uppercase tracking-wider">{{ label }}</label>
      <p class="mt-1 text-[10px] text-neutral-500">{{ hint }}</p>
    </div>

    <div
      v-if="selectedPreviewUrl || modelValue"
      class="flex items-center justify-center overflow-hidden rounded-xs border border-neutral-200 bg-neutral-50 p-3"
      :class="previewClasses"
    >
      <img
        :src="selectedPreviewUrl || modelValue"
        :alt="label"
        class="max-h-full max-w-full object-contain"
      >
    </div>
    <div
      v-else
      class="flex min-h-24 items-center justify-center rounded-xs border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500"
    >
      Aucune image sélectionnée
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="acceptedFormats"
      :disabled="disabled || isUploading"
      class="hidden"
      @change="handleFileSelect"
    >

    <div v-if="selectedFile" class="space-y-2 rounded-xs border border-blue-200 bg-blue-50 p-3">
      <p class="truncate text-xs font-semibold text-blue-900">Nouvelle image : {{ selectedFile.name }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          :disabled="isUploading || disabled"
          class="rounded-xs bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          @click="uploadFile"
        >
          {{ isUploading ? 'Téléversement…' : (modelValue ? 'Confirmer le remplacement' : 'Enregistrer l’image') }}
        </button>
        <button
          type="button"
          :disabled="isUploading"
          class="rounded-xs border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-800 disabled:opacity-50"
          @click="cancelSelection"
        >
          Annuler
        </button>
      </div>
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <button
        type="button"
        :disabled="disabled || isUploading"
        class="rounded-xs bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        @click="openFilePicker"
      >
        {{ modelValue ? 'Remplacer l’image' : '+ Ajouter une image' }}
      </button>
      <button
        v-if="modelValue"
        type="button"
        :disabled="disabled || isUploading"
        class="rounded-xs border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
        @click="deleteImage"
      >
        Supprimer l’image
      </button>
    </div>

    <p v-if="uploadError" role="alert" class="text-xs text-red-700">{{ uploadError }}</p>
    <p class="text-[10px] text-neutral-500">JPG, PNG, WebP, GIF ou AVIF — {{ maxFileSize }} Mo maximum.</p>
  </div>
</template>
