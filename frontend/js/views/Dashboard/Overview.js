import { supabase } from "../../utils/supabase.js";

async function waitForUser(timeout = 5000) {
  // Try immediate session first
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session?.user) return sessionData.session.user;

  // Subscribe and wait for a sign-in event (short timeout)
  return new Promise((resolve) => {
    const start = Date.now();
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (sess?.user) {
        sub.subscription.unsubscribe();
        resolve(sess.user);
      } else if (Date.now() - start > timeout) {
        sub.subscription.unsubscribe();
        resolve(null);
      }
    });
  });
}

export async function Overview(container) {
  const user = await waitForUser();

  if (!user) {
    container.innerHTML = `<p>Not authenticated</p>`;
    return;
  }

  await loadProfile(container, user);
}

async function loadProfile(container, user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    renderRequestProfile(container, user);
    return;
  }

  renderProfile(container, profile, user);
}

function renderProfile(container, profile, user) {
  const canChangeRole = profile.university_id === null;

  container.innerHTML = `
  <style>
    .wrapper {
      max-width: 900px;
      margin: 40px auto;
      font-family: Arial, sans-serif;
    }

    .wrapper h1 {
      margin-bottom: 10px;
    }

    .profile-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .profile-table th,
    .profile-table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }

    .profile-table th {
      background: #f5f5f5;
    }

    .profile-table input {
      width: 100%;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid #ccc;
      background: #fafafa;
    }

    .profile-table button {
      padding: 6px 10px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: #007bff;
      color: white;
    }

    .profile-table button:hover {
      background: #0056b3;
    }

    .danger {
      background: #dc3545;
    }

    .danger:hover {
      background: #a71d2a;
    }

    .locked {
      color: gray;
      font-size: 13px;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.4);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hidden {
      display: none;
    }

    .modal {
      background: white;
      padding: 25px;
      border-radius: 10px;
      width: 400px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  </style>

  <div class="wrapper">
    <h1>Profile Overview</h1>
    <p><b>Email:</b> ${user.email}</p>

    <table class="profile-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>

        <tr>
          <td>Profile ID</td>
          <td><input value="${profile.id}" disabled /></td>
          <td><span class="locked">Cannot Change</span></td>
        </tr>

        <tr>
          <td>Role</td>
          <td><input value="${profile.role}" disabled /></td>
          <td>
            ${
              canChangeRole
                ? `<button id="changeRoleBtn">Become Admin</button>`
                : `<span class="locked">Locked (University Assigned)</span>`
            }
          </td>
        </tr>

        <tr>
          <td>University ID</td>
          <td>
            <input value="${profile.university_id ?? "Not Assigned"}" disabled />
          </td>
          <td>
            ${
              profile.university_id === null
                ? `<span class="locked">Not Assigned</span>`
                : `<button id="leaveUniBtn" class="danger">Leave University</button>`
            }
          </td>
        </tr>

        <tr>
          <td>Status</td>
          <td><input value="${profile.status}" disabled /></td>
          <td><span class="locked">Cannot Change</span></td>
        </tr>

        <tr>
          <td>Created At</td>
          <td><input value="${new Date(profile.created_at).toLocaleString()}" disabled /></td>
          <td><span class="locked">Cannot Change</span></td>
        </tr>

      </tbody>
    </table>
  </div>

  <!-- Modal -->
  <div id="modalOverlay" class="modal-overlay hidden">
    <div class="modal">
      <h3 id="modalTitle"></h3>
      <p id="modalDescription"></p>
      <div class="modal-actions">
        <button id="modalConfirmBtn">Confirm</button>
        <button id="modalCancelBtn" class="danger">Cancel</button>
      </div>
    </div>
  </div>
  `;

  // Render admin requests area placeholder
  const adminArea = document.createElement('div');
  adminArea.id = 'adminRequestsArea';
  container.appendChild(adminArea);

  attachEvents(profile, user, container);

  // If admin, load pending requests
  if (profile.role === 'admin' && profile.university_id) {
    loadAdminRequests(profile.university_id);
  }
}

