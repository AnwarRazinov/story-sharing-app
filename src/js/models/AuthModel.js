import { API_CONFIG } from "../config/api-config.js";
import ApiUtil from "../utils/api.js";

class AuthModel {
  static async register(userData) {
    try {
      console.log('Attempting registration with:', { ...userData, password: '[HIDDEN]' });
      
      const response = await ApiUtil.post(
        API_CONFIG.ENDPOINTS.REGISTER,
        userData
      );
      
      console.log('Registration response:', response);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(credentials) {
    try {
      console.log('Attempting login with:', { ...credentials, password: '[HIDDEN]' });
      console.log('Login endpoint:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`);
      
      const response = await ApiUtil.post(
        API_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );
      
      console.log('Login response:', response);
      
      if (response.loginResult) {
        console.log('Saving token and user data...');
        this.saveToken(response.loginResult.token);
        this.saveUserData(response.loginResult);
        console.log('Login successful!');
      } else {
        console.error('No loginResult in response');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static saveToken(token) {
    console.log('Saving token to localStorage');
    localStorage.setItem("token", token);
  }

  static getToken() {
    const token = localStorage.getItem("token");
    console.log('Retrieved token:', token ? '[TOKEN EXISTS]' : 'NO TOKEN');
    return token;
  }

  static saveUserData(userData) {
    console.log('Saving user data:', userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  }

  static getUserData() {
    const userData = localStorage.getItem("userData");
    const parsed = userData ? JSON.parse(userData) : null;
    console.log('Retrieved user data:', parsed);
    return parsed;
  }

  static logout() {
    console.log('Logging out...');
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.dispatchEvent(new CustomEvent("auth-changed"));
  }

  static isAuthenticated() {
    const hasToken = !!this.getToken();
    console.log('Is authenticated:', hasToken);
    return hasToken;
  }
}

export default AuthModel;