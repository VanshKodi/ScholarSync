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

        <div class="nav-label nav-text">Documents</div>
        <div class="subgroup">
          <a href="#/dashboard/all_documents" class="nav-item" data-module="./views/Dashboard/AllDocuments.js" data-export="AllDocuments">
          <img src="./resources/icons/Home_file.svg" alt="Toggle" style="width: 20px; height: 20px;" />
            <span class="nav-text">All Docs</span>
          </a>
          <a href="#/dashboard/profile" class="nav-item" data-module="./views/Dashboard/DashboardProfile.js" data-export="DashboardProfile">
          <img src="./resources/icons/Pc_file.svg" alt="Toggle" style="width: 20px; height: 20px;" />
            <span class="nav-text">Local</span>
          </a>
          <a href="#/dashboard/account" class="nav-item" data-module="./views/Dashboard/DashboardAccount.js" data-export="DashboardAccount">
          <img src="./resources/icons/Uni_file.svg" alt="Toggle" style="width: 20px; height: 20px;" />
            <span class="nav-text">Global</span>
          </a>
        </div>

        <div class="nav-label nav-text">Academic</div>
        <div class="subgroup">
          <a href="#/dashboard/profile" class="nav-item" data-module="./views/Dashboard/DashboardProfile.js" data-export="DashboardProfile">
            <span class="icon">👤</span>
            <span class="nav-text">Attendence</span>
          </a>
          <a href="#/dashboard/account" class="nav-item" data-module="./views/Dashboard/DashboardAccount.js" data-export="DashboardAccount">
            <span class="icon">⚙️</span>
            <span class="nav-text">Grade</span>
            
          <a href="#/dashboard/account" class="nav-item" data-module="./views/Dashboard/DashboardAccount.js" data-export="DashboardAccount">
            <span class="icon">⚙️</span>
            <span class="nav-text">CLO</span>
          </a>
        </div>

        <div class="nav-label nav-text">Misc</div>
        <div class="subgroup">
          <a href="#/dashboard/profile" class="nav-item" data-module="./views/Dashboard/DashboardProfile.js" data-export="DashboardProfile">
            <span class="icon">👤</span>
            <span class="nav-text">TA-Allotment</span>
          </a>
          <a href="#/dashboard/account" class="nav-item" data-module="./views/Dashboard/DashboardAccount.js" data-export="DashboardAccount">
            <span class="icon">⚙️</span>
            <span class="nav-text">Innovative Learning</span>
        </div>

        <div class="nav-label nav-text">ChatBot</div>
        <a href="#/chat" class="nav-item" data-module="./views/Dashboard/ChatView.js" data-export="ChatView">
          <span class="icon">🤖</span>
          <span class="nav-text">Chat with ScholarSync</span>
        </a>

        ${isAdmin() ? `
          <div class="nav-label nav-text">Administration</div>
          <a href="#/admin/users" class="nav-item" data-module="./views/Dashboard/AdminUsers.js" data-export="AdminUsers">
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