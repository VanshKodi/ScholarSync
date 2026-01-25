import { getSession } from "../scripts/session.js";

export function Dashboard() {
  const session = getSession();

  if (!session) {
    return `<h2>Not authenticated</h2>`;
  }

  // The Dashboard view returns a layout with an area the sidebar will populate
  // The main content region below has id="dashboard-content" — Sidebar link clicks will replace its innerHTML
  return `
    <section class="dashboard-layout">
      <!-- Sidebar will be injected into #sidebar-root (global) -->
      <main id="dashboard-content" class="dashboard-content">
        <h2>Dashboard</h2>

        <p><strong>Email:</strong> <span id="userEmail">Loading...</span></p>
        <p><strong>User Type:</strong> <span id="userRole">Loading...</span></p>

        <p>This is the dashboard landing area. Use the sidebar to navigate subviews.</p>
      </main>
    </section>
  `;
}