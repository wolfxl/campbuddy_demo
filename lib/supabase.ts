import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_key'

// For demo/development: create a client even with placeholder values
// This prevents the app from crashing when Supabase isn't properly configured
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = 
  supabaseUrl !== 'https://demo.supabase.co' && 
  supabaseAnonKey !== 'demo_key' &&
  !supabaseUrl.includes('demo') &&
  !supabaseAnonKey.includes('demo')

// Export the client as default as well for convenience
export default supabase
