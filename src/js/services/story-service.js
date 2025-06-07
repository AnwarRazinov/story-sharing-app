import { API_CONFIG } from "../config/api-config.js";

class StoryService {
  static async getStories(options = {}) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STORIES;
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.size) params.append('size', options.size);
      if (options.location) params.append('location', options.location);
      
      const queryString = params.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
      const fullUrl = `${API_CONFIG.BASE_URL}${fullEndpoint}`;
      
      console.log('Fetching stories from:', fullUrl);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using authentication token');
      } else {
        console.log('No token found, trying without authentication');
      }
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      });
      
      console.log('Stories response status:', response.status);
      
      if (!response.ok) {
        // If 401 and we tried with auth, try without location parameter
        if (response.status === 401 && options.location) {
          console.log('401 with location parameter, trying without location...');
          return this.getStories({ 
            page: options.page, 
            size: options.size 
            // Remove location parameter
          });
        }
        
        // If still 401, try completely without auth
        if (response.status === 401 && token) {
          console.log('401 with auth, trying without authentication...');
          const noAuthResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (noAuthResponse.ok) {
            const data = await noAuthResponse.json();
            console.log('Success without auth:', data);
            return data;
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Stories data received:', data);
      console.log('Number of stories:', data.listStory?.length || 0);
      
      return data;
    } catch (error) {
      console.error("Error fetching stories:", error);
      throw error;
    }
  }

  static async getStoryDetail(id) {
    try {
      const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES}/${id}`;
      
      console.log('Fetching story detail from:', fullUrl);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      });
      
      console.log('Story detail response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Story detail data:', data);
      
      return data;
    } catch (error) {
      console.error("Error fetching story detail:", error);
      throw error;
    }
  }

  static async getStoryById(id) {
    // Alias for getStoryDetail to maintain compatibility
    return this.getStoryDetail(id);
  }

  static async addStory(storyData) {
    try {
      // This endpoint DOES require authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required to add stories');
      }

      const formData = new FormData();
      formData.append("description", storyData.description);
      formData.append("photo", storyData.photo);
      
      if (storyData.lat) {
        formData.append("lat", storyData.lat);
      }
      
      if (storyData.lon) {
        formData.append("lon", storyData.lon);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding story:", error);
      throw error;
    }
  }

  static async addStoryAsGuest(storyData) {
    try {
      const formData = new FormData();
      formData.append("description", storyData.description);
      formData.append("photo", storyData.photo);
      
      if (storyData.lat) {
        formData.append("lat", storyData.lat);
      }
      
      if (storyData.lon) {
        formData.append("lon", storyData.lon);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.STORIES_GUEST}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding guest story:", error);
      throw error;
    }
  }
}

export default StoryService;