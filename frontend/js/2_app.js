import { startRouter } from "./3_router.js";
import { showLoader, hideLoader } from "./components/Loader.js";

console.log("app.js loaded");
showLoader("Loading ScholarSync...");
setTimeout(hideLoader, 500);
startRouter(document.getElementById("root"));