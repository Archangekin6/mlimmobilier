<script setup lang="ts">
import { ref } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

definePageMeta({
  layout: 'admin'
})

const { settings, saveSettings } = useSiteData()

const form = ref({ ...settings.value })
const savedSuccess = ref(false)
const savedError = ref('')

// Logo upload
const logoTab = ref<'url' | 'upload'>('url')
const logoFileInput = ref<HTMLInputElement | null>(null)
const isUploadingLogo = ref(false)
const logoUploadError = ref('')
const logoUploadSuccess = ref(false)

const triggerLogoFileInput = () => logoFileInput.value?.click()

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validation
  if (!file.type.startsWith('image/')) {
    logoUploadError.value = 'Veuillez sélectionner une image valide'
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    logoUploadError.value = 'L\'image doit peser moins de 2MB'
    return
  }

  logoUploadError.value = ''
  isUploadingLogo.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'site-images')
    const data = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    form.value.logoUrl = data.url
    logoUploadSuccess.value = true
    
    setTimeout(() => {
      logoUploadSuccess.value = false
    }, 3000)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'data' in error) {
      const data = error.data
      logoUploadError.value = typeof data === 'object' && data !== null && 'statusMessage' in data && typeof data.statusMessage === 'string'
        ? data.statusMessage
        : 'Erreur lors du téléchargement de l’image'
    } else {
      logoUploadError.value = error instanceof Error && error.message
        ? error.message
        : 'Erreur lors du téléchargement de l’image'
    }
    console.error(error)
  } finally {
    isUploadingLogo.value = false
    if (logoFileInput.value) {
      logoFileInput.value.value = ''
    }
  }
}

const handleSave = () => {
  savedError.value = ''
  void saveSettings(form.value).then(() => {
    savedSuccess.value = true
    setTimeout(() => {
      savedSuccess.value = false
    }, 3000)
  }).catch((error: unknown) => {
    console.error('Erreur d’enregistrement des paramètres:', error)
    savedError.value = 'Impossible d’enregistrer les paramètres. Vérifiez la connexion puis réessayez.'
  })
}

