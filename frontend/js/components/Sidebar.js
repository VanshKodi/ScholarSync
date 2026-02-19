export default function Sidebar({ onSelect }) {
  const aside = document.createElement("aside");
  aside.className = "sidebar expanded";

  const toggle = document.createElement("button");
  toggle.className = "sidebar-toggle";
  toggle.innerHTML = "☰";

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
    item("📊", "Overview", "overview"),

    section("Documents"),
    item("🗎", "All Docs", "documents"),

    section("Academic"),
    item("👤", "Attendance", "attendance"),
    item("⚙️", "Grade", "grade"),
    item("⚙️", "CLO", "clo"),

    section("Administration"),
    item("📋", "Join Requests", "join-requests"),

    section("Misc"),
    item("👤", "TA-Allotment", "ta"),
    item("⚙️", "Innovative Learning", "innovative"),

    section("ChatBot"),
    item("🤖", "Chat with ScholarSync", "chat")
  );

  aside.append(toggle, nav);
  return aside;
}