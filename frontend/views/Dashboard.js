export function Dashboard(userEmail, userRole) {
  return `
    <section class="dashboard-page">
      <div class="dashboard-card">
        <h2>Dashboard</h2>

        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>User Type:</strong> ${userRole}</p>

        <p class="dashboard-note">
          This is a placeholder dashboard.
        </p>
      </div>
    </section>
  `;
}
