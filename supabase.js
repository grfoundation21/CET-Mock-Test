import { createClient } from '@supabase/supabase-js'

const url = 'https://YOUR_PROJECT_URL.supabase.co'
const key = 'YOUR_ANON_PUBLIC_KEY_HERE'

export const supabase = createClient(url, key)
