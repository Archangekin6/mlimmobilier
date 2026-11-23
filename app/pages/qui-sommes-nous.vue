<script setup lang="ts">
import { computed } from 'vue'
import { useSiteData } from '~/composables/useSiteData'
import { useSiteImages } from '~/composables/useSiteImages'

const { settings } = useSiteData()
const { getImageBySection } = useSiteImages()

// Get hero background image
const heroImage = computed(() => {
  const img = getImageBySection('about', 'hero_background')
  return {
    url: img?.image_url || '',
    alt: img?.alt_text || 'Architecture moderne Abidjan'
  }
})

// Get presentation image
const presentationImage = computed(() => {
  const img = getImageBySection('about', 'presentation_image')
  return {
    url: img?.image_url || '',
    alt: img?.alt_text || 'Équipe technique ML Immobilier SARL'
  }
})

const aboutValues = computed(() => [
  { title: settings.value.aboutValue1Title, text: settings.value.aboutValue1Text, icon: 'i-heroicons-shield-check' },
  { title: settings.value.aboutValue2Title, text: settings.value.aboutValue2Text, icon: 'i-heroicons-document-text' },
  { title: settings.value.aboutValue3Title, text: settings.value.aboutValue3Text, icon: 'i-heroicons-clock' },
  { title: settings.value.aboutValue4Title, text: settings.value.aboutValue4Text, icon: 'i-heroicons-user' }
].filter(value => value.title || value.text))

const aboutStats = computed(() => [
  { value: settings.value.statsProjects, label: 'Chantiers livrés', prefix: '+' },
  { value: settings.value.statsClients, label: 'Clients accompagnés', prefix: '+' },
  { value: settings.value.statsYears, label: 'Ans d’expérience', prefix: '+' },
  { value: settings.value.statsSatisfaction, label: 'Satisfaction', prefix: '', suffix: '%' }
].filter(stat => stat.value !== null))

useSeoMeta({
  title: `Qui sommes-nous | ${settings.value.companyName}`,
  description: settings.value.aboutHeroSubtitle
})
</script>

<template>
  <div class="space-y-16 md:space-y-20 pb-20">
    <!-- Header banner: Architectural Photography with Text Overlay -->
    <section class="relative min-h-[400px] lg:min-h-[500px] flex items-center">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0 bg-neutral-100">
        <img
          v-if="heroImage.url"
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
            {{ settings.aboutHeroTitle }}
          </h1>
          <p class="text-neutral-700 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {{ settings.aboutHeroSubtitle }}
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
            {{ settings.aboutPresentationTitle }}
          </h2>

          <p class="text-neutral-600 text-xs sm:text-sm leading-relaxed">
            {{ settings.aboutPresentationText }}
          </p>

          <p class="text-neutral-600 text-xs sm:text-sm leading-relaxed">
            {{ settings.aboutLocationText }}
          </p>

          <div v-if="aboutStats.length" class="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-3">
            <div v-for="stat in aboutStats" :key="stat.label" class="rounded-sm border border-neutral-200 bg-neutral-50 p-4">
              <div class="tabular-nums text-2xl font-black text-neutral-950">{{ stat.prefix }}{{ stat.value }}{{ 'suffix' in stat ? stat.suffix : '' }}</div>
              <div class="mt-0.5 text-xs font-bold uppercase tracking-wider text-neutral-900">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
          <img
            v-if="presentationImage.url"
            :src="presentationImage.url"
            :alt="presentationImage.alt"
            class="w-full h-[400px] object-cover"
          />
        </div>
      </div>
    </section>

    <section v-if="settings.aboutMissionTitle || settings.aboutMissionText" class="border-y border-neutral-200 bg-white py-16">
      <div class="mx-auto max-w-4xl space-y-3 px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-black tracking-tight text-neutral-950">{{ settings.aboutMissionTitle }}</h2>
        <p class="text-sm leading-relaxed text-neutral-600">{{ settings.aboutMissionText }}</p>
      </div>
    </section>

    <!-- Nos Piliers -->
    <section v-if="aboutValues.length" class="bg-neutral-50 border-y border-neutral-200 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl space-y-2 mb-10">
          <span class="text-neutral-500 font-bold text-xs uppercase tracking-widest">
            {{ settings.aboutValuesTitle }}
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            {{ settings.aboutValuesSubtitle }}
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="value in aboutValues" :key="value.title" class="space-y-3 rounded-md border border-neutral-200 bg-white p-6 shadow-xs">
            <div class="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-200 bg-neutral-100 font-bold text-neutral-900">
              <UIcon :name="value.icon" class="h-5 w-5 text-emerald-600" />
            </div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-950">{{ value.title }}</h3>
            <p class="text-xs leading-relaxed text-neutral-600">{{ value.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-4xl mx-auto px-4 text-center space-y-5">
      <h2 class="text-2xl sm:text-3xl font-black text-neutral-950">{{ settings.aboutCtaTitle }}</h2>
      <p class="text-neutral-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
        {{ settings.aboutCtaText }}
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
          v-if="settings.phone1"
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
