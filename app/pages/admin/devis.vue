<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteData, type QuoteRequest } from '~/composables/useSiteData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { quotes, updateQuoteStatus, deleteQuote } = useSiteData()

const activeFilter = ref<'all' | 'nouveau' | 'en_cours' | 'devis_envoye' | 'termine' | 'archive'>('all')
const selectedQuote = ref<QuoteRequest | null>(null)
const editingNotes = ref('')

onMounted(() => {
  if (route.query.id) {
    const q = quotes.value.find(item => item.id === route.query.id)
    if (q) {
      openQuoteDetail(q)
    }
  }
})

const filteredQuotes = computed(() => {
  if (activeFilter.value === 'all') return quotes.value
  return quotes.value.filter(q => q.status === activeFilter.value)
})

const openQuoteDetail = (quote: QuoteRequest) => {
  selectedQuote.value = quote
  editingNotes.value = quote.notes || ''
}

const saveQuoteNotes = () => {
  if (selectedQuote.value) {
    updateQuoteStatus(selectedQuote.value.id, selectedQuote.value.status, editingNotes.value)
    selectedQuote.value.notes = editingNotes.value
  }
}

const changeStatus = (status: QuoteRequest['status']) => {
  if (selectedQuote.value) {
    updateQuoteStatus(selectedQuote.value.id, status, editingNotes.value)
    selectedQuote.value.status = status
  }
}

const handleDelete = (id: string) => {
  if (confirm('Confirmez-vous la suppression définitive de cette demande ?')) {
    deleteQuote(id)
    if (selectedQuote.value?.id === id) {
      selectedQuote.value = null
    }
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'nouveau': return { label: 'Nouveau', class: 'bg-black text-white' }
    case 'en_cours': return { label: 'En cours', class: 'bg-neutral-200 text-black' }
    case 'devis_envoye': return { label: 'Devis envoyé', class: 'border border-black text-black' }
    case 'termine': return { label: 'Terminé', class: 'bg-neutral-100 text-neutral-600' }
    default: return { label: 'Archivé', class: 'text-neutral-400 border border-neutral-300' }
  }
}

const getWhatsAppDirectLink = (quote: QuoteRequest) => {
  const cleanPhone = quote.phone.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(`Bonjour ${quote.fullName}, nous faisons suite à votre demande de devis pour les travaux de ${quote.service.toUpperCase()} auprès de ML Immobilier SARL.`)
  return `https://wa.me/${cleanPhone}?text=${message}`
}

