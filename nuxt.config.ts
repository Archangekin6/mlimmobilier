import { builtinModules } from 'node:module'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false,
    useSsrCookies: true,
    types: '~/types/database.types.ts'
  },

  runtimeConfig: {
    public: {
      turnstileSiteKey: ''
    }
  },

  nitro: {
    externals: {
      trace: false
    },

    hooks: {
      'rollup:before'(_nitro, rollupConfig) {
        const origExternal = rollupConfig.external

        rollupConfig.external = (id, ...args) => {
          if (id.startsWith('node:') || builtinModules.includes(id)) {
            return true
          }

          if (Array.isArray(origExternal)) {
            return origExternal.includes(id)
          }

          if (typeof origExternal === 'function') {
            return origExternal(id, ...args)
          }

          return false
        }
      }
    }
  }
})