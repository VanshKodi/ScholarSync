import Landing from "./views/Landing.js";
const routes = [];
console.log("router.js loaded");

routes.push({
  match: path => path === "/",
  handler: ({ root }) => {
    Landing({ root });
  }
});
export function startRouter(root) {
  function resolve() {
    const path = window.location.hash.slice(1) || "/";

    for (const route of routes) {
      if (route.match(path)) {
        route.handler({ path, root });
        return;
      }
    }

    root.innerHTML = "<h2>404</h2>";
  }

  window.addEventListener("hashchange", resolve);
  resolve();
}