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
      const profileResp = await request("/auth/profile", { method: "GET" });
      const universityId = profileResp.university_id;

      if (!universityId) {
        loading.innerHTML = "<p>You are not an admin of any university.</p>";
        return;
      }

      // Fetch join requests
      const requests = await request(`/university-join-requests/${universityId}`, {
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

        const status = document.createElement("p");
        status.className = "request-status";
        status.textContent = `Status: ${req.status}`;

        const createdAt = document.createElement("p");
        createdAt.className = "request-date";
        createdAt.textContent = `Requested: ${new Date(req.created_at).toLocaleDateString()}`;

        info.append(requesterName, status, createdAt);

        // Only show action buttons if status is pending
        let actions = null;
        if (req.status === "pending") {
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
        }

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