async function loadAdminRequests(universityId) {
  const el = document.getElementById('adminRequestsArea');
  if (!el) return;

  el.innerHTML = '<h3>Pending Join Requests</h3><div id="requestsList">Loading...</div>';

  const { data, error } = await supabase
    .from('university_join_requests')
    .select('*')
    .eq('university_id', universityId)
    .eq('status', 'pending');

  const listEl = document.getElementById('requestsList');
  if (error) {
    listEl.innerText = 'Failed to load requests: ' + (error.message || error);
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerText = 'No pending requests.';
    return;
  }

  listEl.innerHTML = data.map(r => `
    <div class="request-item" data-id="${r.request_id}" style="border:1px solid #ddd;padding:8px;margin:8px 0;">
      <div><b>Requester:</b> ${r.requester_id}</div>
      <div><b>Message:</b> ${r.message ?? ''}</div>
      <div style="margin-top:8px;">
        <button data-action="accept" class="acceptBtn">Accept</button>
        <button data-action="reject" class="rejectBtn danger">Reject</button>
      </div>
    </div>
  `).join('');

  // Attach handlers
  listEl.querySelectorAll('.acceptBtn').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.closest('.request-item').dataset.id;
    await handleRequestAction(id, 'accept');
    loadAdminRequests(universityId);
  }));

  listEl.querySelectorAll('.rejectBtn').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.closest('.request-item').dataset.id;
    await handleRequestAction(id, 'reject');
    loadAdminRequests(universityId);
  }));
}

async function handleRequestAction(requestId, action) {
  try {
    const resp = await fetch('/handle-join-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, action })
    });

    if (!resp.ok) {
      const text = await resp.text();
      alert('Failed: ' + text);
      return;
    }

    alert('Request ' + action + 'ed');
  } catch (err) {
    alert('Error handling request: ' + err.message);
  }
}

function renderRequestProfile(container, user) {
  container.innerHTML = `
    <div style="max-width:600px;margin:60px auto;font-family:Arial;">
      <h1>No Profile Found</h1>
      <p>Create your profile to continue.</p>
      <button id="createProfileBtn"
        style="padding:10px 14px;border:none;border-radius:6px;background:#28a745;color:white;cursor:pointer;">
        Create Profile
      </button>
    </div>
  `;

  document.getElementById("createProfileBtn")
    ?.addEventListener("click", async () => {
      await supabase.from("profiles").upsert({
        id: user.id,
        role: "faculty",
        university_id: null,
        status: "active"
      });

      await loadProfile(container, user);
    });
}

function attachEvents(profile, user, container) {
  const changeRoleBtn = document.getElementById("changeRoleBtn");
  const leaveUniBtn = document.getElementById("leaveUniBtn");

  changeRoleBtn?.addEventListener("click", async () => {
    if (profile.university_id !== null) {
      alert("Role change not allowed.");
      return;
    }

    openModal(
      "Become University Admin",
      "This will create a University entity and assign you as Admin.",
      async () => {

        // Create university (must be authenticated; RLS may block anon)
        const { data: university, error: uniError } = await supabase
          .from("universities")
          .insert([{ name: user.email + "'s University" }])
          .select()
          .single();

        if (uniError) {
          // Handle common RLS / permission failure
          if (uniError.status === 403 || /permission denied/i.test(uniError.message || '')) {
            alert("Permission denied creating university. Ensure you're signed in and your account is allowed to create a university.");
            return;
          }

          alert("Failed to create university: " + (uniError.message || uniError));
          return;
        }

        const universityId = university?.university_id;

        if (!universityId) {
          alert("Unexpected response from server when creating university.");
          return;
        }

        const { error: profError } = await supabase
          .from("profiles")
          .update({ role: "admin", university_id: universityId })
          .eq("id", user.id);

        if (profError) {
          // If profile update fails due to RLS, optionally roll back university creation.
          alert("Failed to update profile: " + (profError.message || profError));
          return;
        }

        alert("You are now Admin.");
        location.reload();
      }
    );
  });

  leaveUniBtn?.addEventListener("click", async () => {
    await supabase
      .from("profiles")
      .update({ university_id: null })
      .eq("id", user.id);

    location.reload();
  });
}

function openModal(title, description, onConfirm) {
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const descEl = document.getElementById("modalDescription");
  const confirmBtn = document.getElementById("modalConfirmBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");

  titleEl.innerText = title;
  descEl.innerText = description;

  overlay.classList.remove("hidden");

  confirmBtn.onclick = async () => {
    await onConfirm();
    overlay.classList.add("hidden");
  };

  cancelBtn.onclick = () => {
    overlay.classList.add("hidden");
  };
}