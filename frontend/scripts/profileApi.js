import { getSession, setProfile } from "./session.js";

export async function fetchProfile() {
  const session = getSession();

  const res = await fetch("http://localhost:8000/auth/me", {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (!res.ok) throw new Error("Unauthorized");
  const data = await res.json();
  setProfile(data);
}
