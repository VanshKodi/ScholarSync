import { isAuthenticated } from "../utils/auth.js";

export default function Navbar() {
    const nav = document.createElement("header");
    nav.className = "navbar";

    const isAuth = isAuthenticated();

    nav.innerHTML = `
    <div class="nav-left">
      <a href="#/">
            <img
              src="../resources/favicons/graduation-cap.svg"
              class="navbar-logo"
              alt="ScholarSync"
            />
        </a>
      <span class="navbar-title"> ScholarSync</span>
          
    </div>
    <div class="nav-right">
      ${isAuth
            ? `
            <button class="nav-btn">Dashboard</button>
            <button class="nav-btn outline">Logout</button>
          `
            : `
            <button class="nav-btn primary">Get Started</button>
          `
        }
    </div>
  `;

    return nav;
}