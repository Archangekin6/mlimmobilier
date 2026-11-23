import { supabaseAdmin } from '~~/server/utils/supabase'

const quoteStatuses = ['nouveau', 'en_cours', 'devis_envoye', 'termine', 'archive'] as const

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  const id = getRouterParam(event, 'id')
  if (!id || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) throw createError({ statusCode: 400, statusMessage: 'Identifiant de demande invalide' })

  const body = await readBody<{ status?: unknown; admin_notes?: unknown }>(event)
  if (!body || (body.status === undefined && body.admin_notes === undefined)) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune modification fournie' })
  }
  const update: { status?: typeof quoteStatuses[number]; admin_notes?: string | null } = {}
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !quoteStatuses.includes(body.status as typeof quoteStatuses[number])) {
      throw createError({ statusCode: 400, statusMessage: 'Statut de demande invalide' })
    }
    update.status = body.status as typeof quoteStatuses[number]
  }
  if (body.admin_notes !== undefined) {
    if (body.admin_notes !== null && (typeof body.admin_notes !== 'string' || body.admin_notes.length > 5000)) {
      throw createError({ statusCode: 400, statusMessage: 'Note administrative invalide' })
    }
    update.admin_notes = typeof body.admin_notes === 'string' ? body.admin_notes.trim() : null
  }

  const supabase = supabaseAdmin
  const { data, error } = await supabase.from('quote_requests').update(update).eq('id', id).select('*').maybeSingle()
  if (error) {
    console.error('Erreur de mise à jour de la demande de devis:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de modifier la demande' })
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Demande introuvable' })
  return data
})
