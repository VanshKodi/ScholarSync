import { isAuthenticated, logout, onAuthChange } from "../utils/auth.js";

// Navbar CSS - hardcoded directly in component
const navbarCSS = `
  .navbar {
    height: 64px;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
  }
  .navbar-logo {
    width: 45px;
    height: auto;
    margin-right: 8px;
  }
  .navbar-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
  }
  .nav-left {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .nav-right {
    display: flex;
    gap: 12px;
  }
  .nav-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .nav-btn.primary {
    background: #5b6cff;
    color: #fff;
  }
  .nav-btn.outline {
    background: transparent;
    border: 1px solid #c7d2fe;
    color: #4338ca;
  }
`;

// Inject styles once
if (!document.getElementById('navbar-styles')) {
  const style = document.createElement('style');
  style.id = 'navbar-styles';
  style.textContent = navbarCSS;
  document.head.appendChild(style);
}

export default function Navbar() {
  const nav = document.createElement("header");
  nav.className = "navbar";

  async function render() {
    const isAuth = await isAuthenticated();

    nav.innerHTML = `
      <div class="nav-left">
        <a href="#/">
          <img
            src="./resources/favicons/graduation-cap.svg"
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
