<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteData, type Project } from '~/composables/useSiteData'

const route = useRoute()
const { settings, publishedProjects } = useSiteData()
const whatsappNumber = computed(() => settings.value.whatsapp.replace(/\D/g, ''))
const selectedCategory = ref<'all' | 'btp' | 'electrification' | 'gestion'>('all')
const activeModalProject = ref<Project | null>(null)
const currentPhotoIndex = ref(0)

onMounted(() => {
  if (route.query.category) {
    const cat = String(route.query.category).toLowerCase()
    if (cat === 'all' || cat === 'btp' || cat === 'electrification' || cat === 'gestion') {
      selectedCategory.value = cat
    }
  }
})

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'all') {
    return publishedProjects.value
  }
  return publishedProjects.value.filter(p => p.category === selectedCategory.value)
})

const projectCountByCategory = computed(() => ({
  btp: publishedProjects.value.filter(project => project.category === 'btp').length,
  electrification: publishedProjects.value.filter(project => project.category === 'electrification').length,
  gestion: publishedProjects.value.filter(project => project.category === 'gestion').length
}))

const categoryLabels: Record<Project['category'], string> = {
  btp: 'BTP – Bâtiment et travaux publics',
  electrification: 'Électrification et distribution électrique',
  gestion: 'Gestion immobilière'
}

const formatProjectDate = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(parsedDate)
}

const openProjectModal = (project: Project) => {
  activeModalProject.value = project
  currentPhotoIndex.value = 0
}

const closeProjectModal = () => {
  activeModalProject.value = null
}

watch(
  () => [route.query.project, publishedProjects.value] as const,
  ([projectId, projects]) => {
    if (typeof projectId !== 'string') return
    const project = projects.find(item => item.id === projectId)
    if (project) openProjectModal(project)
  },
  { immediate: true }
)

useSeoMeta({
  title: 'Nos réalisations | ML Immobilier SARL',
  description: `Découvrez les réalisations publiées de ${settings.value.companyName} dans ses trois domaines d’activité.`
})
</script>

