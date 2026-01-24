import { Navbar } from "./components/Navbar.js";
import { router } from "./router.js";
import { clearSession } from "./scripts/session.js";
import { supabase } from "./scripts/supabase.js";
import { setSession } from "./scripts/session.js";
const app = document.getElementById("app");
const navbar = document.getElementById("navbar");

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

// frontend/app.js
import { logout } from "./scripts/auth.js"; // Make sure to import the logic

function attachNavbarHandlers() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => { // Added async
    e.preventDefault();
    
    try {
      await logout(); // Wait for the cleanup to finish
      window.location.hash = "#/login"; 
      // render() will be called automatically by the hashchange listener
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}

async function render() {
  // Check if Supabase still considers us logged in (Local Storage check)
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    setSession(data.session);
  }

  navbar.innerHTML = Navbar();
  attachNavbarHandlers();
  router(app);
  hideLoader();
}

// Listen for route changes (e.g., clicking a link or back button)
window.addEventListener("hashchange", render);

// Initial boot-up
window.addEventListener("load", render);