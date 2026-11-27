<script setup lang="ts">
import { computed } from 'vue'
import { useSiteData } from '~/composables/useSiteData'

const { settings } = useSiteData()
const route = useRoute()

const whatsappNumber = computed(() => settings.value.whatsapp.replace(/\D/g, ''))
const whatsappLink = computed(() => {
  const message = encodeURIComponent('Bonjour ML Immobilier SARL, je souhaite obtenir des informations concernant vos services.')
  return `https://wa.me/${whatsappNumber.value}?text=${message}`
})
</script>

<template>
  <div v-if="settings.socialWhatsappEnabled && whatsappNumber && !route.path.startsWith('/admin')" class="whatsapp-float">
    <a
      :href="whatsappLink"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      class="whatsapp-float__link"
    >
      <svg class="whatsapp-float__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.496.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.58-.487-.501-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.371-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64.001 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.411z"/>
      </svg>
      <span class="whatsapp-float__tooltip">Discuter avec nous</span>
    </a>
  </div>
</template>

<style scoped>
.whatsapp-float {
  position: fixed;
  z-index: 50;
  right: max(1rem, env(safe-area-inset-right, 0px));
  bottom: max(1rem, env(safe-area-inset-bottom, 0px));
  animation: whatsapp-appear 420ms ease-out both;
}

.whatsapp-float__link {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: 9999px;
  background: #25d366;
  color: #fff;
  box-shadow: 0 4px 14px rgb(37 211 102 / 30%);
  transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.whatsapp-float__link:hover {
  transform: translateY(-2px);
  background: #20ba59;
  box-shadow: 0 6px 18px rgb(37 211 102 / 40%);
}

.whatsapp-float__link:focus-visible {
  outline: 3px solid #111;
  outline-offset: 3px;
}

.whatsapp-float__icon {
  width: 1.75rem;
  height: 1.75rem;
  fill: currentColor;
}

.whatsapp-float__tooltip {
  position: absolute;
  right: calc(100% + 0.75rem);
  top: 50%;
  transform: translate(0.25rem, -50%);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background: #111;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease;
}

@media (hover: hover) and (min-width: 640px) {
  .whatsapp-float__link:hover .whatsapp-float__tooltip,
  .whatsapp-float__link:focus-visible .whatsapp-float__tooltip {
    transform: translate(0, -50%);
    opacity: 1;
  }
}

@keyframes whatsapp-appear {
  from {
    transform: translateY(0.5rem) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .whatsapp-float,
  .whatsapp-float__link,
  .whatsapp-float__tooltip {
    animation: none;
    transition: none;
  }
}
</style>