useSeoMeta({
  title: 'Gestion des Devis | Admin ML Immobilier SARL',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl sm:text-2xl font-black text-black tracking-tight">Demandes de Devis</h2>
      <p class="text-xs text-neutral-500 mt-0.5">Consultez, traitez et contactez directement vos prospects.</p>
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xs border border-neutral-200">
      <button
        v-for="status in ['all', 'nouveau', 'en_cours', 'devis_envoye', 'termine', 'archive']"
        :key="status"
        type="button"
        @click="activeFilter = status as any"
        :class="activeFilter === status ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black'"
        class="px-3 py-1.5 rounded-xs text-xs uppercase tracking-wider transition-colors"
      >
        {{ status === 'all' ? 'Tous' : status.replace('_', ' ') }}
      </button>
    </div>

    <!-- Main Grid: List & Detail Drawer -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- QUOTES LIST -->
      <div :class="selectedQuote ? 'lg:col-span-6' : 'lg:col-span-12'" class="bg-white border border-neutral-200 rounded-xs overflow-hidden">
        <div class="p-3.5 border-b border-neutral-200 flex justify-between items-center text-xs text-neutral-500 uppercase tracking-wider font-semibold">
          <span>{{ filteredQuotes.length }} demande(s)</span>
        </div>

        <div v-if="filteredQuotes.length > 0" class="divide-y divide-neutral-100">
          <div
            v-for="quote in filteredQuotes"
            :key="quote.id"
            @click="openQuoteDetail(quote)"
            class="p-4 hover:bg-neutral-50 transition-colors cursor-pointer space-y-2"
            :class="selectedQuote?.id === quote.id ? 'bg-neutral-50 border-l-2 border-black' : ''"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-bold text-black text-xs">{{ quote.fullName }}</span>
                <span :class="`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-xs ${formatStatus(quote.status).class}`">
                  {{ formatStatus(quote.status).label }}
                </span>
              </div>
              <span class="text-[10px] text-neutral-400 font-mono">
                {{ new Date(quote.createdAt).toLocaleDateString('fr-FR') }}
              </span>
            </div>

            <p class="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{{ quote.description }}</p>

            <div class="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-50">
              <span class="uppercase tracking-wider font-bold text-black bg-neutral-100 px-1.5 py-0.5 rounded-xs text-[10px]">
                {{ quote.service }}
              </span>
              <span class="flex items-center gap-1 font-mono">
                <UIcon name="i-heroicons-phone" class="w-3 h-3 text-neutral-400" />
                {{ quote.phone }}
              </span>
              <span v-if="quote.location" class="flex items-center gap-1">
                <UIcon name="i-heroicons-map-pin" class="w-3 h-3 text-neutral-400" />
                {{ quote.location }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="p-8 text-center text-xs text-neutral-500">
          Aucune demande correspondant à ce filtre.
        </div>
      </div>

      <!-- QUOTE DETAIL PANE -->
      <div v-if="selectedQuote" class="lg:col-span-6 bg-white border border-neutral-200 rounded-xs p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <div class="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Fiche Devis</div>
            <h3 class="text-base font-black text-black">{{ selectedQuote.fullName }}</h3>
          </div>
          <button
            @click="selectedQuote = null"
            class="p-1 text-neutral-400 hover:text-black rounded-xs"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Contact Actions -->
        <div class="flex items-center gap-2">
          <a
            :href="getWhatsAppDirectLink(selectedQuote)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 inline-flex items-center justify-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xs transition-colors"
          >
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-3.5 h-3.5" />
            <span>Contacter WhatsApp</span>
          </a>
          <a
            :href="`tel:${selectedQuote.phone.replace(/[^0-9]/g, '')}`"
            class="inline-flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors"
          >
            <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5" />
            <span>Appeler</span>
          </a>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xs text-xs">
          <div>
            <span class="text-neutral-500 text-[10px] uppercase tracking-wider block">Service demandé :</span>
            <span class="font-bold text-black uppercase">{{ selectedQuote.service }}</span>
          </div>
          <div>
            <span class="text-neutral-500 text-[10px] uppercase tracking-wider block">Localisation :</span>
            <span class="font-bold text-black">{{ selectedQuote.location || 'Non spécifié' }}</span>
          </div>
          <div>
            <span class="text-neutral-500 text-[10px] uppercase tracking-wider block">Budget envisagé :</span>
            <span class="font-bold text-black">{{ selectedQuote.budget || 'Non spécifié' }}</span>
          </div>
          <div>
            <span class="text-neutral-500 text-[10px] uppercase tracking-wider block">Délai souhaité :</span>
            <span class="font-bold text-black">{{ selectedQuote.timeline || 'Non spécifié' }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-neutral-500 text-[10px] uppercase tracking-wider block">Adresse e-mail :</span>
            <span class="font-mono text-black">{{ selectedQuote.email }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label class="block text-[11px] font-bold text-black uppercase tracking-wider">Description du besoin :</label>
          <div class="p-3 bg-neutral-50 border border-neutral-200 rounded-xs text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
            {{ selectedQuote.description }}
          </div>
        </div>

        <!-- Status update -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-bold text-black uppercase tracking-wider">Statut du dossier :</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="st in ['nouveau', 'en_cours', 'devis_envoye', 'termine', 'archive']"
              :key="st"
              type="button"
              @click="changeStatus(st as any)"
              :class="selectedQuote.status === st ? 'bg-black text-white font-bold' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'"
              class="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-xs transition-colors text-center"
            >
              {{ st.replace('_', ' ') }}
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-bold text-black uppercase tracking-wider">Notes internes :</label>
          <textarea
            v-model="editingNotes"
            rows="3"
            placeholder="Ajouter des notes techniques ou remarques sur l'échange..."
            class="w-full p-2.5 bg-white border border-neutral-300 text-xs text-black rounded-xs focus:border-black focus:outline-none"
          ></textarea>
          <button
            type="button"
            @click="saveQuoteNotes"
            class="bg-neutral-100 hover:bg-black hover:text-white text-black border border-neutral-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
          >
            Enregistrer la note
          </button>
        </div>

        <!-- Delete button -->
        <div class="pt-3 border-t border-neutral-100 text-right">
          <button
            type="button"
            @click="handleDelete(selectedQuote.id)"
            class="text-[11px] font-semibold text-neutral-500 hover:text-black uppercase tracking-wider"
          >
            Supprimer cette demande
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
