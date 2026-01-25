import { Navbar } from "./components/Navbar.js";
import { Sidebar } from "./components/Sidebar.js";
import { router } from "./router.js";
import { clearSession } from "./scripts/session.js";
import { supabase } from "./scripts/supabase.js";
import { setSession } from "./scripts/session.js";

const app = document.getElementById("app");
const navbar = document.getElementById("navbar");
const sidebarRoot = document.getElementById("sidebar-root");

/* Hide the global loader safely */
function hideLoader() {
  const loader = document.getElementById("global-loader");
  if (!loader) return;
  // add class that fades it out (css already defines .loader-hidden)
  loader.classList.add("loader-hidden");
  // remove from layout after animation
  setTimeout(() => {
    loader.style.display = "none";
  }, 500);
}

function attachNavbarHandlers() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearSession();
    // navigate to login and re-render
    window.location.hash = "#/login";
    render();
  });
}

/* Dynamic import helper: given a module path and export name, import and render into #dashboard-content */
async function loadModuleIntoDashboard(modulePath, exportName = null) {
  try {
    const mod = await import(modulePath);
    // default to first exported function if exportName not provided
    const renderFn =
      (exportName && mod[exportName]) ||
      Object.values(mod).find((v) => typeof v === "function");
    const target = document.getElementById("dashboard-content");
    if (!target) {
      console.warn("No #dashboard-content element found to render view.");
      return;
    }
    if (!renderFn) {
      target.innerHTML = `<p>View could not be loaded.</p>`;
      return;
    }
    target.innerHTML = renderFn();
  } catch (err) {
    console.error("Failed to load module", modulePath, err);
    const target = document.getElementById("dashboard-content");
    if (target) target.innerHTML = `<p>Error loading view.</p>`;
  }
}

function attachSidebarHandlers() {
  if (!sidebarRoot) return;

  // sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebarToggle");
  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  // link clicks (event delegation)
  // use a single listener so repeated renderings of sidebar don't require re-attaching many listeners
  sidebarRoot.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest(".nav-item");
    if (!a) return;
    e.preventDefault();

    // highlight active
    const prev = sidebarRoot.querySelector(".nav-item.active");
    if (prev) prev.classList.remove("active");
    a.classList.add("active");

    const modulePath = a.dataset.module;
    const exportName = a.dataset.export;

    // If this is a dashboard link, dynamically import and render into #dashboard-content
    if (modulePath && document.getElementById("dashboard-content")) {
      loadModuleIntoDashboard(modulePath, exportName);
      // optionally update the hash so router remains in sync
      if (a.getAttribute("href")) {
        window.location.hash = a.getAttribute("href");
      }
    } else {
      // fallback: navigate to href (e.g., chat links handled elsewhere)
      const href = a.getAttribute("href");
      if (href) window.location.hash = href;
    }
  });
}

async function render() {
  try {
    // Safely attempt to get supabase session; don't let it throw and block the rest
    const sessionResult = await supabase.auth.getSession().catch((e) => {
      console.warn("supabase.auth.getSession() failed:", e);
      return { data: { session: null } };
    });
    if (sessionResult && sessionResult.data && sessionResult.data.session) {
      setSession(sessionResult.data.session);
    }

    // Render navbar
    if (!navbar) {
      console.error("Missing #navbar element in DOM");
    } else {
      navbar.innerHTML = Navbar();
      attachNavbarHandlers();
    }

    // Render main view via existing router
    if (!app) {
      console.error("Missing #app element in DOM");
    } else {
      router(app);
    }

    // If currently on a dashboard route, inject the sidebar
    const path = window.location.hash || "#/";
    if (path.startsWith("#/dashboard")) {
      if (sidebarRoot) {
        // You can fetch chats or other sidebar data and pass into Sidebar(...)
        sidebarRoot.innerHTML = Sidebar([]);
        // ensure Sidebar.css is loaded once
        if (!document.getElementById("sidebar-css")) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "./components/Sidebar.css";
          link.id = "sidebar-css";
          document.head.appendChild(link);
        }
        attachSidebarHandlers();

        // load a default dashboard subview (Overview) into the dashboard content
        const active = sidebarRoot.querySelector(".nav-item.active");
        if (active && active.dataset.module) {
          loadModuleIntoDashboard(active.dataset.module, active.dataset.export);
        }
      } else {
        console.warn("No #sidebar-root found; skipping sidebar injection.");
      }
    } else {
      // not on dashboard — ensure sidebar area is cleared
      if (sidebarRoot) sidebarRoot.innerHTML = "";
    }
  } catch (err) {
    // Catch any unexpected runtime error during render so loader can be hidden below
    console.error("Render error:", err);
  } finally {
    // ALWAYS hide the loader so it can't get stuck
    hideLoader();
  }
}

// Safety nets: ensure the loader gets hidden on global errors/unhandled rejections
window.addEventListener("error", (ev) => {
  // log and hide loader
  console.error("Global error:", ev.error || ev.message, ev);
  hideLoader();
});
window.addEventListener("unhandledrejection", (ev) => {
  console.error("Unhandled promise rejection:", ev.reason);
  hideLoader();
});

window.addEventListener("hashchange", render);
window.addEventListener("load", render);