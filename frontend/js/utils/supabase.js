const { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } = window.__ENV__;

export const supabase = window.supabase.createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY
);