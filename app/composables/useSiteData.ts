import { computed } from 'vue'
import type { SiteImage } from './useSiteImages'

export interface Project {
  id: string
  title: string
  category: 'btp' | 'electrification' | 'gestion'
  location: string
  date: string
  description: string
  fullDescription?: string
  client?: string
  imageUrl: string
  imageStoragePath?: string
  gallery?: string[]
  galleryImages?: Array<{ imageUrl: string; storagePath: string }>
  published: boolean
  featured: boolean
  displayOrder: number
}

export interface QuoteRequest {
  id: string
  service: 'btp' | 'electrification' | 'gestion' | 'autre'
  fullName: string
  phone: string
  email: string
  location?: string
  budget?: string
  timeline?: string
  description: string
  status: 'nouveau' | 'en_cours' | 'devis_envoye' | 'termine' | 'archive'
  createdAt: string
  notes?: string
}

export interface Testimonial {
  id: string
  client_name: string
  client_function: string | null
  client_company: string | null
  client_location: string | null
  testimonial_text: string
  service_type: string | null
  rating: number | null
  photo_url: string | null
  testimonial_date: string | null
  published: boolean
  featured: boolean
  display_order: number
}

export type ServiceSlug = 'btp' | 'electrification' | 'gestion'

export interface ServiceDetailItem {
  title: string
  text: string
}

export interface SiteService {
  slug: ServiceSlug
  homeTitle: string
  detailTitle: string
  badge: string
  homeDescription: string
  homeHighlights: string[]
  detailDescription: string
  detailItems: ServiceDetailItem[]
  displayOrder: number
  published: boolean
  icon: string
}

export interface SiteSettings {
  companyName: string
  logoUrl: string
  tagline: string
  address: string
  city: string
  phone1: string
  phone2: string
  whatsapp: string
  email: string
  workingHours: string
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  heroSecondaryCtaText: string
  homeDescription: string
  statsClients: number | null
  statsProjects: number | null
  statsYears: number | null
  statsSatisfaction: number | null
  socialFacebook: string
  socialLinkedin: string
  socialInstagram: string
  bannerNotice: string
  showNotice: boolean
  aboutHeroTitle: string
  aboutHeroSubtitle: string
  aboutPresentationTitle: string
  aboutPresentationText: string
  aboutLocationText: string
  aboutMissionTitle: string
  aboutMissionText: string
  aboutValuesTitle: string
  aboutValuesSubtitle: string
  aboutValue1Title: string
  aboutValue1Text: string
  aboutValue2Title: string
  aboutValue2Text: string
  aboutValue3Title: string
  aboutValue3Text: string
  aboutValue4Title: string
  aboutValue4Text: string
  aboutCtaTitle: string
  aboutCtaText: string
}

interface DatabaseProject {
  id: string
  title: string
  service_type: Project['category']
  location: string | null
  project_date: string | null
  summary: string | null
  description: string | null
  full_description: string | null
  client_name: string | null
  cover_image_url: string | null
  published: boolean
  featured: boolean
  display_order: number
}

interface DatabaseSettings {
  company_name: string
  logo_url: string | null
  tagline: string | null
  address: string | null
  city: string | null
  phone1: string | null
  phone2: string | null
  whatsapp: string | null
  email: string | null
  working_hours: string | null
  hero_title: string | null
  hero_subtitle: string | null
  hero_cta_text: string | null
  hero_secondary_cta_text: string | null
  home_description: string | null
  stats_clients: number | null
  stats_projects: number | null
  stats_years: number | null
  stats_satisfaction: number | null
  social_facebook: string | null
  social_linkedin: string | null
  social_instagram: string | null
  banner_notice: string | null
  show_notice: boolean
  about_hero_title: string | null
  about_hero_subtitle: string | null
  about_presentation_title: string | null
  about_presentation_text: string | null
  about_location_text: string | null
  about_mission_title: string | null
  about_mission_text: string | null
  about_values_title: string | null
  about_values_subtitle: string | null
  about_value_1_title: string | null
  about_value_1_text: string | null
  about_value_2_title: string | null
  about_value_2_text: string | null
  about_value_3_title: string | null
  about_value_3_text: string | null
  about_value_4_title: string | null
  about_value_4_text: string | null
  about_cta_title: string | null
  about_cta_text: string | null
}