<template>
  <div class="space-y-16 pb-20">
    <!-- Header banner: Luminous Contemporary Architecture -->
    <section class="bg-gradient-to-b from-white via-neutral-50/60 to-white py-16 lg:py-20 border-b border-neutral-200 text-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950">
          Nos réalisations
        </h1>
        <p class="text-neutral-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Consultez les projets publiés dans nos trois domaines d’activité.
        </p>
      </div>
    </section>

    <!-- Filters & Gallery -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Filter buttons: segmented corporate bar -->
      <div class="flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5 mb-10 bg-neutral-100 p-1 border border-neutral-200 rounded-sm mx-auto">
        <button
          type="button"
          @click="selectedCategory = 'all'"
          :class="selectedCategory === 'all' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
          class="px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
        >
          Tous ({{ publishedProjects.length }})
        </button>
        <button
          type="button"
          @click="selectedCategory = 'btp'"
          :class="selectedCategory === 'btp' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
          class="px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
        >
          BTP – Bâtiment et travaux publics ({{ projectCountByCategory.btp }})
        </button>
        <button
          type="button"
          @click="selectedCategory = 'electrification'"
          :class="selectedCategory === 'electrification' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
          class="px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
        >
          Électrification et distribution électrique ({{ projectCountByCategory.electrification }})
        </button>
        <button
          type="button"
          @click="selectedCategory = 'gestion'"
          :class="selectedCategory === 'gestion' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
          class="px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
        >
          Gestion immobilière ({{ projectCountByCategory.gestion }})
        </button>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="bg-white rounded-md overflow-hidden border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div class="relative h-60 overflow-hidden bg-neutral-100">
            <img
              v-if="project.imageUrl"
              :src="project.imageUrl"
              :alt="project.title"
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div v-else class="flex h-full items-center justify-center text-neutral-400">
              <UIcon name="i-heroicons-photo" class="h-10 w-10" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3">
              <span class="bg-neutral-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs">
                {{ project.category.toUpperCase() }}
              </span>
            </div>

            <div v-if="project.location || project.date" class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <div v-if="project.location" class="flex items-center gap-1.5 font-medium text-neutral-200">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-white" />
                <span>{{ project.location }}</span>
              </div>
              <span v-if="project.date" class="bg-neutral-900/80 border border-neutral-700 text-neutral-200 font-mono px-2 py-0.5 rounded-sm text-[10px]">
                {{ formatProjectDate(project.date) }}
              </span>
            </div>
          </div>

          <div class="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div class="space-y-1.5">
              <h3 class="font-bold text-base text-neutral-950">
                {{ project.title }}
              </h3>
              <p class="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                {{ project.description }}
              </p>
            </div>

            <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <button
                type="button"
                class="ml-auto text-neutral-900 font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1 group-hover:underline"
                @click="openProjectModal(project)"
              >
                <span>Voir le projet</span>
                <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state if no projects -->
      <div v-if="filteredProjects.length === 0" class="text-center py-16 bg-neutral-50 rounded-md border border-neutral-200 p-8">
        <UIcon name="i-heroicons-photo" class="w-10 h-10 text-neutral-400 mx-auto mb-3" />
        <h3 class="text-base font-bold text-neutral-900">
          {{ publishedProjects.length === 0 ? 'Aucune réalisation publiée pour le moment' : 'Aucune réalisation dans cette catégorie' }}
        </h3>
        <p class="text-sm text-neutral-500 mt-2 max-w-lg mx-auto">
          {{ publishedProjects.length === 0
            ? 'Les réalisations validées apparaîtront ici dès leur publication.'
            : 'Aucun projet publié ne correspond à ce filtre. Choisissez une autre catégorie.' }}
        </p>
        <button
          v-if="publishedProjects.length > 0 && selectedCategory !== 'all'"
          type="button"
          class="mt-4 text-xs font-bold uppercase tracking-wider text-neutral-900 underline underline-offset-4"
          @click="selectedCategory = 'all'"
        >
          Voir toutes les catégories
        </button>
      </div>
    </section>

    <!-- PROJECT DETAIL MODAL / LIGHTBOX -->
    <div
      v-if="activeModalProject"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      @click.self="closeProjectModal"
    >
      <div role="dialog" aria-modal="true" :aria-label="activeModalProject.title" class="bg-white rounded-md max-w-3xl w-full overflow-hidden border border-neutral-200 shadow-xl flex flex-col max-h-[90vh]">
        <!-- Modal Header: Clean White -->
        <div class="p-4 sm:p-5 bg-white text-neutral-900 flex items-center justify-between border-b border-neutral-200">
          <div>
            <span class="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{{ categoryLabels[activeModalProject.category] }}</span>
            <h2 class="text-lg sm:text-xl font-black text-neutral-950 mt-0.5">{{ activeModalProject.title }}</h2>
          </div>
          <button
            type="button"
            @click="closeProjectModal"
            aria-label="Fermer les détails du projet"
            class="p-1.5 text-neutral-500 hover:text-black rounded-sm hover:bg-neutral-100 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-5 overflow-y-auto">
          <!-- Main Photo Viewer -->
          <div class="relative rounded-sm overflow-hidden bg-neutral-100 h-56 sm:h-72 border border-neutral-200">
            <img
              v-if="(activeModalProject.gallery && activeModalProject.gallery.length > 0) ? activeModalProject.gallery[currentPhotoIndex] : activeModalProject.imageUrl"
              :src="(activeModalProject.gallery && activeModalProject.gallery.length > 0) ? activeModalProject.gallery[currentPhotoIndex] : activeModalProject.imageUrl"
              :alt="activeModalProject.title"
              loading="lazy"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center text-neutral-400">
              <UIcon name="i-heroicons-photo" class="h-10 w-10" />
            </div>
          </div>

          <!-- Thumbnails if gallery exists -->
          <div
            v-if="activeModalProject.gallery && activeModalProject.gallery.length > 1"
            class="flex items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              v-for="(img, idx) in activeModalProject.gallery"
              :key="idx"
              type="button"
              @click="currentPhotoIndex = idx"
              class="w-16 h-12 rounded-sm overflow-hidden shrink-0 border-2 transition-all"
              :class="currentPhotoIndex === idx ? 'border-neutral-900' : 'border-transparent opacity-60 hover:opacity-100'"
            >
              <img :src="img" alt="" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Project Specs -->
          <div v-if="activeModalProject.location || activeModalProject.date" class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 text-xs">
            <div v-if="activeModalProject.location">
              <span class="text-neutral-500 block text-[10px] uppercase tracking-wider">Localisation :</span>
              <span class="font-bold text-neutral-950">{{ activeModalProject.location }}</span>
            </div>
            <div v-if="activeModalProject.date">
              <span class="text-neutral-500 block text-[10px] uppercase tracking-wider">Date de réalisation :</span>
              <span class="font-bold text-neutral-950">{{ formatProjectDate(activeModalProject.date) }}</span>
            </div>
          </div>

          <!-- Detailed text -->
          <div class="space-y-1.5">
            <h4 class="font-bold text-neutral-950 text-xs uppercase tracking-wider">Description de l'ouvrage :</h4>
            <p class="text-neutral-600 text-xs leading-relaxed">
              {{ activeModalProject.fullDescription || activeModalProject.description }}
            </p>
          </div>

          <!-- Modal Action CTA -->
          <div class="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <a
                v-if="whatsappNumber"
                :href="`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour ${settings.companyName}, je souhaite un devis suite au projet : ${activeModalProject.title}`)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20BA59] text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors shadow-xs"
              >
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.697c.969.53 1.83.824 2.806.824 3.182 0 5.768-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.485-4.464 9.949-9.969 9.949-1.748 0-3.385-.453-4.819-1.246l-5.212 1.359 1.385-5.074c-.9-1.488-1.423-3.23-1.423-5.088 0-5.485 4.464-9.949 9.969-9.949 5.505 0 9.969 4.464 9.969 9.949z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
              <a
                v-if="settings.phone1"
                :href="`tel:${settings.phone1.replace(/\s+/g, '')}`"
                class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors"
              >
                <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-neutral-600" />
                <span>Appeler</span>
              </a>
            </div>

            <NuxtLink
              :to="`/contact?service=${activeModalProject.category}&project=${encodeURIComponent(activeModalProject.title)}`"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors text-center shadow-xs"
            >
              <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 text-white" />
              <span>Demander un devis</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
