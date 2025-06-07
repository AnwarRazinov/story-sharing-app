import AuthService from "../services/auth-service.js";
import Router from "../router.js";

class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  init() {
    const form = document.getElementById("register-form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
      console.log('Register form initialized');
    } else {
      console.error('Register form not found');
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    console.log('Register form submitted');

    // Clear previous errors
    this.view.clearError("name-error");
    this.view.clearError("email-error");
    this.view.clearError("password-error");
    this.view.clearError("form-error");

    // Get form values with null checks
    const nameElement = document.getElementById("name");
    const emailElement = document.getElementById("email");
    const passwordElement = document.getElementById("password");

    if (!nameElement || !emailElement || !passwordElement) {
      console.error('Form elements not found');
      this.view.showError("form-error", "Form elements not found. Please try again.");
      return;
    }

    const name = nameElement.value.trim();
    const email = emailElement.value.trim();
    const password = passwordElement.value;

    console.log(`Registration attempt - Name: ${name}, Email: ${email}, Password length: ${password.length}`);

    // Validate
    let hasError = false;

    if (!name) {
      this.view.showError("name-error", "Name is required");
      hasError = true;
    }

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
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, attempting registration...');

    try {
      this.view.setLoadingState(true);
      
      const response = await AuthService.register(name, email, password);
      
      console.log('Registration successful:', response);
      
      // Show success message
      this.view.showSuccess("Registration successful! Please login with your new account.");
      
      // Navigate to login after a short delay
      setTimeout(() => {
        Router.navigateTo("/login");
      }, 2000);
      
    } catch (error) {
      console.error('Registration failed:', error);
      this.view.showError(
        "form-error",
        error.message || "Registration failed. Please try again."
      );
    } finally {
      this.view.setLoadingState(false);
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default RegisterPresenter;