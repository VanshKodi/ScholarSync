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
}

.advanced-filters.active {
  display: flex;
}

.file-upload {
  margin: 20px 0;
  padding: 16px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  text-align: center;
  background: #f9fafb;
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
        <input type="text" placeholder="Filter by author..." />
        <input type="text" placeholder="Filter by tag..." />
      </div>
    </div>

    <div class="file-upload">
      <div>Select a file to upload</div>
      <input type="file" id="fileInput" />

      <div id="uploadOptions" style="display:none; margin-top:16px;">
        <label>
          <input type="radio" name="uploadMode" value="new" checked />
          Create New Document
        </label>

        <label style="margin-left:20px;">
          <input type="radio" name="uploadMode" value="existing" />
          Add Version To Existing
        </label>

        <div id="newDocFields" style="margin-top:12px;">
          <input type="text" id="newDocTitle" placeholder="Document Title" />
          <textarea id="newDocDescription" placeholder="Description"></textarea>
        </div>

        <div id="existingDocFields" style="display:none; margin-top:12px;">
          <div class="searchable-dropdown">
            <input type="text" id="docSearchUpload" placeholder="Search document..." />
            <div class="dropdown-results" id="docResults"></div>
          </div>
        </div>

        <button id="confirmUploadBtn" style="margin-top:12px;">
          Upload
        </button>
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
  const globalColumn = card.querySelector("#globalDocs");
  const localColumn = card.querySelector("#localDocs");

  const fileInput = card.querySelector("#fileInput");
  const uploadOptions = card.querySelector("#uploadOptions");
  const newFields = card.querySelector("#newDocFields");
  const existingFields = card.querySelector("#existingDocFields");
  const uploadSearchInput = card.querySelector("#docSearchUpload");
  const dropdownResults = card.querySelector("#docResults");

  let globalDocs = [];
  let localDocs = [];
  let documentGroups = [];
  let selectedGroupId = null;

  /* ======================
     Load Documents
  ====================== */

  async function loadDocuments() {
    try {
      const data = await request("/documents-visible-to-user", { method: "GET" });

      globalDocs = data.filter(doc => doc.scope === "global");
      localDocs = data.filter(doc => doc.scope === "local");

      renderDocs(globalDocs, globalColumn, "Global Documents");
      renderDocs(localDocs, localColumn, "Local University Documents");

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

    if (!advancedToggle.checked) {
      const filteredGlobal = globalDocs.filter(doc =>
        doc.title.toLowerCase().includes(query)
      );

      const filteredLocal = localDocs.filter(doc =>
        doc.title.toLowerCase().includes(query)
      );

      renderDocs(filteredGlobal, globalColumn, "Global Documents");
      renderDocs(filteredLocal, localColumn, "Local University Documents");
    }
  }

  searchInput.addEventListener("input", performSearch);

  advancedToggle.addEventListener("change", () => {
    advancedFilters.classList.toggle("active", advancedToggle.checked);
  });

  /* ======================
     Upload UI
  ====================== */

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      uploadOptions.style.display = "block";
    }
  });

  document.querySelectorAll("input[name='uploadMode']").forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "new") {
        newFields.style.display = "block";
        existingFields.style.display = "none";
      } else {
        newFields.style.display = "none";
        existingFields.style.display = "block";
        loadDocumentGroups();
      }
    });
  });

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
    dropdownResults.style.display = "block";

    list.forEach(group => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = group.title;

      item.onclick = () => {
        selectedGroupId = group.doc_group_id;
        uploadSearchInput.value = group.title;
        dropdownResults.style.display = "none";
      };

      dropdownResults.appendChild(item);
    });
  }
  /* ======================
   Upload Action
====================== */
card.querySelector("#confirmUploadBtn")
  .addEventListener("click", async () => {

    const mode = document.querySelector("input[name='uploadMode']:checked").value;
    const file = fileInput.files[0];

    if (!file) {
      alert("Select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      if (mode === "new") {
        const title = card.querySelector("#newDocTitle").value;
        const description = card.querySelector("#newDocDescription").value;

        if (!title) {
          alert("Title required");
          return;
        }

        formData.append("title", title);
        formData.append("description", description || "");

        await request("/create-document-group-and-upload", {
          method: "POST",
          body: formData
        });

        alert("Uploaded successfully");
      }

      if (mode === "existing") {
        if (!selectedGroupId) {
          alert("Select a document group");
          return;
        }

        formData.append("group_id", selectedGroupId);

        await request("/upload-new-version", {
          method: "POST",
          body: formData
        });

        alert("New version uploaded");
      }

      uploadOptions.style.display = "none";
      fileInput.value = "";
      loadDocuments();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
});
  /* ======================
     Init
  ====================== */

  loadDocuments();
}