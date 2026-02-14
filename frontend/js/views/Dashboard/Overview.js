import { supabase } from "../../utils/supabase.js";

export async function Overview(container) {
  const { data: { user } } = await supabase.auth.getUser();

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
    renderRequestButton(container, user);
    return;
  }

  renderProfile(container, profile, user);
}

function renderProfile(container, profile, user) {

  const canChangeRole = profile.university_id === null;

  container.innerHTML = `
  <style>
    .profile-wrapper {
      max-width: 900px;
      margin: 40px auto;
      font-family: Arial, sans-serif;
    }

    .profile-wrapper h1 {
      margin-bottom: 10px;
    }

    .profile-wrapper p {
      margin-bottom: 20px;
      color: #555;
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
      background-color: #f5f5f5;
      font-weight: bold;
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
      background-color: #007bff;
      color: white;
      font-size: 13px;
    }

    .profile-table button:hover {
      background-color: #0056b3;
    }

    .disabled-text {
      color: gray;
      font-size: 13px;
    }

    .danger-btn {
      background-color: #dc3545;
    }

    .danger-btn:hover {
      background-color: #a71d2a;
    }
  </style>

  <div class="profile-wrapper">
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
          <td><span class="disabled-text">Cannot Change</span></td>
        </tr>

        <tr>
          <td>Role</td>
          <td><input value="${profile.role}" disabled /></td>
          <td>
            ${
              canChangeRole
                ? `<button id="changeRoleBtn">Change Role to Admin</button>`
                : `<span class="disabled-text">Locked (University Assigned)</span>`
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
                ? `<button id="joinUniBtn">Join University</button>`
                : `<button id="leaveUniBtn" class="danger-btn">Leave University</button>`
            }
          </td>
        </tr>

        <tr>
          <td>Status</td>
          <td><input value="${profile.status}" disabled /></td>
          <td><span class="disabled-text">Cannot Change</span></td>
        </tr>

        <tr>
          <td>Created At</td>
          <td>
            <input value="${new Date(profile.created_at).toLocaleString()}" disabled />
          </td>
          <td><span class="disabled-text">Cannot Change</span></td>
        </tr>

      </tbody>
    </table>
  </div>
  `;

  attachEvents(profile, user);
}

function renderRequestButton(container, user) {
  container.innerHTML = `
    <div style="max-width:600px;margin:60px auto;font-family:Arial;">
      <h1>No Profile Found</h1>
      <p>You are authenticated but do not yet have a profile.</p>
      <button id="requestProfileBtn"
        style="padding:10px 14px;border:none;border-radius:6px;background:#28a745;color:white;cursor:pointer;">
        Create Profile
      </button>
    </div>
  `;

  document
    .getElementById("requestProfileBtn")
    ?.addEventListener("click", async () => {
      await requestProfile(user);
      await loadProfile(container, user);
    });
}

async function requestProfile(user) {
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      role: "faculty",
      university_id: null,
      status: "active"
    });

  if (error) {
    console.error(error);
    alert("Failed to create profile");
    return;
  }

  alert("Profile created successfully");
}

function attachEvents(profile, user) {
  const changeRoleBtn = document.getElementById("changeRoleBtn");
  const joinUniBtn = document.getElementById("joinUniBtn");
  const leaveUniBtn = document.getElementById("leaveUniBtn");

  changeRoleBtn?.addEventListener("click", async () => {
    if (profile.university_id !== null) {
      alert("Role change not allowed once university is assigned.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Failed to change role");
      return;
    }

    alert("Role updated to Admin");
    location.reload();
  });

  joinUniBtn?.addEventListener("click", async () => {
    const uniId = prompt("Enter University UUID:");
    if (!uniId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ university_id: uniId })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Failed to join university");
      return;
    }

    alert("University assigned");
    location.reload();
  });

  leaveUniBtn?.addEventListener("click", async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ university_id: null })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Failed to leave university");
      return;
    }

    alert("University removed");
    location.reload();
  });
}