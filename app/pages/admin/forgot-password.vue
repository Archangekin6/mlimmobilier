<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false
})

const { requestPasswordReset } = useAuth()

const email = ref('')
const successMsg = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  
  if (!email.value.trim()) {
    errorMsg.value = 'Veuillez entrer votre adresse email'
    return
  }
  
  isLoading.value = true

  try {
    const result = await requestPasswordReset(email.value)

    if (result.success) {
      successMsg.value = result.message || 'Un email de réinitialisation a été envoyé'
      email.value = ''
    } else {
      errorMsg.value = result.error || 'Une erreur est survenue'
    }
  } catch (err: unknown) {
    console.error('Erreur reset password:', err)
    errorMsg.value = 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}

useSeoMeta({
  title: 'Mot de passe oublié | ML Immobilier SARL',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white border border-neutral-200 rounded-md p-6 sm:p-8 space-y-5 shadow-sm">
      <!-- Logo & Header -->
      <div class="text-center space-y-2">
        <div class="w-10 h-10 rounded-sm bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-xs">
          <UIcon name="i-heroicons-key" class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-lg font-black text-neutral-950 tracking-tight uppercase">Mot de passe oublié</h1>
        <p class="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Réinitialisation</p>
      </div>

      <!-- Success Alert -->
      <div v-if="successMsg" class="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
        {{ successMsg }}
      </div>

      <!-- Error Alert -->
      <div v-if="errorMsg" class="p-3 rounded-sm bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
        {{ errorMsg }}
      </div>

      <!-- Form -->
      <form v-if="!successMsg" @submit.prevent="handleSubmit" class="space-y-4">
        <div class="text-xs text-neutral-600 space-y-1">
          <p>Entrez l'adresse email de votre compte administrateur.</p>
          <p>Vous recevrez un lien pour créer un nouveau mot de passe.</p>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-neutral-950 uppercase tracking-wider mb-1">Adresse E-mail</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-3 py-2 rounded-sm bg-white border border-neutral-300 text-neutral-950 text-xs focus:border-neutral-900 focus:outline-none"
            placeholder="admin@mlimmobilier.com"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white font-semibold uppercase tracking-wider py-2.5 rounded-sm text-xs transition-colors shadow-xs"
        >
          <UIcon v-if="isLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-white" />
          <UIcon v-else name="i-heroicons-paper-airplane" class="w-4 h-4" />
          <span>{{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}</span>
        </button>
      </form>

      <!-- Back to login -->
      <div class="text-center pt-2">
        <NuxtLink 
          to="/admin/login" 
          class="text-xs text-neutral-500 hover:text-neutral-950 inline-flex items-center gap-1 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5" />
          <span>Retour à la connexion</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
