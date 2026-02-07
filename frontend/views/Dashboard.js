import { getSession } from "../scripts/session.js";
import { DashboardOverview } from "./DashboardOverview.js";

export function Dashboard() {
  const session = getSession();

  if (!session) {
    return `<h2>Not authenticated</h2>`;
  }

  const overviewHTML = DashboardOverview();

  // The Dashboard view returns the main content region the sidebar will
  // populate (the sidebar container is the global aside in index.html).
  return `
    <section class="dashboard-layout">
      <main id="dashboard-content" class="dashboard-content">
        ${overviewHTML}
      </main>
    </section>
  `;
}