interface DatabaseSiteService {
  slug: ServiceSlug
  home_title: string
  detail_title: string
  badge: string
  home_description: string
  home_highlights: unknown
  detail_description: string
  detail_items: unknown
  display_order: number
  published: boolean
}

const emptySettings: SiteSettings = {
  companyName: 'ML Immobilier SARL',
  logoUrl: '',
  tagline: '',
  address: '',
  city: '',
  phone1: '',
  phone2: '',
  whatsapp: '',
  email: '',
  workingHours: '',
  heroTitle: '',
  heroSubtitle: '',
  heroCtaText: '',
  heroSecondaryCtaText: '',
  homeDescription: '',
  statsClients: null,
  statsProjects: null,
  statsYears: null,
  statsSatisfaction: null,
  socialFacebook: '',
  socialLinkedin: '',
  socialInstagram: '',
  bannerNotice: '',
  showNotice: false,
  aboutHeroTitle: '',
  aboutHeroSubtitle: '',
  aboutPresentationTitle: '',
  aboutPresentationText: '',
  aboutLocationText: '',
  aboutMissionTitle: '',
  aboutMissionText: '',
  aboutValuesTitle: '',
  aboutValuesSubtitle: '',
  aboutValue1Title: '',
  aboutValue1Text: '',
  aboutValue2Title: '',
  aboutValue2Text: '',
  aboutValue3Title: '',
  aboutValue3Text: '',
  aboutValue4Title: '',
  aboutValue4Text: '',
  aboutCtaTitle: '',
  aboutCtaText: ''
}

function mapSettings(row: DatabaseSettings | null): SiteSettings {
  if (!row) return { ...emptySettings }
  return {
    companyName: row.company_name,
    logoUrl: row.logo_url || '',
    tagline: row.tagline || '',
    address: row.address || '',
    city: row.city || '',
    phone1: row.phone1 || '',
    phone2: row.phone2 || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    workingHours: row.working_hours || '',
    heroTitle: row.hero_title || '',
    heroSubtitle: row.hero_subtitle || '',
    heroCtaText: row.hero_cta_text || '',
    heroSecondaryCtaText: row.hero_secondary_cta_text || '',
    homeDescription: row.home_description || '',
    statsClients: row.stats_clients,
    statsProjects: row.stats_projects,
    statsYears: row.stats_years,
    statsSatisfaction: row.stats_satisfaction,
    socialFacebook: row.social_facebook || '',
    socialLinkedin: row.social_linkedin || '',
    socialInstagram: row.social_instagram || '',
    bannerNotice: row.banner_notice || '',
    showNotice: row.show_notice,
    aboutHeroTitle: row.about_hero_title || '',
    aboutHeroSubtitle: row.about_hero_subtitle || '',
    aboutPresentationTitle: row.about_presentation_title || '',
    aboutPresentationText: row.about_presentation_text || '',
    aboutLocationText: row.about_location_text || '',
    aboutMissionTitle: row.about_mission_title || '',
    aboutMissionText: row.about_mission_text || '',
    aboutValuesTitle: row.about_values_title || '',
    aboutValuesSubtitle: row.about_values_subtitle || '',
    aboutValue1Title: row.about_value_1_title || '',
    aboutValue1Text: row.about_value_1_text || '',
    aboutValue2Title: row.about_value_2_title || '',
    aboutValue2Text: row.about_value_2_text || '',
    aboutValue3Title: row.about_value_3_title || '',
    aboutValue3Text: row.about_value_3_text || '',
    aboutValue4Title: row.about_value_4_title || '',
    aboutValue4Text: row.about_value_4_text || '',
    aboutCtaTitle: row.about_cta_title || '',
    aboutCtaText: row.about_cta_text || ''
  }
}

const serviceIcons: Record<ServiceSlug, string> = {
  btp: 'i-heroicons-wrench-screwdriver',
  electrification: 'i-heroicons-bolt',
  gestion: 'i-heroicons-key'
}

function mapStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function mapDetailItems(value: unknown): ServiceDetailItem[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is ServiceDetailItem =>
    typeof item === 'object' &&
    item !== null &&
    'title' in item &&
    typeof item.title === 'string' &&
    'text' in item &&
    typeof item.text === 'string'
  )
}

