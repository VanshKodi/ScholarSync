import { request, clearCache } from "../../api.js";

/* ======================
   Documents UI
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

.search-bar button.semantic-btn {
  background: #7c3aed;
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
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.doc-title:hover {
  color: #1d4ed8;
}

.doc-meta {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 4px;
}

.doc-actions {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

.doc-btn {
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  color: #374151;
}

.doc-btn:hover {
  background: #f3f4f6;
}

.doc-btn.download-btn {
  border-color: #2563eb;
  color: #2563eb;
}

.doc-btn.download-btn:hover {
  background: #dbeafe;
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

/* ── Modal overlay ───────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #e5e7eb;
  gap: 12px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1f2937;
  flex: 1;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0 4px;
}

.modal-close:hover { color: #111827; }

.modal-body {
  overflow-y: auto;
  padding: 20px 24px;
  flex: 1;
}

.modal-section-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  margin: 16px 0 6px;
}

.modal-section-label:first-child { margin-top: 0; }

.modal-desc-text {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.55;
  white-space: pre-wrap;
}

.modal-desc-placeholder {
  font-size: 0.9rem;
  color: #9ca3af;
  font-style: italic;
}

/* Version list inside group modal */
.version-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  transition: 0.15s;
}

.version-item:hover {
  background: #f0f4ff;
  border-color: #c7d2fe;
}

.version-item.latest-version {
  border-color: #2563eb;
  background: #eff6ff;
}

