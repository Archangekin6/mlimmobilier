<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import WhatsAppButton from '~/components/common/WhatsAppButton.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-black selection:text-white">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <WhatsAppButton />
  </div>
</template>
