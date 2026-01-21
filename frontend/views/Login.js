export function Login() {
  return `
    <section class="login-page">
      <div class="login-card">

        <div class="login-icon">
          <img 
            src="./resources/favicons/graduation-cap.svg" 
            alt="EduManage"
          />
        </div>

        <h2 class="login-title">Welcome to EduManage</h2>

        <div class="login-tabs">
          <a href="#/login" class="login-tab active">Login</a>
          <a href="#/signup" class="login-tab">Sign Up</a>
        </div>

        <form class="login-form" id="loginForm">

          <div class="login-field">
            <label for="email">Email</label>
            <div class="login-input-wrapper">
              <span class="login-input-icon">
                <img src="./resources/icons/mail.svg" alt="" />
              </span>
              <input id="email" type="email" required placeholder="user@edu.com" />
            </div>
          </div>

          <div class="login-field">
            <label for="password">Password</label>
            <div class="login-input-wrapper">
              <span class="login-input-icon">
                <img src="./resources/icons/lock.svg" alt="" />
              </span>
              <input id="password" type="password" required placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" class="btn-primary login-submit">
            Login
          </button>

        </form>
      </div>
    </section>
  `;
}
