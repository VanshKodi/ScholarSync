// DocumentUpload CSS - hardcoded directly in component
const documentUploadCSS = `
  .upload-btn {
    padding: 10px 14px;
    border-radius: 10px;
    background: #111;
    color: white;
    border: none;
    cursor: pointer;
  }
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .popup {
    background: white;
    width: 380px;
    padding: 20px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .popup label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
  }
  .popup input, .popup select {
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
  .drop-box {
    border: 2px dashed #ccc;
    padding: 26px;
    text-align: center;
    border-radius: 10px;
    color: #777;
  }
  .drop-box.hover {
    border-color: #6366f1;
  }
  .ghost-btn {
    background: none;
    border: none;
    color: #4f46e5;
    cursor: pointer;
  }
  .popup-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .group-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .group-item {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #f9fafb;
    cursor: pointer;
  }
`;

// Inject styles once
if (!document.getElementById('documentupload-styles')) {
  const style = document.createElement('style');
  style.id = 'documentupload-styles';
  style.textContent = documentUploadCSS;
  document.head.appendChild(style);
}

import { supabase } from "../utils/supabase.js";
import { Session } from "../api.js";

export function DocumentUpload() {
  const btn = document.createElement("button");
  btn.className = "upload-btn";
  btn.textContent = "+ Upload Document";

  btn.onclick = openUploadPopup;
  return btn;
}

/* ---------------- popup ---------------- */

function openUploadPopup() {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup";

  popup.innerHTML = `
    <h3>Upload Document</h3>

    <label>
      Scope
      <select id="scope">
        <option value="local">Local</option>
        <option value="global">Global</option>
      </select>
    </label>

    <div class="drop-box" id="dropBox">
      Drag & drop document here
    </div>

    <label>
      Actual file name
      <input id="actualName" disabled />
    </label>

    <label>
      Preferred name
      <input id="preferredName" placeholder="Enter your preferred name" />
    </label>

    <button id="aiName" class="ghost-btn">
      🤖 Suggest name using AI
    </button>

    <div class="popup-actions">
      <button class="cancel">Cancel</button>
      <button class="primary" id="uploadBtn" disabled>Upload</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  const dropBox = popup.querySelector("#dropBox");
  const actualName = popup.querySelector("#actualName");
  const preferredName = popup.querySelector("#preferredName");
  const uploadBtn = popup.querySelector("#uploadBtn");

  let uploadedFile = null;

  /* ---- drag & drop ---- */

  dropBox.ondragover = e => {
    e.preventDefault();
    dropBox.classList.add("hover");
  };

  dropBox.ondragleave = () => dropBox.classList.remove("hover");

  dropBox.ondrop = e => {
    e.preventDefault();
    dropBox.classList.remove("hover");

    uploadedFile = e.dataTransfer.files[0];
    if (!uploadedFile) return;

    actualName.value = uploadedFile.name;
    preferredName.value = uploadedFile.name.replace(/\.[^/.]+$/, "");
    uploadBtn.disabled = false;
  };

  /* ---- AI name hook ---- */

  popup.querySelector("#aiName").onclick = async () => {
    if (!uploadedFile) return;

    preferredName.value = "Fetching AI suggestion...";

    // BACKEND HOOK
    // const res = await fetch("/api/ai/suggest-name");
    // const { name } = await res.json();

    setTimeout(() => {
      preferredName.value = "Academic Calendar 2024";
    }, 800);
  };

  /* ---- upload / duplicate check ---- */

  uploadBtn.onclick = async () => {
    popup.innerHTML = `
      <h3>Similar documents found</h3>
      <p>Select a document group</p>

      <div class="group-list">
        <button class="group-item">Academic Calendar</button>
        <button class="group-item">Semester Schedules</button>
        <button class="group-item">Upload as new document</button>
      </div>
    `;

    // BACKEND HOOK: call production Render URL and send Supabase access token
    const runCheck = async () => {
      const session = await Session.get();
      const token = session?.access_token;
      if (!token) {
        console.error('no session token');
        return;
      }

      try {
        const res = await fetch('https://scholarsync-3s4e.onrender.com/ping', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        console.log('Backend says:', json);
      } catch (err) {
        console.error('backend error', err);
      }
    };

    runCheck();
  };

  popup.querySelector(".cancel").onclick = () => overlay.remove();
  overlay.onclick = e => e.target === overlay && overlay.remove();
}
