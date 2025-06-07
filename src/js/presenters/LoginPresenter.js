import AuthService from "../services/auth-service.js";
import Router from "../router.js";

class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  init() {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.showDebugInfo("🔄 Login form initialized");
  }

  async handleSubmit(event) {
    event.preventDefault();

    this.showDebugInfo("🔄 Login form submitted");

    // Clear previous errors
    this.view.clearError("email-error");
    this.view.clearError("password-error");
    this.view.clearError("form-error");

    // Get form values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    this.showDebugInfo(`📧 Email: ${email}`);
    this.showDebugInfo(`🔑 Password length: ${password.length}`);

    // Validate
    let hasError = false;

    if (!email) {
      this.view.showError("email-error", "Email is required");
      hasError = true;
    } else if (!this.isValidEmail(email)) {
      this.view.showError("email-error", "Please enter a valid email address");
      hasError = true;
    }

    if (!password) {
      this.view.showError("password-error", "Password is required");
      hasError = true;
    } else if (password.length < 8) {
      this.view.showError(
        "password-error",
        "Password must be at least 8 characters"
      );
      hasError = true;
    }

    if (hasError) {
      this.showDebugInfo("❌ Validation failed");
      return;
    }

    this.showDebugInfo("✅ Validation passed");

    try {
      this.view.setLoadingState(true);
      this.showDebugInfo("🔄 Calling AuthService.login...");
      
      const response = await AuthService.login(email, password);
      
      this.showDebugInfo("✅ Login successful!");
      this.showDebugInfo(`📝 Response: ${JSON.stringify(response).substring(0, 100)}...`);
      
      Router.navigateTo("/");
    } catch (error) {
      this.showDebugInfo(`❌ Login failed: ${error.message}`);
      this.view.showError(
        "form-error",
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      this.view.setLoadingState(false);
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showDebugInfo(message) {
    // Create or update debug panel
    let debugPanel = document.getElementById('debug-panel');
    if (!debugPanel) {
      debugPanel = document.createElement('div');
      debugPanel.id = 'debug-panel';
      debugPanel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 10px;
        width: 300px;
        max-height: 400px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 1000;
        overflow-y: auto;
        font-family: monospace;
      `;
      document.body.appendChild(debugPanel);
    }
    
    const timestamp = new Date().toLocaleTimeString();
    const debugLine = document.createElement('div');
    debugLine.textContent = `[${timestamp}] ${message}`;
    debugPanel.appendChild(debugLine);
    
    // Keep only last 20 messages
    while (debugPanel.children.length > 20) {
      debugPanel.removeChild(debugPanel.firstChild);
    }
    
    // Scroll to bottom
    debugPanel.scrollTop = debugPanel.scrollHeight;
  }
}

export default LoginPresenter;