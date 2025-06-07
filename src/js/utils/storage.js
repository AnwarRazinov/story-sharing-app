class StorageUtil {
    static setToken(token) {
      localStorage.setItem('auth_token', token);
    }
  
    static getToken() {
      return localStorage.getItem('auth_token');
    }
  
    static removeToken() {
      localStorage.removeItem('auth_token');
    }
  
    static setUser(user) {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  
    static getUser() {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
  
    static removeUser() {
      localStorage.removeItem('user_data');
    }
  
    static clear() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }
  
  export default StorageUtil;