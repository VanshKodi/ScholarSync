import { supabase } from "../../utils/supabase.js";
import { Session, request } from "../../api.js";

console.log("Overview file loaded");

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
        <button id="adminBtn">Become Admin</button>
        <button id="joinBtn">Join University</button>
        <button id="facultyBtn">Become Faculty</button>
        <button id="viewBtn">View Join Requests</button>
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

/* ======================
   Event handlers (no nested inline handlers)
====================== */

function attachHandlers(container, user, profile) {
  document.getElementById("adminBtn").addEventListener("click", async () => {
    const name = prompt("University name:");
    if (!name) return;
    await request(`/become-admin/${encodeURIComponent(name)}`, { method: "POST" });
    // reload small part
    const { data: refreshed } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    renderProfile(container, user, refreshed);
  });

  document.getElementById("joinBtn").addEventListener("click", async () => {
    const id = prompt("University ID:");
    if (!id) return;
    await request(`/apply-to-join-university/${encodeURIComponent(id)}`, { method: "POST" });
    const { data: refreshed } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    renderProfile(container, user, refreshed);
  });

  document.getElementById("facultyBtn").addEventListener("click", async () => {
    if (prompt("Enter 123159 to confirm") !== "123159") return;
    await request("/become-faculty", { method: "POST" });
    const { data: refreshed } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    renderProfile(container, user, refreshed);
  });

  document.getElementById("viewBtn").addEventListener("click", () => {
    if (!profile?.university_id) {
      alert("You are not assigned to any university.");
      return;
    }
    renderJoinRequests(profile.university_id);
  });
}
/* ======================
   Join Requests Viewer
====================== */

async function renderJoinRequests(universityId) {
  const container = document.getElementById("joinReqsContainer");
  container.innerHTML = "Loading...";

  try {
    const requests = await request(
      `/university-join-requests/${encodeURIComponent(universityId)}`
    );

    if (!requests.length) {
      container.innerHTML = "<p>No join requests.</p>";
      return;
    }

    container.innerHTML = requests
      .map(
        (r) => `
        <div style="border:1px solid #ccc;padding:10px;margin-bottom:10px;">
          <p><b>Requester:</b> ${r.requester_id}</p>
          <p><b>Status:</b> ${r.status}</p>

          ${
            r.status === "pending"
              ? `
                <button data-id="${r.request_id}" class="approveBtn">Approve</button>
                <button data-id="${r.request_id}" class="rejectBtn">Reject</button>
              `
              : ""
          }
        </div>
      `
      )
      .join("");

    // event delegation for approve/reject
    container.querySelectorAll('.approveBtn, .rejectBtn').forEach(b=>b.removeEventListener && b.removeEventListener());
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.classList.contains('approveBtn')) {
        await request(`/approve-join-request/${id}`, { method: 'POST' });
        renderJoinRequests(universityId);
      }
      if (btn.classList.contains('rejectBtn')) {
        await request(`/reject-join-request/${id}`, { method: 'POST' });
        renderJoinRequests(universityId);
      }
    });

  } catch (err) {
    container.innerHTML =
      "<p style='color:red;'>Failed to load join requests.</p>";
  }
}