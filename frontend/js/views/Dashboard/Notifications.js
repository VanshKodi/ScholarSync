import { request } from "../../api.js";

/* ======================
   Styles
====================== */

const notifCSS = `
  .notifications-view {
    max-width: 700px;
    margin: 40px auto;
  }

  .notifications-card {
    background: white;
    padding: 28px;
    border-radius: 14px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }

  .notifications-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .notifications-header h2 {
    font-size: 1.6rem;
    color: #1f2937;
    margin: 0;
  }

  .notif-header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .refresh-btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: #f3f4f6;
    color: #374151;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .refresh-btn:hover {
    background: #e5e7eb;
  }

  .notif-mark-all-btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: #e0e7ff;
    color: #3730a3;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .notif-mark-all-btn:hover {
    background: #c7d2fe;
  }

  .notif-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .notif-item {
    display: flex;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    transition: background 0.15s;
    cursor: pointer;
  }

  .notif-item.unread {
    background: #eef2ff;
    border-color: #c7d2fe;
  }

  .notif-item:hover {
    background: #e0e7ff;
  }

  .notif-dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #6366f1;
    margin-top: 5px;
    opacity: 0;
  }

  .notif-item.unread .notif-dot {
    opacity: 1;
  }

  .notif-body {
    flex: 1;
    min-width: 0;
  }

  .notif-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .notif-message {
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.5;
  }

  .notif-message a {
    color: #4f46e5;
    text-decoration: underline;
  }

  .notif-time {
    font-size: 0.78rem;
    color: #9ca3af;
    margin-top: 6px;
  }

  .notif-empty {
    text-align: center;
    color: #9ca3af;
    padding: 40px 0;
    font-size: 0.95rem;
  }

  .notif-loading {
    text-align: center;
    color: #9ca3af;
    padding: 40px 0;
  }
`;

if (!document.getElementById("notifications-styles")) {
  const style = document.createElement("style");
  style.id = "notifications-styles";
  style.textContent = notifCSS;
  document.head.appendChild(style);
}

/* ======================
   Helpers
====================== */

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ======================
   Main
====================== */

export async function Notifications(container) {
  container.innerHTML = `
    <div class="notifications-view">
      <div class="notifications-card">
        <div class="notifications-header">
          <h2>Notifications</h2>
          <div class="notif-header-actions">
            <button class="refresh-btn" id="refreshNotifBtn">↻ Refresh</button>
            <button class="notif-mark-all-btn" id="markAllBtn">Mark all as read</button>
          </div>
        </div>
        <div id="notifList" class="notif-list">
          <div class="notif-loading">Loading…</div>
        </div>
      </div>
    </div>
  `;

  const listEl     = container.querySelector("#notifList");
  const markAll    = container.querySelector("#markAllBtn");
  const refreshBtn = container.querySelector("#refreshNotifBtn");

  async function load() {
    try {
      const notifs = await request("/notifications");
      renderList(notifs);
    } catch (e) {
      listEl.innerHTML = `<div class="notif-empty">Failed to load notifications.</div>`;
    }
  }

  function renderList(notifs) {
    if (!notifs || notifs.length === 0) {
      listEl.innerHTML = `<div class="notif-empty">No notifications yet.</div>`;
      return;
    }

    listEl.innerHTML = "";
    for (const n of notifs) {
      const item = document.createElement("div");
      item.className = `notif-item${n.is_read ? "" : " unread"}`;

      const dot = document.createElement("div");
      dot.className = "notif-dot";

      const body = document.createElement("div");
      body.className = "notif-body";

      const title = document.createElement("div");
      title.className = "notif-title";
      title.textContent = n.title;

      // message is an HTML string generated by the backend (html.escape applied
      // to user-supplied parts) – render it as-is to preserve formatting.
      const msg = document.createElement("div");
      msg.className = "notif-message";
      msg.innerHTML = n.message;

      const time = document.createElement("div");
      time.className = "notif-time";
      time.textContent = timeAgo(n.created_at);

      body.append(title, msg, time);
      item.append(dot, body);

      // Mark as read on click
      if (!n.is_read) {
        item.addEventListener("click", async () => {
          item.classList.remove("unread");
          dot.style.opacity = "0";
          try {
            await request(`/notifications/${n.notification_id}/read`, { method: "POST" });
          } catch (_) { /* best-effort */ }
        });
      }

      listEl.appendChild(item);
    }
  }

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.textContent = "↻ Loading…";
    refreshBtn.disabled = true;
    listEl.innerHTML = `<div class="notif-loading">Refreshing…</div>`;
    await load();
    refreshBtn.textContent = "↻ Refresh";
    refreshBtn.disabled = false;
  });

  markAll.addEventListener("click", async () => {
    try {
      await request("/notifications/read-all", { method: "POST" });
      container.querySelectorAll(".notif-item.unread").forEach(el => {
        el.classList.remove("unread");
        el.querySelector(".notif-dot").style.opacity = "0";
      });
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  });

  await load();
}
