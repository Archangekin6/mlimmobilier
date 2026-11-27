<script setup lang="ts">
import { useSiteData } from '~/composables/useSiteData'

const { settings, publishedServices } = useSiteData()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#111111] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <!-- Col 1: Identity -->
        <div class="space-y-4">
          <div class="flex min-w-0 items-center gap-3">
            <img
              src="/uploads/img-1795172952218-4154do.jpg"
              :alt="`Logo ${settings.companyName}`"
              class="max-h-10 w-auto max-w-24 shrink-0 object-contain"
            >
            <div class="min-w-0">
              <span class="text-base font-black text-white tracking-wider">{{ settings.companyName }}</span>
              <span v-if="settings.city" class="block text-[10px] uppercase tracking-widest text-neutral-400 font-medium">{{ settings.city }}</span>
            </div>
          </div>
          <p v-if="settings.tagline" class="text-xs text-neutral-400 leading-relaxed">
            {{ settings.tagline }}
          </p>

          <!-- Social Icons — Official brand hover colors -->
          <div class="flex items-center gap-2 pt-2">
            <a
              v-if="settings.socialFacebookEnabled && /^https?:\/\//i.test(settings.socialFacebook)"
              :href="settings.socialFacebook"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook ML Immobilier"
              class="w-8 h-8 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] flex items-center justify-center transition-all"
            >
              <UIcon name="i-simple-icons-facebook" class="w-4 h-4" />
            </a>
            <a
              v-if="settings.socialLinkedin"
              :href="settings.socialLinkedin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn ML Immobilier"
              class="w-8 h-8 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] flex items-center justify-center transition-all"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              v-if="settings.socialInstagramEnabled && /^https?:\/\//i.test(settings.socialInstagram)"
              :href="settings.socialInstagram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram ML Immobilier"
              class="w-8 h-8 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-[#E4405F] hover:border-[#E4405F] flex items-center justify-center transition-all"
            >
              <UIcon name="i-simple-icons-instagram" class="w-4 h-4" />
            </a>
            <a
              v-if="settings.socialWhatsappEnabled && settings.whatsapp.replace(/\D/g, '')"
              :href="`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contacter ML Immobilier sur WhatsApp"
              class="w-8 h-8 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] flex items-center justify-center transition-all"
            >
              <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Col 2: Services -->
        <div>
          <h4 class="text-white font-bold text-xs uppercase tracking-wider mb-4">
            Domaines d'Intervention
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li v-for="service in publishedServices" :key="service.slug">
              <NuxtLink :to="`/services#${service.slug}`" class="hover:text-white transition-colors flex items-center gap-1.5">
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 text-neutral-500" />
                <span>{{ service.homeTitle }}</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/realisations" class="hover:text-white transition-colors flex items-center gap-1.5">
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 text-neutral-500" />
                <span>Réalisations & Chantiers</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Navigation -->
        <div>
          <h4 class="text-white font-bold text-xs uppercase tracking-wider mb-4">
            Navigation
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <NuxtLink to="/" class="hover:text-white transition-colors">Accueil</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/qui-sommes-nous" class="hover:text-white transition-colors">Qui sommes-nous</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/realisations" class="hover:text-white transition-colors">Nos Réalisations</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="hover:text-white transition-colors">Demander un Devis</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/mentions-legales" class="hover:text-white transition-colors">Mentions Légales</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 4: Contacts -->
        <div>
          <h4 class="text-white font-bold text-xs uppercase tracking-wider mb-4">
            Siège & Contacts
          </h4>
          <ul class="space-y-3 text-xs text-neutral-400">
            <li v-if="settings.address || settings.city" class="flex items-start gap-2.5">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <span>{{ [settings.address, settings.city].filter(Boolean).join(', ') }}</span>
            </li>
            <li v-if="settings.phone1" class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-phone" class="w-4 h-4 text-neutral-500 shrink-0" />
              <a :href="`tel:${settings.phone1.replace(/\s+/g, '')}`" class="hover:text-white">
                {{ settings.phone1 }}
              </a>
            </li>
            <li v-if="settings.email" class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-neutral-500 shrink-0" />
              <a :href="`mailto:${settings.email}`" class="hover:text-white">
                {{ settings.email }}
              </a>
            </li>
            <li v-if="settings.workingHours" class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-neutral-500 shrink-0" />
              <span>{{ settings.workingHours }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <div>
          © {{ currentYear }} <span class="text-neutral-300 font-medium">{{ settings.companyName }}</span>. Tous droits réservés.
        </div>
        <div class="flex items-center gap-6">
          <NuxtLink to="/mentions-legales" class="hover:text-neutral-300 transition-colors">Mentions Légales</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-neutral-300 transition-colors">Contact</NuxtLink>
          <span v-if="settings.city">{{ settings.city }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
