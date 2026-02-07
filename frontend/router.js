import { Landing } from "./views/Landing.js";
import { Login } from "./views/Login.js";
import { Signup } from "./views/Signup.js";
import { Dashboard } from "./views/Dashboard.js";

import { getSession } from "./scripts/session.js";
import { attachLoginHandler, attachSignupHandler } from "./scripts/authHandlers.js";

const routes = {
  "": Landing,
  "#/": Landing,
  "#/login": Login,
  "#/signup": Signup,
  "#/dashboard": Dashboard
};

export function router(app) {
  const path = window.location.hash || "#/";

  // Treat any /dashboard subpath as the Dashboard view so the dashboard
  // layout (sidebar + content) remains present even for nested routes.
  const isDashboardPath = path.startsWith("#/dashboard");
  const view = isDashboardPath ? Dashboard : (routes[path] || (() => "<h2>404</h2>"));

  // 🔒 Auth guard for dashboard paths
  if (isDashboardPath && !getSession()) {
    window.location.hash = "#/login";
    return;
  }

  // Render view
  app.innerHTML = view();

  // 🔑 Attach handlers AFTER render
  if (path === "#/login") {
    attachLoginHandler();
  }

  if (path === "#/signup") {
    attachSignupHandler();
  }
}
