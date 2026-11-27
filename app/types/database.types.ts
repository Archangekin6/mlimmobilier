export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type TimestampColumns = {
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_images: {
        Row: {
          id: string
          page: string
          section: string
          description: string
          image_url: string
          storage_path: string
          alt_text: string | null
          display_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page: string
          section: string
          description: string
          image_url: string
          storage_path: string
          alt_text?: string | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page?: string
          section?: string
          description?: string
          image_url?: string
          storage_path?: string
          alt_text?: string | null
          display_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
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
          stats_clients: number | null
          stats_projects: number | null
          stats_years: number | null
          stats_satisfaction: number | null
          social_facebook: string | null
          social_linkedin: string | null
          social_instagram: string | null
          social_facebook_enabled: boolean
          social_instagram_enabled: boolean
          social_whatsapp_enabled: boolean
          banner_notice: string | null
        } & TimestampColumns & { show_notice: boolean }
        Insert: {
          id?: string
          company_name?: string
          logo_url?: string | null
          tagline?: string | null
          address?: string | null
          city?: string | null
          phone1?: string | null
          phone2?: string | null
          whatsapp?: string | null
          email?: string | null
          working_hours?: string | null
          hero_title?: string | null
          hero_subtitle?: string | null
          hero_cta_text?: string | null
          hero_secondary_cta_text?: string | null
          home_description?: string | null
          about_hero_title?: string | null
          about_hero_subtitle?: string | null
          about_presentation_title?: string | null
          about_presentation_text?: string | null
          about_location_text?: string | null
          about_mission_title?: string | null
          about_mission_text?: string | null
          about_values_title?: string | null
          about_values_subtitle?: string | null
          about_value_1_title?: string | null
          about_value_1_text?: string | null
          about_value_2_title?: string | null
          about_value_2_text?: string | null
          about_value_3_title?: string | null
          about_value_3_text?: string | null
          about_value_4_title?: string | null
          about_value_4_text?: string | null
          about_cta_title?: string | null
          about_cta_text?: string | null
          stats_clients?: number | null
          stats_projects?: number | null
          stats_years?: number | null
          stats_satisfaction?: number | null
          social_facebook?: string | null
          social_linkedin?: string | null
          social_instagram?: string | null
          social_facebook_enabled?: boolean
          social_instagram_enabled?: boolean
          social_whatsapp_enabled?: boolean
          banner_notice?: string | null
          show_notice?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          logo_url?: string | null
          tagline?: string | null
          address?: string | null
          city?: string | null
          phone1?: string | null
          phone2?: string | null
          whatsapp?: string | null
          email?: string | null
          working_hours?: string | null
          hero_title?: string | null
          hero_subtitle?: string | null
          hero_cta_text?: string | null
          hero_secondary_cta_text?: string | null
          home_description?: string | null
          about_hero_title?: string | null
          about_hero_subtitle?: string | null
          about_presentation_title?: string | null
          about_presentation_text?: string | null
          about_location_text?: string | null
          about_mission_title?: string | null
          about_mission_text?: string | null
          about_values_title?: string | null
          about_values_subtitle?: string | null
          about_value_1_title?: string | null
          about_value_1_text?: string | null
          about_value_2_title?: string | null
          about_value_2_text?: string | null
          about_value_3_title?: string | null
          about_value_3_text?: string | null
          about_value_4_title?: string | null
          about_value_4_text?: string | null
          about_cta_title?: string | null
          about_cta_text?: string | null
          stats_clients?: number | null
          stats_projects?: number | null
          stats_years?: number | null
          stats_satisfaction?: number | null
          social_facebook?: string | null
          social_linkedin?: string | null
          social_instagram?: string | null
          social_facebook_enabled?: boolean
          social_instagram_enabled?: boolean
          social_whatsapp_enabled?: boolean
          banner_notice?: string | null
          show_notice?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_services: {
        Row: {
          slug: 'btp' | 'electrification' | 'gestion'
          home_title: string
          detail_title: string
          badge: string
          home_description: string
          home_highlights: Json
          detail_description: string
          detail_items: Json
          display_order: number
          published: boolean
        } & TimestampColumns
        Insert: {
          slug: 'btp' | 'electrification' | 'gestion'
          home_title: string
          detail_title: string
          badge: string
          home_description: string
          home_highlights?: Json
          detail_description: string
          detail_items?: Json
          display_order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: 'btp' | 'electrification' | 'gestion'
          home_title?: string
          detail_title?: string
          badge?: string
          home_description?: string
          home_highlights?: Json
          detail_description?: string
          detail_items?: Json
          display_order?: number
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          id: string
          service: 'btp' | 'electrification' | 'gestion' | 'autre'
          full_name: string
          phone: string
          email: string | null
          location: string | null
          budget: string | null
          timeline: string | null
          description: string
          status: 'nouveau' | 'en_cours' | 'devis_envoye' | 'termine' | 'archive'
          admin_notes: string | null
          ip_address: string | null
          user_agent: string | null
        } & TimestampColumns
        Insert: {
          id?: string
          service: 'btp' | 'electrification' | 'gestion' | 'autre'
          full_name: string
          phone: string
          email?: string | null
          location?: string | null
          budget?: string | null
          timeline?: string | null
          description: string
          status?: 'nouveau' | 'en_cours' | 'devis_envoye' | 'termine' | 'archive'
          admin_notes?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service?: 'btp' | 'electrification' | 'gestion' | 'autre'
          full_name?: string
          phone?: string
          email?: string | null
          location?: string | null
          budget?: string | null
          timeline?: string | null
          description?: string
          status?: 'nouveau' | 'en_cours' | 'devis_envoye' | 'termine' | 'archive'
          admin_notes?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
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
        } & TimestampColumns
        Insert: {
          id?: string
          client_name: string
          client_function?: string | null
          client_company?: string | null
          client_location?: string | null
          testimonial_text: string
          service_type?: string | null
          rating?: number | null
          photo_url?: string | null
          testimonial_date?: string | null
          published?: boolean
          featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          client_function?: string | null
          client_company?: string | null
          client_location?: string | null
          testimonial_text?: string
          service_type?: string | null
          rating?: number | null
          photo_url?: string | null
          testimonial_date?: string | null
          published?: boolean
          featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          description: string | null
          full_description: string | null
          service_type: 'btp' | 'electrification' | 'gestion'
          location: string | null
          start_date: string | null
          end_date: string | null
          project_date: string | null
          client_name: string | null
          status: 'planned' | 'in_progress' | 'completed' | 'on_hold'
          cover_image_url: string | null
          published: boolean
          featured: boolean
          display_order: number
        } & TimestampColumns
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          description?: string | null
          full_description?: string | null
          service_type: 'btp' | 'electrification' | 'gestion'
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          project_date?: string | null
          client_name?: string | null
          status?: 'planned' | 'in_progress' | 'completed' | 'on_hold'
          cover_image_url?: string | null
          published?: boolean
          featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          description?: string | null
          full_description?: string | null
          service_type?: 'btp' | 'electrification' | 'gestion'
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          project_date?: string | null
          client_name?: string | null
          status?: 'planned' | 'in_progress' | 'completed' | 'on_hold'
          cover_image_url?: string | null
          published?: boolean
          featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          storage_path: string
          alt_text: string | null
          is_cover: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          storage_path: string
          alt_text?: string | null
          is_cover?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          storage_path?: string
          alt_text?: string | null
          is_cover?: boolean
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          id: string
          identifier_hash: string
          action: string
          attempts: number
          window_started_at: string
          blocked_until: string | null
        } & TimestampColumns
        Insert: {
          id?: string
          identifier_hash: string
          action: string
          attempts?: number
          window_started_at?: string
          blocked_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          identifier_hash?: string
          action?: string
          attempts?: number
          window_started_at?: string
          blocked_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      check_rate_limit: {
        Args: {
          p_identifier_hash: string
          p_action: string
          p_max_count: number
          p_window_minutes: number
        }
        Returns: Json
      }
      cleanup_rate_limits: {
        Args: { p_window_hours?: number }
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
