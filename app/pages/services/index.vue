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

// Get service section images
const btpImage = computed(() => {
  const img = getImageBySection('services', 'btp_section_image')
  return {
    url: img?.image_url || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    alt: img?.alt_text || 'Travaux de construction BTP ML Immobilier'
  }
})

const electrificationImage = computed(() => {
  const img = getImageBySection('services', 'electrification_section_image')
  return {
    url: img?.image_url || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80',
    alt: img?.alt_text || 'Travaux d\'électrification et réseau HTA/BTA'
  }
})

const gestionImage = computed(() => {
  const img = getImageBySection('services', 'gestion_section_image')
  return {
    url: img?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
    alt: img?.alt_text || 'Gestion immobilière à Abidjan ML Immobilier'
  }
})

useSeoMeta({
  title: 'Nos Services | BTP, Électrification & Gestion Immobilière Abidjan',
  description: 'Services d’excellence proposés par ML Immobilier SARL : Travaux BTP, réseaux d’électrification HTA/BTA et gestion locative sécurisée à Abidjan.'
})
</script>

<template>
  <div class="space-y-16 md:space-y-20 lg:space-y-24 pb-20">
    <!-- Header banner: Luminous Contemporary Architecture -->
    <section class="bg-gradient-to-b from-white via-neutral-50/60 to-white py-16 lg:py-20 border-b border-neutral-200 text-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950">
          Des Services Conçus pour la Réussite de Vos Projets
        </h1>
        <p class="text-neutral-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Du gros œuvre à la valorisation de votre patrimoine en passant par les raccordements électriques à haute exigence technique.
        </p>
      </div>
    </section>

    <!-- Quick Direct Contact Strip: Clean Luminous Card -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white text-neutral-900 rounded-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral-200 shadow-sm">
        <div class="flex items-center gap-3.5 text-center sm:text-left">
          <div class="w-10 h-10 rounded-sm bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-phone" class="w-5 h-5 text-neutral-900" />
          </div>
          <div>
            <div class="text-xs sm:text-sm font-bold text-neutral-950 uppercase tracking-wider">Conseil technique direct</div>
            <div class="text-xs text-neutral-500">Nos ingénieurs et techniciens vous répondent du lundi au samedi.</div>
          </div>
        </div>
        <div class="flex items-center gap-2.5">
          <a
            :href="`tel:${settings.phone1.replace(/\s+/g, '')}`"
            class="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-white" />
            <span>{{ settings.phone1 }}</span>
          </a>
          <a
            :href="`https://wa.me/${settings.whatsapp}`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA59] text-white px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold transition-all shadow-xs"
          >
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.697c.969.53 1.83.824 2.806.824 3.182 0 5.768-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.485-4.464 9.949-9.969 9.949-1.748 0-3.385-.453-4.819-1.246l-5.212 1.359 1.385-5.074c-.9-1.488-1.423-3.23-1.423-5.088 0-5.485 4.464-9.949 9.969-9.949 5.505 0 9.969 4.464 9.969 9.949z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>

    <!-- SERVICE 1: BTP -->
    <section id="btp" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-md p-8 lg:p-10 border border-neutral-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
        <div class="lg:col-span-6 space-y-4">
          <div class="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-sm uppercase tracking-wider">
            <UIcon name="i-heroicons-wrench-screwdriver" class="w-3.5 h-3.5 text-neutral-700" />
            <span>Pôle Construction & Ouvrages</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            BTP & Construction Générale
          </h2>

          <p class="text-neutral-600 text-xs sm:text-sm leading-relaxed">
            De la préparation de votre terrain à la remise définitive des clés, notre division BTP prend en charge l'ensemble des corps d'état avec une rigueur d'ingénierie exemplaire.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Gros Œuvre & Fondations</span>
              </div>
              <p class="text-[11px] text-neutral-600">Études de sols, terrassements, fondations profondes, béton armé certifié.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Second Œuvre & Finitions</span>
              </div>
              <p class="text-[11px] text-neutral-600">Plâtrerie, carrelage grand format, peinture industrielle, étanchéité terrasses.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Rénovation & Extension</span>
              </div>
              <p class="text-[11px] text-neutral-600">Surélévation d'immeubles, réaménagement de bureaux et remise aux normes.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Voiries & Clôtures</span>
              </div>
              <p class="text-[11px] text-neutral-600">Aménagement d'accès pavés, assainissement individuel ou collectif, clôtures sécurisées.</p>
            </div>
          </div>

          <div class="pt-2">
            <NuxtLink
              to="/contact?service=btp"
              class="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold px-5 py-3 rounded-sm text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
              <span>Demander un devis pour vos travaux BTP</span>
            </NuxtLink>
          </div>
        </div>

        <div class="lg:col-span-6 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
          <img
            :src="btpImage.url"
            :alt="btpImage.alt"
            class="w-full h-[400px] object-cover"
          />
        </div>
      </div>
    </section>

    <!-- SERVICE 2: ELECTRIFICATION -->
    <section id="electrification" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-md p-8 lg:p-10 border border-neutral-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
        <div class="lg:col-span-6 lg:order-2 space-y-4">
          <div class="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-sm uppercase tracking-wider">
            <UIcon name="i-heroicons-bolt" class="w-3.5 h-3.5 text-neutral-700" />
            <span>Pôle Énergie & Distribution</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            Électrification HTA / BTA & Réseaux
          </h2>

          <p class="text-neutral-600 text-xs sm:text-sm leading-relaxed">
            Spécialistes reconnus pour les travaux électriques d’envergure à Abidjan et en région. Conformité stricte avec le cahier des charges de la Compagnie Ivoirienne d’Électricité (CIE).
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Postes HTA/BTA</span>
              </div>
              <p class="text-[11px] text-neutral-600">Cellules de protection, transformateurs de puissance et raccordements réseau.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Électrification Lotissements</span>
              </div>
              <p class="text-[11px] text-neutral-600">Lignes aériennes et souterraines, candélabres LED et colonnes montantes.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Armoires & TGBT</span>
              </div>
              <p class="text-[11px] text-neutral-600">Câblage de tableaux divisionnaires, équilibrage des phases et mise à la terre.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Solaire & Groupes</span>
              </div>
              <p class="text-[11px] text-neutral-600">Systèmes photovoltaïques hybrides avec batteries et inverseur automatique.</p>
            </div>
          </div>

          <div class="pt-2">
            <NuxtLink
              to="/contact?service=electrification"
              class="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold px-5 py-3 rounded-sm text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
              <span>Demander un devis en Électrification</span>
            </NuxtLink>
          </div>
        </div>

        <div class="lg:col-span-6 lg:order-1 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
          <img
            :src="electrificationImage.url"
            :alt="electrificationImage.alt"
            class="w-full h-[400px] object-cover"
          />
        </div>
      </div>
    </section>

    <!-- SERVICE 3: GESTION IMMOBILIERE -->
    <section id="gestion" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-md p-8 lg:p-10 border border-neutral-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
        <div class="lg:col-span-6 space-y-4">
          <div class="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-sm uppercase tracking-wider">
            <UIcon name="i-heroicons-key" class="w-3.5 h-3.5 text-neutral-700" />
            <span>Pôle Gestion de Patrimoine</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            Gestion & Administration de Biens
          </h2>

          <p class="text-neutral-600 text-xs sm:text-sm leading-relaxed">
            Propriétaires résidant à Abidjan ou dans la diaspora : confiez votre patrimoine immobilier à un gestionnaire rigoureux. Sécurité juridique et régularité des reversements locatifs garanties.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Sélection des Locataires</span>
              </div>
              <p class="text-[11px] text-neutral-600">Étude de solvabilité poussée, contrats de bail conformes et états des lieux minutieux.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Recouvrement & Reversement</span>
              </div>
              <p class="text-[11px] text-neutral-600">Perception ponctuelle des loyers et reversement sécurisé sur votre compte bancaire chaque mois.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Maintenance & Entretien</span>
              </div>
              <p class="text-[11px] text-neutral-600">Interventions rapides de plomberie, serrurerie et électricité pour préserver la valeur du bien.</p>
            </div>

            <div class="p-3.5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-1">
              <div class="font-bold text-neutral-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-emerald-600" />
                <span>Rapports de Gestion</span>
              </div>
              <p class="text-[11px] text-neutral-600">États financiers trimestriels détaillés et assistance aux déclarations foncières.</p>
            </div>
          </div>

          <div class="pt-2">
            <NuxtLink
              to="/contact?service=gestion"
              class="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold px-5 py-3 rounded-sm text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-white" />
              <span>Confier un bien en gestion locative</span>
            </NuxtLink>
          </div>
        </div>

        <div class="lg:col-span-6 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
          <img
            :src="gestionImage.url"
            :alt="gestionImage.alt"
            class="w-full h-[400px] object-cover"
          />
        </div>
      </div>
    </section>
  </div>
</template>
