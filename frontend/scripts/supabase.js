import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://tivwxpzuieawkjbiokoy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdnd4cHp1aWVhd2tqYmlva295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjczMDgsImV4cCI6MjA4NDMwMzMwOH0.lwBcwVa-hZWRpVqLznVXWmAIKy9NgXrJmlrEmcxv_Qo";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);