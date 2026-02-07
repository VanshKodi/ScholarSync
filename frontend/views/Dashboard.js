import { getSession } from "../scripts/session.js";
import { DashboardOverview } from "./DashboardOverview.js";

export function Dashboard() {
  const session = getSession();

  if (!session) {
    return `<h2>Not authenticated</h2>`;
  }

  const overviewHTML = DashboardOverview();

  // The Dashboard view returns a layout with an area the sidebar will populate
  // The main content region below has id="dashboard-content" — Sidebar link clicks will replace its innerHTML
  return `
    <section class="dashboard-layout">
      <!-- Sidebar will be injected into #sidebar-root (global) -->
      <aside id="sidebar-root"><!-- sidebar populates here --></aside>
      <main id="dashboard-content" class="dashboard-content">
        ${overviewHTML}
      </main>
    </section>
  `;
}