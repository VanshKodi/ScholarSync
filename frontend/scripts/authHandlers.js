// frontend/scripts/authHandlers.js
import { login, signup } from "./auth.js";
import { getSession } from "./session.js";


// ✅ LOGIN HANDLER
export function attachLoginHandler() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await login(email, password);

      const session = getSession();
      if (!session) {
        throw new Error("Login succeeded but session missing");
      }

      window.location.hash = "#/dashboard";
    } catch (err) {
      alert(err.message || "Login failed");
    }
  });
}


// ✅ SIGNUP HANDLER
export function attachSignupHandler() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;

    const roleInput = document.querySelector("input[name='role']:checked");
    const requestedRole = roleInput?.value;

    if (!requestedRole) {
      alert("Please select a user type.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Create auth user
      await signup(email, password);

      // Login immediately
      await login(email, password);

      const session = getSession();
      if (!session) {
        throw new Error("Session not available after signup");
      }

      // Initialize profile in backend
      await fetch("http://localhost:8000/auth/init-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          requested_role: requestedRole
        })
      });

      window.location.hash = "#/dashboard";

    } catch (err) {
      alert(err.message || "Signup failed");
    }
  });
}