useSeoMeta({
  title: 'Coordonnées & Contact | Admin ML Immobilier SARL',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-black tracking-tight">Coordonnées & Contact</h2>
        <p class="text-xs text-neutral-500 mt-0.5">
        Identité, coordonnées, logo et réseaux sociaux de l’entreprise.
        </p>
      </div>

      <button
        type="button"
        @click="handleSave"
        class="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xs transition-colors"
      >
        <UIcon name="i-heroicons-check" class="w-4 h-4 text-white" />
        <span>Enregistrer</span>
      </button>
    </div>

    <!-- Success message -->
    <div v-if="savedSuccess" class="p-3.5 rounded-xs bg-black text-white text-xs font-bold flex items-center gap-2 border border-neutral-800">
      <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-white" />
      <span>Modifications enregistrées et immédiatement appliquées.</span>
    </div>
    <div v-if="savedError" class="p-3.5 rounded-xs bg-red-50 text-red-800 text-xs border border-red-200">
      {{ savedError }}
    </div>

    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- 1. IDENTITE & CONTACT -->
      <div class="bg-white border border-neutral-200 rounded-xs p-6 space-y-4">
        <h3 class="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-black" />
          <span>Coordonnées & Siège</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Raison sociale</label>
            <input
              v-model="form.companyName"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Sous-titre / Activité</label>
            <input
              v-model="form.tagline"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
            />
          </div>
        </div>

        <!-- Logo de l'entreprise -->
        <div class="space-y-3 border-t border-neutral-100 pt-4">
          <label class="block text-[11px] font-bold text-black uppercase tracking-wider">
            Logo de l'entreprise
          </label>
          <p class="text-[10px] text-neutral-500">
            Téléchargez le logo depuis votre ordinateur ou collez une URL.             Formats acceptés : PNG, JPG, WebP, GIF ou AVIF. Hauteur recommandée : 56px.
          </p>

          <!-- Tabs -->
          <div class="flex gap-2 border-b border-neutral-200">
            <button
              type="button"
              @click="logoTab = 'url'"
              :class="[
                'px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px]',
                logoTab === 'url'
                  ? 'text-black border-b-black'
                  : 'text-neutral-500 border-b-transparent hover:text-neutral-700'
              ]"
            >
              Lien URL
            </button>
            <button
              type="button"
              @click="logoTab = 'upload'"
              :class="[
                'px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px]',
                logoTab === 'upload'
                  ? 'text-black border-b-black'
                  : 'text-neutral-500 border-b-transparent hover:text-neutral-700'
              ]"
            >
              Télécharger
            </button>
          </div>

          <!-- URL Tab -->
          <div v-if="logoTab === 'url'" class="space-y-3">
            <input
              v-model="form.logoUrl"
              type="url"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="https://exemple.com/logo.png"
            />
          </div>

          <!-- Upload Tab -->
          <div v-if="logoTab === 'upload'" class="space-y-3">
            <input
              ref="logoFileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              @change="handleLogoUpload"
              class="hidden"
            />
            
            <div
              @click="triggerLogoFileInput"
              class="border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-xs p-6 text-center cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100"
            >
              <div class="flex flex-col items-center gap-2">
                <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8 text-neutral-400" />
                <div>
                  <p class="text-xs font-bold text-neutral-700">Cliquez pour uploader</p>
                  <p class="text-[10px] text-neutral-500">PNG, JPG, GIF jusqu'à 2MB</p>
                </div>
              </div>
            </div>

            <div v-if="isUploadingLogo" class="flex items-center gap-2 text-xs text-neutral-700">
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
              <span>Téléchargement en cours...</span>
            </div>

            <div v-if="logoUploadError" class="p-2.5 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs">
              {{ logoUploadError }}
            </div>

            <div v-if="logoUploadSuccess" class="p-2.5 rounded-xs bg-green-50 border border-green-200 text-green-700 text-xs">
              Image téléchargée avec succès !
            </div>
          </div>

          <!-- Preview -->
          <div v-if="form.logoUrl" class="border border-neutral-200 rounded-xs bg-neutral-50 p-3 flex items-center justify-center overflow-hidden w-32 h-20">
            <img
              :src="form.logoUrl"
              alt="Logo de l'entreprise"
              class="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Adresse (Siège)</label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="Yopougon, Terminus 27"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Ville & Pays</label>
            <input
              v-model="form.city"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="Abidjan, Côte d’Ivoire"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Téléphone Principal 1</label>
            <input
              v-model="form.phone1"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none font-mono"
              placeholder="+225 07 ..."
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Téléphone Secondaire 2</label>
            <input
              v-model="form.phone2"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none font-mono"
              placeholder="+225 05 ..."
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">WhatsApp (sans +)</label>
            <input
              v-model="form.whatsapp"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none font-mono"
              placeholder="2250708091011"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Courriel de contact</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Horaires d'ouverture</label>
            <input
              v-model="form.workingHours"
              type="text"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- RESEAUX SOCIAUX -->
      <div class="bg-white border border-neutral-200 rounded-xs p-6 space-y-4">
        <h3 class="text-xs font-bold text-black uppercase tracking-wider border-b border-neutral-200 pb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-share" class="w-4 h-4 text-black" />
          <span>Réseaux Sociaux</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Facebook</label>
            <input
              v-model="form.socialFacebook"
              type="url"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">LinkedIn</label>
            <input
              v-model="form.socialLinkedin"
              type="url"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="https://linkedin.com/..."
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-black uppercase tracking-wider mb-1">Instagram</label>
            <input
              v-model="form.socialInstagram"
              type="url"
              class="w-full px-3 py-2 rounded-xs bg-white border border-neutral-300 text-black text-xs focus:border-black focus:outline-none"
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end pt-2">
        <button
          type="submit"
          class="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xs transition-colors"
        >
          <UIcon name="i-heroicons-check" class="w-4 h-4 text-white" />
          <span>Sauvegarder les modifications</span>
        </button>
      </div>
    </form>
  </div>
</template>
