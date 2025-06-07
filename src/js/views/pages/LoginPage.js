class LoginPage {
  render() {
    return `
      <section class="auth-page">
        <div class="auth-container">
          <header class="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to share your stories</p>
          </header>

          <form id="login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-control"
                placeholder="Enter your email"
                required
                aria-required="true"
                aria-describedby="email-error"
                autocomplete="email"
              >
              <div id="email-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-control"
                placeholder="Enter your password"
                required
                aria-required="true"
                aria-describedby="password-error"
                autocomplete="current-password"
                minlength="8"
              >
              <div id="password-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div id="form-error" class="error-message" role="alert" aria-live="polite"></div>

            <button type="submit" class="btn btn-primary btn-block" id="login-button">
              Login
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a href="/register" data-route="/register">Register here</a></p>
          </div>
        </div>
      </section>
    `;
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }
  }

  setLoadingState(isLoading) {
    const loginButton = document.getElementById("login-button");
    const form = document.getElementById("login-form");

    if (loginButton) {
      loginButton.disabled = isLoading;
      loginButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Logging in...'
        : "Login";
    }

    if (form) {
      form.setAttribute("aria-busy", isLoading.toString());
    }
  }
}

export default LoginPage;