import { FeatureCard } from "../components/FeatureCard.js";

export function Landing() {
  return `
    <section class="hero">
      <h1>Welcome to ScholarSync</h1>
      <p>
        Your ultimate academic management platform for seamless learning
        experiences.
      </p>
      <button class="btn-primary btn-large">Explore Features</button>
    </section>

    <section class="features">
      ${FeatureCard(
        "📅",
        "Schedules",
        "Manage your academic timetable effortlessly with our scheduling tools."
      )}
      ${FeatureCard(
        "👥",
        "Attendance",
        "Keep track of attendance efficiently with our comprehensive tracking features."
      )}
      ${FeatureCard(
        "🤖",
        "AI Tools",
        "Leverage AI to enhance learning and administrative processes efficiently."
      )}
    </section>

    <footer class="footer">
      © 2023 ScholarSync. All rights reserved.
    </footer>
  `;
}
