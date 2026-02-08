import { isAuthenticated, logout, onAuthChange } from "../utils/auth.js";

export default function Navbar() {
  const nav = document.createElement("header");
  nav.className = "navbar";

  async function render() {
    const isAuth = await isAuthenticated();

    nav.innerHTML = `
      <div class="nav-left">
        <a href="#/">
          <img
            src="../resources/favicons/graduation-cap.svg"
            class="navbar-logo"
            alt="ScholarSync"
          />
        </a>
        <span class="navbar-title">ScholarSync</span>
      </div>

      <div class="nav-right">
        ${
          isAuth
            ? `
              <button class="nav-btn" id="dashboardBtn">Dashboard</button>
              <button class="nav-btn outline" id="logoutBtn">Logout</button>
            `
            : `
              <button class="nav-btn primary" id="getStartedBtn">
                Get Started
              </button>
            `
        }
      </div>
    `;

    if (isAuth) {
      nav.querySelector("#dashboardBtn").onclick = () => {
        window.location.hash = "#/dashboard";
      };

      nav.querySelector("#logoutBtn").onclick = async () => {
        await logout();
        window.location.hash = "#/";
      };
    } else {
      nav.querySelector("#getStartedBtn").onclick = () => {
        window.location.hash = "#/login";
      };
    }
  }

  render();

  onAuthChange(() => {
    render();
  });

  return nav;
}