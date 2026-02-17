import { supabase } from "../../utils/supabase.js";

const API_BASE = "https://api.vanshkodi.in";

/* ======================
   API Helper
====================== */

async function apiFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.body && !(options.body instanceof FormData) && {
        "Content-Type": "application/json"
      })
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
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;

  if (!user) {
    container.innerHTML = "<p>Not authenticated</p>";
    return;
  }

  renderProfile(container, user);
}

async function renderProfile(container, user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

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

  // Buttons always attach
  document.getElementById("adminBtn").onclick = async () => {
    const name = prompt("University name:");
    if (!name) return;
    await apiFetch(`/become-admin/${encodeURIComponent(name)}`, { method: "POST" });
    renderProfile(container, user);
  };

  document.getElementById("joinBtn").onclick = async () => {
    const id = prompt("University ID:");
    if (!id) return;
    await apiFetch(`/apply-to-join-university/${encodeURIComponent(id)}`, { method: "POST" });
    renderProfile(container, user);
  };

  document.getElementById("facultyBtn").onclick = async () => {
    if (prompt("Enter 123159 to confirm") !== "123159") return;
    await apiFetch("/become-faculty", { method: "POST" });
    renderProfile(container, user);
  };

  document.getElementById("viewBtn").onclick = async () => {
    if (!profile?.university_id) {
      alert("You are not assigned to any university.");
      return;
    }
    renderJoinRequests(profile.university_id);
  };
}
/* ======================
   Join Requests Viewer
====================== */

async function renderJoinRequests(universityId) {
  const container = document.getElementById("joinReqsContainer");
  container.innerHTML = "Loading...";

  try {
    const requests = await apiFetch(
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

    /* ===== Approve ===== */
    document.querySelectorAll(".approveBtn").forEach((btn) => {
      btn.onclick = async () => {
        await apiFetch(`/approve-join-request/${btn.dataset.id}`, {
          method: "POST"
        });
        renderJoinRequests(universityId);
      };
    });

    /* ===== Reject ===== */
    document.querySelectorAll(".rejectBtn").forEach((btn) => {
      btn.onclick = async () => {
        await apiFetch(`/reject-join-request/${btn.dataset.id}`, {
          method: "POST"
        });
        renderJoinRequests(universityId);
      };
    });

  } catch (err) {
    container.innerHTML =
      "<p style='color:red;'>Failed to load join requests.</p>";
  }
}