import { API_CONFIG } from "../config/api-config.js";
import AuthModel from "../models/AuthModel.js";

class ApiUtil {
  static async request(endpoint, options = {}) {
    const token = AuthModel.getToken();
    const headers = {
      ...options.headers,
    };

    if (token && !options.skipAuth) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  static get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      ...options,
    });
  }

  static post(endpoint, body, headers = {}) {
    return this.request(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  static postFormData(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: formData,
      ...options,
    });
  }

  static delete(endpoint, body = null, headers = {}) {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return this.request(endpoint, options);
  }
}

export default ApiUtil;