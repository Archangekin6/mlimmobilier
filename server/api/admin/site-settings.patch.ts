import { getPublicStoragePath, removeStorageFileIfUnused } from '~~/server/utils/storage'
import { isValidSiteSettingsString } from '~~/server/utils/site-settings-validation'
import { supabaseAdmin } from '~~/server/utils/supabase'

const settingsFields = {
  companyName: 'company_name',
  logoUrl: 'logo_url',
  tagline: 'tagline',
  address: 'address',
  city: 'city',
  phone1: 'phone1',
  phone2: 'phone2',
  whatsapp: 'whatsapp',
  email: 'email',
  workingHours: 'working_hours',
  heroTitle: 'hero_title',
  heroSubtitle: 'hero_subtitle',
  heroCtaText: 'hero_cta_text',
  heroSecondaryCtaText: 'hero_secondary_cta_text',
  homeDescription: 'home_description',
  statsClients: 'stats_clients',
  statsProjects: 'stats_projects',
  statsYears: 'stats_years',
  statsSatisfaction: 'stats_satisfaction',
  socialFacebook: 'social_facebook',
  socialLinkedin: 'social_linkedin',
  socialInstagram: 'social_instagram',
  socialFacebookEnabled: 'social_facebook_enabled',
  socialInstagramEnabled: 'social_instagram_enabled',
  socialWhatsappEnabled: 'social_whatsapp_enabled',
  bannerNotice: 'banner_notice',
  showNotice: 'show_notice',
  aboutHeroTitle: 'about_hero_title',
  aboutHeroSubtitle: 'about_hero_subtitle',
  aboutPresentationTitle: 'about_presentation_title',
  aboutPresentationText: 'about_presentation_text',
  aboutLocationText: 'about_location_text',
  aboutMissionTitle: 'about_mission_title',
  aboutMissionText: 'about_mission_text',
  aboutValuesTitle: 'about_values_title',
  aboutValuesSubtitle: 'about_values_subtitle',
  aboutValue1Title: 'about_value_1_title',
  aboutValue1Text: 'about_value_1_text',
  aboutValue2Title: 'about_value_2_title',
  aboutValue2Text: 'about_value_2_text',
  aboutValue3Title: 'about_value_3_title',
  aboutValue3Text: 'about_value_3_text',
  aboutValue4Title: 'about_value_4_title',
  aboutValue4Text: 'about_value_4_text',
  aboutCtaTitle: 'about_cta_title',
  aboutCtaText: 'about_cta_text'
} as const

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })
  }

  const update: Record<string, string | number | boolean | null> = {}
  for (const [field, column] of Object.entries(settingsFields)) {
    const value = body[field]
    if (value === undefined) continue
    if (['statsClients', 'statsProjects', 'statsYears', 'statsSatisfaction'].includes(field)) {
      if (value !== null && (typeof value !== 'number' || !Number.isInteger(value) || value < 0)) {
        throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${field}` })
      }
      update[column] = value
    } else if (field === 'showNotice' || field === 'socialFacebookEnabled' || field === 'socialInstagramEnabled' || field === 'socialWhatsappEnabled') {
      if (typeof value !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: 'Valeur invalide pour showNotice' })
      }
      update[column] = value
    } else if (value === null || typeof value === 'string') {
      if (typeof value === 'string' && !isValidSiteSettingsString(field, value)) {
        throw createError({ statusCode: 400, statusMessage: `Valeur trop longue pour ${field}` })
      }
      update[column] = typeof value === 'string'
        ? (field === 'whatsapp' ? value.replace(/\D/g, '') : value.trim())
        : null
    } else {
      throw createError({ statusCode: 400, statusMessage: `Valeur invalide pour ${field}` })
    }
  }

  if (Object.keys(update).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune modification fournie' })
  }

  const supabase = supabaseAdmin
  let oldLogoUrl: string | null = null
  if (Object.hasOwn(update, 'logo_url')) {
    const { data: current, error: currentError } = await supabase
      .from('site_settings').select('logo_url').eq('id', '00000000-0000-0000-0000-000000000001').maybeSingle()
    if (currentError) throw createError({ statusCode: 500, statusMessage: 'Impossible de lire les paramètres actuels' })
    oldLogoUrl = current?.logo_url || null
  }
  const { data, error } = await supabase
    .from('site_settings')
    .update(update)
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('Erreur d’enregistrement des paramètres du site:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer les paramètres' })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Ligne des paramètres introuvable. Vérifiez la migration 002.' })
  }
  if (oldLogoUrl && update.logo_url !== oldLogoUrl) {
    const oldPath = getPublicStoragePath('site-images', oldLogoUrl)
    if (oldPath) {
      const cleanup = await removeStorageFileIfUnused('site-images', oldPath)
      if (cleanup.warning) console.error(cleanup.warning)
    }
  }
  return data
})
