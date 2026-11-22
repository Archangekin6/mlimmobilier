export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
