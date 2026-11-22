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
      console.error('Keep-alive DB check failed:', error)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
    
    // Succès - le projet Supabase reste actif
    return {
      success: true,
      message: 'Supabase keep-alive successful',
      company: data.company_name,
      last_update: data.updated_at,
      timestamp: new Date().toISOString()
    }
    
  } catch (err: any) {
    console.error('Keep-alive exception:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Keep-alive check failed'
    })
  }
})
