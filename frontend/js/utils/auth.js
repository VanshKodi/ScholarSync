// auth.js
import { supabase } from "./supabase.js";
import { Session, request } from "../api.js";

/* ---------- AUTH ACTIONS ---------- */

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/#/dashboard`
    }
  });
  if (error) {
    console.error("Login error:", error);
    return;
  } else {
    const hasProfile = await request("check_profile");
    if (!hasProfile.has_profile) {
      await request("create_profile");
    }

  }
}

export async function logout() {
  await supabase.auth.signOut();
}

/* ---------- AUTH STATE ---------- */

export async function isAuthenticated() {
  const session = await Session.get();
  return !!session;
}

export function onAuthChange(callback) {
  Session.onChange(callback);
}

export async function getUser() {
  const session = await Session.get();
  return session?.user || null;
}