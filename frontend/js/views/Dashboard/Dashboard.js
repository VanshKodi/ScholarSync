import Navbar from "../../components/Navbar.js";
import Sidebar from "../../components/Sidebar.js";

import { Overview } from "./Overview.js";
import { Documents } from "./Documents.js";
import { Profile } from "./Profile.js";
import { Settings } from "./Settings.js";

export default function Dashboard({ root }) {
  root.innerHTML = "";

  const navbar = Navbar();

  const layout = document.createElement("div");
  layout.className = "dashboard-layout";

  const main = document.createElement("main");
  main.className = "dashboard-main";

  function render(view) {
    switch (view) {
      case "documents":
        Documents(main);
        break;
      case "profile":
        Profile(main);
        break;
      case "settings":
        Settings(main);
        break;
      default:
        Overview(main);
    }
  }

  const sidebar = Sidebar({
    onSelect: render
  });

  render("overview");

  layout.appendChild(sidebar);
  layout.appendChild(main);

  root.appendChild(navbar);
  root.appendChild(layout);
}