<script setup lang="ts">
import { computed } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

const { settings } = useSiteData()

const whatsappLink = computed(() => {
  const number = settings.value.whatsapp.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(`Bonjour ML Immobilier SARL, je vous contacte depuis votre site web pour une demande d'information / devis.`)
  return `https://wa.me/${number}?text=${message}`
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Floating button: Official WhatsApp Green #25D366, elegant and discreet -->
    <a
      :href="whatsappLink"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter ML Immobilier sur WhatsApp"
      class="flex items-center gap-2.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA59] text-white rounded-md shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition-all text-xs font-semibold tracking-wide"
    >
      <!-- Official WhatsApp SVG icon -->
      <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.697c.969.53 1.83.824 2.806.824 3.182 0 5.768-2.586 5.768-5.766.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.485-4.464 9.949-9.969 9.949-1.748 0-3.385-.453-4.819-1.246l-5.212 1.359 1.385-5.074c-.9-1.488-1.423-3.23-1.423-5.088 0-5.485 4.464-9.949 9.969-9.949 5.505 0 9.969 4.464 9.969 9.949z"/>
      </svg>
      <span>WhatsApp</span>
    </a>
  </div>
</template>
