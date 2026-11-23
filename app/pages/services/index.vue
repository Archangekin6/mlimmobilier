<script setup lang="ts">
import { useSiteData } from '~/composables/useSiteData'
import { useSiteImages } from '~/composables/useSiteImages'
import type { ServiceSlug } from '~/composables/useSiteData'

const { settings, publishedServices } = useSiteData()
const { getImageBySection } = useSiteImages()

const serviceImageSections: Record<ServiceSlug, string> = {
  btp: 'btp_section_image',
  electrification: 'electrification_section_image',
  gestion: 'gestion_section_image'
}

const phoneLink = (phone: string) => phone.replace(/[\s().-]/g, '')
const whatsappNumber = settings.value.whatsapp.replace(/\D/g, '')

useSeoMeta({
  title: 'Nos Services | BTP, Électrification & Gestion Immobilière Abidjan',
  description: 'Services proposés par ML Immobilier SARL : travaux BTP, électrification HTA/BTA et gestion immobilière.'
})
</script>

<template>
  <div class="space-y-16 pb-20 md:space-y-20 lg:space-y-24">
    <section class="border-b border-neutral-200 bg-gradient-to-b from-white via-neutral-50/60 to-white py-16 text-center lg:py-20">
      <div class="mx-auto max-w-7xl space-y-3 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
          Des Services Conçus pour la Réussite de Vos Projets
        </h1>
        <p class="mx-auto max-w-2xl text-xs leading-relaxed text-neutral-600 sm:text-sm">
          Du gros œuvre à la valorisation de votre patrimoine en passant par les raccordements électriques à haute exigence technique.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-4 rounded-md border border-neutral-200 bg-white p-4 text-neutral-900 shadow-sm sm:flex-row sm:p-6">
        <div class="flex items-center gap-3.5 text-center sm:text-left">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-200 bg-neutral-100">
            <UIcon name="i-heroicons-phone" class="h-5 w-5" />
          </div>
          <div>
            <div class="text-xs font-bold uppercase tracking-wider sm:text-sm">Conseil technique direct</div>
            <div class="text-xs text-neutral-500">Nos équipes sont à votre écoute.</div>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2.5">
          <a
            v-if="settings.phone1"
            :href="`tel:${phoneLink(settings.phone1)}`"
            class="inline-flex items-center gap-2 rounded-sm bg-neutral-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-black"
          >
            <UIcon name="i-heroicons-phone" class="h-3.5 w-3.5" />
            <span>{{ settings.phone1 }}</span>
          </a>
          <a
            v-if="whatsappNumber"
            :href="`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour, je souhaite obtenir des informations sur vos services.')}`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-[#20BA59]"
          >
            <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.697c.969.53 1.83.824 2.806.824 3.182 0 5.768-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.485-4.464 9.949-9.969 9.949-1.748 0-3.385-.453-4.819-1.246l-5.212 1.359 1.385-5.074c-.9-1.488-1.423-3.23-1.423-5.088 0-5.485 4.464-9.949 9.969-9.949 5.505 0 9.969 4.464 9.969 9.949z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>

    <section
      v-for="service in publishedServices"
      :id="service.slug"
      :key="service.slug"
      class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div class="grid grid-cols-1 items-center gap-8 rounded-md border border-neutral-200 bg-white p-8 shadow-xs lg:grid-cols-12 lg:p-10">
        <div
          class="space-y-4 lg:col-span-6"
          :class="service.slug === 'electrification' ? 'lg:order-2' : ''"
        >
          <div class="inline-flex items-center gap-1.5 rounded-sm border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-800">
            <UIcon :name="service.icon" class="h-3.5 w-3.5" />
            <span>{{ service.badge }}</span>
          </div>

          <h2 class="text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl">
            {{ service.detailTitle }}
          </h2>
          <p class="text-xs leading-relaxed text-neutral-600 sm:text-sm">
            {{ service.detailDescription }}
          </p>

          <div v-if="service.detailItems.length" class="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <div
              v-for="(item, index) in service.detailItems"
              :key="`${service.slug}-${index}`"
              class="space-y-1 rounded-sm border border-neutral-200 bg-neutral-50 p-3.5"
            >
              <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-950">
                <UIcon name="i-heroicons-check" class="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{{ item.title }}</span>
              </div>
              <p class="text-[11px] text-neutral-600">{{ item.text }}</p>
            </div>
          </div>

          <div class="pt-2">
            <NuxtLink
              :to="`/contact?service=${service.slug}`"
              class="inline-flex items-center gap-2 rounded-sm bg-neutral-900 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-black"
            >
              <UIcon name="i-heroicons-document-text" class="h-4 w-4" />
              <span>Demander un devis — {{ service.homeTitle }}</span>
            </NuxtLink>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 shadow-sm lg:col-span-6"
          :class="service.slug === 'electrification' ? 'lg:order-1' : ''"
        >
          <img
            v-if="getImageBySection('services', serviceImageSections[service.slug])?.image_url"
            :src="getImageBySection('services', serviceImageSections[service.slug])?.image_url || ''"
            :alt="getImageBySection('services', serviceImageSections[service.slug])?.alt_text || service.detailTitle"
            class="h-[400px] w-full object-cover"
          >
        </div>
      </div>
    </section>

    <p v-if="!publishedServices.length" class="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-neutral-500">
      Aucun service n’est actuellement publié.
    </p>
  </div>
</template>
