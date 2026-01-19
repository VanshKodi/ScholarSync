export function FeatureCard(icon, title, description) {
  return `
    <div class="feature-card">
      <div class="feature-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
  `;
}
