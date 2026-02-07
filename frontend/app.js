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
  loader.classList.add("loader-hidden");
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
    window.location.hash = "#/login";
    render();
  });
}

/* Dynamic import helper */
async function loadModuleIntoDashboard(modulePath, exportName = null) {
  try {
    const mod = await import(modulePath);
    const renderFn =
      (exportName && mod[exportName]) ||
      Object.values(mod).find((v) => typeof v === "function");

    const getTarget = () => document.getElementById("dashboard-content");
    let target = getTarget();
    if (!target) {
      // The dashboard content may not yet be in the DOM if the router
      // hasn't finished rendering; wait briefly for it to appear.
      const maxAttempts = 50; // ~2.5s
      for (let i = 0; i < maxAttempts && !target; i++) {
        await new Promise((res) => setTimeout(res, 50));
        target = getTarget();
      }
    }

    if (!target) {
      // As a last resort create a fallback container so the view can render
      const appRoot = document.getElementById("app") || document.body;
      const fallback = document.createElement("main");
      fallback.id = "dashboard-content";
      fallback.className = "dashboard-content";
      appRoot.appendChild(fallback);
      target = fallback;
      console.warn("Created fallback #dashboard-content element to render view.");
    }

    if (!renderFn) {
      target.innerHTML = `
        <div class="maincontent-placeholder">
          <h3>Placeholder</h3>
          <p>The view for <strong>${modulePath}</strong> is not implemented yet.</p>
        </div>
      `;
      return;
    }

    const result = renderFn();
    target.innerHTML = result instanceof Promise ? await result : result;

    } catch (err) {
      console.error("Failed to load module", modulePath, err);
      const target = document.getElementById("dashboard-content");
      if (target) target.innerHTML = `
        <div class="maincontent-placeholder">
          <h3>Placeholder</h3>
          <p>Unable to load <strong>${modulePath}</strong>. This view may not be created yet.</p>
        </div>
      `;
    }
}

function attachSidebarHandlers() {
  if (!sidebarRoot) return;

  // Note: the rendered <aside class="sidebar" id="sidebar"> lives inside #sidebar-root
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebarToggle");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      // toggle both the inner sidebar and the outer root so CSS can react
      sidebar.classList.toggle("collapsed");
      sidebarRoot.classList.toggle("collapsed");

      // optional: toggle a body class if you want global adjustments
      document.body.classList.toggle("sidebar-collapsed");
    });
  }

  // link clicks (event delegation)
  // attach the listener on the outer root so it survives sidebar re-rendering
  sidebarRoot.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest(".nav-item");
    if (!a) return;
    e.preventDefault();

    const prev = sidebarRoot.querySelector(".nav-item.active");
    if (prev) prev.classList.remove("active");
    a.classList.add("active");

    const modulePath = a.dataset.module;
    const exportName = a.dataset.export;

    if (modulePath && document.getElementById("dashboard-content")) {
      loadModuleIntoDashboard(modulePath, exportName);
      if (a.getAttribute("href")) window.location.hash = a.getAttribute("href");
    } else {
      const href = a.getAttribute("href");
      if (href) window.location.hash = href;
    }
  });
}

async function render() {
  try {
    const sessionResult = await supabase.auth.getSession().catch((e) => {
      console.warn("supabase.auth.getSession() failed:", e);
      return { data: { session: null } };
    });
    if (sessionResult && sessionResult.data && sessionResult.data.session) {
      setSession(sessionResult.data.session);
    }

    if (!navbar) {
      console.error("Missing #navbar element in DOM");
    } else {
      navbar.innerHTML = Navbar();
      attachNavbarHandlers();
    }

    if (!app) {
      console.error("Missing #app element in DOM");
    } else {
      router(app);
    }

    const path = window.location.hash || "#/";
    if (path.startsWith("#/dashboard")) {
      if (sidebarRoot) {
        sidebarRoot.innerHTML = Sidebar([]);
        if (!document.getElementById("sidebar-css")) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "./components/Sidebar.css";
          link.id = "sidebar-css";
          document.head.appendChild(link);
        }
        attachSidebarHandlers();

        const active = sidebarRoot.querySelector(".nav-item.active");
        if (active && active.dataset.module) {
          loadModuleIntoDashboard(active.dataset.module, active.dataset.export);
        }
      } else {
        console.warn("No #sidebar-root found; skipping sidebar injection.");
      }
    } else {
      if (sidebarRoot) {
        // remove sidebar DOM (empty it)
        sidebarRoot.innerHTML = "";

        // remove dynamically added sidebar stylesheet so the layout isn't pushed on pages without the sidebar
        const sidebarCss = document.getElementById("sidebar-css");
        if (sidebarCss) {
          sidebarCss.remove();
        }

        // clear any stateful classes that may influence layout
        sidebarRoot.classList.remove("collapsed");
        document.body.classList.remove("sidebar-collapsed");

        // ensure #app has no leftover inline margin-left
        const appEl = document.getElementById("app");
        if (appEl) {
          appEl.style.marginLeft = "";
        }
      }
    }
  } catch (err) {
    console.error("Render error:", err);
  } finally {
    hideLoader();
  }
}

window.addEventListener("error", (ev) => {
  console.error("Global error:", ev.error || ev.message, ev);
  hideLoader();
});
window.addEventListener("unhandledrejection", (ev) => {
  console.error("Unhandled promise rejection:", ev.reason);
  hideLoader();
});

// Ensure render runs on initial page load and on hash changes
window.addEventListener("hashchange", render);
window.addEventListener("load", render);