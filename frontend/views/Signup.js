export function Signup() {
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
        <h2 class="login-title">Create your account</h2>

        <!-- Tabs -->
        <div class="login-tabs">
          <a href="#/login" class="login-tab">
            Login
          </a>
          <a href="#/signup" class="login-tab active">
            Sign Up
          </a>
        </div>

        <!-- Form -->
        <form class="login-form" id="signupForm">

          <!-- Email -->
          <div class="login-field">
            <label for="signup-email">Email</label>
            <div class="login-input-wrapper">
              <span class="login-input-icon">
                <img src="./resources/icons/mail.svg" alt="" aria-hidden="true" />
              </span>
              <input 
                id="signup-email"
                type="email"
                placeholder="user@edu.com"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div class="login-field">
            <label for="signup-password">Password</label>
            <div class="login-input-wrapper">
              <span class="login-input-icon">
                <img src="./resources/icons/lock.svg" alt="" aria-hidden="true" />
              </span>
              <input 
                id="signup-password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="login-field">
            <label for="signup-confirm">Confirm Password</label>
            <div class="login-input-wrapper">
              <span class="login-input-icon">
                <img src="./resources/icons/lock.svg" alt="" aria-hidden="true" />
              </span>
              <input 
                id="signup-confirm"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <!-- Role Selection -->
          <div class="login-field">
            <label>User Type</label>
            <div class="signup-roles">


              <label class="signup-role">
                <input type="radio" name="role" value="faculty" />
                <span>Faculty</span>
              </label>

              <label class="signup-role">
                <input type="radio" name="role" value="admin" />
                <span>Admin</span>
              </label>

            </div>
          </div>

          <!-- Submit -->
          <button 
            type="submit"
            class="btn-primary login-submit"
          >
            Create Account
          </button>

        </form>

      </div>
    </section>
  `;
}
