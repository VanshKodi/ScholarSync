import { Navbar } from "./components/Navbar.js";
import { router } from "./router.js";

const app = document.getElementById("app");
const navbar = document.getElementById("navbar");

function render() {
  navbar.innerHTML = Navbar();
  router(app);
}

window.addEventListener("hashchange", render);
window.addEventListener("load", render);
