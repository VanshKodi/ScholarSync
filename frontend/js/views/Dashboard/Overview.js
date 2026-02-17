import { supabase } from "../../utils/supabase.js";

const API_BASE = "https://api.vanshkodi.in";

/* ======================
   Helpers
====================== */

async function getUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

async function apiFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {})
    },
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

/* ======================
   Main
====================== */

export async function Overview(container) {
  const user = await getUser();
  if (!user) return (container.innerHTML = "<p>Not authenticated</p>");
  renderProfile(container, user);
}

async function renderProfile(container, user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    container.innerHTML = "<p>No profile found.</p>";
    return;
  }

  container.innerHTML = `
    <div style="max-width:900px;margin:32px auto;">
      <h1>Profile</h1>
      <p><b>Email:</b> ${user.email}</p>
      <p><b>Role:</b> ${profile.role}</p>
      <p><b>University ID:</b> ${profile.university_id ?? "None"}</p>
      <p><b>Status:</b> ${profile.status}</p>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
        <button id="adminBtn">Become Admin</button>
        <button id="joinBtn">Join University</button>
        <button id="facultyBtn">Become Faculty</button>
      </div>
    </div>
  `;

  document.getElementById("adminBtn").onclick = () =>
    handleAdmin(user, container);

  document.getElementById("joinBtn").onclick = () =>
    handleJoin(user, container);

  document.getElementById("facultyBtn").onclick = () =>
    handleFaculty(user, container);
}

/* ======================
   Actions
====================== */

async function handleAdmin(user, container) {
  const name = prompt("University name:");
  if (!name) return;

  await apiFetch(`/become-admin/${encodeURIComponent(name)}`, {
    method: "POST"
  });

  alert("You are now Admin");
  renderProfile(container, user);
}

async function handleJoin(user, container) {
  const id = prompt("University ID:");
  if (!id) return;

  await apiFetch(`/apply-to-join-university/${encodeURIComponent(id)}`, {
    method: "POST"
  });

  alert("Join request sent");
  renderProfile(container, user);
}

async function handleFaculty(user, container) {
  if (prompt("Enter 123159 to confirm") !== "123159") return;

  await apiFetch("/become-faculty", { method: "POST" });

  alert("You are now Faculty");
  renderProfile(container, user);
}