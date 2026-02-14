import { userService } from "../services/userService.js";

export async function Overview(container) {

  const user = await userService.getAuthUser();

  if (!user) {
    container.innerHTML = "<p>Not authenticated</p>";
    return;
  }

  const profile = await userService.getProfile(user.id);

  render(container, user, profile);
}

function render(container, authUser, profile) {

  container.innerHTML = `
    <h1>User Overview</h1>

    <h3>Authentication</h3>
    ${renderObject(authUser)}

    <h3>Profile</h3>
    ${profile ? renderEditableObject(profile) : "<p>No profile found</p>"}

    <hr/>

    <button id="saveProfile">Save Changes</button>
    <button id="registerAdmin">Register as Admin</button>
    <button id="joinOrg">Join Organization</button>
  `;

  setupActions(authUser, profile);
}