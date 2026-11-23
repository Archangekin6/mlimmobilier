// Endpoint protégé pour le cron keep-alive
// Effectue une simple lecture dans Supabase pour maintenir l'activité
// et éviter la mise en pause automatique du projet FREE

import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  // Vérification du token secret pour protéger l'endpoint
  const cronToken = getHeader(event, 'x-cron-token')
  
  if (!cronToken || cronToken !== process.env.CRON_SECRET_TOKEN) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid cron token'
    })
  }
  
  try {
    // Lecture simple pour maintenir Supabase actif
    // Cette requête compte comme une "activité" et empêche la pause
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('id, company_name, updated_at')
      .single()
    
    if (error) {
      console.error('Keep-alive DB check failed:', error.message)
      throw createError({ statusCode: 503, statusMessage: 'Supabase est temporairement indisponible' })
    }

    const { data: removedRateLimits, error: cleanupError } = await supabaseAdmin
      .rpc('cleanup_rate_limits', { p_window_hours: 168 })
    if (cleanupError) {
      console.error('Rate-limit cleanup failed:', cleanupError.message)
      throw createError({ statusCode: 503, statusMessage: 'Le nettoyage anti-abus est temporairement indisponible' })
    }
    
    // Succès - le projet Supabase reste actif
    return {
      success: true,
      message: 'Supabase keep-alive successful',
      company: data.company_name,
      last_update: data.updated_at,
      removed_rate_limits: removedRateLimits,
      timestamp: new Date().toISOString()
    }
    
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'statusCode' in err &&
      typeof err.statusCode === 'number'
    ) {
      throw err
    }
    console.error('Keep-alive exception:', err)
    throw createError({
      statusCode: 503,
      statusMessage: 'Keep-alive check failed'
    })
  }
})
