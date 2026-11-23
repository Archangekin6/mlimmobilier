<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSiteData, type SiteService } from '~/composables/useSiteData'

definePageMeta({ layout: 'admin' })

const { services, loadAdminServices, saveService } = useSiteData()
const editedServices = ref<SiteService[]>([])
const highlightsText = ref<Record<string, string>>({})
const savingSlug = ref<string | null>(null)
const messages = ref<Record<string, string>>({})
const errors = ref<Record<string, string>>({})

const imageSections: Record<SiteService['slug'], string> = {
  btp: 'btp_section_image',
  electrification: 'electrification_section_image',
  gestion: 'gestion_section_image'
}

onMounted(async () => {
  await loadAdminServices()
  editedServices.value = services.value.map(service => ({
    ...service,
    homeHighlights: [...service.homeHighlights],
    detailItems: service.detailItems.map(item => ({ ...item }))
  }))
  highlightsText.value = Object.fromEntries(
    editedServices.value.map(service => [service.slug, service.homeHighlights.join('\n')])
  )
})

const addDetail = (service: SiteService) => {
  if (service.detailItems.length < 8) service.detailItems.push({ title: '', text: '' })
}

const removeDetail = (service: SiteService, index: number) => {
  service.detailItems.splice(index, 1)
}

const save = async (service: SiteService) => {
  if (savingSlug.value) return
  savingSlug.value = service.slug
  messages.value[service.slug] = ''
  errors.value[service.slug] = ''

  try {
    await saveService({
      ...service,
      homeHighlights: (highlightsText.value[service.slug] || '')
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean)
    })
    messages.value[service.slug] = 'Service enregistré.'
  } catch (error) {
    console.error(`Erreur d’enregistrement du service ${service.slug}:`, error)
    errors.value[service.slug] = error instanceof Error ? error.message : 'Impossible d’enregistrer ce service.'
  } finally {
    savingSlug.value = null
  }
}

useSeoMeta({ title: 'Gestion des services | Administration', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <header>
      <h2 class="text-xl font-black text-neutral-950">Services</h2>
      <p class="mt-1 text-xs text-neutral-500">Gérez séparément les trois pôles existants, leur ordre et leur visibilité.</p>
    </header>

    <p v-if="!editedServices.length" class="rounded-sm border border-neutral-200 bg-white p-5 text-xs text-neutral-600">
      Chargement des contenus depuis Supabase…
    </p>

    <article v-for="service in editedServices" :key="service.slug" class="space-y-5 rounded-sm border border-neutral-200 bg-neutral-50 p-4 sm:p-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-neutral-950">{{ service.homeTitle }}</h3>
          <p class="text-[11px] uppercase tracking-wide text-neutral-500">{{ service.slug }}</p>
        </div>
        <label class="flex items-center gap-2 text-xs font-semibold">
          <input v-model="service.published" type="checkbox">
          Publier ce service
        </label>
      </header>

      <AdminSiteImageEditor
        page="services"
        :section="imageSections[service.slug]"
        :title="`Image — ${service.homeTitle}`"
      />

      <section class="grid gap-4 rounded-sm border border-neutral-200 bg-white p-5 sm:grid-cols-2">
        <h4 class="sm:col-span-2 text-sm font-bold">Carte de la page d’accueil</h4>
        <label class="block text-xs font-semibold">Nom
          <input v-model="service.homeTitle" maxlength="160" class="mt-1 w-full rounded-sm border p-2 text-sm">
        </label>
        <label class="block text-xs font-semibold">Pôle / badge
          <input v-model="service.badge" maxlength="100" class="mt-1 w-full rounded-sm border p-2 text-sm">
        </label>
        <label class="block text-xs font-semibold sm:col-span-2">Description
          <textarea v-model="service.homeDescription" maxlength="2000" rows="3" class="mt-1 w-full rounded-sm border p-2 text-sm" />
        </label>
        <label class="block text-xs font-semibold sm:col-span-2">Points complémentaires (un par ligne, 8 maximum)
          <textarea v-model="highlightsText[service.slug]" rows="4" class="mt-1 w-full rounded-sm border p-2 text-sm" />
        </label>
      </section>

      <section class="space-y-4 rounded-sm border border-neutral-200 bg-white p-5">
        <h4 class="text-sm font-bold">Détail du service</h4>
        <label class="block text-xs font-semibold">Titre
          <input v-model="service.detailTitle" maxlength="160" class="mt-1 w-full rounded-sm border p-2 text-sm">
        </label>
        <label class="block text-xs font-semibold">Description
          <textarea v-model="service.detailDescription" maxlength="2000" rows="3" class="mt-1 w-full rounded-sm border p-2 text-sm" />
        </label>
        <div v-for="(item, index) in service.detailItems" :key="index" class="grid gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-[1fr_2fr_auto]">
          <label class="block text-xs font-semibold">Complément {{ index + 1 }}
            <input v-model="item.title" maxlength="120" class="mt-1 w-full rounded-sm border p-2 text-sm">
          </label>
          <label class="block text-xs font-semibold">Texte
            <textarea v-model="item.text" maxlength="500" rows="2" class="mt-1 w-full rounded-sm border p-2 text-sm" />
          </label>
          <button type="button" class="self-end rounded-sm border border-red-200 px-3 py-2 text-xs text-red-700" @click="removeDetail(service, index)">
            Retirer
          </button>
        </div>
        <button
          v-if="service.detailItems.length < 8"
          type="button"
          class="rounded-sm border border-neutral-300 px-3 py-2 text-xs font-semibold"
          @click="addDetail(service)"
        >
          Ajouter un complément
        </button>
      </section>

      <div class="flex flex-wrap items-end justify-between gap-4 rounded-sm border border-neutral-200 bg-white p-5">
        <label class="block text-xs font-semibold">Ordre d’affichage
          <input v-model.number="service.displayOrder" type="number" min="0" max="1000" step="1" class="mt-1 w-32 rounded-sm border p-2 text-sm">
        </label>
        <button
          type="button"
          :disabled="savingSlug !== null"
          class="rounded-sm bg-neutral-900 px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
          @click="save(service)"
        >
          {{ savingSlug === service.slug ? 'Enregistrement…' : 'Enregistrer ce service' }}
        </button>
      </div>

      <p v-if="messages[service.slug]" role="status" class="text-xs text-emerald-700">{{ messages[service.slug] }}</p>
      <p v-if="errors[service.slug]" role="alert" class="text-xs text-red-700">{{ errors[service.slug] }}</p>
    </article>
  </div>
</template>
