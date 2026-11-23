<script setup lang="ts">
import { useSiteData } from '~/composables/useSiteData'

const { settings } = useSiteData()

useSeoMeta({
  title: 'Mentions Légales & Confidentialité | ML Immobilier SARL',
  description: 'Informations juridiques, mentions légales et politique de confidentialité du site internet de ML Immobilier SARL.'
})
</script>

<template>
  <div class="space-y-12 pb-20">
    <!-- Header banner: Luminous Contemporary Architecture -->
    <section class="bg-gradient-to-b from-white via-neutral-50/60 to-white py-14 border-b border-neutral-200 text-center">
      <div class="max-w-4xl mx-auto px-4 space-y-2">
        <h1 class="text-2xl sm:text-3xl font-black text-neutral-950">Mentions Légales & Confidentialité</h1>
        <p class="text-neutral-600 text-xs">Informations juridiques et cadre réglementaire de ML Immobilier SARL.</p>
      </div>
    </section>

    <!-- Legal Content -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
      <!-- Section 1: Identification -->
      <div class="bg-white p-6 sm:p-8 rounded-md border border-neutral-200 space-y-3 shadow-xs">
        <h2 class="text-base font-bold text-neutral-950 border-b pb-2 border-neutral-200 flex items-center gap-2 uppercase tracking-wider">
          <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-neutral-900" />
          <span>1. Présentation de la Société</span>
        </h2>
        <ul class="space-y-1.5 text-xs text-neutral-700">
          <li><strong>Dénomination sociale :</strong> {{ settings.companyName }}</li>
          <li><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</li>
          <li><strong>Siège social :</strong> {{ settings.address }}, {{ settings.city }}</li>
          <li><strong>Téléphone :</strong> {{ settings.phone1 }} / {{ settings.phone2 }}</li>
          <li><strong>Courriel :</strong> {{ settings.email }}</li>
          <li><strong>Registre de Commerce :</strong> Immatriculée au RCCM d'Abidjan</li>
          <li><strong>Domaines d'activité :</strong> BTP (Bâtiment et Travaux Publics), Électrification générale HTA/BTA, Gestion et Administration Immobilière.</li>
        </ul>
      </div>

      <!-- Section 2: Hébergement -->
      <div class="bg-white p-6 sm:p-8 rounded-md border border-neutral-200 space-y-3 shadow-xs">
        <h2 class="text-base font-bold text-neutral-950 border-b pb-2 border-neutral-200 flex items-center gap-2 uppercase tracking-wider">
          <UIcon name="i-heroicons-server" class="w-4 h-4 text-neutral-900" />
          <span>2. Hébergement & Réalisation</span>
        </h2>
        <p class="text-xs text-neutral-600 leading-relaxed">
          Le site web de {{ settings.companyName }} est développé sous architecture SSR avec <strong>Nuxt 4</strong> et hébergé sur <strong>Render</strong>, avec stockage de données relationnelles PostgreSQL sous <strong>Supabase</strong>.
        </p>
      </div>

      <!-- Section 3: Propriété intellectuelle -->
      <div class="bg-white p-6 sm:p-8 rounded-md border border-neutral-200 space-y-3 shadow-xs">
        <h2 class="text-base font-bold text-neutral-950 border-b pb-2 border-neutral-200 flex items-center gap-2 uppercase tracking-wider">
          <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-neutral-900" />
          <span>3. Propriété Intellectuelle</span>
        </h2>
        <p class="text-xs text-neutral-600 leading-relaxed">
          L'ensemble des contenus (textes, logos, photographies d'ouvrages, éléments graphiques) figurant sur ce site est la propriété exclusive de ML Immobilier SARL ou fait l'objet d'une autorisation régulière. Toute reproduction sans accord préalable est interdite.
        </p>
      </div>

      <!-- Section 4: Données personnelles -->
      <div class="bg-white p-6 sm:p-8 rounded-md border border-neutral-200 space-y-3 shadow-xs">
        <h2 class="text-base font-bold text-neutral-950 border-b pb-2 border-neutral-200 flex items-center gap-2 uppercase tracking-wider">
          <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-neutral-900" />
          <span>4. Protection des Données Personnelles</span>
        </h2>
        <p class="text-xs text-neutral-600 leading-relaxed">
          Les informations transmises via le formulaire de devis (nom, téléphone, courriel, caractéristiques du projet) sont destinées exclusivement au chiffrage et au suivi commercial par ML Immobilier SARL.
        </p>
        <p class="text-xs text-neutral-600 leading-relaxed">
          Vous disposez d'un droit d'accès, de rectification et de suppression de vos données par courriel à : <strong>{{ settings.email }}</strong>.
        </p>
      </div>
    </section>
  </div>
</template>
