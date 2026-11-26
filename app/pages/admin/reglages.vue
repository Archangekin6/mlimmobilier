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
        Identité, coordonnées et réseaux sociaux de l’entreprise.
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
          <p class="block text-[11px] font-bold text-black uppercase tracking-wider">Logo officiel de l'entreprise</p>
          <img
            src="/uploads/img-1795172952218-4154do.jpg"
            :alt="`Logo ${settings.companyName}`"
            class="h-14 w-auto object-contain"
          >
          <p class="text-xs text-neutral-500">Le logo officiel est géré par le fichier présent dans le dossier public du site.</p>
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
