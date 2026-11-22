<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  hint?: string
  previewSize?: 'small' | 'medium' | 'large'
  acceptedFormats?: string
  maxFileSize?: number // en MB
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Image',
  hint: 'Téléchargez une image depuis votre ordinateur ou collez une URL',
  previewSize: 'medium',
  acceptedFormats: 'image/*',
  maxFileSize: 5
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const urlInput = ref(props.modelValue)
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const currentTab = ref<'url' | 'upload'>('url')

const previewSizeClasses = {
  small: 'w-20 h-16',
  medium: 'w-40 h-32',
  large: 'w-full h-64'
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

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
  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload')
    }

    const data = await response.json()
    emit('update:modelValue', data.url)
    uploadSuccess.value = true
    urlInput.value = data.url
    
    setTimeout(() => {
      uploadSuccess.value = false
    }, 3000)
  } catch (error) {
    uploadError.value = 'Erreur lors du téléchargement de l\'image'
    console.error(error)
  } finally {
    isUploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
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
    <div v-if="currentTab === 'url'" class="space-y-3">
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
    <div v-if="currentTab === 'upload'" class="space-y-3">
      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFormats"
        @change="handleFileSelect"
        class="hidden"
      />

      <!-- Drop zone -->
      <div
        @click="triggerFileInput"
        @dragover.prevent="true"
        @drop.prevent="(e) => {
          const dataTransfer = e.dataTransfer
          if (!dataTransfer) return
          const files = dataTransfer.files
          if (files.length > 0) {
            const fakeEvent = { target: { files } } as any
            handleFileSelect(fakeEvent)
          }
        }"
        class="border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-xs p-6 text-center cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100"
      >
        <div class="flex flex-col items-center gap-2">
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8 text-neutral-400" />
          <div>
            <p class="text-xs font-bold text-neutral-700">Cliquez pour uploader ou glissez-déposez</p>
            <p class="text-[10px] text-neutral-500">PNG, JPG, GIF jusqu'à {{ maxFileSize }}MB</p>
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
    <div v-if="modelValue" class="border border-neutral-200 rounded-xs bg-neutral-50 p-3 flex items-center justify-center overflow-hidden" :class="previewClasses">
      <img
        :src="modelValue"
        :alt="label"
        class="max-h-full max-w-full object-contain"
      />
    </div>
  </div>
</template>