function mapService(row: DatabaseSiteService): SiteService {
  return {
    slug: row.slug,
    homeTitle: row.home_title,
    detailTitle: row.detail_title,
    badge: row.badge,
    homeDescription: row.home_description,
    homeHighlights: mapStringList(row.home_highlights),
    detailDescription: row.detail_description,
    detailItems: mapDetailItems(row.detail_items),
    displayOrder: row.display_order,
    published: row.published,
    icon: serviceIcons[row.slug]
  }
}

interface DatabaseProjectImage {
  project_id: string
  image_url: string
  storage_path?: string
  is_cover: boolean
  display_order: number
}

function mapProject(row: DatabaseProject, images: DatabaseProjectImage[]): Project {
  const projectImages = images
    .filter(image => image.project_id === row.id)
    .sort((left, right) => left.display_order - right.display_order)
  const imageUrl = row.cover_image_url || projectImages.find(image => image.is_cover)?.image_url || projectImages[0]?.image_url || ''
  return {
    id: row.id,
    title: row.title,
    category: row.service_type,
    location: row.location || '',
    date: row.project_date || '',
    description: row.summary || row.description || '',
    fullDescription: row.full_description || row.description || '',
    client: row.client_name || '',
    imageUrl,
    imageStoragePath: projectImages.find(image => image.is_cover)?.storage_path || projectImages[0]?.storage_path,
    gallery: projectImages.map(image => image.image_url),
    galleryImages: projectImages
      .filter((image): image is DatabaseProjectImage & { storage_path: string } => Boolean(image.storage_path))
      .map(image => ({ imageUrl: image.image_url, storagePath: image.storage_path })),
    published: row.published,
    featured: row.featured,
    displayOrder: row.display_order
  }
}

function mapQuote(row: Record<string, unknown>): QuoteRequest {
  return {
    id: String(row.id),
    service: row.service as QuoteRequest['service'],
    fullName: String(row.full_name),
    phone: String(row.phone),
    email: typeof row.email === 'string' ? row.email : '',
    location: typeof row.location === 'string' ? row.location : '',
    budget: typeof row.budget === 'string' ? row.budget : '',
    timeline: typeof row.timeline === 'string' ? row.timeline : '',
    description: String(row.description),
    status: row.status as QuoteRequest['status'],
    createdAt: String(row.created_at),
    notes: typeof row.admin_notes === 'string' ? row.admin_notes : ''
  }
}

