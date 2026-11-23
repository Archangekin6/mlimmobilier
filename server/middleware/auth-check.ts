import { getRequestURL } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { isAdminProfileForUser } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const isAdminApi = path === '/api/admin' || path.startsWith('/api/admin/')

  if (!isAdminApi) {
    return
  }

  const supabase = await serverSupabaseClient(event)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('Erreur de validation de la session admin:', authError)
  }

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, user_id, full_name, email, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Erreur de vérification du profil admin:', profileError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Vérification du profil administrateur impossible'
    })
  }

  if (!isAdminProfileForUser(user.id, profile)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès non autorisé'
    })
  }

  event.context.adminProfile = profile
  event.context.adminUser = user
})
