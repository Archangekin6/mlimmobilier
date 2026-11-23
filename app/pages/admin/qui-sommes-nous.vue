<script setup lang="ts">
import { ref } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

definePageMeta({ layout: 'admin' })

const { settings, saveSettings } = useSiteData()
const form = ref({ ...settings.value })
const isSaving = ref(false)
const message = ref('')
const errorMessage = ref('')

const valueFields = [
  { titleKey: 'aboutValue1Title', textKey: 'aboutValue1Text', label: 'Valeur 1' },
  { titleKey: 'aboutValue2Title', textKey: 'aboutValue2Text', label: 'Valeur 2' },
  { titleKey: 'aboutValue3Title', textKey: 'aboutValue3Text', label: 'Valeur 3' },
  { titleKey: 'aboutValue4Title', textKey: 'aboutValue4Text', label: 'Valeur 4' }
] as const

const save = async () => {
  if (isSaving.value) return
  isSaving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await saveSettings(form.value)
    message.value = 'Les contenus de la page ont été enregistrés.'
  } catch (error) {
    console.error('Erreur d’enregistrement de la page Qui sommes-nous:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Impossible d’enregistrer les contenus.'
  } finally {
    isSaving.value = false
  }
}

useSeoMeta({ title: 'Gestion de Qui sommes-nous | Administration', robots: 'noindex, nofollow' })
</script>

<template>
  <form class="mx-auto max-w-4xl space-y-6" @submit.prevent="save">
    <header>
      <h2 class="text-xl font-black text-neutral-950">Page Qui sommes-nous</h2>
      <p class="mt-1 text-xs text-neutral-500">Le Hero de cette page est indépendant de celui de l’accueil.</p>
    </header>

    <AdminSiteImageEditor page="about" section="hero_background" title="Image du Hero Qui sommes-nous" />
    <AdminSiteImageEditor page="about" section="presentation_image" title="Image de présentation" />

    <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
      <h3 class="border-b border-neutral-200 pb-2 text-sm font-bold">Hero et présentation</h3>
      <label class="block text-xs font-semibold">Titre du Hero
        <input v-model="form.aboutHeroTitle" maxlength="200" class="mt-1 w-full rounded-sm border p-2 text-sm">
      </label>
      <label class="block text-xs font-semibold">Texte du Hero
        <textarea v-model="form.aboutHeroSubtitle" maxlength="2000" rows="3" class="mt-1 w-full rounded-sm border p-2 text-sm" />
      </label>
      <label class="block text-xs font-semibold">Titre de présentation
        <input v-model="form.aboutPresentationTitle" maxlength="200" class="mt-1 w-full rounded-sm border p-2 text-sm">
      </label>
      <label class="block text-xs font-semibold">Présentation
        <textarea v-model="form.aboutPresentationText" maxlength="4000" rows="5" class="mt-1 w-full rounded-sm border p-2 text-sm" />
      </label>
      <label class="block text-xs font-semibold">Implantation et équipe
        <textarea v-model="form.aboutLocationText" maxlength="4000" rows="5" class="mt-1 w-full rounded-sm border p-2 text-sm" />
      </label>
    </section>

    <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
      <h3 class="border-b border-neutral-200 pb-2 text-sm font-bold">Mission (facultative)</h3>
      <p class="text-xs text-neutral-500">Aucune mission n’est préremplie : renseignez uniquement un texte validé par l’entreprise.</p>
      <label class="block text-xs font-semibold">Titre
        <input v-model="form.aboutMissionTitle" maxlength="200" class="mt-1 w-full rounded-sm border p-2 text-sm">
      </label>
      <label class="block text-xs font-semibold">Texte
        <textarea v-model="form.aboutMissionText" maxlength="4000" rows="4" class="mt-1 w-full rounded-sm border p-2 text-sm" />
      </label>
    </section>

    <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
      <h3 class="border-b border-neutral-200 pb-2 text-sm font-bold">Valeurs de l’entreprise</h3>
      <label class="block text-xs font-semibold">Titre de section
        <input v-model="form.aboutValuesTitle" maxlength="200" class="mt-1 w-full rounded-sm border p-2 text-sm">
      </label>
      <label class="block text-xs font-semibold">Sous-titre
        <input v-model="form.aboutValuesSubtitle" maxlength="300" class="mt-1 w-full rounded-sm border p-2 text-sm">
      </label>
      <div v-for="value in valueFields" :key="value.titleKey" class="grid gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2">
        <label class="block text-xs font-semibold">{{ value.label }} — titre
          <input v-model="form[value.titleKey]" maxlength="150" class="mt-1 w-full rounded-sm border p-2 text-sm">
        </label>
        <label class="block text-xs font-semibold">{{ value.label }} — texte
          <textarea v-model="form[value.textKey]" maxlength="1000" rows="3" class="mt-1 w-full rounded-sm border p-2 text-sm" />
        </label>
      </div>
    </section>

    <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
      <h3 class="border-b border-neutral-200 pb-2 text-sm font-bold">Appel à contact</h3>
      <label class="block text-xs font-semibold">Titre
        <input v-model="form.aboutCtaTitle" maxlength="200" class="mt-1 w-full rounded-sm border p-2 text-sm">
      </label>
      <label class="block text-xs font-semibold">Texte
        <textarea v-model="form.aboutCtaText" maxlength="2000" rows="3" class="mt-1 w-full rounded-sm border p-2 text-sm" />
      </label>
    </section>

    <p v-if="message" role="status" class="text-xs text-emerald-700">{{ message }}</p>
    <p v-if="errorMessage" role="alert" class="text-xs text-red-700">{{ errorMessage }}</p>
    <div class="flex justify-end">
      <button type="submit" :disabled="isSaving" class="rounded-sm bg-neutral-900 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">
        {{ isSaving ? 'Enregistrement…' : 'Enregistrer la page' }}
      </button>
    </div>
  </form>
</template>
