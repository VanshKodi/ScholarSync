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
  container.innerHTML = `
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
        <td>
          <input id="id" value="${profile.id}" disabled />
        </td>
        <td>-</td>
      </tr>

      <tr>
        <td>Role</td>
        <td>
          <input id="role" value="${profile.role}" disabled />
        </td>
        <td>-</td>
      </tr>

      <tr>
        <td>University ID</td>
        <td>
          <input id="university_id" value="${profile.university_id ?? ""}" disabled />
        </td>
        <td>
          <button onclick="enableEdit('university_id')">Edit</button>
        </td>
      </tr>

      <tr>
        <td>Status</td>
        <td>
          <input id="status" value="${profile.status}" disabled />
        </td>
        <td>-</td>
      </tr>

      <tr>
        <td>Created At</td>
        <td>
          <input value="${new Date(profile.created_at).toLocaleString()}" disabled />
        </td>
        <td>-</td>
      </tr>

    </tbody>
  </table>

  <br>
  <button id="saveChanges">Save Changes</button>
`;
}
function renderRequestButton(container, user) {

  container.innerHTML = `
    <h1>No Profile Found</h1>
    <p>You are authenticated but do not have a profile ID.</p>
    <button id="requestId">Request Profile ID</button>
  `;

  document.getElementById("requestId")
    .addEventListener("click", async () => {

      await requestProfile(user);
      await loadProfile(container, user); // refresh
    });
}

async function requestProfile(user) {
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      role: "faculty", // default
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