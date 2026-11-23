<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteData, type QuoteRequest } from '~/composables/useSiteData'

interface TurnstileRenderOptions {
  sitekey: string
  size: 'normal'
  callback: (token: string) => void
  'error-callback': () => void
  'expired-callback': () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  getResponse: (widgetId: string) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const route = useRoute()
const { settings, publishedServices } = useSiteData()
const whatsappNumber = computed(() => settings.value.whatsapp.replace(/\D/g, ''))
const mapQuery = computed(() => [settings.value.address, settings.value.city].filter(Boolean).join(' '))
const turnstileSiteKey = useRuntimeConfig().public.turnstileSiteKey
const turnstileContainer = ref<HTMLElement | null>(null)
const turnstileWidgetId = ref<string | null>(null)
const turnstileError = ref('')
let turnstileLoadPromise: Promise<TurnstileApi> | null = null
let turnstileInitPromise: Promise<void> | null = null

const form = ref({
  service: (publishedServices.value[0]?.slug ?? 'autre') as QuoteRequest['service'],
  fullName: '',
  phone: '',
  email: '',
  location: '',
  budget: '',
  timeline: '',
  description: ''
})

const isSubmitting = ref(false)
const submittedSuccess = ref(false)
const errorMessage = ref('')

function getApiErrorDetails(error: unknown): { statusCode?: number; statusMessage?: string } {
  if (typeof error !== 'object' || error === null) {
    return {}
  }

  const record = error as Record<string, unknown>
  const response = typeof record.response === 'object' && record.response !== null
    ? record.response as Record<string, unknown>
    : undefined
  const data = typeof record.data === 'object' && record.data !== null
    ? record.data as Record<string, unknown>
    : undefined
  const statusCode = typeof record.statusCode === 'number'
    ? record.statusCode
    : typeof response?.status === 'number'
      ? response.status
      : undefined
  const statusMessage = typeof data?.message === 'string'
    ? data.message
    : typeof data?.statusMessage === 'string'
      ? data.statusMessage
      : typeof record.message === 'string'
        ? record.message
        : undefined

  return { statusCode, statusMessage }
}

const resetTurnstileWidget = () => {
  if (turnstileWidgetId.value && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId.value)
  }
}

onMounted(() => {
  if (route.query.service) {
    const s = String(route.query.service).toLowerCase()
    const selectedService = publishedServices.value.find(service => service.slug === s)
    if (selectedService) {
      form.value.service = selectedService.slug
    } else {
      form.value.service = 'autre'
    }
  }
  if (route.query.project) {
    form.value.description = `Demande de devis suite au projet : ${route.query.project}\n`
  }

  if (turnstileSiteKey) {
    turnstileInitPromise = initializeTurnstile()
    void turnstileInitPromise.catch(() => {
      turnstileInitPromise = null
      turnstileError.value = 'La vérification de sécurité est indisponible.'
    })
  }
})

const loadTurnstile = (): Promise<TurnstileApi> => {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  if (!turnstileLoadPromise) {
    turnstileLoadPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.turnstile) {
          resolve(window.turnstile)
        } else {
          reject(new Error('Turnstile did not initialize'))
        }
      }
      script.onerror = () => reject(new Error('Turnstile script failed to load'))
      document.head.appendChild(script)
    }).catch((error: unknown) => {
      turnstileLoadPromise = null
      throw error
    })
  }

  return turnstileLoadPromise
}

const initializeTurnstile = async () => {
  if (!turnstileSiteKey || !turnstileContainer.value || turnstileWidgetId.value) {
    return
  }

  const api = await loadTurnstile()
  if (!turnstileContainer.value || turnstileWidgetId.value) {
    return
  }

  turnstileWidgetId.value = api.render(turnstileContainer.value, {
    sitekey: turnstileSiteKey,
    size: 'normal',
    callback: () => { turnstileError.value = '' },
    'error-callback': () => {
      turnstileError.value = 'La vérification de sécurité a échoué. Veuillez réessayer.'
    },
    'expired-callback': () => {
      turnstileError.value = 'La vérification de sécurité a expiré. Veuillez recommencer.'
    }
  })
}

