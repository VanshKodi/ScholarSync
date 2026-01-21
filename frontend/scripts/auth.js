import { supabase } from "./supabase.js";
import { setSession, clearSession } from "./session.js";

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  setSession(data.session);
}

export async function signup(email, password) {
  const { error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) throw error;
}

export async function logout() {
  await supabase.auth.signOut();
  clearSession();
}
