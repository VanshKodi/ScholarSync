export function Navbar() {
  return `
    <header class="navbar">
      <div class="navbar-left">
      <a href="#/"><img
          src="./resources/favicons/graduation-cap.svg"
          class="navbar-logo"
          alt="ScholarSync"
        />
        <span class="navbar-title">ScholarSync</span>
      </a>
        </div>

      <a href="#/login" class="btn-primary">Get Started</a>
    </header>
  `;
}
