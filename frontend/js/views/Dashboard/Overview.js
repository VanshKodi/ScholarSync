import { supabase } from "../../utils/supabase.js";
import { Session, request } from "../../api.js";



/* ======================
   Main
====================== */

export async function Overview(container) {
  console.log("Overview called");

  const session = await Session.get();
  const user = session?.user;

  if (!user) {
    container.innerHTML = "<p>Not authenticated</p>";
    return;
  }

  // Load profile data once and render
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  renderProfile(container, user, profile);

  attachHandlers(container, user, profile);
}

/* ======================
   Rendering (pure)
   renderProfile does only UI rendering
====================== */

export function renderProfile(container, user, profile) {
  container.innerHTML = `
    <div style="max-width:900px;margin:32px auto;">
      <h1>Profile</h1>
      <div id="profileInfo"></div>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
        <button id="getProfileBtn">Get Profile</button>
        <button id="adminBtn">Become Admin</button>
        <button id="joinBtn">Join University</button>
      </div>

      <div id="joinReqsContainer" style="margin-top:20px;"></div>
    </div>
  `;

  const profileInfo = document.getElementById("profileInfo");

  if (!profile) {
    profileInfo.innerHTML = "<p>No profile found.</p>";
  } else {
    profileInfo.innerHTML = `
      <p><b>Email:</b> ${user.email}</p>
      <p><b>Role:</b> ${profile.role}</p>
      <p><b>University ID:</b> ${profile.university_id ?? "None"}</p>
      <p><b>Status:</b> ${profile.status}</p>
    `;
  }
}


async function attachHandlers(container, user) {
  const adminBtn = container.querySelector("#adminBtn");
  const joinBtn = container.querySelector("#joinBtn");
  const getProfileBtn = container.querySelector("#getProfileBtn");

  adminBtn.addEventListener("click", async () => {
    const name = prompt("Enter University name:");
    if (!name) return;

    await request(`/create-university/${encodeURIComponent(name)}`, {
      method: "POST",
    });

    await refreshProfile(container, user);
  });

  joinBtn.addEventListener("click", async () => {
    const id = prompt("University ID:");
    if (!id) return;

    await request(`/apply-to-join-university/${encodeURIComponent(id)}`, {
      method: "POST",
    });

    await refreshProfile(container, user);
  });

  getProfileBtn.addEventListener("click", async () => {
    console.log("Fetching profile...");
    await request(`/create-profile`, { method: "POST" });
    await refreshProfile(container, user);
  });
}

async function refreshProfile(container, user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  renderProfile(container, user, profile);
}