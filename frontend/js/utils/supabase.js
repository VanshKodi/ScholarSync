// js/scripts/supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } = ENV;

export const supabase = window.supabase.createClient(
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY
);