import { supabase } from "../utils/supabase.js";

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
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
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