const getTurnstileToken = async (): Promise<string> => {
  if (!turnstileSiteKey) {
    if (import.meta.dev) {
      return ''
    }

    throw new Error('La vérification de sécurité est indisponible.')
  }

  if (!turnstileInitPromise) {
    turnstileInitPromise = initializeTurnstile()
  }
  await turnstileInitPromise

  const api = window.turnstile
  const widgetId = turnstileWidgetId.value
  if (!api || !widgetId) {
    throw new Error('La vérification de sécurité est indisponible.')
  }

  const token = api.getResponse(widgetId)
  if (!token) {
    throw new Error('Veuillez compléter la vérification de sécurité.')
  }
  return token
}

onBeforeUnmount(() => {
  if (turnstileWidgetId.value && window.turnstile) {
    window.turnstile.remove(turnstileWidgetId.value)
  }
})

const startNewRequest = async () => {
  submittedSuccess.value = false
  await nextTick()
  if (turnstileSiteKey) {
    turnstileInitPromise = initializeTurnstile()
    void turnstileInitPromise.catch(() => {
      turnstileInitPromise = null
      turnstileError.value = 'La vérification de sécurité est indisponible.'
    })
  }
}

const submitQuoteForm = async () => {
  errorMessage.value = ''
  turnstileError.value = ''

  if (!form.value.fullName || !form.value.phone || !form.value.description) {
    errorMessage.value = 'Veuillez renseigner votre nom, numéro de téléphone et la description de votre besoin.'
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/quotes/session')
    const turnstileToken = await getTurnstileToken()
    const response = await $fetch<{ success: boolean; quote_id: string }>('/api/quotes/submit', {
      method: 'POST',
      body: {
        service: form.value.service,
        full_name: form.value.fullName,
        phone: form.value.phone,
        email: form.value.email,
        location: form.value.location,
        budget: form.value.budget,
        timeline: form.value.timeline,
        description: form.value.description,
        turnstile_token: turnstileToken
      }
    })

    if (response.success !== true || typeof response.quote_id !== 'string' || !response.quote_id) {
      throw new Error('Le serveur n’a pas confirmé l’enregistrement de la demande.')
    }

    await new Promise(resolve => setTimeout(resolve, 600))

    if (turnstileWidgetId.value && window.turnstile) {
      window.turnstile.remove(turnstileWidgetId.value)
      turnstileWidgetId.value = null
      turnstileInitPromise = null
    }
    submittedSuccess.value = true
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    form.value = {
      service: 'btp',
      fullName: '',
      phone: '',
      email: '',
      location: '',
      budget: '',
      timeline: '',
      description: ''
    }
  } catch (error: unknown) {
    resetTurnstileWidget()
    const { statusCode, statusMessage } = getApiErrorDetails(error)

    if (statusCode === 403) {
      errorMessage.value = 'La vérification de sécurité a échoué. Veuillez réessayer.'
    } else if (statusCode === 429) {
      errorMessage.value = statusMessage || 'Trop de demandes ont été envoyées. Veuillez réessayer plus tard.'
    } else if (statusCode === 503) {
      errorMessage.value = statusMessage || 'La protection anti-abus est temporairement indisponible. Veuillez réessayer plus tard.'
    } else {
      errorMessage.value = turnstileError.value || statusMessage || 'Une erreur est survenue lors de l’envoi. Veuillez nous contacter directement par téléphone ou WhatsApp.'
    }
  } finally {
    isSubmitting.value = false
  }
}

useSeoMeta({
  title: `Contact & Demande de Devis | ${settings.value.companyName}`,
  description: `Contactez ${settings.value.companyName} pour vos projets de BTP, d’électrification ou de gestion immobilière.`
})
</script>

