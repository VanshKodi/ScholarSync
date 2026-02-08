// js/views/Login.js
import { loginWithGoogle } from "../utils/auth.js";

export default function Login({ root }) {
  root.innerHTML = "";

  const page = document.createElement("div");
  page.className = "login-page";

  const card = document.createElement("div");
  card.className = "login-card";

  const title = document.createElement("h2");
  title.textContent = "Welcome to ScholarSync";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Sign in to continue";

  const googleBtn = document.createElement("button");
  googleBtn.className = "google-btn";
  googleBtn.innerHTML = `
    <img src="../resources/images/google-icon.png" alt="Google" />
    Continue with Google
  `;

  googleBtn.addEventListener("click", async () => {
    await loginWithGoogle();
    // Supabase handles redirect + session
  });

  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(googleBtn);
  page.appendChild(card);
  root.appendChild(page);
}