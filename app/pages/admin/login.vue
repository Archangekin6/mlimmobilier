<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false
})

const router = useRouter()
const { user, login, logout, isAuthenticated, initialize } = useAuth()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

// Si déjà connecté, rediriger vers l'admin
onMounted(async () => {
  await initialize()

  if (user.value && !isAuthenticated.value) {
    await logout()
  }

  if (isAuthenticated.value) {
    await router.replace('/admin')
  }
})

const handleLogin = async () => {
  errorMsg.value = ''
  
  // Validation basique
  if (!email.value.trim() || !password.value) {
    errorMsg.value = 'Veuillez remplir tous les champs'
    return
  }
  
  isLoading.value = true

  try {
    const result = await login(email.value, password.value)

    if (result.success) {
      // Connexion réussie - rediriger vers l'admin
      await router.push('/admin')
    } else {
      // Afficher l'erreur
      errorMsg.value = result.error || 'Identifiants incorrects'
    }
  } catch (err: any) {
    console.error('Erreur login:', err)
    errorMsg.value = 'Une erreur est survenue lors de la connexion'
  } finally {
    isLoading.value = false
  }
}

useSeoMeta({
  title: 'Connexion Administration | ML Immobilier SARL',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white border border-neutral-200 rounded-md p-6 sm:p-8 space-y-5 shadow-sm">
      <!-- Logo & Header -->
      <div class="text-center space-y-2">
        <div class="w-10 h-10 rounded-sm bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-xs">
          <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-lg font-black text-neutral-950 tracking-tight uppercase">Administration</h1>
        <p class="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">ML Immobilier SARL</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMsg" class="p-3 rounded-sm bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
        {{ errorMsg }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
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

        <div>
          <label class="block text-[11px] font-bold text-neutral-950 uppercase tracking-wider mb-1">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-2 rounded-sm bg-white border border-neutral-300 text-neutral-950 text-xs focus:border-neutral-900 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white font-semibold uppercase tracking-wider py-2.5 rounded-sm text-xs transition-colors shadow-xs"
        >
          <UIcon v-if="isLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-white" />
          <UIcon v-else name="i-heroicons-lock-closed" class="w-4 h-4" />
          <span>{{ isLoading ? 'Connexion...' : 'Se connecter' }}</span>
        </button>
      </form>

      <!-- Forgot password link -->
      <div class="text-center">
        <NuxtLink 
          to="/admin/forgot-password" 
          class="text-xs text-neutral-600 hover:text-neutral-950 transition-colors inline-flex items-center gap-1"
        >
          <UIcon name="i-heroicons-key" class="w-3.5 h-3.5" />
          <span>Mot de passe oublié ?</span>
        </NuxtLink>
      </div>

      <!-- Security notice -->
      <div class="p-3 rounded-sm bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 text-center space-y-1">
        <p class="font-semibold text-neutral-900">Accès réservé</p>
        <p>Seuls les administrateurs autorisés peuvent se connecter.</p>
      </div>

      <div class="text-center pt-1">
        <NuxtLink to="/" class="text-xs text-neutral-500 hover:text-neutral-950 inline-flex items-center gap-1 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5" />
          <span>Retour au site public</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
