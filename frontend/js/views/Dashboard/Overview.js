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

  const fields = Object.entries(profile)
    .map(([key, value]) => `
      <label>${key}</label>
      <input value="${value ?? ""}" disabled />
      <br>
    `)
    .join("");

  container.innerHTML = `
    <h1>Profile Overview</h1>
    <p><b>Email:</b> ${user.email}</p>
    <hr>
    ${fields}
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
      university_id: 0,
      status: "active"
    });

  if (error) {
    console.error(error);
    alert("Failed to create profile");
    return;
  }

  alert("Profile created successfully");
}