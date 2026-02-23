import { supabase } from "../../utils/supabase.js";
import { Session, request, clearCache } from "../../api.js";

/* ======================
   Styles
====================== */

const overviewCSS = `
  .overview-view {
    max-width: 900px;
    margin: 40px auto;
  }

  .overview-card {
    background: white;
    padding: 28px;
    border-radius: 14px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }

  .overview-card h1 {
    margin-bottom: 20px;
    font-size: 1.6rem;
    color: #1f2937;
  }

  .profile-info p {
    margin: 6px 0;
    font-size: 0.95rem;
    color: #374151;
  }

  .actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-success {
    background: #10b981;
    color: white;
  }

  .btn-success:hover {
    background: #059669;
  }

  .btn-outline {
    background: #f3f4f6;
    color: #111827;
  }

  .btn-outline:hover {
    background: #e5e7eb;
  }

  .refresh-btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: #f3f4f6;
    color: #374151;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .refresh-btn:hover {
    background: #e5e7eb;
  }

  .input-group {
    margin-top: 18px;
    display: flex;
    gap: 8px;
  }

  .input-group input {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
  }

  .message {
    margin-top: 16px;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .message-success {
    background: #d1fae5;
    color: #065f46;
  }

  .message-error {
    background: #fee2e2;
    color: #991b1b;
  }
`;

if (!document.getElementById("overview-styles")) {
  const style = document.createElement("style");
  style.id = "overview-styles";
  style.textContent = overviewCSS;
  document.head.appendChild(style);
}

/* ======================
   Main
====================== */

export async function Overview(container) {
  const session = await Session.get();
  const user = session?.user;

  if (!user) {
    container.innerHTML = "<p>Not authenticated</p>";
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  renderProfile(container, user, profile);
}

/* ======================
   Render
====================== */

function renderProfile(container, user, profile) {
  container.innerHTML = `
    <div class="overview-view">
      <div class="overview-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h1 style="margin:0;">Profile Overview</h1>
          <button id="refreshOverviewBtn" class="refresh-btn">↻ Refresh</button>
        </div>

        <div class="profile-info">
          <p><b>Email:</b> ${user.email}</p>
          <p><b>Role:</b> ${profile?.role ?? "None"}</p>
          <p><b>University ID:</b> ${profile?.university_id ?? "None"}</p>
          <p><b>Status:</b> ${profile?.status ?? "N/A"}</p>
        </div>

        <div class="actions">
          <button id="createProfileBtn" class="btn btn-outline">Create Profile</button>
          <button id="adminToggleBtn" class="btn btn-primary">Create University</button>
          <button id="joinToggleBtn" class="btn btn-success">Join University</button>
        </div>

        <div id="dynamicInput"></div>
        <div id="messageBox"></div>
      </div>
    </div>
  `;

  attachHandlers(container, user);
}

/* ======================
   Handlers
====================== */

function attachHandlers(container, user) {
  const dynamicInput = container.querySelector("#dynamicInput");
  const messageBox = container.querySelector("#messageBox");

  container.querySelector("#refreshOverviewBtn").addEventListener("click", async () => {
    clearCache();
    await Overview(container);
  });

  function showMessage(msg, type = "success") {
    messageBox.innerHTML = `
      <div class="message message-${type}">
        ${msg}
      </div>
    `;
  }

  container.querySelector("#createProfileBtn").onclick = async () => {
    try {
      await request("/create-profile", { method: "POST" });
      showMessage("Profile created successfully!");
    } catch (e) {
      showMessage(e.detail || "Failed to create profile", "error");
    }
  };

  container.querySelector("#adminToggleBtn").onclick = () => {
    dynamicInput.innerHTML = `
      <div class="input-group">
        <input type="text" id="universityNameInput" placeholder="Enter university name" />
        <button class="btn btn-primary" id="submitUniversity">Create</button>
      </div>
    `;

    container.querySelector("#submitUniversity").onclick = async () => {
      const name = container.querySelector("#universityNameInput").value.trim();
      if (!name) return;

      try {
        await request(`/create-university/${encodeURIComponent(name)}`, {
          method: "POST",
        });
        showMessage("University created. You are now admin.");
      } catch (e) {
        showMessage(e.detail || "Failed to create university", "error");
      }
    };
  };

  container.querySelector("#joinToggleBtn").onclick = () => {
    dynamicInput.innerHTML = `
      <div class="input-group">
        <input type="text" id="universityIdInput" placeholder="Enter university ID" />
        <button class="btn btn-success" id="submitJoin">Request</button>
      </div>
    `;

    container.querySelector("#submitJoin").onclick = async () => {
      const id = container.querySelector("#universityIdInput").value.trim();
      if (!id) return;

      try {
        await request(`/apply-to-join-university/${encodeURIComponent(id)}`, {
          method: "POST",
        });
        showMessage("Join request submitted successfully!");
      } catch (e) {
        showMessage(e.detail || "Failed to submit join request", "error");
      }
    };
  };
}