<template>
  <div class="space-y-16 pb-20">
    <!-- Header banner: Luminous Contemporary Architecture -->
    <section class="bg-gradient-to-b from-white via-neutral-50/60 to-white py-16 lg:py-20 border-b border-neutral-200 text-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950">
          Parlons de Votre Projet
        </h1>
        <p class="text-neutral-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Nos ingénieurs étudient votre cahier des charges et vous transmettent un devis chiffré sous 24 à 48 heures.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- FORM COLUMN -->
        <div class="lg:col-span-7 bg-white rounded-md p-6 sm:p-8 border border-neutral-200 shadow-sm">
          <div class="mb-6">
            <h2 class="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
              Demande de Devis en Ligne
            </h2>
            <p class="text-neutral-600 text-xs mt-1">
              Remplissez les informations ci-dessous. Sans engagement de votre part.
            </p>
          </div>

          <!-- Success Alert (Functional Colors: Emerald) -->
          <div v-if="submittedSuccess" class="mb-6 p-5 rounded-sm bg-emerald-50 text-emerald-950 border border-emerald-200 space-y-2">
            <div class="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-600" />
              <span>Demande envoyée avec succès</span>
            </div>
            <p class="text-xs text-emerald-800/90 leading-relaxed">
              Nous avons bien enregistré votre projet. Un ingénieur de <strong>{{ settings.companyName }}</strong> vous contactera pour convenir d'une visite de chantier ou vous transmettre votre chiffrage.
            </p>
            <button
              type="button"
              @click="startNewRequest"
              class="mt-2 text-xs font-semibold text-emerald-900 underline uppercase tracking-wider"
            >
              Faire une nouvelle demande
            </button>
          </div>

          <!-- Error Alert (Functional Colors: Red) -->
          <div v-if="errorMessage" class="mb-6 p-4 rounded-sm bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {{ errorMessage }}
          </div>

          <!-- The Form -->
          <form v-if="!submittedSuccess" @submit.prevent="submitQuoteForm" class="space-y-5">
            <div ref="turnstileContainer" class="min-h-[65px]" />
            <p v-if="turnstileError" role="alert" class="text-xs text-red-700">
              {{ turnstileError }}
            </p>

            <!-- Service Selection -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider">
                Type de prestation <span class="text-neutral-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="service in publishedServices"
                  :key="service.slug"
                  type="button"
                  @click="form.service = service.slug"
                  :class="form.service === service.slug ? 'bg-neutral-900 text-white font-bold border-neutral-900 shadow-xs' : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100'"
                  class="py-2.5 px-3 rounded-sm border text-xs text-center transition-colors flex items-center justify-center gap-2 uppercase tracking-wider font-semibold"
                >
                  <UIcon :name="service.icon" class="w-4 h-4" />
                  <span>{{ service.homeTitle }}</span>
                </button>

                <button
                  type="button"
                  @click="form.service = 'autre'"
                  :class="form.service === 'autre' ? 'bg-neutral-900 text-white font-bold border-neutral-900 shadow-xs' : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100'"
                  class="py-2.5 px-3 rounded-sm border text-xs text-center transition-colors flex items-center justify-center gap-2 uppercase tracking-wider font-semibold"
                >
                  <UIcon name="i-heroicons-ellipsis-horizontal" class="w-4 h-4" />
                  <span>Autre / Mixte</span>
                </button>
              </div>
            </div>

            <!-- Client Identity -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1">
                  Nom complet / Société *
                </label>
                <input
                  v-model="form.fullName"
                  type="text"
                  required
                  placeholder="M. Kouamé Yao"
                  class="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1">
                  Téléphone *
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="+225 07 00 00 00 00"
                  class="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1">
                  Adresse e-mail
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="contact@exemple.com"
                  class="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1">
                  Lieu du chantier
                </label>
                <input
                  v-model="form.location"
                  type="text"
                  placeholder="Commune, ville..."
                  class="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <!-- Budget & Timeline -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1">
                  Budget estimatif
                </label>
                <input
                  v-model="form.budget"
                  type="text"
                  placeholder="Ex: 25 000 000 FCFA"
                  class="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1">
                  Délai souhaité
                </label>
                <input
                  v-model="form.timeline"
                  type="text"
                  placeholder="Dans les 2 mois..."
                  class="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-bold text-neutral-950 uppercase tracking-wider mb-1">
                Description du besoin *
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                required
                placeholder="Surface du terrain, nombre d'étages, puissance électrique requise, nombre de logements à gérer..."
                class="w-full px-3.5 py-2.5 rounded-sm border border-neutral-300 text-xs text-neutral-950 focus:border-neutral-900 focus:outline-none leading-relaxed"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-sm transition-all shadow-xs"
              >
                <UIcon v-if="!isSubmitting" name="i-heroicons-paper-airplane" class="w-4 h-4 text-white" />
                <UIcon v-else name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-white" />
                <span>{{ isSubmitting ? 'Transmission en cours...' : 'Envoyer ma demande de devis' }}</span>
              </button>
            </div>

            <p class="text-[10px] text-neutral-500 text-center uppercase tracking-wider">
              Traitement confidentiel conforme aux règles de {{ settings.companyName }}.
            </p>
          </form>
        </div>

        <!-- CONTACT DETAILS & MAP COLUMN -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Direct Contact Card: Luminous White Card with Crisp Structure -->
          <div class="bg-white text-neutral-900 rounded-md p-6 sm:p-8 border border-neutral-200 space-y-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-950 border-b border-neutral-100 pb-3">
              Coordonnées Directes
            </h3>

            <div class="space-y-4 text-xs">
              <div v-if="settings.address || settings.city" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-sm bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <div class="font-bold text-neutral-950 uppercase tracking-wider text-[11px]">Siège Social</div>
                  <div v-if="settings.address" class="text-neutral-700">{{ settings.address }}</div>
                  <div v-if="settings.city" class="text-neutral-500">{{ settings.city }}</div>
                </div>
              </div>

              <div v-if="settings.phone1 || settings.phone2" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-sm bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
                  <UIcon name="i-heroicons-phone" class="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <div class="font-bold text-neutral-950 uppercase tracking-wider text-[11px]">Téléphone</div>
                  <a v-if="settings.phone1" :href="`tel:${settings.phone1.replace(/\s+/g, '')}`" class="block text-neutral-900 hover:underline font-mono font-semibold">
                    {{ settings.phone1 }}
                  </a>
                  <a v-if="settings.phone2" :href="`tel:${settings.phone2.replace(/\s+/g, '')}`" class="block text-neutral-500 hover:underline text-[11px] font-mono">
                    {{ settings.phone2 }}
                  </a>
                </div>
              </div>

              <div v-if="whatsappNumber" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-sm bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200">
                  <svg class="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.697c.969.53 1.83.824 2.806.824 3.182 0 5.768-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.485-4.464 9.949-9.969 9.949-1.748 0-3.385-.453-4.819-1.246l-5.212 1.359 1.385-5.074c-.9-1.488-1.423-3.23-1.423-5.088 0-5.485 4.464-9.949 9.969-9.949 5.505 0 9.969 4.464 9.969 9.949z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-bold text-neutral-950 uppercase tracking-wider text-[11px]">Ligne WhatsApp</div>
                  <a
                    :href="`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour ${settings.companyName}, je souhaite un devis.`)}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-emerald-700 hover:underline font-mono font-semibold"
                  >
                    {{ settings.whatsapp }}
                  </a>
                </div>
              </div>

              <div v-if="settings.email" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-sm bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
                  <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <div class="font-bold text-neutral-950 uppercase tracking-wider text-[11px]">Courriel</div>
                  <a :href="`mailto:${settings.email}`" class="text-neutral-700 hover:underline">
                    {{ settings.email }}
                  </a>
                </div>
              </div>

              <div v-if="settings.workingHours" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-sm bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <div class="font-bold text-neutral-950 uppercase tracking-wider text-[11px]">Horaires d'Ouverture</div>
                  <div class="text-neutral-600">{{ settings.workingHours }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mini Map Embed -->
          <div v-if="mapQuery" class="bg-white rounded-md p-5 border border-neutral-200 space-y-3 shadow-sm">
            <h4 class="font-bold text-neutral-950 text-xs uppercase tracking-wider flex items-center gap-2">
              <UIcon name="i-heroicons-map" class="w-4 h-4 text-neutral-800" />
              <span>{{ mapQuery }}</span>
            </h4>
            <div class="h-60 rounded-sm overflow-hidden border border-neutral-200">
              <iframe
                :title="`Carte d’accès ${mapQuery}`"
                class="w-full h-full border-0"
                loading="lazy"
                :src="`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
