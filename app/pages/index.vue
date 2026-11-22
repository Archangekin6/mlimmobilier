<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSiteData } from '~/composables/useSiteData'
import { useSiteImages } from '~/composables/useSiteImages'

const { settings, publishedProjects } = useSiteData()
const { fetchSiteImages, getImageBySection } = useSiteImages()

// Fetch site images on mount
onMounted(async () => {
  await fetchSiteImages()
})

// Get hero background image
const heroImage = computed(() => {
  const img = getImageBySection('home', 'hero_background')
  return {
    url: img?.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    alt: img?.alt_text || 'Architecture contemporaine ML Immobilier'
  }
})

const activeCategory = ref<'all' | 'btp' | 'electrification' | 'gestion'>('all')

const filteredProjects = computed(() => {
  if (activeCategory.value === 'all') {
    return publishedProjects.value.slice(0, 6)
  }
  return publishedProjects.value.filter(p => p.category === activeCategory.value).slice(0, 6)
})

const services = [
  {
    id: 'btp',
    title: 'BTP & Construction Générale',
    badge: 'Pôle Construction',
    icon: 'i-heroicons-wrench-screwdriver',
    description: 'De l’étude géotechnique aux finitions de standing. Réalisation d’immeubles d’habitation, villas modernes, travaux de génie civil et rénovation lourde.',
    points: ['Gros œuvre & béton armé certifié', 'Rénovation & second œuvre soigné', 'Suivi de chantier rigoureux & délais garantis']
  },
  {
    id: 'electrification',
    title: 'Électrification HTA / BTA & Énergie',
    badge: 'Pôle Énergie',
    icon: 'i-heroicons-bolt',
    description: 'Conception et déploiement de réseaux électriques sécurisés conformes aux normes CIE. Postes transformateurs, électrification de lotissements et solaire.',
    points: ['Postes HTA/BTA & armoires TGBT', 'Électrification lotissements & voiries', 'Solutions solaires & groupes électrogènes']
  },
  {
    id: 'gestion',
    title: 'Gestion & Valorisation Immobilière',
    badge: 'Pôle Patrimoine',
    icon: 'i-heroicons-key',
    description: 'Optimisez la rentabilité et la longévité de vos biens à Abidjan. Gestion locative intégrale, recouvrement rigoureux et maintenance technique préventive.',
    points: ['Sélection rigoureuse des locataires', 'Taux de recouvrement des loyers > 99%', 'Entretien & valorisation du bâti']
  }
]

useSeoMeta({
  title: 'ML Immobilier SARL | BTP, Électrification & Gestion Immobilière à Abidjan',
  description: 'ML Immobilier SARL à Abidjan (Yopougon Terminus 27). Ingénierie BTP, réseaux d’électrification et gestion de patrimoine.'
})
</script>