export function useSiteData() {
  const settings = useState<SiteSettings>('site-settings', () => ({ ...emptySettings }))
  const projects = useState<Project[]>('site-projects', () => [])
  const quotes = useState<QuoteRequest[]>('site-quotes', () => [])
  const testimonials = useState<Testimonial[]>('site-testimonials', () => [])
  const services = useState<SiteService[]>('site-services', () => [])
  const siteImages = useState<SiteImage[]>('site-images', () => [])
  const siteImagesFetched = useState<boolean>('site-images-fetched', () => false)
  const isPublicDataLoaded = useState<boolean>('site-public-data-loaded', () => false)
  const isAdminDataLoaded = useState<boolean>('site-admin-data-loaded', () => false)
  const isAdminServicesLoaded = useState<boolean>('site-admin-services-loaded', () => false)

  const publishedProjects = computed(() => projects.value.filter(project => project.published))
  const featuredProjects = computed(() => projects.value.filter(project => project.published && project.featured))
  const publishedTestimonials = computed(() => testimonials.value.filter(testimonial => testimonial.published))
  const publishedServices = computed(() =>
    services.value
      .filter(service => service.published)
      .sort((left, right) => left.displayOrder - right.displayOrder)
  )
  const pendingQuotesCount = computed(() => quotes.value.filter(quote => quote.status === 'nouveau').length)

  const loadPublicData = async (force = false) => {
    if (isPublicDataLoaded.value && !force) return
    if (force) clearNuxtData('site-public-data')

    const { data, error } = await useAsyncData('site-public-data', () => $fetch<{
      settings: DatabaseSettings | null
      projects: DatabaseProject[]
      testimonials: Testimonial[]
      services: DatabaseSiteService[]
      projectImages: DatabaseProjectImage[]
      siteImages: SiteImage[]
    }>('/api/site-data'), { dedupe: 'defer' })

    if (error.value) throw error.value
    const result = data.value
    if (!result) throw new Error('Les données publiques du site sont indisponibles')

    settings.value = mapSettings(result.settings)
    projects.value = result.projects.map(row => mapProject(row, result.projectImages))
    testimonials.value = result.testimonials
    services.value = result.services.map(mapService)
    siteImages.value = result.siteImages
    siteImagesFetched.value = true
    isPublicDataLoaded.value = true
  }

  const loadAdminData = async (force = false) => {
    if (isAdminDataLoaded.value && !force) return
    const data = await $fetch<{
      settings: DatabaseSettings | null
      projects: DatabaseProject[]
      testimonials: Testimonial[]
      quotes: Array<Record<string, unknown>>
      projectImages: DatabaseProjectImage[]
    }>('/api/admin/data')
    settings.value = mapSettings(data.settings)
    projects.value = data.projects.map(row => mapProject(row, data.projectImages))
    testimonials.value = data.testimonials
    quotes.value = data.quotes.map(mapQuote)
    isAdminDataLoaded.value = true
  }

  const loadAdminServices = async (force = false) => {
    if (isAdminServicesLoaded.value && !force) return
    const data = await $fetch<DatabaseSiteService[]>('/api/admin/services')
    services.value = data.map(mapService)
    isAdminServicesLoaded.value = true
  }

  const saveService = async (service: SiteService) => {
    const updated = await $fetch<DatabaseSiteService>(`/api/admin/services/${service.slug}`, {
      method: 'PATCH',
      body: {
        home_title: service.homeTitle,
        detail_title: service.detailTitle,
        badge: service.badge,
        home_description: service.homeDescription,
        home_highlights: service.homeHighlights,
        detail_description: service.detailDescription,
        detail_items: service.detailItems,
        display_order: service.displayOrder,
        published: service.published
      }
    })
    const mapped = mapService(updated)
    services.value = services.value.some(item => item.slug === mapped.slug)
      ? services.value.map(item => item.slug === mapped.slug ? mapped : item)
      : [...services.value, mapped]
    isAdminServicesLoaded.value = true
    clearNuxtData('site-public-data')
  }

  const saveSettings = async (newSettings: SiteSettings) => {
    await $fetch('/api/admin/site-settings', { method: 'PATCH', body: newSettings })
    settings.value = { ...newSettings }
    clearNuxtData('site-public-data')
    isPublicDataLoaded.value = false
  }

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    await $fetch('/api/admin/projects', { method: 'POST', body: projectData })
    await loadAdminData(true)
  }

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    await $fetch(`/api/admin/projects/${encodeURIComponent(id)}`, { method: 'PATCH', body: projectData })
    await loadAdminData(true)
  }

  const deleteProject = async (id: string) => {
    await $fetch(`/api/admin/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
    await loadAdminData(true)
  }

  const toggleProjectPublish = async (id: string) => {
    const project = projects.value.find(item => item.id === id)
    if (!project) return
    await updateProject(id, { published: !project.published })
  }

  const updateQuoteStatus = async (id: string, status: QuoteRequest['status'], notes?: string) => {
    await $fetch(`/api/admin/quotes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { status, ...(notes !== undefined ? { admin_notes: notes } : {}) }
    })
    await loadAdminData(true)
  }

  const deleteQuote = async (id: string) => {
    await $fetch(`/api/admin/quotes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    await loadAdminData(true)
  }

  const saveTestimonial = async (testimonial: Partial<Testimonial> & Pick<Testimonial, 'client_name' | 'testimonial_text'>) => {
    const id = testimonial.id
    if (id) {
      await $fetch(`/api/admin/testimonials/${encodeURIComponent(id)}`, { method: 'PATCH', body: testimonial })
    } else {
      await $fetch('/api/admin/testimonials', { method: 'POST', body: testimonial })
    }
    await loadAdminData(true)
  }

  const deleteTestimonial = async (id: string) => {
    await $fetch(`/api/admin/testimonials/${encodeURIComponent(id)}`, { method: 'DELETE' })
    await loadAdminData(true)
  }

  return {
    settings,
    projects,
    publishedProjects,
    featuredProjects,
    quotes,
    testimonials,
    publishedTestimonials,
    services,
    publishedServices,
    pendingQuotesCount,
    loadPublicData,
    loadAdminData,
    loadAdminServices,
    saveService,
    saveSettings,
    addProject,
    updateProject,
    deleteProject,
    toggleProjectPublish,
    updateQuoteStatus,
    deleteQuote,
    saveTestimonial,
    deleteTestimonial
  }
}
