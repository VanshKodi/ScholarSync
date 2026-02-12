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
  features.className = "features";

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