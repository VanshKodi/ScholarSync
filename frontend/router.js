import { Landing } from "./views/Landing.js";
import { Login } from "./views/Login.js";
import { Signup } from "./views/Signup.js";
const routes = {
  "": Landing,
  "#/": Landing,
  "#/login": Login,
  "#/signup": Signup
};

export function router(app) {
  const path = window.location.hash;
  const view = routes[path] || (() => "<h2>404</h2>");
  app.innerHTML = view();
}