.version-badge {
  font-size: 0.75rem;
  font-weight: 700;
  background: #e5e7eb;
  color: #374151;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}

.version-item.latest-version .version-badge {
  background: #2563eb;
  color: white;
}

.version-info {
  flex: 1;
  min-width: 0;
}

.version-filename {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-date {
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 2px;
}

/* Version detail modal */
.version-detail-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.version-detail-key {
  font-size: 0.82rem;
  color: #6b7280;
  min-width: 110px;
}

.version-detail-value {
  font-size: 0.88rem;
  color: #1f2937;
  font-weight: 500;
}

.version-edit-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.version-edit-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
}

.version-edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.btn-primary {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: white;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover { background: #1d4ed8; }

.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 0.88rem;
  cursor: pointer;
}

.btn-secondary:hover { background: #f3f4f6; }

.modal-status-msg {
  font-size: 0.82rem;
  color: #475569;
}

.modal-status-msg.error { color: #b91c1c; }

/* Notifications bell */
.notif-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.notif-bell-btn {
  position: relative;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notif-bell-btn:hover { background: #f3f4f6; }

.notif-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 999px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Read notifications – muted/lighter appearance */
.notif-item {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.88rem;
  opacity: 0.55;
  transition: opacity 0.3s ease, background 0.3s ease;
}

/* Unread notifications – full colour, clickable */
.notif-item.unread {
  background: #eff6ff;
  border-color: #bfdbfe;
  opacity: 1;
  cursor: pointer;
}

.notif-item.unread:hover {
  background: #dbeafe;
}

.notif-item-title {
  font-weight: 700;
  color: #1f2937;
}

.notif-item-msg {
  color: #374151;
  margin-top: 2px;
}

.notif-item-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
}

.notif-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 24px 0;
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
    <div class="notif-bar">
      <button class="notif-bell-btn" id="notifBellBtn">
        🔔 Notifications
        <span class="notif-badge" id="notifBadge" style="display:none;">0</span>
      </button>
    </div>

    <div class="documents-header">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <h2>Documents</h2>
        <button id="refreshDocsBtn" style="padding:8px 14px;border-radius:8px;border:none;background:#f3f4f6;color:#374151;font-size:0.85rem;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">↻ Refresh</button>
      </div>
      <div class="search-bar">
        <input type="text" id="docSearchInput" placeholder="Search documents…" />
        <button id="semanticSearchBtn" class="semantic-btn" title="Semantic (AI) search">🔍 AI Search</button>
        <button id="textSearchBtn" title="Text search on document content" style="padding:10px 14px;border-radius:8px;border:none;cursor:pointer;background:#059669;color:white;font-weight:500;">🔎 Text Search</button>
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
            <input type="text" id="docSearchUpload" placeholder="Search existing document group…" />
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

  const searchInput           = card.querySelector("#docSearchInput");
  const semanticSearchBtn     = card.querySelector("#semanticSearchBtn");
  const textSearchBtn         = card.querySelector("#textSearchBtn");
  const refreshDocsBtn        = card.querySelector("#refreshDocsBtn");
  const advancedToggle        = card.querySelector("#advancedToggle");
  const advancedFilters       = card.querySelector("#advancedFilters");
  const onlyActiveFilter      = card.querySelector("#onlyActiveFilter");
  const descriptionTypeFilter = card.querySelector("#descriptionTypeFilter");
  const globalColumn          = card.querySelector("#globalDocs");
  const localColumn           = card.querySelector("#localDocs");

  const fileInput             = card.querySelector("#fileInput");
  const uploadOptions         = card.querySelector("#uploadOptions");
  const newFields             = card.querySelector("#newDocFields");
  const existingFields        = card.querySelector("#existingDocFields");
  const newDocModeBtn         = card.querySelector("#newDocModeBtn");
  const existingModeBtn       = card.querySelector("#existingModeBtn");
  const uploadSearchInput     = card.querySelector("#docSearchUpload");
  const dropdownResults       = card.querySelector("#docResults");
  const uploadStatus          = card.querySelector("#uploadStatus");
  const uploadButton          = card.querySelector("#confirmUploadBtn");
  const uploadBtnText         = card.querySelector(".upload-btn-text");
  const descriptionInput      = card.querySelector("#docDescription");
  const scopeSelect           = card.querySelector("#docScope");
  const notifBellBtn          = card.querySelector("#notifBellBtn");
  const notifBadge            = card.querySelector("#notifBadge");

  let globalDocs      = [];
  let localDocs       = [];
  let documentGroups  = [];
  let selectedGroupId = null;
  let uploadMode      = "new";
  let userProfile     = null;

  /* ======================
     Load User Profile
  ====================== */

  async function loadProfile() {
    try {
      userProfile = await request("/get-user-profile", { method: "GET" });
    } catch (err) {
      console.warn("Could not load user profile", err);
    }
  }

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
      localDocs  = data.filter(doc => doc.scope === "local");

      performSearch();
    } catch (err) {
      console.error("loadDocuments error:", err);
      renderDocs([], globalColumn, "Global Documents");
      renderDocs([], localColumn, "Local University Documents");
    }
  }

  /* ======================
     Access Control
  ====================== */

  function canDownload(doc) {
    if (!userProfile) return false;
    const role = userProfile.role;
    if (role === "admin") return true;
    if (role === "faculty" && doc.scope === "local") return true;
    return false;
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

      const downloadBtn = canDownload(doc)
        ? `<button class="doc-btn download-btn" data-docid="${doc.document_id}">⬇ Download</button>`
        : "";

      item.innerHTML = `
        <div class="doc-title" data-groupid="${doc.group_id}">${doc.title}</div>
        <div class="doc-meta">
          ${doc.human_description || "No description"}
          ${doc.status ? ` &bull; ${doc.status}` : ""}
        </div>
        <div class="doc-actions">
          ${downloadBtn}
        </div>
      `;

      // Click document title → open Document Group Modal
      item.querySelector(".doc-title").addEventListener("click", () => {
        openGroupModal(doc.group_id);
      });

      // Download click
      const dlBtn = item.querySelector(".download-btn");
      if (dlBtn) {
        dlBtn.addEventListener("click", () => downloadDocument(doc.document_id));
      }

      column.appendChild(item);
    });
  }

  /* ======================
     Download
  ====================== */

  async function downloadDocument(documentId) {
    try {
      const resp = await request(`/download-document/${documentId}`, { method: "GET" });
      if (resp && resp.url) {
        window.open(resp.url, "_blank", "noopener");
      }
    } catch (err) {
      console.error("Download failed", err);
      alert("Download failed: " + (err.message || "Unknown error"));
    }
  }

  /* ======================
     Document Group Modal
  ====================== */

  async function openGroupModal(groupId) {
    let data;
    try {
      data = await request(`/document-group/${groupId}`, { method: "GET" });
    } catch (err) {
      console.error("Failed to load group", err);
      alert("Could not load document details.");
      return;
    }

    const { group, versions } = data;
    const activeId   = group.active_document_id;
    const latestDoc  = versions.find(v => v.document_id === activeId) || versions[0] || {};
    const humanDesc  = group.human_description || latestDoc.human_description || "";
    const aiDesc     = group.ai_description    || latestDoc.ai_description    || "";

    const versionsHTML = (versions || []).map(v => {
      const date = v.created_at
        ? new Date(v.created_at).toLocaleDateString(undefined,
            { year: "numeric", month: "short", day: "numeric" })
        : "—";
      const isLatest  = v.document_id === activeId;
      const badgeText = isLatest ? `v${v.version_number} · Latest` : `v${v.version_number}`;
      return `
        <div class="version-item ${isLatest ? "latest-version" : ""}"
             data-docid="${v.document_id}">
          <span class="version-badge">${badgeText}</span>
          <div class="version-info">
            <div class="version-filename">${v.file_name || "—"}</div>
            <div class="version-date">Uploaded ${date}</div>
          </div>
        </div>
      `;
    }).join("");

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box" id="groupModal">
        <div class="modal-header">
          <h3>${group.title}</h3>
          <button class="modal-close" id="closeGroupModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-section-label">Human Description</div>
          ${humanDesc
            ? `<div class="modal-desc-text">${humanDesc}</div>`
            : `<div class="modal-desc-placeholder">No human description provided.</div>`}

          <div class="modal-section-label">AI Description</div>
          ${aiDesc
            ? `<div class="modal-desc-text">${aiDesc}</div>`
            : `<div class="modal-desc-placeholder">AI description not yet generated.</div>`}

          <div class="modal-section-label">All Versions (${versions.length})</div>
          <div class="version-list">
            ${versionsHTML || `<div class="modal-desc-placeholder">No versions found.</div>`}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#closeGroupModal").onclick = () => overlay.remove();
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    // Click a version row → open version detail modal
    overlay.querySelectorAll(".version-item").forEach(row => {
      row.addEventListener("click", () => {
        const docId  = row.dataset.docid;
        const vData  = versions.find(v => v.document_id === docId);
        if (vData) {
          vData.is_latest = vData.document_id === activeId;
          overlay.remove();
          openVersionModal(vData, group);
        }
      });
    });
  }

  /* ======================
     Version Detail Modal
  ====================== */

  function openVersionModal(version, group) {
    const canEdit = userProfile && (
      userProfile.role === "admin" ||
      (userProfile.role === "faculty" && group.created_by === userProfile.id)
    );

    const date = version.created_at
      ? new Date(version.created_at).toLocaleString(undefined, {
          year: "numeric", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit"
        })
      : "—";

    const dlAllowed = canDownload({ scope: group.scope, document_id: version.document_id });

    const editSection = canEdit ? `
      <div class="modal-section-label" style="margin-top:20px;">Edit Details</div>
      <div class="version-edit-form">
        <label class="field-label" for="editHumanDesc">Human Description</label>
        <textarea id="editHumanDesc">${version.human_description || ""}</textarea>
        <div class="version-edit-actions">
          <span class="modal-status-msg" id="editStatusMsg"></span>
          <button class="btn-secondary" id="cancelEditBtn">Cancel</button>
          <button class="btn-primary" id="saveEditBtn">Save</button>
        </div>
      </div>
    ` : "";

    const dlSection = dlAllowed
      ? `<button class="btn-primary" id="versionDlBtn" style="margin-top:16px;">⬇ Download</button>`
      : "";

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box" id="versionModal">
        <div class="modal-header">
          <h3>${version.file_name || "Version Detail"}</h3>
          <button class="modal-close" id="closeVersionModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="version-detail-row">
            <span class="version-detail-key">Version</span>
            <span class="version-detail-value">v${version.version_number}${version.is_latest ? " (latest)" : ""}</span>
          </div>
          <div class="version-detail-row">
            <span class="version-detail-key">File Name</span>
            <span class="version-detail-value">${version.file_name || "—"}</span>
          </div>
          <div class="version-detail-row">
            <span class="version-detail-key">Upload Date</span>
            <span class="version-detail-value">${date}</span>
          </div>
          <div class="version-detail-row">
            <span class="version-detail-key">Status</span>
            <span class="version-detail-value">${version.status || "—"}</span>
          </div>

          <div class="modal-section-label" style="margin-top:14px;">Human Description</div>
          <div class="modal-desc-text" id="versionHumanDescDisplay">
            ${version.human_description || "<span class=\"modal-desc-placeholder\">None</span>"}
          </div>

          <div class="modal-section-label">AI Description</div>
          <div class="modal-desc-text">
            ${version.ai_description || "<span class=\"modal-desc-placeholder\">Not yet generated</span>"}
          </div>

          ${dlSection}
          ${editSection}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#closeVersionModal").onclick = () => overlay.remove();
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    if (dlAllowed) {
      overlay.querySelector("#versionDlBtn").addEventListener("click", () => {
        downloadDocument(version.document_id);
      });
    }

    if (canEdit) {
      overlay.querySelector("#cancelEditBtn").onclick = () => overlay.remove();
      overlay.querySelector("#saveEditBtn").addEventListener("click", async () => {
        const newDesc   = overlay.querySelector("#editHumanDesc").value.trim();
        const statusMsg = overlay.querySelector("#editStatusMsg");
        try {
          await request(`/document/${version.document_id}`, {
            method: "PATCH",
            body:   { human_description: newDesc },
          });
          statusMsg.textContent = "Saved!";
          statusMsg.classList.remove("error");
          version.human_description = newDesc;
          overlay.querySelector("#versionHumanDescDisplay").textContent = newDesc || "None";
          setTimeout(() => { statusMsg.textContent = ""; }, 2500);
        } catch (err) {
          console.error("Save failed", err);
          statusMsg.textContent = "Save failed.";
          statusMsg.classList.add("error");
        }
      });
    }
  }

  /* ======================
     Instant Search
  ====================== */

  function performSearch() {
    const query           = searchInput.value.trim().toLowerCase();
    const activeOnly      = !advancedToggle.checked || onlyActiveFilter.checked;
    const descriptionType = advancedToggle.checked ? descriptionTypeFilter.value : "all";

    const applyFilters = (docs) => docs.filter(doc => {
      const title      = (doc.title             || "").toLowerCase();
      const humanDesc  = (doc.human_description || "").toLowerCase();
      const aiDesc     = (doc.ai_description    || "").toLowerCase();

      const matchesQuery = !query ||
        [title, humanDesc, aiDesc].some(v => v.includes(query));

      const isActive = doc.is_active !== false;

      const hasDescMatch = descriptionType === "all"
        || (descriptionType === "human" && humanDesc.length > 0)
        || (descriptionType === "ai"    && aiDesc.length > 0);

      return matchesQuery && (!activeOnly || isActive) && hasDescMatch;
    });

    renderDocs(applyFilters(globalDocs), globalColumn, "Global Documents");
    renderDocs(applyFilters(localDocs),  localColumn,  "Local University Documents");
  }

  /* ======================
     HyDE Semantic Search
  ====================== */

  async function performSemanticSearch() {
    const query = searchInput.value.trim();
    if (!query) { performSearch(); return; }

    const origText         = semanticSearchBtn.textContent;
    semanticSearchBtn.textContent = "Searching…";
    semanticSearchBtn.disabled    = true;

    try {
      const results = await request("/search-documents", {
        method: "POST",
        body:   { query, mode: "semantic" },
      });

      const data = Array.isArray(results) ? results : [];
      globalDocs = data.filter(d => d.scope === "global");
      localDocs  = data.filter(d => d.scope === "local");
      performSearch();
    } catch (err) {
      console.error("Semantic search failed", err);
      alert("Semantic search failed. Falling back to local search.");
      performSearch();
    } finally {
      semanticSearchBtn.textContent = origText;
      semanticSearchBtn.disabled    = false;
    }
  }

  /* ======================
     Text Search
  ====================== */

  async function performTextSearch() {
    const query = searchInput.value.trim();
    if (!query) { performSearch(); return; }

    const origText       = textSearchBtn.textContent;
    textSearchBtn.textContent = "Searching…";
    textSearchBtn.disabled    = true;

    try {
      const results = await request("/search-documents", {
        method: "POST",
        body:   { query, mode: "text" },
      });

      const data = Array.isArray(results) ? results : [];
      globalDocs = data.filter(d => d.scope === "global");
      localDocs  = data.filter(d => d.scope === "local");
      performSearch();
    } catch (err) {
      console.error("Text search failed", err);
      alert("Text search failed.");
      performSearch();
    } finally {
      textSearchBtn.textContent = origText;
      textSearchBtn.disabled    = false;
    }
  }

  searchInput.addEventListener("input", performSearch);

  semanticSearchBtn.addEventListener("click", performSemanticSearch);
  textSearchBtn.addEventListener("click", performTextSearch);

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") performSemanticSearch();
  });

  refreshDocsBtn.addEventListener("click", async () => {
    clearCache("/documents-visible-to-user");
    await loadDocuments();
  });

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
    if (fileInput.files.length === 0) uploadStatus.textContent = "";
  });

  function setUploadMode(mode) {
    uploadMode      = mode;
    const isNew     = mode === "new";
    selectedGroupId = null;
    uploadSearchInput.value        = "";
    dropdownResults.style.display  = "none";
    newFields.style.display        = isNew ? "block" : "none";
    existingFields.style.display   = isNew ? "none"  : "block";
    newDocModeBtn.classList.toggle("active",  isNew);
    existingModeBtn.classList.toggle("active", !isNew);
    if (!isNew) loadDocumentGroups();
  }

  newDocModeBtn.addEventListener("click",   () => setUploadMode("new"));
  existingModeBtn.addEventListener("click", () => setUploadMode("existing"));

  async function loadDocumentGroups() {
    const groups   = await request("/my-document-groups", { method: "GET" });
    documentGroups = groups;
    renderDropdown(groups);
  }

  uploadSearchInput.addEventListener("input", () => {
    const q = uploadSearchInput.value.toLowerCase();
    renderDropdown(documentGroups.filter(g => g.title.toLowerCase().includes(q)));
  });

  function renderDropdown(list) {
    dropdownResults.innerHTML     = "";
    dropdownResults.style.display = list.length ? "block" : "none";
    list.forEach(group => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.innerHTML = `${group.title}<span class="upload-group-scope">${group.scope || "local"}</span>`;
      item.onclick   = () => {
        selectedGroupId             = group.doc_group_id;
        uploadSearchInput.value     = group.title;
        dropdownResults.style.display = "none";
      };
      dropdownResults.appendChild(item);
    });
  }

  function setUploadState(loading, message = "", isError = false) {
    uploadButton.disabled = loading;
    uploadButton.classList.toggle("loading", loading);
    uploadBtnText.textContent = loading ? "Uploading…" : "Upload";
    uploadStatus.textContent  = message;
    uploadStatus.classList.toggle("error", isError);
  }

  function resetUploadForm() {
    fileInput.value                             = "";
    uploadSearchInput.value                     = "";
    card.querySelector("#newDocTitle").value    = "";
    descriptionInput.value                      = "";
    scopeSelect.value                           = "local";
    dropdownResults.style.display               = "none";
    uploadOptions.style.display                 = "none";
    selectedGroupId                             = null;
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
        await request("/create-document-group-and-upload", { method: "POST", body: formData });
      }

      if (uploadMode === "existing") {
        if (!selectedGroupId) {
          setUploadState(false, "Please select an existing document group.", true);
          return;
        }
        formData.append("group_id", selectedGroupId);
        await request("/upload-new-version", { method: "POST", body: formData });
      }

      resetUploadForm();
      setUploadState(false, "Upload complete.");
      await loadDocuments();

    } catch (err) {
      console.error("Document upload failed", err);
      setUploadState(false, "Upload failed. Check console for details.", true);
    }
  });

  /* ======================
     Notifications
  ====================== */

  async function pollNotifications() {
    try {
      const notifs = await request("/notifications", { method: "GET" });
      const unread  = (notifs || []).filter(n => !n.is_read).length;
      if (unread > 0) {
        notifBadge.textContent    = unread;
        notifBadge.style.display  = "inline-flex";
      } else {
        notifBadge.style.display  = "none";
      }
    } catch (err) {
      // Silently ignore notification poll errors
      console.debug("Notification poll failed:", err);
    }
  }

  notifBellBtn.addEventListener("click", openNotificationsModal);

  async function openNotificationsModal() {
    let notifs = [];
    try {
      notifs = await request("/notifications", { method: "GET" }) || [];
    } catch (err) {
      console.error("Failed to load notifications", err);
    }

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3>Notifications</h3>
          <button class="modal-close" id="closeNotifModal">&times;</button>
        </div>
        <div class="modal-body">
          <div style="text-align:right;margin-bottom:10px;">
            <button class="btn-secondary" id="markAllReadBtn"
                    style="font-size:0.8rem;padding:5px 10px;">
              Mark all as read
            </button>
          </div>
          <div class="notif-list" id="notifList"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const listEl = overlay.querySelector("#notifList");

    // Track local unread count to update the bell badge in real time
    let localUnread = notifs.filter(n => !n.is_read).length;

    function updateBadge() {
      if (localUnread > 0) {
        notifBadge.textContent   = localUnread;
        notifBadge.style.display = "inline-flex";
      } else {
        notifBadge.style.display = "none";
      }
    }

    /** Build a single notification DOM node. */
    function buildNotifItem(n) {
      const time = n.created_at
        ? new Date(n.created_at).toLocaleString(undefined, {
            month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit"
          })
        : "";

      const el = document.createElement("div");
      el.className   = `notif-item ${n.is_read ? "" : "unread"}`;
      el.dataset.nid = n.notification_id;
      el.innerHTML   = `
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-msg">${n.message}</div>
        <div class="notif-item-time">${time}${n.is_read ? "" : " · click to mark as seen"}</div>
      `;

      // Clicking an unread item marks it as seen, applies lighter style,
      // and moves it below all remaining unread items.
      if (!n.is_read) {
        el.addEventListener("click", async () => {
          try {
            await request(`/notifications/${n.notification_id}/read`, { method: "POST" });
            n.is_read = true;
            el.classList.remove("unread");
            // Update the hint text
            const timeEl = el.querySelector(".notif-item-time");
            if (timeEl) timeEl.textContent = time;
            // Sink below unread items: append to end of list
            listEl.appendChild(el);
            localUnread = Math.max(0, localUnread - 1);
            updateBadge();
          } catch (err) {
            console.error("Mark as read failed", err);
          }
        });
      }

      return el;
    }

    if (notifs.length === 0) {
      listEl.innerHTML = `<div class="notif-empty">No notifications yet.</div>`;
    } else {
      notifs.forEach(n => listEl.appendChild(buildNotifItem(n)));
    }

    overlay.querySelector("#closeNotifModal").onclick = () => overlay.remove();
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector("#markAllReadBtn").addEventListener("click", async () => {
      try {
        await request("/notifications/read-all", { method: "POST" });
        // Apply lighter style to every item and move them all to read order
        listEl.querySelectorAll(".notif-item.unread").forEach(el => {
          el.classList.remove("unread");
          const timeEl = el.querySelector(".notif-item-time");
          if (timeEl) timeEl.textContent = timeEl.textContent.replace(" · click to mark as seen", "");
          listEl.appendChild(el);
        });
        localUnread = 0;
        updateBadge();
      } catch (err) {
        console.error("Mark all read failed", err);
      }
    });
  }

  /* ======================
     Init
  ====================== */

  async function init() {
    await loadProfile();
    await loadDocuments();
    // Poll for notifications immediately, then every 30 s
    pollNotifications();
    setInterval(pollNotifications, 30000);
  }

  init();
}
