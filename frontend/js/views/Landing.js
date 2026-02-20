// Landing CSS - hardcoded directly in component
const landingCSS = `
  .landing {
    background: #f6f8fc;
    min-height: calc(100vh - 64px);
  }
  .landing-hero {
    padding: 96px 32px;
    text-align: center;
    background: #ffffff;
  }
  .landing-hero h1 {
    font-size: 2.4rem;
    margin-bottom: 12px;
  }
  .landing-hero p {
    color: #475569;
    margin-bottom: 24px;
  }
  .landing-hero-btn {
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    background: #5b6cff;
    color: white;
    cursor: pointer;
  }
  .landing-features {
    padding: 64px 32px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .landing-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    text-align: center;
  }
  .landing-card img {
    max-width: 100%;
    height: auto;
    margin-bottom: 12px;
  }
  .landing-card h3 {
    margin-bottom: 8px;
    color: #1f2937;
  }
  .landing-card p {
    color: #64748b;
    font-size: 0.95rem;
  }
`;

// Inject styles once
if (!document.getElementById('landing-styles')) {
  const style = document.createElement('style');
  style.id = 'landing-styles';
  style.textContent = landingCSS;
  document.head.appendChild(style);
}

import Navbar from "../components/Navbar.js";

function card(imgpath, title, description) {
  const card = document.createElement("div");
  card.className = "landing-card";

  const img = document.createElement("img");
  img.src = imgpath;
  img.alt = title;

  const h3 = document.createElement("h3");
  h3.textContent = title;

  const p = document.createElement("p");
  p.textContent = description;

  card.appendChild(img);
  card.appendChild(h3);
  card.appendChild(p);

  return card;
}

export default function Landing({ root }) {
  root.innerHTML = "";

  // Navbar
  const navbar = Navbar();

  // Main container
  const main = document.createElement("main");
  main.className = "landing";

  // Hero section
  const hero = document.createElement("section");
  hero.className = "landing-hero";

  const heroTitle = document.createElement("h1");
  heroTitle.textContent = "Welcome to ScholarSync";

  const heroDesc = document.createElement("p");
  heroDesc.textContent =
    "Your ultimate academic management platform for seamless learning experiences.";

  const heroBtn = document.createElement("button");
  heroBtn.className = "landing-hero-btn";
  heroBtn.id = "exploreBtn";
  heroBtn.textContent = "Explore Features";

  hero.appendChild(heroTitle);
  hero.appendChild(heroDesc);
  hero.appendChild(heroBtn);

  // Features section
  const features = document.createElement("section");
  features.className = "landing-features";

  features.appendChild(
    card("./resources/images/schedule.png", "Schedules", "Manage your academic timetable effortlessly.")
  );
  features.appendChild(
    card("./resources/images/attendance.png", "Attendance", "Track attendance efficiently.")
  );
  features.appendChild(
    card("./resources/images/ai-tools.png", "AI Tools", "Enhance learning with intelligent tools.")
  );

  // Assemble page
  main.appendChild(hero);
  main.appendChild(features);

  root.appendChild(navbar);
  root.appendChild(main);

  // Events
  heroBtn.addEventListener("click", () => {
    // Placeholder navigation for now
    window.location.hash = "#features";
  });
}