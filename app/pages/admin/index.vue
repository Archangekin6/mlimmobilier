<script setup lang="ts">
import { computed } from 'vue'
import { useSiteData } from '~/composables/useSiteData'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'admin'
})

const { quotes, projects, pendingQuotesCount } = useSiteData()
const { adminProfile } = useAuth()

const recentQuotes = computed(() => quotes.value.slice(0, 5))
const publishedProjectsCount = computed(() => projects.value.filter(p => p.published).length)
const totalQuotesCount = computed(() => quotes.value.length)

const stats = computed(() => [
  {
    title: 'Nouvelles Demandes',
    value: pendingQuotesCount.value,
    desc: 'À traiter rapidement',
    icon: 'i-heroicons-inbox-stack',
    badgeClass: pendingQuotesCount.value > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-neutral-600 bg-neutral-100 border-neutral-200'
  },
  {
    title: 'Total Devis',
    value: totalQuotesCount.value,
    desc: 'Historique enregistré',
    icon: 'i-heroicons-document-chart-bar',
    badgeClass: 'text-neutral-700 bg-neutral-100 border-neutral-200'
  },
  {
    title: 'Projets Publiés',
    value: publishedProjectsCount.value,
    desc: `Sur ${projects.value.length} créés`,
    icon: 'i-heroicons-photo',
    badgeClass: 'text-neutral-700 bg-neutral-100 border-neutral-200'
  },
  {
    title: 'Compte Actif',
    value: 'Administrateur',
    desc: adminProfile.value?.email || 'Compte administrateur',
    icon: 'i-heroicons-shield-check',
    badgeClass: 'text-neutral-700 bg-neutral-100 border-neutral-200'
  }
])

const formatStatus = (status: string) => {
  switch (status) {
    case 'nouveau': return { label: 'Nouveau', class: 'bg-blue-50 text-blue-700 border border-blue-200' }
    case 'en_cours': return { label: 'En cours', class: 'bg-amber-50 text-amber-700 border border-amber-200' }
    case 'devis_envoye': return { label: 'Devis envoyé', class: 'bg-indigo-50 text-indigo-700 border border-indigo-200' }
    case 'termine': return { label: 'Terminé', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
    default: return { label: 'Archivé', class: 'text-neutral-500 bg-neutral-100 border border-neutral-200' }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
          Tableau de Bord
        </h2>
        <p class="text-xs text-neutral-500 mt-0.5">
          Activité récente et gestion des contenus de ML Immobilier SARL.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/devis"
          class="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-xs"
        >
          <UIcon name="i-heroicons-inbox-stack" class="w-3.5 h-3.5 text-white" />
          <span>Gérer les devis</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/realisations"
          class="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-semibold text-xs uppercase tracking-wider px-3.5 py-2 rounded-sm transition-colors shadow-xs"
        >
          <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 text-neutral-700" />
          <span>Nouveau projet</span>
        </NuxtLink>
      </div>
    </div>

    <!-- STATS CARDS: Luminous Corporate Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="(card, idx) in stats"
        :key="idx"
        class="bg-white border border-neutral-200 rounded-md p-5 space-y-3 shadow-xs hover:border-neutral-300 transition-all"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{{ card.title }}</span>
          <div class="w-8 h-8 rounded-sm bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
            <UIcon :name="card.icon" class="w-4 h-4" />
          </div>
        </div>
        <div>
          <div class="text-2xl font-black text-neutral-950 tabular-nums">{{ card.value }}</div>
          <div class="text-[11px] text-neutral-500 mt-0.5">{{ card.desc }}</div>
        </div>
      </div>
    </div>

    <!-- RECENT QUOTES & ACTIONS -->
    <div class="bg-white border border-neutral-200 rounded-md p-6 space-y-4 shadow-xs">
      <div class="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-inbox" class="w-4 h-4 text-neutral-900" />
          <h3 class="font-bold text-neutral-950 text-sm uppercase tracking-wider">Dernières Demandes de Devis</h3>
        </div>
        <NuxtLink to="/admin/devis" class="text-xs text-neutral-600 hover:text-neutral-950 font-semibold uppercase tracking-wider">
          Voir tout →
        </NuxtLink>
      </div>

      <div v-if="recentQuotes.length > 0" class="divide-y divide-neutral-100">
        <div
          v-for="quote in recentQuotes"
          :key="quote.id"
          class="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50 p-2.5 rounded-sm transition-colors"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-neutral-950 text-xs">{{ quote.fullName }}</span>
              <!-- Functional status badge -->
              <span :class="`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${formatStatus(quote.status).class}`">
                {{ formatStatus(quote.status).label }}
              </span>
              <span class="text-[9px] uppercase tracking-wider font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-sm border border-neutral-200">
                {{ quote.service }}
              </span>
            </div>
            <p class="text-xs text-neutral-600 line-clamp-1 max-w-lg">{{ quote.description }}</p>
            <div class="text-[10px] text-neutral-500 flex items-center gap-3">
              <span class="flex items-center gap-1 font-mono">
                <UIcon name="i-heroicons-phone" class="w-3 h-3 text-neutral-400" />
                {{ quote.phone }}
              </span>
              <span v-if="quote.location" class="flex items-center gap-1">
                <UIcon name="i-heroicons-map-pin" class="w-3 h-3 text-neutral-400" />
                {{ quote.location }}
              </span>
              <span>Reçu le {{ new Date(quote.createdAt).toLocaleDateString('fr-FR') }}</span>
            </div>
          </div>

          <NuxtLink
            :to="`/admin/devis?id=${quote.id}`"
            class="text-xs font-semibold text-neutral-900 hover:text-black uppercase tracking-wider text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-sm transition-colors"
          >
            Traiter
          </NuxtLink>
        </div>
      </div>

      <div v-else class="text-center py-8 text-neutral-500 text-xs">
        Aucune demande de devis pour le moment.
      </div>
    </div>
  </div>
</template>
