// Login CSS - hardcoded directly in component
const loginCSS = `
  .login-page {
    height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f6f8fc;
  }
  .login-card {
    background: #fff;
    padding: 32px;
    border-radius: 12px;
    width: 360px;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  }
  .login-card h2 {
    margin-bottom: 8px;
  }
  .login-card p {
    color: #64748b;
    margin-bottom: 24px;
  }
  .google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: white;
    font-size: 0.95rem;
    cursor: pointer;
  }
  .google-btn:hover {
    background: #f9fafb;
  }
  .google-btn img {
    width: 18px;
    height: 18px;
  }
`;

// Inject styles once
if (!document.getElementById('login-styles')) {
  const style = document.createElement('style');
  style.id = 'login-styles';
  style.textContent = loginCSS;
  document.head.appendChild(style);
}

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