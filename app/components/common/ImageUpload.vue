<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'

interface Props {
  modelValue: string
  label?: string
  hint?: string
  previewSize?: 'small' | 'medium' | 'large'
  acceptedFormats?: string
  maxFileSize?: number // en MB
  bucket?: 'site-images' | 'project-images'
  compact?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Image',
  hint: 'Téléchargez une image depuis votre ordinateur ou collez une URL',
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
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const urlInput = ref(props.modelValue)
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const currentTab = ref<'url' | 'upload'>('url')
const selectedPreviewUrl = ref('')

watch(() => props.modelValue, (value) => {
  urlInput.value = value
})

const clearSelectedPreview = () => {
  if (selectedPreviewUrl.value.startsWith('blob:')) URL.revokeObjectURL(selectedPreviewUrl.value)
  selectedPreviewUrl.value = ''
}

onUnmounted(clearSelectedPreview)

const previewSizeClasses = {
  small: 'w-20 h-16',
  medium: 'w-40 h-32',
  large: 'w-full h-64'
}

const uploadFile = async (file: File) => {
  if (isUploading.value || props.disabled) return

  // Validation
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Veuillez sélectionner une image valide'
    return
  }

  if (file.size > props.maxFileSize * 1024 * 1024) {
    uploadError.value = `L'image doit peser moins de ${props.maxFileSize}MB`
    return
  }

  uploadError.value = ''
  uploadSuccess.value = false
  clearSelectedPreview()
  selectedPreviewUrl.value = URL.createObjectURL(file)
  isUploading.value = true
  emit('uploading', true)

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', props.bucket)
    const response = await $fetch<{ url: string; storagePath: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    emit('update:modelValue', response.url)
    emit('uploaded', { url: response.url, storagePath: response.storagePath })
    uploadSuccess.value = true
    urlInput.value = response.url
    clearSelectedPreview()
    
    setTimeout(() => {
      uploadSuccess.value = false
    }, 3000)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'data' in error) {
      const data = error.data
      if (typeof data === 'object' && data !== null && 'statusMessage' in data && typeof data.statusMessage === 'string') {
        uploadError.value = data.statusMessage
      } else {
        uploadError.value = 'Erreur lors du téléchargement de l’image'
      }
    } else if (error instanceof Error && error.message) {
      uploadError.value = error.message
    } else {
      uploadError.value = 'Erreur lors du téléchargement de l’image'
    }
    console.error(error)
  } finally {
    isUploading.value = false
    emit('uploading', false)
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  const file = target.files?.[0]
  if (!file) return
  await uploadFile(file)
  target.value = ''
}

const handleUrlChange = () => {
  uploadError.value = ''
  emit('update:modelValue', urlInput.value)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const previewClasses = computed(() => previewSizeClasses[props.previewSize])
</script>

<template>
  <div class="space-y-3">
    <!-- Label -->
    <label class="block text-[11px] font-bold text-black uppercase tracking-wider">
      {{ label }}
    </label>

    <!-- Hint -->
    <p class="text-[10px] text-neutral-500">
      {{ hint }}
    </p>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-neutral-200">
      <button
        v-if="!compact"
        type="button"
        @click="currentTab = 'url'"
        :class="[
          'px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px]',
          currentTab === 'url'
            ? 'text-black border-b-black'
            : 'text-neutral-500 border-b-transparent hover:text-neutral-700'
        ]"
      >
        <UIcon name="i-heroicons-link" class="w-3.5 h-3.5 inline mr-1" />
        Lien URL
      </button>
      <button
        v-if="!compact"
        type="button"
        @click="currentTab = 'upload'"
        :class="[
          'px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px]',
          currentTab === 'upload'
            ? 'text-black border-b-black'
            : 'text-neutral-500 border-b-transparent hover:text-neutral-700'
        ]"
      >
        <UIcon name="i-heroicons-cloud-arrow-up" class="w-3.5 h-3.5 inline mr-1" />
        Télécharger
      </button>
    </div>

    <!-- URL Tab -->
    <div v-if="!compact && currentTab === 'url'" class="space-y-3">
      <div class="flex gap-3 items-start">
        <input
          v-model="urlInput"
          type="url"
          @input="handleUrlChange"
          class="flex-1 px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
          placeholder="https://exemple.com/image.png"
        />
      </div>
    </div>

    <!-- Upload Tab -->
    <div v-if="compact || currentTab === 'upload'" class="space-y-3">
      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFormats"
        :disabled="isUploading || disabled"
        @change="handleFileSelect"
        class="hidden"
      />

      <!-- Drop zone -->
      <div
        @click="!disabled && !isUploading && triggerFileInput()"
        @dragover.prevent="true"
        @drop.prevent="(event) => {
          const file = event.dataTransfer?.files[0]
          if (file) uploadFile(file)
        }"
        :class="[
          'border-2 border-dashed border-neutral-300 rounded-xs p-6 text-center transition-colors bg-neutral-50',
          disabled || isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-neutral-400 hover:bg-neutral-100'
        ]"
      >
        <div class="flex flex-col items-center gap-2">
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8 text-neutral-400" />
          <div>
            <p class="text-xs font-bold text-neutral-700">Cliquez pour uploader ou glissez-déposez</p>
            <p class="text-[10px] text-neutral-500">JPG, PNG, WebP, GIF ou AVIF — {{ maxFileSize }} Mo maximum</p>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isUploading" class="flex items-center gap-2 text-xs text-neutral-700">
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
        <span>Téléchargement en cours...</span>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="uploadError" class="p-2.5 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
      <span>{{ uploadError }}</span>
    </div>

    <!-- Success message -->
    <div v-if="uploadSuccess" class="p-2.5 rounded-xs bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
      <UIcon name="i-heroicons-check-circle" class="w-4 h-4 flex-shrink-0" />
      <span>Image téléchargée avec succès !</span>
    </div>

    <!-- Preview -->
    <div v-if="selectedPreviewUrl || urlInput" class="border border-neutral-200 rounded-xs bg-neutral-50 p-3 flex items-center justify-center overflow-hidden" :class="previewClasses">
      <img
        :src="selectedPreviewUrl || urlInput"
        :alt="label"
        class="max-h-full max-w-full object-contain"
      />
    </div>
  </div>
</template>
