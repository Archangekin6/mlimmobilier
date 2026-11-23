import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const userId = event.context.adminUser?.id

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }

  const body = await readBody<{ full_name?: unknown }>(event)

  if (typeof body?.full_name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nom complet invalide'
    })
  }

  const fullName = body.full_name.trim()

  if (!fullName || fullName.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le nom complet doit contenir entre 1 et 200 caractères'
    })
  }

  const supabase = supabaseAdmin
  const { data, error } = await supabase
    .from('admin_profiles')
    .update({ full_name: fullName })
    .eq('user_id', userId)
    .select('id, user_id, full_name, email, created_at')
    .maybeSingle()

  if (error) {
    console.error('Erreur mise à jour du profil administrateur:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de mettre à jour le profil administrateur'
    })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Profil administrateur introuvable'
    })
  }

  return data
})
