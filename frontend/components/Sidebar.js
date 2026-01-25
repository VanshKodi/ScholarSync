import { getProfile, isAdmin } from "../scripts/session.js";

export function Sidebar(chats = []) {
  const profile = getProfile();

  const chatListHtml = chats.length > 0
    ? chats.map(chat => `
        <a href="#/chat/${chat.id}" class="nav-item chat-item" data-module="./views/ChatView.js" data-export="ChatView">
          <span class="icon">💬</span>
          <span class="nav-text">${chat.title || 'New Chat'}</span>
        </a>
      `).join('')
    : '<p class="nav-text empty-msg">No recent chats</p>';

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <button id="sidebarToggle" class="toggle-btn" aria-label="Toggle sidebar">
          <img src="./resources/icons/menu.svg" alt="Toggle" style="width: 20px; height: 20px;" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Each link includes data-module and data-export so we can dynamic-import the view -->
        <a href="#/dashboard" class="nav-item active" data-module="./views/DashboardOverview.js" data-export="DashboardOverview">
          <span class="icon">📊</span>
          <span class="nav-text">Overview</span>
        </a>

        <div class="nav-label nav-text">Management</div>
        <a href="#/dashboard/courses" class="nav-item" data-module="./views/DashboardCourses.js" data-export="DashboardCourses">
          <span class="icon">📚</span>
          <span class="nav-text">Courses</span>
        </a>

        <div class="nav-label nav-text">Settings</div>
        <div class="subgroup">
          <a href="#/dashboard/profile" class="nav-item" data-module="./views/DashboardProfile.js" data-export="DashboardProfile">
            <span class="icon">👤</span>
            <span class="nav-text">Profile</span>
          </a>
          <a href="#/dashboard/account" class="nav-item" data-module="./views/DashboardAccount.js" data-export="DashboardAccount">
            <span class="icon">⚙️</span>
            <span class="nav-text">Account</span>
          </a>
        </div>

        ${isAdmin() ? `
          <div class="nav-label nav-text">Administration</div>
          <a href="#/admin/users" class="nav-item" data-module="./views/AdminUsers.js" data-export="AdminUsers">
            <span class="icon">🛡️</span>
            <span class="nav-text">Manage Users</span>
          </a>
        ` : ''}

        <div class="nav-label nav-text">Recent Chats</div>
        <div id="sidebar-chat-list">
          ${chatListHtml}
        </div>
      </nav>
    </aside>
  `;
}