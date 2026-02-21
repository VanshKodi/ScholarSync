import { request } from "../../api.js";

/* ======================
   Documents UI Upgrade
====================== */

const documentsCSS = `
.documents-view {
  max-width: 1100px;
  margin: 40px auto;
}

.documents-card {
  background: white;
  padding: 28px;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.documents-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.documents-header h2 {
  font-size: 1.6rem;
  color: #1f2937;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-bar input[type="text"] {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.search-bar button {
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #3b82f6;
  color: white;
  font-weight: 500;
}

.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #374151;
}

.advanced-filters {
  margin-top: 10px;
  display: none;
  gap: 10px;
  flex-wrap: wrap;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
}

.advanced-filters.active {
  display: flex;
}

.file-upload {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.upload-title {
  margin: 0 0 6px;
  font-size: 1.05rem;
  color: #0f172a;
}

.upload-subtitle {
  margin: 0 0 14px;
  font-size: 0.86rem;
  color: #64748b;
}

.upload-options {
  margin-top: 16px;
  border-top: 1px solid #e2e8f0;
  padding-top: 14px;
}

.upload-mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.mode-chip {
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.85rem;
  cursor: pointer;
}

.mode-chip.active {
  border-color: #2563eb;
  background: #dbeafe;
  color: #1e40af;
}

.upload-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-fields input,
.upload-fields textarea,
.upload-fields select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
}

.upload-fields textarea {
  min-height: 90px;
  resize: vertical;
}

.upload-description-fields {
  margin-top: 10px;
}

.field-label {
  font-size: 0.84rem;
  color: #334155;
  font-weight: 600;
}

.inline-select-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 10px;
}

@media (max-width: 640px) {
  .inline-select-row {
    grid-template-columns: 1fr;
  }
}

.upload-group-scope {
  font-size: 0.78rem;
  color: #64748b;
  margin-left: 8px;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
}

.upload-status {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: #475569;
}

.upload-status.error {
  color: #b91c1c;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #2563eb;
  color: white;
  font-weight: 600;
}

.upload-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.upload-spinner {
  display: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  animation: upload-spin 0.8s linear infinite;
}

.upload-btn.loading .upload-spinner {
  display: inline-block;
}

@keyframes upload-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.docs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .docs-grid {
    grid-template-columns: 1fr;
  }
}

.docs-column {
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
}

.doc-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
  transition: 0.2s ease;
}

.doc-item:hover {
  background: #f3f4f6;
}

.doc-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.doc-meta {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Searchable dropdown */
.searchable-dropdown {
  position: relative;
  width: 100%;
}

.searchable-dropdown input {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.dropdown-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 4px;
  display: none;
  z-index: 10;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.advanced-filters label {
  font-size: 0.85rem;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}
`;

if (!document.getElementById("documents-styles")) {
  const style = document.createElement("style");
  style.id = "documents-styles";
  style.textContent = documentsCSS;
  document.head.appendChild(style);
}

