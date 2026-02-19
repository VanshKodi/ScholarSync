// components (go up twice → js → components)
import Navbar from "../../components/Navbar.js";
import Sidebar from "../../components/Sidebar.js";
import { DocumentUpload } from "../../components/DocumentUpload.js";

// dashboard views (same folder)
import { Overview } from "./Overview.js";
import { Documents } from "./Documents.js";
import { Profile } from "./Profile.js";
import { Settings } from "./Settings.js";
import { JoinRequests } from "./JoinRequests.js";

export default function Dashboard({ root }) {
  root.innerHTML = "";

  const navbar = Navbar();

  const layout = document.createElement("div");
  layout.className = "dashboard-layout";

  const main = document.createElement("main");
  main.className = "dashboard-main";

  function render(view) {
    main.innerHTML = "";

    if (view === "documents") {
      const upload = DocumentUpload();
      main.appendChild(upload);
      Documents(main);
      return;
    }

    if (view === "join-requests") {
      JoinRequests(main);
      return;
    }

    Overview(main);
  }

  const sidebar = Sidebar({ onSelect: render });

  render("overview");

  layout.append(sidebar, main);
  root.append(navbar, layout);
}