<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteData, type Project } from '~/composables/useSiteData'

const route = useRoute()
const { settings, publishedProjects } = useSiteData()
const selectedCategory = ref<'all' | 'btp' | 'electrification' | 'gestion'>('all')
const activeModalProject = ref<Project | null>(null)
const currentPhotoIndex = ref(0)

onMounted(() => {
  if (route.query.category) {
    const cat = String(route.query.category).toLowerCase()
    if (['all', 'btp', 'electrification', 'gestion'].includes(cat)) {
      selectedCategory.value = cat as any
    }
  }
})

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'all') {
    return publishedProjects.value
  }
  return publishedProjects.value.filter(p => p.category === selectedCategory.value)
})

const openProjectModal = (project: Project) => {
  activeModalProject.value = project
  currentPhotoIndex.value = 0
}

const closeProjectModal = () => {
  activeModalProject.value = null
}

useSeoMeta({
  title: 'Nos Réalisations | Galerie Photos BTP & Énergie Abidjan',
  description: 'Découvrez les chantiers et réalisations de ML Immobilier SARL : Immeubles BTP, lotissements électrifiés et parcs locatifs gérés à Abidjan.'
})
</script>

<template>
  <div class="space-y-16 pb-20">
    <!-- Header banner: Luminous Contemporary Architecture -->
    <section class="bg-gradient-to-b from-white via-neutral-50/60 to-white py-16 lg:py-20 border-b border-neutral-200 text-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950">
          La Preuve par nos Réalisations
        </h1>
        <p class="text-neutral-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Explorez nos projets récents à travers Abidjan et la Côte d'Ivoire. Rigueur d'exécution, respect des normes et finitions professionnelles.
        </p>
      </div>
    </section>

    <!-- Filters & Gallery -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Filter buttons: segmented corporate bar -->
      <div class="flex flex-wrap items-center justify-center gap-1.5 mb-10 bg-neutral-100 p-1 border border-neutral-200 rounded-sm max-w-fit mx-auto">
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
          BTP & Construction
        </button>
        <button
          type="button"
          @click="selectedCategory = 'electrification'"
          :class="selectedCategory === 'electrification' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
          class="px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
        >
          Électrification & Réseaux
        </button>
        <button
          type="button"
          @click="selectedCategory = 'gestion'"
          :class="selectedCategory === 'gestion' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
          class="px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
        >
          Gestion Immobilière
        </button>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="bg-white rounded-md overflow-hidden border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          @click="openProjectModal(project)"
        >
          <div class="relative h-60 overflow-hidden bg-neutral-100">
            <img
              :src="project.imageUrl"
              :alt="project.title"
              class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3">
              <span class="bg-neutral-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs">
                {{ project.category.toUpperCase() }}
              </span>
            </div>

            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <div class="flex items-center gap-1.5 font-medium text-neutral-200">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-white" />
                <span>{{ project.location }}</span>
              </div>
              <span class="bg-neutral-900/80 border border-neutral-700 text-neutral-200 font-mono px-2 py-0.5 rounded-sm text-[10px]">
                {{ project.date }}
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
              <span class="text-neutral-500 text-[11px]">
                Client : {{ project.client || 'Privé' }}
              </span>
              <button
                type="button"
                class="text-neutral-900 font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1 group-hover:underline"
              >
                <span>Galerie</span>
                <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state if no projects -->
      <div v-if="filteredProjects.length === 0" class="text-center py-16 bg-neutral-50 rounded-md border border-neutral-200 p-8">
        <UIcon name="i-heroicons-photo" class="w-10 h-10 text-neutral-400 mx-auto mb-2" />
        <h3 class="text-sm font-bold text-neutral-900 uppercase tracking-wider">Aucun projet dans cette catégorie</h3>
        <p class="text-xs text-neutral-500 mt-1">Sélectionnez une autre catégorie ci-dessus.</p>
      </div>
    </section>

    <!-- PROJECT DETAIL MODAL / LIGHTBOX -->
    <div
      v-if="activeModalProject"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      @click.self="closeProjectModal"
    >
      <div class="bg-white rounded-md max-w-3xl w-full overflow-hidden border border-neutral-200 shadow-xl flex flex-col max-h-[90vh]">
        <!-- Modal Header: Clean White -->
        <div class="p-4 sm:p-5 bg-white text-neutral-900 flex items-center justify-between border-b border-neutral-200">
          <div>
            <span class="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{{ activeModalProject.category }}</span>
            <h2 class="text-lg sm:text-xl font-black text-neutral-950 mt-0.5">{{ activeModalProject.title }}</h2>
          </div>
          <button
            type="button"
            @click="closeProjectModal"
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
              :src="(activeModalProject.gallery && activeModalProject.gallery.length > 0) ? activeModalProject.gallery[currentPhotoIndex] : activeModalProject.imageUrl"
              :alt="activeModalProject.title"
              class="w-full h-full object-cover"
            />
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
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <span class="text-neutral-500 block text-[10px] uppercase tracking-wider">Localisation :</span>
              <span class="font-bold text-neutral-950">{{ activeModalProject.location }}</span>
            </div>
            <div>
              <span class="text-neutral-500 block text-[10px] uppercase tracking-wider">Année :</span>
              <span class="font-bold text-neutral-950">{{ activeModalProject.date }}</span>
            </div>
            <div>
              <span class="text-neutral-500 block text-[10px] uppercase tracking-wider">Maître d'ouvrage :</span>
              <span class="font-bold text-neutral-950">{{ activeModalProject.client || 'Privé' }}</span>
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
                :href="`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Bonjour ML Immobilier, je souhaite un devis suite au projet : ${activeModalProject.title}`)}`"
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
