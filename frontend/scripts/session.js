let session = null;
let profile = null;

export function setSession(s) {
  session = s;
}

export function getSession() {
  return session;
}

export function setProfile(p) {
  profile = p;
}

export function getProfile() {
  return profile;
}

export function clearSession() {
  session = null;
  profile = null;
}
