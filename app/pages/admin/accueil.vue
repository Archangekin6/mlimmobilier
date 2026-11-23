<script setup lang="ts">
import { ref } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

definePageMeta({ layout: 'admin' })

const { settings, saveSettings } = useSiteData()
const form = ref({ ...settings.value })
const isSaving = ref(false)
const message = ref('')
const errorMessage = ref('')

const statFields = [
  { key: 'statsYears', label: 'Années d’expérience' },
  { key: 'statsProjects', label: 'Chantiers livrés' },
  { key: 'statsClients', label: 'Clients accompagnés' },
  { key: 'statsSatisfaction', label: 'Taux de satisfaction (%)' }
] as const

type StatField = typeof statFields[number]['key']

const updateStat = (key: StatField, event: Event) => {
  const value = (event.target as HTMLInputElement).value
  form.value[key] = value === '' ? null : Number(value)
}

const save = async () => {
  if (isSaving.value) return
  isSaving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await saveSettings(form.value)
    message.value = 'Les contenus de l’accueil ont été enregistrés.'
  } catch (error) {
    console.error('Erreur d’enregistrement de la page d’accueil:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Impossible d’enregistrer les contenus.'
  } finally {
    isSaving.value = false
  }
}

useSeoMeta({ title: 'Gestion de l’accueil | Administration', robots: 'noindex, nofollow' })
</script>

<template>
  <form class="mx-auto max-w-4xl space-y-6" @submit.prevent="save">
    <header>
      <h2 class="text-xl font-black text-neutral-950">Page d’accueil</h2>
      <p class="mt-1 text-xs text-neutral-500">Gérez le Hero, les textes et les statistiques réellement renseignées.</p>
    </header>

    <AdminSiteImageEditor page="home" section="hero_background" title="Image du Hero d’accueil" />

    <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
      <h3 class="border-b border-neutral-200 pb-2 text-sm font-bold">Hero et accroches</h3>
      <label class="block text-xs font-semibold">Titre principal
        <input v-model="form.heroTitle" maxlength="200" class="mt-1 w-full rounded-sm border p-2 text-sm">
      </label>
      <label class="block text-xs font-semibold">Sous-titre
        <textarea v-model="form.heroSubtitle" maxlength="2000" rows="3" class="mt-1 w-full rounded-sm border p-2 text-sm" />
      </label>
      <label class="block text-xs font-semibold">Texte descriptif des expertises
        <textarea v-model="form.homeDescription" maxlength="2000" rows="3" class="mt-1 w-full rounded-sm border p-2 text-sm" />
      </label>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block text-xs font-semibold">Bouton principal
          <input v-model="form.heroCtaText" maxlength="100" class="mt-1 w-full rounded-sm border p-2 text-sm">
        </label>
        <label class="block text-xs font-semibold">Bouton secondaire
          <input v-model="form.heroSecondaryCtaText" maxlength="100" class="mt-1 w-full rounded-sm border p-2 text-sm">
        </label>
      </div>
      <div class="space-y-3 border-t border-neutral-100 pt-4">
        <label class="flex items-center gap-2 text-xs font-semibold">
          <input v-model="form.showNotice" type="checkbox">
          Afficher la bannière d’information
        </label>
        <label class="block text-xs font-semibold">Texte de la bannière
          <input v-model="form.bannerNotice" maxlength="500" class="mt-1 w-full rounded-sm border p-2 text-sm">
        </label>
      </div>
    </section>

    <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
      <h3 class="border-b border-neutral-200 pb-2 text-sm font-bold">Statistiques</h3>
      <p class="text-xs text-neutral-500">Laissez un champ vide si la valeur n’est pas validée. Aucune valeur n’est affichée comme zéro par défaut.</p>
      <div class="grid gap-4 sm:grid-cols-2">
        <label v-for="field in statFields" :key="field.key" class="block text-xs font-semibold">
          {{ field.label }}
          <input
            type="number"
            min="0"
            step="1"
            :value="form[field.key] ?? ''"
            class="mt-1 w-full rounded-sm border p-2 text-sm"
            @input="updateStat(field.key, $event)"
          >
        </label>
      </div>
    </section>

    <p v-if="message" role="status" class="text-xs text-emerald-700">{{ message }}</p>
    <p v-if="errorMessage" role="alert" class="text-xs text-red-700">{{ errorMessage }}</p>
    <div class="flex justify-end">
      <button type="submit" :disabled="isSaving" class="rounded-sm bg-neutral-900 px-5 py-3 text-xs font-bold text-white disabled:opacity-50">
        {{ isSaving ? 'Enregistrement…' : 'Enregistrer la page d’accueil' }}
      </button>
    </div>
  </form>
</template>
