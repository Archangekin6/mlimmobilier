<script setup lang="ts">
import { ref } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

const { settings } = useSiteData()
const isMobileMenuOpen = ref(false)

const navLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Qui sommes-nous', to: '/qui-sommes-nous' },
  { label: 'Services', to: '/services' },
  { label: 'Réalisations', to: '/realisations' },
  { label: 'Contact & Devis', to: '/contact' }
]
</script>

<template>
  <header class="w-full sticky top-0 z-40 bg-white text-neutral-900 border-b border-neutral-200 transition-shadow duration-300">
    <!-- Main Navigation Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center group">
          <img 
            v-if="settings.logoUrl" 
            :src="settings.logoUrl" 
            :alt="`Logo ${settings.companyName}`"
            class="h-14 w-auto object-contain transition-all duration-300 group-hover:opacity-90"
          />
          <div 
            v-else 
            class="w-10 h-10 rounded-sm bg-neutral-900 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-black"
          >
            <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-white" />
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-2">
          <NuxtLink
            v-for="item in navLinks"
            :key="item.to"
            :to="item.to"
            class="nav-link relative px-4 py-2 text-[13px] font-medium text-neutral-700 hover:text-neutral-950 transition-colors duration-200"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Desktop CTA & Phone -->
        <div class="hidden lg:flex items-center gap-5">
          <a
            :href="`tel:${settings.phone1.replace(/\s+/g, '')}`"
            class="text-[13px] text-neutral-600 hover:text-neutral-950 transition-colors duration-200 flex items-center gap-2 font-medium"
          >
            <UIcon name="i-heroicons-phone" class="w-4 h-4 text-neutral-500" />
            <span>{{ settings.phone1 }}</span>
          </a>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold text-[13px] tracking-wide px-5 py-2.5 rounded-sm transition-all duration-200 shadow-sm hover:shadow"
          >
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
            <span>Demander un devis</span>
          </NuxtLink>
        </div>

        <!-- Mobile Menu Toggle -->
        <div class="flex items-center lg:hidden">
          <button
            type="button"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 rounded-sm text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 focus:outline-none transition-all duration-200"
            :aria-label="isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
          >
            <UIcon :name="isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden border-t border-neutral-200 bg-white px-4 pt-4 pb-6 space-y-2"
      >
        <NuxtLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          @click="isMobileMenuOpen = false"
          class="block px-4 py-3 rounded-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors duration-200"
          active-class="text-neutral-950 bg-neutral-100 font-semibold"
        >
          {{ item.label }}
        </NuxtLink>

        <div class="pt-4 border-t border-neutral-200 flex flex-col gap-3">
          <NuxtLink
            to="/contact"
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-center gap-2 w-full bg-neutral-900 hover:bg-black text-white font-semibold py-3 rounded-sm text-[13px] tracking-wide text-center transition-all duration-200"
          >
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
            <span>Demander un devis</span>
          </NuxtLink>

          <a
            :href="`tel:${settings.phone1.replace(/\s+/g, '')}`"
            class="flex items-center justify-center gap-2 w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium py-3 rounded-sm text-[13px] text-center border border-neutral-200 transition-all duration-200"
          >
            <UIcon name="i-heroicons-phone" class="w-4 h-4 text-neutral-500" />
            <span>{{ settings.phone1 }}</span>
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* Animated underline for navigation links */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #111111;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .nav-link::after {
    transition: none;
  }
}

.nav-link:hover::after {
  transform: scaleX(1);
}

/* Active state with permanent underline */
.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  color: #111111;
  font-weight: 600;
}

.nav-link.router-link-active::after,
.nav-link.router-link-exact-active::after {
  transform: scaleX(1);
}

/* Header shadow on scroll (handled by JS if needed) */
header.scrolled {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
}
</style>
