import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

if (!window.__ENV__) {
  throw new Error('window.__ENV__ is not defined (check script order in index.html)')
}

const { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } = window.__ENV__

if (!SUPABASE_PROJECT_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase env vars missing')
}

export const supabase = createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY
)

export default supabase