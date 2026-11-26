<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSiteData } from '~/composables/useSiteData'

const router = useRouter()
const { adminProfile, logout, isAuthenticated, isLoadingProfile } = useAuth()
const { pendingQuotesCount: quotesCount, loadAdminData } = useSiteData()
const logoutError = ref('')
const dataLoadError = ref('')

onMounted(async () => {
  try {
    await loadAdminData()
  } catch (error) {
    console.error('Erreur de chargement des données administratives:', error)
    dataLoadError.value = 'Impossible de charger les données administratives.'
  }
})

watch([isAuthenticated, isLoadingProfile], ([authenticated, loading]) => {
  if (!authenticated && !loading) {
    void router.replace('/admin/login')
  }
})

const handleLogout = async () => {
  logoutError.value = ''
  const result = await logout()

  if (result.success) {
    await router.replace('/admin/login')
  } else {
    logoutError.value = result.error || 'Impossible de se déconnecter'
  }
}

const navItems = [
  { label: 'Tableau de bord', to: '/admin', icon: 'i-heroicons-squares-2x2', exact: true },
  { label: 'Accueil', to: '/admin/accueil', icon: 'i-heroicons-home' },
  { label: 'Qui sommes-nous', to: '/admin/qui-sommes-nous', icon: 'i-heroicons-building-office-2' },
  { label: 'Services', to: '/admin/services', icon: 'i-heroicons-wrench-screwdriver' },
  { label: 'Réalisations', to: '/admin/realisations', icon: 'i-heroicons-photo' },
  { label: 'Témoignages', to: '/admin/temoignages', icon: 'i-heroicons-chat-bubble-left-right' },
  { label: 'Coordonnées & contact', to: '/admin/reglages', icon: 'i-heroicons-identification' },
  { label: 'Demandes de devis', to: '/admin/devis', icon: 'i-heroicons-inbox-stack' }
]
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col md:flex-row">
    <!-- Admin Sidebar: Luminous White & Clean Border -->
    <aside class="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0">
      <!-- Admin Brand -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-neutral-200">
        <NuxtLink to="/admin" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-sm bg-neutral-900 text-white flex items-center justify-center font-bold">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-white" />
          </div>
          <div>
            <div class="font-black text-neutral-950 text-xs tracking-wider">ML IMMOBILIER</div>
            <div class="text-[9px] text-neutral-500 font-semibold uppercase tracking-widest">Espace Administration</div>
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between px-3 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
          active-class="bg-neutral-900 text-white font-bold hover:bg-neutral-900 hover:text-white"
          :exact="item.exact"
        >
          <div class="flex items-center gap-2.5">
            <UIcon :name="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </div>
          <span
            v-if="item.to === '/admin/devis' && quotesCount > 0"
            class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm border border-emerald-200"
          >
            {{ quotesCount }}
          </span>
        </NuxtLink>
      </nav>

      <!-- User & Quick Exit -->
      <div class="p-3.5 border-t border-neutral-200 bg-neutral-50/80">
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="truncate">
            <div class="text-xs font-bold text-neutral-900 truncate">{{ adminProfile?.full_name || 'Administrateur' }}</div>
            <div class="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Administrateur</div>
          </div>
          <button
            @click="handleLogout"
            title="Se déconnecter"
            class="p-1.5 text-neutral-500 hover:text-red-600 rounded-sm hover:bg-neutral-100 transition-colors"
          >
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
          </button>
        </div>
        <p v-if="logoutError" class="mb-2 px-1 text-[10px] text-red-600">{{ logoutError }}</p>

        <NuxtLink
          to="/"
          target="_blank"
          class="flex items-center justify-center gap-1.5 w-full bg-white hover:bg-neutral-100 text-neutral-800 text-[11px] font-semibold uppercase tracking-wider py-2 rounded-sm transition-colors border border-neutral-300 shadow-xs"
        >
          <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3.5 h-3.5 text-neutral-500" />
          <span>Voir le site</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 bg-neutral-50">
      <!-- Top header bar: Clean White -->
      <header class="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <h1 class="text-xs sm:text-sm font-bold text-neutral-950 uppercase tracking-wider">Console de Gestion</h1>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Session active</span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/admin/devis"
            class="relative p-1.5 text-neutral-600 hover:text-neutral-950 transition-colors rounded-sm hover:bg-neutral-100"
            title="Demandes de devis"
          >
            <UIcon name="i-heroicons-bell" class="w-4 h-4" />
            <span
              v-if="quotesCount > 0"
              class="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"
            ></span>
          </NuxtLink>

          <NuxtLink
            to="/admin/reglages"
            class="p-1.5 text-neutral-600 hover:text-neutral-950 transition-colors rounded-sm hover:bg-neutral-100"
            title="Réglages"
          >
            <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </header>

      <!-- Page Body Slot -->
      <main class="flex-1 p-6 sm:p-8 overflow-y-auto">
        <p v-if="dataLoadError" class="mb-4 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          {{ dataLoadError }}
        </p>
        <slot />
      </main>
    </div>
  </div>
</template>
