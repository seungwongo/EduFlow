import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side Supabase client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Server-side Supabase client with user session
// For now, we'll use admin client in server components
// This is a simplified approach - in production, you'd want proper session handling
export async function createServerSupabaseClient() {
  // For server-side operations, we can use the admin client
  // In a production app, you'd extract the session from cookies and create a user-scoped client
  return supabaseAdmin
}