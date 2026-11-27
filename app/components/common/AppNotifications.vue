<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications'

const { notifications, dismiss } = useNotifications()

const classes: Record<'success' | 'error' | 'warning' | 'info', string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-neutral-300 bg-white text-neutral-900'
}

const icons: Record<'success' | 'error' | 'warning' | 'info', string> = {
  success: 'i-heroicons-check-circle',
  error: 'i-heroicons-exclamation-circle',
  warning: 'i-heroicons-exclamation-triangle',
  info: 'i-heroicons-information-circle'
}
</script>

<template>
  <div class="fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="classes[notification.type]"
      class="flex items-start gap-2 rounded-sm border px-4 py-3 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <UIcon :name="icons[notification.type]" class="mt-0.5 h-4 w-4 shrink-0" />
      <p class="flex-1 text-xs font-semibold leading-relaxed">{{ notification.message }}</p>
      <button type="button" class="text-neutral-500 hover:text-black" aria-label="Fermer" @click="dismiss(notification.id)">
        <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
