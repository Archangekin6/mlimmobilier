<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false
})

const router = useRouter()
const { updatePassword, logout } = useAuth()

const newPassword = ref('')
const confirmPassword = ref('')
const successMsg = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  
  // Validation
  if (!newPassword.value || !confirmPassword.value) {
    errorMsg.value = 'Veuillez remplir tous les champs'
    return
  }
  
  if (newPassword.value.length < 8) {
    errorMsg.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  isLoading.value = true

  try {
    const result = await updatePassword(newPassword.value)

    if (result.success) {
      const logoutResult = await logout()

      if (!logoutResult.success) {
        errorMsg.value = 'Mot de passe modifié, mais la déconnexion a échoué. Réessayez avant de quitter cette page.'
        return
      }

      successMsg.value = result.message || 'Mot de passe mis à jour avec succès'
      
      // Rediriger vers le login après 2 secondes
      setTimeout(() => {
        router.replace('/admin/login')
      }, 2000)
    } else {
      errorMsg.value = result.error || 'Une erreur est survenue'
    }
  } catch (err: any) {
    console.error('Erreur update password:', err)
    errorMsg.value = 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}

useSeoMeta({
  title: 'Nouveau mot de passe | ML Immobilier SARL',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white border border-neutral-200 rounded-md p-6 sm:p-8 space-y-5 shadow-sm">
      <!-- Logo & Header -->
      <div class="text-center space-y-2">
        <div class="w-10 h-10 rounded-sm bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-xs">
          <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-lg font-black text-neutral-950 tracking-tight uppercase">Nouveau mot de passe</h1>
        <p class="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Sécurisez votre compte</p>
      </div>

      <!-- Success Alert -->
      <div v-if="successMsg" class="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
        <p>{{ successMsg }}</p>
        <p class="mt-1 text-[10px]">Redirection vers la page de connexion...</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMsg" class="p-3 rounded-sm bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
        {{ errorMsg }}
      </div>

      <!-- Form -->
      <form v-if="!successMsg" @submit.prevent="handleSubmit" class="space-y-4">
        <div class="text-xs text-neutral-600">
          <p>Choisissez un nouveau mot de passe sécurisé.</p>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-neutral-950 uppercase tracking-wider mb-1">
            Nouveau mot de passe
          </label>
          <input
            v-model="newPassword"
            type="password"
            required
            autocomplete="new-password"
            minlength="8"
            class="w-full px-3 py-2 rounded-sm bg-white border border-neutral-300 text-neutral-950 text-xs focus:border-neutral-900 focus:outline-none"
            placeholder="Minimum 8 caractères"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-neutral-950 uppercase tracking-wider mb-1">
            Confirmer le mot de passe
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            minlength="8"
            class="w-full px-3 py-2 rounded-sm bg-white border border-neutral-300 text-neutral-950 text-xs focus:border-neutral-900 focus:outline-none"
            placeholder="Retapez le mot de passe"
          />
        </div>

        <div class="text-[10px] text-neutral-500 space-y-1 bg-neutral-50 p-2 rounded-sm">
          <p class="font-semibold text-neutral-700">Conseils de sécurité :</p>
          <ul class="list-disc list-inside space-y-0.5">
            <li>Au moins 8 caractères</li>
            <li>Mélanger majuscules et minuscules</li>
            <li>Inclure des chiffres et symboles</li>
          </ul>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white font-semibold uppercase tracking-wider py-2.5 rounded-sm text-xs transition-colors shadow-xs"
        >
          <UIcon v-if="isLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-white" />
          <UIcon v-else name="i-heroicons-check" class="w-4 h-4" />
          <span>{{ isLoading ? 'Mise à jour...' : 'Mettre à jour' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
