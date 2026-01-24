import { getProfile, isAdmin } from "../scripts/session.js";

export function Sidebar(chats = []) {
  const profile = getProfile();
  
  // Generate chat list HTML
  const chatListHtml = chats.length > 0 
    ? chats.map(chat => `
        <a href="#/chat/${chat.id}" class="nav-item chat-item">
          <span class="icon">💬</span> 
          <span class="nav-text">${chat.title || 'New Chat'}</span>
        </a>
      `).join('')
    : '<p class="nav-text empty-msg">No recent chats</p>';

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <span class="nav-text"><h3>ScholarSync</h3></span>
        <button id="sidebarToggle" class="toggle-btn">
          <img src="./resources/icons/menu.svg" alt="Toggle" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <a href="#/dashboard" class="nav-item active">
          <span class="icon">📊</span> 
          <span class="nav-text">Dashboard</span>
        </a>

        ${isAdmin() ? `
          <div class="nav-label nav-text">Administration</div>
          <a href="#/admin/users" class="nav-item">
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