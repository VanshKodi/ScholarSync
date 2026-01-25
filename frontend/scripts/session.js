// frontend/scripts/session.js

// On initialization, try to "rehydrate" from localStorage
let session = JSON.parse(localStorage.getItem("ss_session")) || null;
let profile = JSON.parse(localStorage.getItem("ss_profile")) || null;

export function setSession(s) {
  session = s;
  if (s) {
    localStorage.setItem("ss_session", JSON.stringify(s));
  } else {
    localStorage.removeItem("ss_session");
  }
}

export function getSession() {
  return session;
}

export function setProfile(p) {
  profile = p;
  if (p) {
    localStorage.setItem("ss_profile", JSON.stringify(p));
  } else {
    localStorage.removeItem("ss_profile");
  }
}

export function getProfile() {
  return profile;
}

export function clearSession() {
  session = null;
  profile = null;
  localStorage.removeItem("ss_session");
  localStorage.removeItem("ss_profile");
}
export function isAdmin() {
  return profile && profile.role === 'admin';
}