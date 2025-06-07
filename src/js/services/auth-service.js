import AuthModel from "../models/AuthModel.js";

class AuthService {
  static async register(name, email, password) {
    try {
      const userData = { name, email, password };
      const response = await AuthModel.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async login(email, password) {
    try {
      console.log('AuthService.login called with:', email);
      
      const credentials = { email, password };
      const response = await AuthModel.login(credentials);
      
      console.log('AuthService.login response:', response);
      
      // Simpan token dan data user
      AuthModel.saveToken(response.loginResult.token);
      AuthModel.saveUserData(response.loginResult);
      
      // Trigger auth change event
      window.dispatchEvent(new CustomEvent('auth-changed'));
      
      return response;
    } catch (error) {
      console.error('AuthService.login error:', error);
      throw error;
    }
  }
  
  static logout() {
    console.log('AuthService.logout called');
    AuthModel.logout();
    window.dispatchEvent(new CustomEvent('auth-changed'));
  }

  static isAuthenticated() {
    const result = AuthModel.isAuthenticated();
    console.log('AuthService.isAuthenticated:', result);
    return result;
  }

  static getToken() {
    return AuthModel.getToken();
  }

  static getUserData() {
    return AuthModel.getUserData();
  }

  // Add this method that Navigation is looking for
  static getCurrentUser() {
    return AuthModel.getUserData();
  }
}

// Make sure we're exporting correctly
export default AuthService;