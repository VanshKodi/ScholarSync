// JoinRequests CSS - hardcoded directly in component
const joinRequestsCSS = `
  .join-requests-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .join-requests-section h2 {
    margin-bottom: 24px;
    color: #1f2937;
  }
  .loading {
    text-align: center;
    color: #6b7280;
    padding: 32px;
  }
  .empty-state {
    text-align: center;
    color: #9ca3af;
    padding: 32px;
    font-style: italic;
  }
  .requests-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .request-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
    transition: background-color 0.2s ease;
  }
  .request-item:hover {
    background-color: #f3f4f6;
  }
  .request-info {
    flex: 1;
  }
  .request-info p {
    margin: 4px 0;
    font-size: 0.95rem;
  }
  .requester-id {
    font-weight: 600;
    color: #1f2937;
  }
  .request-status {
    color: #6b7280;
    font-size: 0.9rem;
  }
  .request-date {
    color: #9ca3af;
    font-size: 0.85rem;
  }
  .request-actions {
    display: flex;
    gap: 8px;
  }
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }
  .btn-primary {
    background: #10b981;
    color: white;
  }
  .btn-primary:hover {
    background: #059669;
    transform: translateY(-1px);
  }
  .btn-danger {
    background: #ef4444;
    color: white;
  }
  .btn-danger:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
  .btn:active {
    transform: translateY(0);
  }
  .error {
    color: #dc2626;
    padding: 12px;
    background: #fee2e2;
    border-radius: 6px;
  }
`;

// Inject styles once
if (!document.getElementById('joinrequests-styles')) {
  const style = document.createElement('style');
  style.id = 'joinrequests-styles';
  style.textContent = joinRequestsCSS;
  document.head.appendChild(style);
}

import { request } from "../../api.js";

export function JoinRequests(container) {
  const section = document.createElement("div");
  section.className = "join-requests-section";

  const title = document.createElement("h2");
  title.textContent = "Manage Join Requests";
  section.appendChild(title);

  const loading = document.createElement("div");
  loading.className = "loading";
  loading.textContent = "Loading requests...";
  section.appendChild(loading);

  async function loadAndRender() {
    try {
      // Get current user's university_id
      const profileResp = await request("/get-user-profile", { method: "GET" });
      const universityId = profileResp.university_id;

      if (!universityId) {
        loading.innerHTML = "<p>You are not an admin of any university.</p>";
        return;
      }

      // Fetch join requests
      const requests = await request(`/all-join-requests/${universityId}`, {
        method: "GET"
      });

      loading.innerHTML = "";

      if (requests.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No pending join requests.";
        empty.className = "empty-state";
        section.appendChild(empty);
        return;
      }

      const list = document.createElement("div");
      list.className = "requests-list";

      requests.forEach((req) => {
        const item = document.createElement("div");
        item.className = "request-item";

        const info = document.createElement("div");
        info.className = "request-info";

        const requesterName = document.createElement("p");
        requesterName.className = "requester-id";
        requesterName.textContent = `User: ${req.requester_id.substring(0, 8)}...`;


        const createdAt = document.createElement("p");
        createdAt.className = "request-date";
        createdAt.textContent = `Requested: ${new Date(req.created_at).toLocaleDateString()}`;

        info.append(requesterName, status, createdAt);

        // Only show action buttons if status is pending
        let actions = null;
        actions = document.createElement("div");
        actions.className = "request-actions";
        const approveBtn = document.createElement("button");
        approveBtn.className = "btn btn-primary";
        approveBtn.textContent = "Approve";
        approveBtn.onclick = async () => {
          try {
            await request("/handle-join-request", {
              method: "POST",
              body: { request_id: req.request_id, action: "accept" }
            });
            loadAndRender(); // Refresh list
          } catch (error) {
            alert("Error approving request: " + error.detail || error);
          }
        };
        const rejectBtn = document.createElement("button");
        rejectBtn.className = "btn btn-danger";
        rejectBtn.textContent = "Reject";
        rejectBtn.onclick = async () => {
          try {
            await request("/handle-join-request", {
              method: "POST",
              body: { request_id: req.request_id, action: "reject" }
            });
            loadAndRender(); // Refresh list
          } catch (error) {
            alert("Error rejecting request: " + error.detail || error);
          }
        };

        actions.append(approveBtn, rejectBtn);
        
        item.append(info);
        if (actions) item.appendChild(actions);
        list.appendChild(item);
      });

      section.appendChild(list);
    } catch (error) {
      loading.innerHTML = `<p class="error">Error loading requests: ${error.detail || error}</p>`;
    }
  }

  loadAndRender();
  container.appendChild(section);
}
