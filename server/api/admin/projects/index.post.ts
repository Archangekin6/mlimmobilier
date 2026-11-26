import { randomUUID } from 'node:crypto'
import { removeStorageFileIfUnused } from '~~/server/utils/storage'
import { validateProjectCreatePayload } from '~~/server/utils/project-validation'
import { supabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!event.context.adminUser?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const body = validateProjectCreatePayload(await readBody<unknown>(event))

  const supabase = supabaseAdmin
  const { data: lastProject, error: orderError } = await supabase
    .from('projects')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (orderError) {
    console.error('Erreur de lecture de l’ordre des projets:', orderError.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de préparer la réalisation' })
  }

  const slugBase = body.title.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
  const slug = `${slugBase || 'realisation'}-${randomUUID().slice(0, 8)}`
  const { data: project, error } = await supabase.from('projects').insert({
    title: body.title,
    slug,
    summary: body.description,
    description: body.description,
    full_description: null,
    service_type: body.category,
    location: body.location || null,
    project_date: null,
    client_name: null,
    cover_image_url: body.imageUrl,
    published: body.published,
    featured: body.featured,
    display_order: (lastProject?.display_order ?? -1) + 1
  }).select('*').single()

  if (error) {
    console.error('Erreur de création du projet:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de créer le projet' })
  }

  const { error: imageError } = await supabase.from('project_images').insert({
    project_id: project.id,
    image_url: body.imageUrl,
    storage_path: body.imageStoragePath,
    is_cover: true,
    display_order: 0
  })

  if (imageError) {
    const { error: rollbackError } = await supabase.from('projects').delete().eq('id', project.id)
    if (rollbackError) {
      console.error('Nettoyage de la réalisation incomplète impossible:', rollbackError.message)
    }
    const cleanup = await removeStorageFileIfUnused('project-images', body.imageStoragePath)
    if (cleanup.warning) console.error(cleanup.warning)
    console.error('Erreur d’enregistrement de la photo principale:', imageError.message)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer la photo principale' })
  }

  return project
})
