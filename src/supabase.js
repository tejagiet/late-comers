import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hjcjkrzfpkbivbghzqgd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jtz5H3jUE5BwROExr8I1kw_ZfP4zJnH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
