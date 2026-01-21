import { getSession, getProfile } from "../scripts/session.js";

export function Navbar() {
  const session = getSession();
  const profile = getProfile();

  // Logged OUT
  if (!session) {
    return `
      <header class="navbar">
        <div class="navbar-left">
          <a href="#/">
            <img
              src="./resources/favicons/graduation-cap.svg"
              class="navbar-logo"
              alt="ScholarSync"
            />
            <span class="navbar-title">ScholarSync</span>
          </a>
        </div>

        <a href="#/login" class="btn-primary">Get Started</a>
      </header>
    `;
  }

  // Logged IN
  return `
    <header class="navbar">
      <div class="navbar-left">
        <a href="#/">
          <img
            src="./resources/favicons/graduation-cap.svg"
            class="navbar-logo"
            alt="ScholarSync"
          />
          <span class="navbar-title">ScholarSync</span>
        </a>
      </div>

      <div class="navbar-right">
        <span class="navbar-role">
          ${profile?.role?.toUpperCase() || ""}
        </span>

        <a href="#/dashboard" class="btn-secondary">
          Dashboard
        </a>

        <a href="#" id="logoutBtn" class="btn-primary">
          Logout
        </a>
      </div>
    </header>
  `;
}
