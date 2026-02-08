// js/views/Dashboard.js
import Navbar from "../components/Navbar.js";

export default function Dashboard({ root }) {
  root.innerHTML = "";

  // Navbar (same component, reused)
  const navbar = Navbar();

  // Main dashboard container
  const main = document.createElement("main");
  main.className = "dashboard";

  const title = document.createElement("h1");
  title.textContent = "Dashboard";

  const subtitle = document.createElement("p");
  subtitle.textContent = "You are successfully logged in.";

  const note = document.createElement("div");
  note.className = "dashboard-placeholder";
  note.textContent = "🚧 Dashboard content coming soon.";

  main.appendChild(title);
  main.appendChild(subtitle);
  main.appendChild(note);

  root.appendChild(navbar);
  root.appendChild(main);
}