export function Documents(container) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "documents-view";

  const card = document.createElement("div");
  card.className = "documents-card";

  card.innerHTML = `
    <div class="documents-header">
      <h2>Documents</h2>
      <div class="search-bar">
        <input type="text" id="docSearchInput" placeholder="Search documents..." />
        <label class="advanced-toggle">
          <input type="checkbox" id="advancedToggle" />
          Advanced
        </label>
      </div>
      <div class="advanced-filters" id="advancedFilters">
        <label>
          <input type="checkbox" id="onlyActiveFilter" checked />
          Only active
        </label>
        <select id="descriptionTypeFilter">
          <option value="all">All descriptions</option>
          <option value="human">Human description</option>
          <option value="ai">AI description</option>
        </select>
      </div>
    </div>

    <div class="file-upload">
      <h3 class="upload-title">Upload Document</h3>
      <p class="upload-subtitle">Select a file first, then choose new document or new version.</p>
      <input type="file" id="fileInput" />

      <div id="uploadOptions" class="upload-options" style="display:none;">
        <div class="upload-mode-toggle">
          <button type="button" class="mode-chip active" id="newDocModeBtn" data-mode="new">New Document</button>
          <button type="button" class="mode-chip" id="existingModeBtn" data-mode="existing">New Version</button>
        </div>

        <div id="newDocFields" class="upload-fields">
          <input type="text" id="newDocTitle" placeholder="Document title" />
          <div class="inline-select-row">
            <label class="field-label" for="docScope">Scope</label>
            <select id="docScope">
              <option value="local">Local</option>
              <option value="global">Global</option>
            </select>
          </div>
        </div>

        <div id="existingDocFields" class="upload-fields" style="display:none;">
          <div class="searchable-dropdown">
            <input type="text" id="docSearchUpload" placeholder="Search existing document group..." />
            <div class="dropdown-results" id="docResults"></div>
          </div>
        </div>

        <div class="upload-fields upload-description-fields">
          <label class="field-label" for="docDescription">Human description</label>
          <textarea id="docDescription" placeholder="Add a human description"></textarea>
        </div>

        <p id="uploadStatus" class="upload-status" aria-live="polite"></p>

        <div class="upload-actions">
          <button id="confirmUploadBtn" class="upload-btn" style="margin-top:12px;">
            <span class="upload-spinner" aria-hidden="true"></span>
            <span class="upload-btn-text">Upload</span>
          </button>
        </div>
      </div>
    </div>

    <div class="docs-grid">
      <div class="docs-column" id="globalDocs">
        <h3>Global Documents</h3>
      </div>
      <div class="docs-column" id="localDocs">
        <h3>Local University Documents</h3>
      </div>
    </div>
  `;

  wrapper.appendChild(card);
  container.appendChild(wrapper);

  /* ======================
     State
  ====================== */

  const searchInput = card.querySelector("#docSearchInput");
  const advancedToggle = card.querySelector("#advancedToggle");
  const advancedFilters = card.querySelector("#advancedFilters");
  const onlyActiveFilter = card.querySelector("#onlyActiveFilter");
  const descriptionTypeFilter = card.querySelector("#descriptionTypeFilter");
  const globalColumn = card.querySelector("#globalDocs");
  const localColumn = card.querySelector("#localDocs");

  const fileInput = card.querySelector("#fileInput");
  const uploadOptions = card.querySelector("#uploadOptions");
  const newFields = card.querySelector("#newDocFields");
  const existingFields = card.querySelector("#existingDocFields");
  const newDocModeBtn = card.querySelector("#newDocModeBtn");
  const existingModeBtn = card.querySelector("#existingModeBtn");
  const uploadSearchInput = card.querySelector("#docSearchUpload");
  const dropdownResults = card.querySelector("#docResults");
  const uploadStatus = card.querySelector("#uploadStatus");
  const uploadButton = card.querySelector("#confirmUploadBtn");
  const uploadBtnText = card.querySelector(".upload-btn-text");
  const descriptionInput = card.querySelector("#docDescription");
  const scopeSelect = card.querySelector("#docScope");

  let globalDocs = [];
  let localDocs = [];
  let documentGroups = [];
  let selectedGroupId = null;
  let uploadMode = "new";

  /* ======================
     Load Documents
  ====================== */

  async function loadDocuments() {
    try {
      const response = await request("/documents-visible-to-user", { method: "GET" });
      const data = Array.isArray(response)
        ? response
        : (response?.documents || response?.items || []);

      globalDocs = data.filter(doc => doc.scope === "global");
      localDocs = data.filter(doc => doc.scope === "local");

      performSearch();

    } catch (err) {
      console.error(err);
      renderDocs([], globalColumn, "Global Documents");
      renderDocs([], localColumn, "Local University Documents");
    }
  }

  /* ======================
     Render
  ====================== */

  function renderDocs(list, column, title) {
    column.innerHTML = `<h3>${title}</h3>`;

    if (list.length === 0) {
      column.innerHTML += `<div class="doc-item">No documents found.</div>`;
      return;
    }

    list.forEach(doc => {
      const item = document.createElement("div");
      item.className = "doc-item";

      item.innerHTML = `
        <div class="doc-title">${doc.title}</div>
        <div class="doc-meta">
          ${doc.human_description || "No description"}
          ${doc.status ? ` • ${doc.status}` : ""}
        </div>
      `;

      column.appendChild(item);
    });
  }

  /* ======================
     Instant Search
  ====================== */

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const activeOnly = !advancedToggle.checked || onlyActiveFilter.checked;
    const descriptionType = advancedToggle.checked
      ? descriptionTypeFilter.value
      : "all";

    const applyFilters = (docs) => docs.filter(doc => {
      const title = (doc.title || "").toLowerCase();
      const humanDescription = (doc.human_description || "").toLowerCase();
      const aiDescription = (doc.ai_description || "").toLowerCase();

      const matchesQuery = [title, humanDescription, aiDescription]
        .some(value => value.includes(query));

      const isActive = doc.is_active !== false;

      const hasDescriptionMatch = descriptionType === "all"
        || (descriptionType === "human" && humanDescription.length > 0)
        || (descriptionType === "ai" && aiDescription.length > 0);

      return matchesQuery && (!activeOnly || isActive) && hasDescriptionMatch;
    });

    const filteredGlobal = applyFilters(globalDocs);
    const filteredLocal = applyFilters(localDocs);

    renderDocs(filteredGlobal, globalColumn, "Global Documents");
    renderDocs(filteredLocal, localColumn, "Local University Documents");
  }

  searchInput.addEventListener("input", performSearch);

  advancedToggle.addEventListener("change", () => {
    advancedFilters.classList.toggle("active", advancedToggle.checked);
    performSearch();
  });

  onlyActiveFilter.addEventListener("change", performSearch);
  descriptionTypeFilter.addEventListener("change", performSearch);

  /* ======================
     Upload UI
  ====================== */

  fileInput.addEventListener("change", () => {
    uploadOptions.style.display = fileInput.files.length > 0 ? "block" : "none";

    if (fileInput.files.length === 0) {
      uploadStatus.textContent = "";
    }
  });

  function setUploadMode(mode) {
    uploadMode = mode;
    const isNew = mode === "new";
    selectedGroupId = null;
    uploadSearchInput.value = "";
    dropdownResults.style.display = "none";
    newFields.style.display = isNew ? "block" : "none";
    existingFields.style.display = isNew ? "none" : "block";
    newDocModeBtn.classList.toggle("active", isNew);
    existingModeBtn.classList.toggle("active", !isNew);

    if (!isNew) {
      loadDocumentGroups();
    }
  }

  newDocModeBtn.addEventListener("click", () => setUploadMode("new"));
  existingModeBtn.addEventListener("click", () => setUploadMode("existing"));

  async function loadDocumentGroups() {
    const groups = await request("/my-document-groups", { method: "GET" });
    documentGroups = groups;
    renderDropdown(groups);
  }

  uploadSearchInput.addEventListener("input", () => {
    const query = uploadSearchInput.value.toLowerCase();
    const filtered = documentGroups.filter(g =>
      g.title.toLowerCase().includes(query)
    );
    renderDropdown(filtered);
  });

  function renderDropdown(list) {
    dropdownResults.innerHTML = "";
    dropdownResults.style.display = list.length ? "block" : "none";

    list.forEach(group => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.innerHTML = `${group.title}<span class="upload-group-scope">${group.scope || "local"}</span>`;

      item.onclick = () => {
        selectedGroupId = group.doc_group_id;
        uploadSearchInput.value = group.title;
        dropdownResults.style.display = "none";
      };

      dropdownResults.appendChild(item);
    });
  }
  function setUploadState(loading, message = "", isError = false) {
    uploadButton.disabled = loading;
    uploadButton.classList.toggle("loading", loading);
    uploadBtnText.textContent = loading ? "Uploading..." : "Upload";
    uploadStatus.textContent = message;
    uploadStatus.classList.toggle("error", isError);
  }

  function resetUploadForm() {
    fileInput.value = "";
    uploadSearchInput.value = "";
    card.querySelector("#newDocTitle").value = "";
    descriptionInput.value = "";
    scopeSelect.value = "local";
    uploadStatus.textContent = "";
    dropdownResults.style.display = "none";
    uploadOptions.style.display = "none";
    selectedGroupId = null;
    setUploadMode("new");
  }

  /* ======================
   Upload Action
====================== */
uploadButton.addEventListener("click", async () => {

    const file = fileInput.files[0];

    if (!file) {
      setUploadState(false, "Please select a file before uploading.", true);
      return;
    }

    const description = descriptionInput.value.trim();
    if (!description) {
      setUploadState(false, "Please add a human description.", true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      setUploadState(true);

      if (uploadMode === "new") {
        const title = card.querySelector("#newDocTitle").value.trim();

        if (!title) {
          setUploadState(false, "Title is required for a new document.", true);
          return;
        }

        formData.append("title", title);
        formData.append("scope", scopeSelect.value);

        await request("/create-document-group-and-upload", {
          method: "POST",
          body: formData
        });
      }

      if (uploadMode === "existing") {
        if (!selectedGroupId) {
          setUploadState(false, "Please select an existing document group.", true);
          return;
        }

        formData.append("group_id", selectedGroupId);

        await request("/upload-new-version", {
          method: "POST",
          body: formData
        });
      }

      resetUploadForm();
      await loadDocuments();

    } catch (err) {
      console.error("Document upload failed", err);
      setUploadState(false, "Upload failed. Check console for details.", true);
    }
});
  /* ======================
     Init
  ====================== */

  loadDocuments();
}
