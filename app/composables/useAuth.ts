import { computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export interface AdminProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  created_at: string
}

export function useAuth() {
  const adminProfile = useState<AdminProfile | null>('admin-profile', () => null)
  const isLoadingProfile = useState('admin-profile-loading', () => false)
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isAuthenticated = computed(() =>
    Boolean(user.value && adminProfile.value?.user_id === user.value.id)
  )

  const loadAdminProfile = async (userId: string): Promise<AdminProfile | null> => {
    isLoadingProfile.value = true

    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('id, user_id, full_name, email, created_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Erreur récupération profil admin:', error)
        adminProfile.value = null
        return null
      }

      adminProfile.value = data
      return data
    } catch (error) {
      console.error('Erreur récupération profil admin:', error)
      adminProfile.value = null
      return null
    } finally {
      isLoadingProfile.value = false
    }
  }

  const fetchAdminProfile = async () => {
    if (!user.value) {
      adminProfile.value = null
      return null
    }

    return loadAdminProfile(user.value.id)
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Erreur déconnexion:', error)
        return {
          success: false,
          error: 'Impossible de se déconnecter'
        }
      }

      adminProfile.value = null
      return { success: true }
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      return {
        success: false,
        error: 'Impossible de se déconnecter'
      }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error || !data.user) {
        return {
          success: false,
          error: 'Identifiants incorrects'
        }
      }

      const profile = await loadAdminProfile(data.user.id)

      if (!profile) {
        const { error: signOutError } = await supabase.auth.signOut()
        adminProfile.value = null

        if (signOutError) {
          console.error('Erreur déconnexion utilisateur non autorisé:', signOutError)
        }

        return {
          success: false,
          error: 'Accès non autorisé'
        }
      }

      return {
        success: true,
        profile
      }
    } catch (error) {
      console.error('Erreur connexion:', error)
      adminProfile.value = null
      return {
        success: false,
        error: 'Une erreur est survenue lors de la connexion'
      }
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`
      })

      if (error) {
        console.error('Erreur réinitialisation:', error)
        return {
          success: false,
          error: 'Impossible d’envoyer le lien de réinitialisation'
        }
      }

      return {
        success: true,
        message: 'Un email de réinitialisation a été envoyé'
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error)
      return {
        success: false,
        error: 'Une erreur est survenue'
      }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        console.error('Erreur changement mot de passe:', error)
        return {
          success: false,
          error: 'Impossible de mettre à jour le mot de passe'
        }
      }

      return {
        success: true,
        message: 'Mot de passe mis à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error)
      return {
        success: false,
        error: 'Une erreur est survenue'
      }
    }
  }

  const updateProfile = async (updates: Partial<Pick<AdminProfile, 'full_name'>>) => {
    if (!isAuthenticated.value) {
      return {
        success: false,
        error: 'Non authentifié'
      }
    }

    const fullName = updates.full_name?.trim()
    if (!fullName) {
      return {
        success: false,
        error: 'Le nom complet est requis'
      }
    }

    try {
      const profile = await $fetch<AdminProfile>('/api/admin/profile', {
        method: 'PATCH',
        body: { full_name: fullName }
      })

      adminProfile.value = profile
      return {
        success: true,
        profile
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      return {
        success: false,
        error: 'Impossible de mettre à jour le profil'
      }
    }
  }

  const initialize = async () => {
    if (!user.value) {
      adminProfile.value = null
      return null
    }

    return fetchAdminProfile()
  }

  return {
    user,
    adminProfile,
    isAuthenticated,
    isLoadingProfile,
    login,
    logout,
    requestPasswordReset,
    updatePassword,
    updateProfile,
    fetchAdminProfile,
    initialize
  }
}
