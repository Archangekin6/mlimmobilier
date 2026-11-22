import { ref, computed } from 'vue'

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
  gallery?: string[]
  published: boolean
  featured: boolean
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
  statsClients: number
  statsProjects: number
  statsYears: number
  statsSatisfaction: number
  socialFacebook: string
  socialLinkedin: string
  socialInstagram: string
  bannerNotice: string
  showNotice: boolean
}

// Initial realistic default settings for ML Immobilier SARL
const defaultSettings: SiteSettings = {
  companyName: 'ML Immobilier SARL',
  logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
  tagline: 'Expert en BTP, Électrification & Gestion Immobilière à Abidjan',
  address: 'Yopougon, Terminus 27',
  city: 'Abidjan, Côte d’Ivoire',
  phone1: '+225 07 08 09 10 11',
  phone2: '+225 05 04 03 02 01',
  whatsapp: '2250708091011',
  email: 'contact@mlimmobilier.com',
  workingHours: 'Lun - Ven : 08h00 - 18h00 | Sam : 09h00 - 13h00',
  heroTitle: 'Bâtir avec rigueur, éclairer avec précision, valoriser votre patrimoine.',
  heroSubtitle: 'ML Immobilier SARL accompagne particuliers, entreprises et institutions dans la réalisation de chantiers BTP, projets d’électrification et la gestion immobilière sécurisée à Abidjan et en Côte d’Ivoire.',
  heroCtaText: 'Demander un devis gratuit',
  statsClients: 120,
  statsProjects: 85,
  statsYears: 8,
  statsSatisfaction: 98,
  socialFacebook: 'https://facebook.com/mlimmobilier',
  socialLinkedin: 'https://linkedin.com/company/mlimmobilier',
  socialInstagram: 'https://instagram.com/mlimmobilier',
  bannerNotice: 'Nouvelle agence à Yopougon Terminus 27 – Venez rencontrer nos experts pour votre projet.',
  showNotice: true
}

// Realistic projects in Abidjan
const defaultProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Construction Résidence R+4 Moderne',
    category: 'btp',
    location: 'Abidjan - Cocody Angré 8ème Tranche',
    date: '2026',
    description: 'Réalisation clé en main d’un immeuble d’habitation de grand standing avec sous-sol et finitions premium.',
    fullDescription: 'Projet complet comprenant les études géotechniques, le terrassement, le gros œuvre en béton armé, les étanchéités de pointe, les menuiseries aluminium et la domotique intégrée.',
    client: 'Société Immobilière d’Abidjan',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80'
    ],
    published: true,
    featured: true
  },
  {
    id: 'proj-2',
    title: 'Électrification HTA/BTA Lotissement Privé',
    category: 'electrification',
    location: 'Bingerville - Zone Résidentielle',
    date: '2026',
    description: 'Installation d’un poste transformateur 630 kVA et extension de réseau de distribution électrique conforme CIE.',
    fullDescription: 'Pose de câbles souterrains, raccordement de 48 villas individuelles, éclairage public LED autonome et certification auprès des organismes nationaux de contrôle.',
    client: 'Collectivité de Résidents',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80'
    ],
    published: true,
    featured: true
  },
  {
    id: 'proj-3',
    title: 'Gestion & Entretien Parc Locatif Résidentiel',
    category: 'gestion',
    location: 'Abidjan - Yopougon & Marcory',
    date: '2025 - En cours',
    description: 'Mandat de gestion locative, recouvrement des loyers, maintenance technique et valorisation pour un parc de 32 appartements.',
    fullDescription: 'Sélection rigoureuse des locataires, taux de recouvrement de 99.4%, audit semestriel de l’état du bâtiment et assistance juridique propriétaire.',
    client: 'Investisseurs Privés',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80'
    ],
    published: true,
    featured: true
  },
  {
    id: 'proj-4',
    title: 'Rénovation Énergétique Siège d’Entreprise',
    category: 'electrification',
    location: 'Abidjan - Plateau',
    date: '2025',
    description: 'Mise en conformité des armoires électriques, onduleurs industriels et intégration de panneaux solaires en toiture.',
    fullDescription: 'Réduction de 35% de la facture énergétique du bâtiment grâce à l’optimisation des charges et l’installation d’une gestion technique centralisée.',
    client: 'Groupe Financier Régional',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'
    ],
    published: true,
    featured: false
  },
  {
    id: 'proj-5',
    title: 'Aménagement de Villa Duplex & Clôture Sécurisée',
    category: 'btp',
    location: 'Abidjan - Songon',
    date: '2025',
    description: 'Construction d’une villa moderne de 6 pièces avec piscine, voirie d’accès pavée et réseau d’assainissement individuel.',
    fullDescription: 'Ouvrage réalisé en 7 mois avec contrôle continu des dosages de béton et respect scrupuleux des normes de sécurité ivoiriennes.',
    client: 'Particulier',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ],
    published: true,
    featured: false
  }
]

