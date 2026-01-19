export function Login() {
  return `
    <section class="login-page">
      <div class="login-card">

        <!-- Icon -->
        <div class="login-icon">
          <img 
            src="./resources/favicons/graduation-cap.svg" 
            alt="EduManage"
          />
        </div>

        <!-- Title -->
        <h2 class="login-title">Welcome to EduManage</h2>

        <!-- Tabs -->
        <div class="login-tabs">
          <a href="#/login" class="login-tab active">
            Login
          </a>
          <a href="#/signup" class="login-tab">
            Sign Up
          </a>
        </div>

        <!-- Form -->
        <form class="login-form" id="loginForm">

          <!-- Email -->
          <div class="login-field">
            <label for="email">Email</label>
            <div class="login-input-wrapper">
              <span class="login-input-icon">
                <img 
                  src="./resources/icons/mail.svg" 
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <input 
                id="email"
                type="email"
                placeholder="user@edu.com"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div class="login-field">
            <label for="password">Password</label>
            <div class="login-input-wrapper">
              <span class="login-input-icon">
                <img 
                  src="./resources/icons/lock.svg" 
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <input 
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <!-- Submit -->
          <button 
            type="submit"
            class="btn-primary login-submit"
          >
            Login
          </button>

        </form>

      </div>
    </section>
  `;
}
