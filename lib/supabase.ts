import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar_url: string | null
          role: 'admin' | 'instructor' | 'student'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'instructor' | 'student'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'instructor' | 'student'
          created_at?: string
          updated_at?: string
        }
      }
      seminars: {
        Row: {
          id: string
          title: string
          description: string | null
          cover_image: string | null
          start_date: string | null
          end_date: string | null
          max_participants: number | null
          status: 'draft' | 'published' | 'ongoing' | 'completed'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          cover_image?: string | null
          start_date?: string | null
          end_date?: string | null
          max_participants?: number | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          cover_image?: string | null
          start_date?: string | null
          end_date?: string | null
          max_participants?: number | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      curriculum: {
        Row: {
          id: string
          seminar_id: string
          week: number
          title: string
          content: string | null
          gpt_suggestion: string | null
          materials: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seminar_id: string
          week: number
          title: string
          content?: string | null
          gpt_suggestion?: string | null
          materials?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seminar_id?: string
          week?: number
          title?: string
          content?: string | null
          gpt_suggestion?: string | null
          materials?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          seminar_id: string
          user_id: string
          status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
          application_text: string | null
          applied_at: string
          approved_at: string | null
          approved_by: string | null
        }
        Insert: {
          id?: string
          seminar_id: string
          user_id: string
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn'
          application_text?: string | null
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
        }
        Update: {
          id?: string
          seminar_id?: string
          user_id?: string
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn'
          application_text?: string | null
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
        }
      }
    }
  }
}