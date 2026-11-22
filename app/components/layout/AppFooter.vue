<script setup lang="ts">
import { useSiteData } from '~/composables/useSiteData'

const { settings } = useSiteData()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#111111] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <!-- Col 1: Identity -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-sm bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-white" />
            </div>
            <div>
              <span class="text-base font-black text-white tracking-wider">ML IMMOBILIER</span>
              <span class="block text-[10px] uppercase tracking-widest text-neutral-400 font-medium">SARL • Abidjan</span>
            </div>
          </div>
          <p class="text-xs text-neutral-400 leading-relaxed">
            Entreprise d'ingénierie et de gestion basée à Abidjan (Yopougon, Terminus 27). Interventions en BTP, électrification HTA/BTA certifiée et gestion de patrimoine.
          </p>

          <!-- Social Icons — Official brand hover colors -->
          <div class="flex items-center gap-2 pt-2">
            <a
              v-if="settings.socialFacebook"
              :href="settings.socialFacebook"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook ML Immobilier"
              class="w-8 h-8 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] flex items-center justify-center transition-all"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
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
              v-if="settings.socialInstagram"
              :href="settings.socialInstagram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram ML Immobilier"
              class="w-8 h-8 rounded-sm bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-[#E4405F] hover:border-[#E4405F] flex items-center justify-center transition-all"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Services -->
        <div>
          <h4 class="text-white font-bold text-xs uppercase tracking-wider mb-4">
            Domaines d'Intervention
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <NuxtLink to="/services" class="hover:text-white transition-colors flex items-center gap-1.5">
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 text-neutral-500" />
                <span>Bâtiment & Travaux Publics (BTP)</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/services" class="hover:text-white transition-colors flex items-center gap-1.5">
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 text-neutral-500" />
                <span>Électrification Haute & Basse Tension</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/services" class="hover:text-white transition-colors flex items-center gap-1.5">
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 text-neutral-500" />
                <span>Gestion & Valorisation Immobilière</span>
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
            <li class="flex items-start gap-2.5">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <span>{{ settings.address }}, {{ settings.city }}</span>
            </li>
            <li class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-phone" class="w-4 h-4 text-neutral-500 shrink-0" />
              <a :href="`tel:${settings.phone1.replace(/\s+/g, '')}`" class="hover:text-white">
                {{ settings.phone1 }}
              </a>
            </li>
            <li class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-neutral-500 shrink-0" />
              <a :href="`mailto:${settings.email}`" class="hover:text-white">
                {{ settings.email }}
              </a>
            </li>
            <li class="flex items-center gap-2.5">
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
          <span>Abidjan, Côte d'Ivoire</span>
        </div>
      </div>
    </div>
  </footer>
</template>
