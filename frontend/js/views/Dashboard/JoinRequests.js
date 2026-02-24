// JoinRequests CSS
const joinRequestsCSS = `
  .join-requests-view {
    padding: 0;
  }

  .join-requests-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .join-requests-header h2 {
    color: #1f2937;
    font-size: 1.5rem;
  }

  .join-requests-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  .loading,
  .empty-state {
    text-align: center;
    padding: 32px;
    color: #6b7280;
  }

  .error-banner {
    background: #fee2e2;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
  }

  .requests-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .request-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f9fafb;
    transition: all 0.2s ease;
  }

  .request-item:hover {
    background: #f3f4f6;
  }

  .request-info p {
    margin: 4px 0;
    font-size: 0.92rem;
  }

  .requester-id {
    font-weight: 600;
    color: #111827;
  }

  .request-date {
    font-size: 0.85rem;
    color: #9ca3af;
  }

  .request-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: #10b981;
    color: white;
  }

  .btn-primary:hover {
    background: #059669;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

if (!document.getElementById("joinrequests-styles")) {
  const style = document.createElement("style");
  style.id = "joinrequests-styles";
  style.textContent = joinRequestsCSS;
  document.head.appendChild(style);
}

import { request, clearCache } from "../../api.js";
import { createLogger } from "../../utils/logger.js";

const log = createLogger("JoinRequests");

export function JoinRequests(container) {
  const wrapper = document.createElement("div");
  wrapper.className = "join-requests-view";

  const header = document.createElement("div");
  header.className = "join-requests-header";

  const title = document.createElement("h2");
  title.textContent = "Manage Join Requests";

  const refreshBtn = document.createElement("button");
  refreshBtn.className = "btn";
  refreshBtn.style.cssText = "background:#f3f4f6;color:#374151;font-size:0.85rem;display:inline-flex;align-items:center;gap:4px;";
  refreshBtn.textContent = "↻ Refresh";

  header.append(title, refreshBtn);

  const card = document.createElement("div");
  card.className = "join-requests-card";

  wrapper.append(header, card);
  container.appendChild(wrapper);

  async function loadAndRender() {
    card.innerHTML = `<div class="loading">Loading requests...</div>`;

    try {
      const profile = await request("/get-user-profile", { method: "GET" });

      if (!profile.university_id) {
        card.innerHTML = `<div class="empty-state">
          You are not an admin of any university.
        </div>`;
        return;
      }

      const requests = await request(
        `/all-join-requests/${profile.university_id}`,
        { method: "GET" }
      );

      if (!requests || requests.length === 0) {
        card.innerHTML = `<div class="empty-state">
          No pending join requests.
        </div>`;
        return;
      }

      card.innerHTML = "";

      const list = document.createElement("div");
      list.className = "requests-list";

      requests.forEach((req) => {
        const item = document.createElement("div");
        item.className = "request-item";

        const info = document.createElement("div");
        info.className = "request-info";

        const requester = document.createElement("p");
        requester.className = "requester-id";
        requester.textContent = `User: ${req.requester_id.substring(0, 8)}...`;

        const created = document.createElement("p");
        created.className = "request-date";
        created.textContent = `Requested: ${new Date(
          req.created_at
        ).toLocaleDateString()}`;

        info.append(requester, created);

        const actions = document.createElement("div");
        actions.className = "request-actions";

        const approveBtn = document.createElement("button");
        approveBtn.className = "btn btn-primary";
        approveBtn.textContent = "Approve";

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "btn btn-danger";
        rejectBtn.textContent = "Reject";

        async function handleAction(action) {
          approveBtn.disabled = true;
          rejectBtn.disabled = true;

          try {
            await request("/handle-join-request", {
              method: "POST",
              body: {
                request_id: req.request_id,
                action
              }
            });
            log.info("Join request %s %sed", req.request_id, action);
            loadAndRender();
          } catch (error) {
            log.error("Failed to %s join request", action, error);
            showError(error.detail || "Action failed");
            approveBtn.disabled = false;
            rejectBtn.disabled = false;
          }
        }

        approveBtn.onclick = () => handleAction("accept");
        rejectBtn.onclick = () => handleAction("reject");

        actions.append(approveBtn, rejectBtn);
        item.append(info, actions);
        list.appendChild(item);
      });

      card.appendChild(list);
    } catch (error) {
      log.error("Failed to load join requests", error);
      showError(error.detail || "Failed to load requests");
    }
  }

  function showError(message) {
    card.innerHTML = `
      <div class="error-banner">${message}</div>
    `;
  }

  refreshBtn.addEventListener("click", () => {
    clearCache("/all-join-requests");
    clearCache("/get-user-profile");
    loadAndRender();
  });

  loadAndRender();
}