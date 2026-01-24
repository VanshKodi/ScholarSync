import { Navbar } from "./components/Navbar.js";
import { router } from "./router.js";
import { clearSession } from "./scripts/session.js";

const app = document.getElementById("app");
const navbar = document.getElementById("navbar");

/**
 * Hides the global splash screen once the app is ready.
 * We use a class so we can handle the fade-out transition in CSS.
 */
function hideLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.add("loader-hidden");
    
    // Optional: Remove from DOM entirely after the fade-out animation (e.g., 500ms)
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }
}

function attachNavbarHandlers() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearSession();
    window.location.hash = "#/login";
    render();
  });
}

function render() {
  // 1. Build the UI
  navbar.innerHTML = Navbar();
  attachNavbarHandlers();
  router(app);

  // 2. Reveal the app!
  // This runs on every render, but hideLoader is smart enough 
  // to only have a visible effect the very first time.
  hideLoader();
}

// Listen for route changes (e.g., clicking a link or back button)
window.addEventListener("hashchange", render);

// Initial boot-up
window.addEventListener("load", render);