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

  .file-upload input {
    margin-top: 10px;
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

  .docs-column h3 {
    margin-top: 0;
    font-size: 1.1rem;
    color: #111827;
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

  /* ======================
     Header
  ====================== */

  card.innerHTML = `
    <div class="documents-header">
      <h2>Documents</h2>

      <div class="search-bar">
        <input type="text" id="docSearchInput" placeholder="Search documents..." />
        <button id="searchBtn">Search</button>
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
      <input 
        type="file" 
        accept="
          application/pdf,
          application/vnd.openxmlformats-officedocument.wordprocessingml.document,
          text/plain,
          text/markdown,
          application/vnd.openxmlformats-officedocument.presentationml.presentation
        "
      />
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
     Elements
  ====================== */

  const advancedToggle = card.querySelector("#advancedToggle");
  const advancedFilters = card.querySelector("#advancedFilters");
  const searchInput = card.querySelector("#docSearchInput");
  const searchBtn = card.querySelector("#searchBtn");
  const globalColumn = card.querySelector("#globalDocs");
  const localColumn = card.querySelector("#localDocs");

  advancedToggle.addEventListener("change", () => {
    advancedFilters.classList.toggle("active", advancedToggle.checked);
  });

  /* ======================
     Dummy Docs
  ====================== */

  const dummyGlobalDocs = [
    { title: "University Guidelines.pdf", author: "Admin", date: "2024-01-10" },
    { title: "Research Policy.docx", author: "Research Dept", date: "2024-02-02" },
    { title: "Code of Conduct.pdf", author: "HR", date: "2024-03-05" }
  ];

  const dummyLocalDocs = [
    { title: "Faculty Meeting Notes.pdf", author: "Dean", date: "2024-04-01" },
    { title: "Lab Schedule.xlsx", author: "Lab Admin", date: "2024-04-10" }
  ];

  /* ======================
     Render Function
  ====================== */

  function renderDocs(list, column, title) {
    column.innerHTML = `<h3>${title}</h3>`;

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "doc-item";
      empty.textContent = "No documents found.";
      column.appendChild(empty);
      return;
    }

    list.forEach(doc => {
      const item = document.createElement("div");
      item.className = "doc-item";

      item.innerHTML = `
        <div class="doc-title">${doc.title}</div>
        <div class="doc-meta">
          ${doc.author} • ${doc.date}
        </div>
      `;

      column.appendChild(item);
    });
  }

  /* Initial Render */
  renderDocs(dummyGlobalDocs, globalColumn, "Global Documents");
  renderDocs(dummyLocalDocs, localColumn, "Local University Documents");

  /* ======================
     Search Logic
  ====================== */

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();

    // If advanced is NOT checked → local filtering
    if (!advancedToggle.checked) {
      const filteredGlobal = dummyGlobalDocs.filter(doc =>
        doc.title.toLowerCase().includes(query)
      );

      const filteredLocal = dummyLocalDocs.filter(doc =>
        doc.title.toLowerCase().includes(query)
      );

      renderDocs(filteredGlobal, globalColumn, "Global Documents");
      renderDocs(filteredLocal, localColumn, "Local University Documents");
    }
    else {
      // For now advanced does nothing special
      console.log("Advanced search mode (future backend search)");
    }
  }

  /* ======================
   Instant Search Logic
====================== */

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();

    // If advanced is NOT checked → local filtering
    if (!advancedToggle.checked) {

      const filteredGlobal = dummyGlobalDocs.filter(doc =>
        doc.title.toLowerCase().includes(query)
      );

      const filteredLocal = dummyLocalDocs.filter(doc =>
        doc.title.toLowerCase().includes(query)
      );

      renderDocs(filteredGlobal, globalColumn, "Global Documents");
      renderDocs(filteredLocal, localColumn, "Local University Documents");
    }
  }

  // 🔥 Instant search while typing
  searchInput.addEventListener("input", performSearch);

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") performSearch();
  });
}