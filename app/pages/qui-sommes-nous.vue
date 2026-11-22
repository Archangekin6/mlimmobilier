<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSiteData } from '~/composables/useSiteData'
import { useSiteImages } from '~/composables/useSiteImages'

const { settings } = useSiteData()
const { fetchSiteImages, getImageBySection } = useSiteImages()

// Fetch site images on mount
onMounted(async () => {
  await fetchSiteImages()
})

// Get hero background image
const heroImage = computed(() => {
  const img = getImageBySection('about', 'hero_background')
  return {
    url: img?.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80',
    alt: img?.alt_text || 'Architecture moderne Abidjan'
  }
})

// Get presentation image
const presentationImage = computed(() => {
  const img = getImageBySection('about', 'presentation_image')
  return {
    url: img?.image_url || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
    alt: img?.alt_text || 'Équipe technique ML Immobilier SARL'
  }
})

useSeoMeta({
  title: 'Qui sommes-nous | ML Immobilier SARL Abidjan',
  description: 'Présentation de ML Immobilier SARL, entreprise ivoirienne de BTP, électrification et gestion immobilière basée à Abidjan (Yopougon Terminus 27).'
})
</script>

<template>
  <div class="space-y-16 md:space-y-20 pb-20">
    <!-- Header banner: Architectural Photography with Text Overlay -->
    <section class="relative min-h-[400px] lg:min-h-[500px] flex items-center">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img
          :src="heroImage.url"
          :alt="heroImage.alt"
          class="w-full h-full object-cover"
        />
        <!-- White overlay for dark text readability -->
        <div class="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 w-full py-16 lg:py-20 text-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950 drop-shadow-sm">
            Bâtir l'Avenir d'Abidjan avec Rigueur & Méthode
          </h1>
          <p class="text-neutral-700 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Découvrez les valeurs, la mission et l'équipe d'ingénieurs et techniciens qui constituent le socle de <strong>ML Immobilier SARL</strong>.
          </p>
        </div>
      </div>
    </section>

    <!-- Presentation Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div class="space-y-4">
          <div class="inline-flex items-center gap-2 text-[10px] font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-sm uppercase tracking-wider">
            <span>Présentation de la société</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            Un acteur d'ingénierie BTP et d'énergie à Abidjan
          </h2>

          <p class="text-neutral-600 text-xs sm:text-sm leading-relaxed">
            Créée pour répondre aux impératifs d'urbanisation, d'infrastructures électriques conformes et de sécurisation du foncier en Côte d'Ivoire, <strong>ML Immobilier SARL</strong> est une entreprise pluridisciplinaire enregistrée au registre du commerce d'Abidjan.
          </p>

          <p class="text-neutral-600 text-xs sm:text-sm leading-relaxed">
            Implantée à <strong>Yopougon (Terminus 27)</strong>, notre équipe regroupe des ingénieurs en génie civil, des techniciens électriciens habilités et des gestionnaires d'actifs. Nous garantissons une présence terrain continue, le contrôle des coûts et le respect scrupuleux des normes ivoiriennes.
          </p>

          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
            <div class="p-4 rounded-sm bg-neutral-50 border border-neutral-200">
              <div class="text-2xl font-black text-neutral-950 tabular-nums">+{{ settings.statsProjects }}</div>
              <div class="text-xs font-bold text-neutral-900 uppercase tracking-wider mt-0.5">Chantiers livrés</div>
              <div class="text-[11px] text-neutral-500">Particuliers & Entreprises</div>
            </div>
            <div class="p-4 rounded-sm bg-neutral-50 border border-neutral-200">
              <div class="text-2xl font-black text-neutral-950 tabular-nums">100%</div>
              <div class="text-xs font-bold text-neutral-900 uppercase tracking-wider mt-0.5">Conformité</div>
              <div class="text-[11px] text-neutral-500">Normes CIE & BTP</div>
            </div>
          </div>
        </div>

        <div class="rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
          <img
            :src="presentationImage.url"
            :alt="presentationImage.alt"
            class="w-full h-[400px] object-cover"
          />
        </div>
      </div>
    </section>

    <!-- Nos Piliers -->
    <section class="bg-neutral-50 border-y border-neutral-200 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl space-y-2 mb-10">
          <span class="text-neutral-500 font-bold text-xs uppercase tracking-widest">
            Nos Piliers
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            4 Principes au Cœur de Chacun de nos Chantiers
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-6 rounded-md border border-neutral-200 space-y-3 shadow-xs">
            <div class="w-9 h-9 rounded-sm bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-emerald-600" />
            </div>
            <h3 class="font-bold text-neutral-950 text-sm uppercase tracking-wider">Rigueur & Qualité</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">
              Exigence absolue sur le calcul des charges, le ferraillage et la sécurité des installations haute tension.
            </p>
          </div>

          <div class="bg-white p-6 rounded-md border border-neutral-200 space-y-3 shadow-xs">
            <div class="w-9 h-9 rounded-sm bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-neutral-700" />
            </div>
            <h3 class="font-bold text-neutral-950 text-sm uppercase tracking-wider">Transparence Totale</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">
              Devis quantitatifs clairs sans frais dissimulés. Rapports d'avancement remis à chaque phase d'exécution.
            </p>
          </div>

          <div class="bg-white p-6 rounded-md border border-neutral-200 space-y-3 shadow-xs">
            <div class="w-9 h-9 rounded-sm bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-neutral-700" />
            </div>
            <h3 class="font-bold text-neutral-950 text-sm uppercase tracking-wider">Respect des Délais</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">
              Planification rigoureuse et approvisionnement anticipé pour livrer les ouvrages aux dates contractuelles.
            </p>
          </div>

          <div class="bg-white p-6 rounded-md border border-neutral-200 space-y-3 shadow-xs">
            <div class="w-9 h-9 rounded-sm bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
              <UIcon name="i-heroicons-user" class="w-5 h-5 text-neutral-700" />
            </div>
            <h3 class="font-bold text-neutral-950 text-sm uppercase tracking-wider">Interlocuteur Dédié</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">
              Un chargé d'affaires qui suit votre dossier de bout en bout et vous conseille avec précision.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-4xl mx-auto px-4 text-center space-y-5">
      <h2 class="text-2xl sm:text-3xl font-black text-neutral-950">Un projet à Abidjan ou en Côte d'Ivoire ?</h2>
      <p class="text-neutral-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
        Consultez nos équipes techniques à notre agence de Yopougon Terminus 27 ou transmettez votre cahier des charges en ligne.
      </p>
      <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-sm transition-all shadow-xs"
        >
          <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
          <span>Demander un devis gratuit</span>
        </NuxtLink>
        <a
          :href="`tel:${settings.phone1.replace(/\s+/g, '')}`"
          class="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-sm transition-colors shadow-xs"
        >
          <UIcon name="i-heroicons-phone" class="w-4 h-4 text-neutral-600" />
          <span>Appeler le siège</span>
        </a>
      </div>
    </section>
  </div>
</template>
