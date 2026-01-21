import { getSession } from "../scripts/session.js";

export function Dashboard() {
  const session = getSession();

  if (!session) {
    return `<h2>Not authenticated</h2>`;
  }

  fetch("http://localhost:8000/auth/me", {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  })
    .then(res => res.json())
    .then(user => {
      document.getElementById("userEmail").innerText = user.email;
      document.getElementById("userRole").innerText = user.role || "faculty";
    })
    .catch(err => {
      console.error(err);
    });

  return `
    <section class="dashboard">
      <h2>Dashboard</h2>

      <p><strong>Email:</strong> <span id="userEmail">Loading...</span></p>
      <p><strong>User Type:</strong> <span id="userRole">Loading...</span></p>

      <p>This is a placeholder dashboard.</p>
    </section>
  `;
}
