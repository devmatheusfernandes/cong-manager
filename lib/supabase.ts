import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          password: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          permission: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          permission: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          permission?: string
          created_at?: string
        }
      }
    }
  }
}

export type SupabaseClient = typeof supabase