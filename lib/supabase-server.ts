import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client that bypasses RLS using service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_key'

// For demo/development: create a client even with placeholder values
export const supabaseServer = createClient(
  supabaseUrl, 
  supabaseServiceKey !== 'demo_service_key' ? supabaseServiceKey : supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Export a flag to check if server Supabase is properly configured
export const isSupabaseServerConfigured = 
  supabaseUrl !== 'https://demo.supabase.co' && 
  supabaseServiceKey !== 'demo_service_key' &&
  !supabaseUrl.includes('demo')

export default supabaseServer
