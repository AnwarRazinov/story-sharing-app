class RegisterPage {
  render() {
    return `
      <section class="auth-page">
        <div class="auth-container">
          <header class="auth-header">
            <h1>Join Dicoding Story</h1>
            <p>Create an account to start sharing your stories</p>
          </header>

          <form id="register-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-control"
                placeholder="Enter your full name"
                required
                aria-required="true"
                aria-describedby="name-error"
                autocomplete="name"
              >
              <div id="name-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

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
                placeholder="Enter your password (min. 8 characters)"
                required
                aria-required="true"
                aria-describedby="password-error"
                autocomplete="new-password"
                minlength="8"
              >
              <div id="password-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>

            <div id="form-error" class="error-message" role="alert" aria-live="polite"></div>

            <button type="submit" class="btn btn-primary btn-block" id="register-button">
              Register
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a href="/login" data-route="/login">Login here</a></p>
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
    const registerButton = document.getElementById("register-button");
    const form = document.getElementById("register-form");

    if (registerButton) {
      registerButton.disabled = isLoading;
      registerButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Creating account...'
        : "Register";
    }

    if (form) {
      form.setAttribute("aria-busy", isLoading.toString());
    }
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
      background: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      text-align: center;
    `;
    successDiv.textContent = message;

    const form = document.getElementById('register-form');
    if (form) {
      form.parentNode.insertBefore(successDiv, form);
    }
  }
}

export default RegisterPage;