// frontend/views/Signup.js
export function Signup() {
  return `
    <section class="login-page">
      <form id="signupForm">
        <input id="signup-email" type="email" required />
        <input id="signup-password" type="password" required />
        <input id="signup-confirm" type="password" required />

        <label>
          <input type="radio" name="role" value="faculty" /> Faculty
        </label>
        <label>
          <input type="radio" name="role" value="admin" /> Admin
        </label>

        <button type="submit">Create Account</button>
      </form>
    </section>
  `;
}
