// SVG Icons as strings
const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 18h6V11l-2-2H9v9z"/><path d="M13 9v2h2"/></svg>`,
  document: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  chat: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`
};

// Sidebar CSS - hardcoded directly in component
const sidebarCSS = `
  .sidebar {
    width: 240px;
    background: #1f2937;
    transition: width 0.25s ease;
    overflow-x: hidden;
  }
  .sidebar.collapsed {
    width: 72px;
  }
  .sidebar-toggle {
    width: 100%;
    padding: 14px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: #9ca3af;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .sidebar-toggle:hover {
    background: #374151;
  }
  .sidebar-toggle svg {
    width: 20px;
    height: 20px;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border: none;
    background: none;
    width: 100%;
    cursor: pointer;
    font-size: 14px;
    color: #d1d5db;
    transition: all 0.2s ease;
    text-align: left;
  }
  .sidebar-item:hover {
    background: #374151;
    color: #ffffff;
  }
  .sidebar-item.active {
    background: #5b6cff;
    color: #ffffff;
  }
  .sidebar .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    width: 20px;
    height: 20px;
  }
  .sidebar .icon svg {
    width: 20px;
    height: 20px;
  }
  .sidebar-section {
    margin: 16px 16px 8px;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .sidebar.collapsed .label,
  .sidebar.collapsed .sidebar-section {
    display: none;
  }
  .sidebar.collapsed .sidebar-item {
    justify-content: center;
    padding: 12px 0;
  }
`;

// Inject styles once
if (!document.getElementById('sidebar-styles')) {
  const style = document.createElement('style');
  style.id = 'sidebar-styles';
  style.textContent = sidebarCSS;
  document.head.appendChild(style);
}

export default function Sidebar({ onSelect }) {
  const aside = document.createElement("aside");
  aside.className = "sidebar expanded";

  const toggle = document.createElement("button");
  toggle.className = "sidebar-toggle";
  toggle.innerHTML = icons.menu;

  toggle.onclick = () => {
    aside.classList.toggle("collapsed");
  };

  const nav = document.createElement("nav");

  function item(icon, text, id) {
    const btn = document.createElement("button");
    btn.className = "sidebar-item";
    btn.onclick = () => onSelect(id);

    btn.innerHTML = `
      <span class="icon">${icon}</span>
      <span class="label">${text}</span>
    `;
    return btn;
  }

  function section(title) {
    const h = document.createElement("div");
    h.className = "sidebar-section";
    h.textContent = title;
    return h;
  }

  nav.append(
    item(icons.home, "Overview", "overview"),

    section("Documents"),
    item(icons.document, "All Docs", "documents"),

    section("Academic"),
    item(icons.user, "Attendance", "attendance"),
    item(icons.settings, "Grade", "grade"),
    item(icons.settings, "CLO", "clo"),

    section("Administration"),
    item(icons.clipboard, "Join Requests", "join-requests"),

    section("Misc"),
    item(icons.user, "TA-Allotment", "ta"),
    item(icons.settings, "Innovative Learning", "innovative"),

    section("ChatBot"),
    item(icons.chat, "Chat with ScholarSync", "chat")
  );

  aside.append(toggle, nav);
  return aside;
}