<template>
  <div class="space-y-16 md:space-y-20 lg:space-y-24 pb-20">
    <!-- Notice Banner if enabled -->
    <div v-if="settings.showNotice && settings.bannerNotice" class="bg-neutral-100 border-b border-neutral-200 text-neutral-800 px-4 py-2.5 text-center text-xs font-medium flex items-center justify-center gap-2">
      <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-neutral-600 shrink-0" />
      <span>{{ settings.bannerNotice }}</span>
    </div>

    <!-- HERO SECTION: Architectural Photography with Content Overlay -->
    <section class="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img
          :src="heroImage.url"
          :alt="heroImage.alt"
          class="w-full h-full object-cover"
        />
        <!-- Overlay for text readability -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 w-full py-20 lg:py-28">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-3xl">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/95 backdrop-blur-sm border border-white/20 text-neutral-900 text-xs font-semibold uppercase tracking-wider mb-6 shadow-lg">
              <UIcon name="i-heroicons-building-office-2" class="w-3.5 h-3.5 text-neutral-700" />
              <span>Ingénierie BTP & Énergie à Abidjan</span>
            </div>

            <!-- Title -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-tight mb-6 drop-shadow-lg">
              {{ settings.heroTitle }}
            </h1>

            <!-- Subtitle -->
            <p class="text-base lg:text-lg text-white/95 leading-relaxed mb-8 max-w-2xl drop-shadow">
              {{ settings.heroSubtitle }}
            </p>

            <!-- CTAs -->
            <div class="flex flex-col sm:flex-row items-start gap-3 mb-12">
              <NuxtLink
                to="/contact"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm px-7 py-4 rounded-sm transition-all shadow-lg hover:shadow-xl"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                <span>{{ settings.heroCtaText }}</span>
              </NuxtLink>

              <NuxtLink
                to="/realisations"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-7 py-4 rounded-sm border border-white/30 transition-all"
              >
                <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                <span>Nos réalisations</span>
              </NuxtLink>
            </div>

            <!-- Trust Metrics -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div class="backdrop-blur-sm bg-white/10 rounded-sm px-4 py-3 border border-white/20">
                <div class="text-3xl font-black text-white tabular-nums mb-1">+{{ settings.statsYears }}</div>
                <div class="text-xs text-white/80 font-medium uppercase tracking-wide">Ans d'expérience</div>
              </div>
              <div class="backdrop-blur-sm bg-white/10 rounded-sm px-4 py-3 border border-white/20">
                <div class="text-3xl font-black text-white tabular-nums mb-1">+{{ settings.statsProjects }}</div>
                <div class="text-xs text-white/80 font-medium uppercase tracking-wide">Chantiers livrés</div>
              </div>
              <div class="backdrop-blur-sm bg-white/10 rounded-sm px-4 py-3 border border-white/20">
                <div class="text-3xl font-black text-white tabular-nums mb-1">{{ settings.statsSatisfaction }}%</div>
                <div class="text-xs text-white/80 font-medium uppercase tracking-wide">Clients satisfaits</div>
              </div>
              <div class="backdrop-blur-sm bg-white/10 rounded-sm px-4 py-3 border border-white/20">
                <div class="text-3xl font-black text-white tabular-nums mb-1">100%</div>
                <div class="text-xs text-white/80 font-medium uppercase tracking-wide">Normes CIE & BTP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator (optional) -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:block">
        <div class="animate-bounce">
          <UIcon name="i-heroicons-chevron-down" class="w-6 h-6 text-white/60" />
        </div>
      </div>
    </section>

    <!-- LES 3 SERVICES CLES -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl space-y-2 mb-12">
        <span class="text-neutral-500 font-bold text-xs uppercase tracking-widest">
          Expertises
        </span>
        <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
          Domaines d'Intervention
        </h2>
        <p class="text-neutral-600 text-sm leading-relaxed">
          Une synergie de compétences pour concevoir vos ouvrages, assurer vos raccordements haute/basse tension et pérenniser vos actifs immobiliers.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="service in services"
          :key="service.id"
          class="bg-white rounded-md p-6 border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-sm bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center">
                <UIcon :name="service.icon" class="w-5 h-5" />
              </div>
              <span class="text-[10px] font-bold text-neutral-600 uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded-sm border border-neutral-200">
                {{ service.badge }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-neutral-950">
              {{ service.title }}
            </h3>

            <p class="text-xs text-neutral-600 leading-relaxed">
              {{ service.description }}
            </p>

            <ul class="space-y-2 pt-2 border-t border-neutral-100">
              <li v-for="(point, idx) in service.points" :key="idx" class="flex items-center gap-2 text-xs text-neutral-700">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-6">
            <NuxtLink
              :to="`/contact?service=${service.id}`"
              class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm text-xs font-semibold uppercase tracking-wider bg-neutral-900 hover:bg-black text-white transition-colors shadow-xs"
            >
              <span>Demander un devis {{ service.id.toUpperCase() }}</span>
              <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- REALISATIONS RECENTES (FILTRABLES) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
        <div>
          <span class="text-neutral-500 font-bold text-xs uppercase tracking-widest">
            Portfolio
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight mt-1">
            Nos Réalisations sur le Terrain
          </h2>
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 border border-neutral-200 rounded-sm">
          <button
            type="button"
            @click="activeCategory = 'all'"
            :class="activeCategory === 'all' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
            class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
          >
            Tous
          </button>
          <button
            type="button"
            @click="activeCategory = 'btp'"
            :class="activeCategory === 'btp' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
            class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
          >
            BTP
          </button>
          <button
            type="button"
            @click="activeCategory = 'electrification'"
            :class="activeCategory === 'electrification' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
            class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
          >
            Électrification
          </button>
          <button
            type="button"
            @click="activeCategory = 'gestion'"
            :class="activeCategory === 'gestion' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-600 hover:text-black'"
            class="px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-colors"
          >
            Gestion
          </button>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="bg-white rounded-md overflow-hidden border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div class="relative h-56 overflow-hidden bg-neutral-100">
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
            <div class="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5 font-medium text-neutral-200">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-white" />
                <span>{{ project.location }}</span>
              </div>
              <span class="text-[10px] font-mono bg-neutral-900/80 text-neutral-200 px-2 py-0.5 rounded-sm border border-neutral-700">
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
              <span class="text-neutral-500">
                Maître d'ouvrage : {{ project.client || 'Privé' }}
              </span>
              <NuxtLink
                :to="`/realisations?category=${project.category}`"
                class="text-neutral-900 font-bold hover:text-black inline-flex items-center gap-1 uppercase tracking-wider text-[11px]"
              >
                <span>Détails</span>
                <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink
          to="/realisations"
          class="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-sm transition-colors shadow-xs"
        >
          <span>Consulter toutes nos réalisations</span>
          <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 text-white" />
        </NuxtLink>
      </div>
    </section>

    <!-- SECTION TEMOIGNAGES -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl space-y-2 mb-8">
        <span class="text-neutral-500 font-bold text-xs uppercase tracking-widest">
          Avis Clients
        </span>
        <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
          Retours d'Expérience
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-md p-6 border border-neutral-200 hover:border-neutral-300 transition-all shadow-xs space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-1 text-amber-500">
              <UIcon v-for="i in 5" :key="i" name="i-heroicons-star" class="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p class="text-xs text-neutral-700 leading-relaxed italic">
              « Le chantier de notre villa duplex à Cocody Riviera a été livré avec 2 semaines d'avance sur le planning contractuel. Rigueur technique et transparence sur les facturations. »
            </p>
          </div>
          <div class="pt-3 border-t border-neutral-100 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-sm bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              KA
            </div>
            <div>
              <div class="text-xs font-bold text-neutral-950">M. Kouamé A.</div>
              <div class="text-[10px] text-neutral-500 uppercase tracking-wider">Propriétaire • Cocody</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-md p-6 border border-neutral-200 hover:border-neutral-300 transition-all shadow-xs space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-1 text-amber-500">
              <UIcon v-for="i in 5" :key="i" name="i-heroicons-star" class="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p class="text-xs text-neutral-700 leading-relaxed italic">
              « Travaux d'électrification HTA/BTA de notre lotissement à Songon impeccables. Conformité CIE validée sans aucune réserve dès la première inspection technique. »
            </p>
          </div>
          <div class="pt-3 border-t border-neutral-100 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-sm bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              OT
            </div>
            <div>
              <div class="text-xs font-bold text-neutral-950">Dr. Ouattara T.</div>
              <div class="text-[10px] text-neutral-500 uppercase tracking-wider">Promoteur • Songon</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-md p-6 border border-neutral-200 hover:border-neutral-300 transition-all shadow-xs space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center gap-1 text-amber-500">
              <UIcon v-for="i in 5" :key="i" name="i-heroicons-star" class="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p class="text-xs text-neutral-700 leading-relaxed italic">
              « Vivant à l'étranger, la gestion de mon immeuble de 8 appartements à Yopougon était complexe. Avec ML Immobilier, les loyers sont virés ponctuellement avec compte rendu clair. »
            </p>
          </div>
          <div class="pt-3 border-t border-neutral-100 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-sm bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              SB
            </div>
            <div>
              <div class="text-xs font-bold text-neutral-950">Mme Soro B.</div>
              <div class="text-[10px] text-neutral-500 uppercase tracking-wider">Investisseuse • Yopougon</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION POURQUOI NOUS CHOISIR: Luminous Corporate Section -->
    <section class="bg-neutral-50 py-16 border-y border-neutral-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <span class="text-neutral-500 font-bold text-xs uppercase tracking-widest">
              Garanties & Méthodes
            </span>
            <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
              L'Assurance d'un Chantier Conforme, Livré dans les Délais.
            </h2>
            <p class="text-neutral-600 text-xs leading-relaxed">
              ML Immobilier SARL applique des normes d'ingénierie rigoureuses et une déontologie stricte. Nous garantissons la maîtrise des coûts, la conformité réglementaire et la sécurité de vos investissements.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3 bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
                <div class="w-8 h-8 rounded-sm bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                  <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 class="font-bold text-neutral-950 text-xs uppercase tracking-wider">Contrôle Qualité & Matériaux Certifiés</h4>
                  <p class="text-xs text-neutral-600 mt-0.5">Dosages de béton contrôlés, ferraillage certifié, appareillages électriques agréés CIE.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
                <div class="w-8 h-8 rounded-sm bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <h4 class="font-bold text-neutral-950 text-xs uppercase tracking-wider">Engagement sur les Délais d'Exécution</h4>
                  <p class="text-xs text-neutral-600 mt-0.5">Planning prévisionnel détaillé remis au client avec pénalités de retard contractuelles.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 bg-white p-4 rounded-sm border border-neutral-200 shadow-xs">
                <div class="w-8 h-8 rounded-sm bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                  <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <h4 class="font-bold text-neutral-950 text-xs uppercase tracking-wider">Interlocuteur Unique Dédié</h4>
                  <p class="text-xs text-neutral-600 mt-0.5">Rapports d'avancement réguliers avec photographies et relevés techniques sur site.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact box teaser -->
          <div class="bg-white p-8 rounded-md border border-neutral-200 space-y-6 shadow-sm">
            <h3 class="text-xl font-bold text-neutral-950">Étude de Projet & Chiffrage</h3>
            <p class="text-neutral-600 text-xs leading-relaxed">
              Consultez nos ingénieurs et techniciens pour une analyse technique personnalisée de votre chantier ou de vos biens immobiliers à Abidjan.
            </p>

            <div class="p-4 rounded-sm bg-neutral-50 border border-neutral-200 space-y-2.5 text-xs">
              <div class="flex items-center justify-between text-neutral-600">
                <span>Siège social :</span>
                <span class="text-neutral-950 font-medium">Yopougon Terminus 27</span>
              </div>
              <div class="flex items-center justify-between text-neutral-600">
                <span>Téléphone :</span>
                <a :href="`tel:${settings.phone1.replace(/\s+/g, '')}`" class="text-neutral-950 hover:underline font-mono font-semibold">
                  {{ settings.phone1 }}
                </a>
              </div>
              <div class="flex items-center justify-between text-neutral-600">
                <span>WhatsApp :</span>
                <span class="text-emerald-700 font-mono font-semibold">+{{ settings.whatsapp }}</span>
              </div>
            </div>

            <NuxtLink
              to="/contact"
              class="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-sm text-center transition-all shadow-xs"
            >
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 text-white" />
              <span>Demander une étude gratuite</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION LOCALISATION -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-md p-8 sm:p-10 border border-neutral-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
        <div class="lg:col-span-5 space-y-4">
          <span class="text-neutral-500 font-bold text-xs uppercase tracking-widest">
            Implantation
          </span>
          <h2 class="text-2xl font-black text-neutral-950 tracking-tight">
            Siège & Accueil Technique
          </h2>
          <p class="text-neutral-600 text-xs leading-relaxed">
            Situés à <strong>Yopougon, Terminus 27</strong>, nos bureaux accueillent maîtres d'ouvrage, propriétaires et partenaires pour l'étude de plans, devis et contrats.
          </p>

          <div class="space-y-2.5 pt-2 text-xs text-neutral-700">
            <div class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-neutral-900 shrink-0" />
              <span><strong>Adresse :</strong> {{ settings.address }}, {{ settings.city }}</span>
            </div>
            <div class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-neutral-900 shrink-0" />
              <span><strong>Horaires :</strong> {{ settings.workingHours }}</span>
            </div>
            <div class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-phone" class="w-4 h-4 text-neutral-900 shrink-0" />
              <span><strong>Contact :</strong> {{ settings.phone1 }}</span>
            </div>
          </div>
        </div>

        <!-- Access landmarks & routing -->
        <div class="lg:col-span-7 bg-neutral-50 rounded-sm p-6 border border-neutral-200 space-y-4">
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-neutral-950 uppercase tracking-wider">
              Accès & Rendez-vous
            </h3>
            <p class="text-xs text-neutral-600">
              Stationnement accessible à proximité immédiate du Terminus 27. Entretien technique possible sur rendez-vous ou sans interruption aux horaires de bureau.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3.5 bg-white border border-neutral-200 rounded-sm shadow-2xs">
              <div class="font-bold text-neutral-950">Études de plans</div>
              <div class="text-[11px] text-neutral-500 mt-0.5">Analyse sur place de vos cahiers des charges BTP et électriques.</div>
            </div>
            <div class="p-3.5 bg-white border border-neutral-200 rounded-sm shadow-2xs">
              <div class="font-bold text-neutral-950">Gérance locative</div>
              <div class="text-[11px] text-neutral-500 mt-0.5">Signatures de mandats et consultation de rapports d'état des lieux.</div>
            </div>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              :href="`https://maps.google.com/?q=${encodeURIComponent('Yopougon Terminus 27 Abidjan Côte d Ivoire')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors shadow-xs"
            >
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 text-white" />
              <span>Google Maps</span>
            </a>
            <NuxtLink
              to="/contact"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors shadow-xs"
            >
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-neutral-600" />
              <span>Prendre rendez-vous</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
