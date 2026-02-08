// auth.js
import { supabase } from "./supabase.js";

/* ---------- AUTH ACTIONS ---------- */

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.href.split("#")[0]
    }
  });

  if (error) {
    console.error("Google login failed:", error.message);
  }
}

export async function logout() {
  await supabase.auth.signOut();
}

/* ---------- AUTH STATE ---------- */

export async function isAuthenticated() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return !!session;
}

export function onAuthChange(callback) {
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

export async function getUser() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}