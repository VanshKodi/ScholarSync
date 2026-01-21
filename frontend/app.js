import { Navbar } from "./components/Navbar.js";
import { router } from "./router.js";
import { clearSession } from "./scripts/session.js";

const app = document.getElementById("app");
const navbar = document.getElementById("navbar");

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
  navbar.innerHTML = Navbar();
  attachNavbarHandlers();
  router(app);
}

window.addEventListener("hashchange", render);
window.addEventListener("load", render);