// Default simulated quote requests
const defaultQuotes: QuoteRequest[] = [
  {
    id: 'quote-101',
    service: 'btp',
    fullName: 'M. Kouassi Adama',
    phone: '+225 07 48 12 34 56',
    email: 'kouassi.adama@gmail.com',
    location: 'Bingerville',
    budget: '45 000 000 FCFA',
    timeline: '3 mois',
    description: 'Projet de construction d’une villa R+1 de 5 pièces sur un terrain viabilisé de 400 m². Besoin d’un devis quantitatif et estimatif.',
    status: 'nouveau',
    createdAt: '2026-11-19T14:30:00Z',
    notes: 'Contacté par téléphone, client très intéressé par nos réalisations à Angré.'
  },
  {
    id: 'quote-102',
    service: 'electrification',
    fullName: 'Mme Bamba Fatou',
    phone: '+225 05 98 76 54 32',
    email: 'fatou.bamba@ci-holding.com',
    location: 'Zone Industrielle Yopougon',
    budget: '18 000 000 FCFA',
    timeline: 'Urgent (1 mois)',
    description: 'Rénovation complète du tableau général basse tension (TGBT) et installation d’un groupe électrogène de secours de 150 kVA.',
    status: 'en_cours',
    createdAt: '2026-11-18T10:15:00Z',
    notes: 'Visite technique sur site planifiée ce vendredi à 10h.'
  },
  {
    id: 'quote-103',
    service: 'gestion',
    fullName: 'Dr. N’Guessan Patrick',
    phone: '+225 01 22 33 44 55',
    email: 'pnguessan@cabinet-med.ci',
    location: 'Cocody Riviera 3',
    budget: 'Non spécifié',
    timeline: 'Immédiat',
    description: 'Mise en gérance d’un immeuble de 8 appartements de standing. Recherche d’un gestionnaire rigoureux avec garantie de loyers.',
    status: 'devis_envoye',
    createdAt: '2026-11-16T09:00:00Z',
    notes: 'Convention de gestion transmise par email, attente de signature.'
  }
]

// Reactive shared state
const settings = ref<SiteSettings>(defaultSettings)
const projects = ref<Project[]>(defaultProjects)
const quotes = ref<QuoteRequest[]>(defaultQuotes)

// Initialize from localStorage if available in browser
let isHydrated = false
const hydrateClientState = () => {
  if (import.meta.client && !isHydrated) {
    try {
      const savedSettings = localStorage.getItem('ml_site_settings')
      if (savedSettings) settings.value = JSON.parse(savedSettings)

      const savedProjects = localStorage.getItem('ml_site_projects')
      if (savedProjects) projects.value = JSON.parse(savedProjects)

      const savedQuotes = localStorage.getItem('ml_site_quotes')
      if (savedQuotes) quotes.value = JSON.parse(savedQuotes)

      isHydrated = true
    } catch (e) {
      console.warn('Storage hydration notice:', e)
    }
  }
}

export function useSiteData() {
  if (import.meta.client) {
    hydrateClientState()
  }

  // --- SETTINGS ACTIONS ---
  const saveSettings = (newSettings: SiteSettings) => {
    settings.value = { ...newSettings }
    if (import.meta.client) {
      localStorage.setItem('ml_site_settings', JSON.stringify(settings.value))
    }
  }

  // --- PROJECTS ACTIONS ---
  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`
    }
    projects.value.unshift(newProject)
    if (import.meta.client) {
      localStorage.setItem('ml_site_projects', JSON.stringify(projects.value))
    }
    return newProject
  }

  const updateProject = (id: string, projectData: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === id)
    const project = projects.value[index]
    if (project) {
      projects.value[index] = { ...project, ...projectData }
      if (import.meta.client) {
        localStorage.setItem('ml_site_projects', JSON.stringify(projects.value))
      }
    }
  }

  const deleteProject = (id: string) => {
    projects.value = projects.value.filter(p => p.id !== id)
    if (import.meta.client) {
      localStorage.setItem('ml_site_projects', JSON.stringify(projects.value))
    }
  }

  const toggleProjectPublish = (id: string) => {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      project.published = !project.published
      if (import.meta.client) {
        localStorage.setItem('ml_site_projects', JSON.stringify(projects.value))
      }
    }
  }

  // --- QUOTES ACTIONS ---
  const addQuote = (quoteData: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>) => {
    const newQuote: QuoteRequest = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      status: 'nouveau',
      createdAt: new Date().toISOString()
    }
    quotes.value.unshift(newQuote)
    if (import.meta.client) {
      localStorage.setItem('ml_site_quotes', JSON.stringify(quotes.value))
    }
    return newQuote
  }

  const updateQuoteStatus = (id: string, status: QuoteRequest['status'], notes?: string) => {
    const quote = quotes.value.find(q => q.id === id)
    if (quote) {
      quote.status = status
      if (notes !== undefined) quote.notes = notes
      if (import.meta.client) {
        localStorage.setItem('ml_site_quotes', JSON.stringify(quotes.value))
      }
    }
  }

  const deleteQuote = (id: string) => {
    quotes.value = quotes.value.filter(q => q.id !== id)
    if (import.meta.client) {
      localStorage.setItem('ml_site_quotes', JSON.stringify(quotes.value))
    }
  }

  // --- COMPUTED ---
  const publishedProjects = computed(() => projects.value.filter(p => p.published))
  const featuredProjects = computed(() => projects.value.filter(p => p.published && p.featured))
  const pendingQuotesCount = computed(() => quotes.value.filter(q => q.status === 'nouveau').length)

  return {
    settings,
    projects,
    publishedProjects,
    featuredProjects,
    quotes,
    pendingQuotesCount,
    saveSettings,
    addProject,
    updateProject,
    deleteProject,
    toggleProjectPublish,
    addQuote,
    updateQuoteStatus,
    deleteQuote,
  }
}
