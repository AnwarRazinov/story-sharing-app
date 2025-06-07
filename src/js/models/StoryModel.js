import { API_CONFIG } from "../config/api-config";
import ApiUtil from "../utils/api";

class StoryModel {
  static async getAllStories(page = 1, size = 10, location = 1) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        location: location.toString(),
      });

      const response = await ApiUtil.get(
        `${API_CONFIG.ENDPOINTS.STORIES}?${params}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async getStoryDetail(id) {
    try {
      const response = await ApiUtil.get(API_CONFIG.ENDPOINTS.STORY_DETAIL(id));
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async addStory(storyData) {
    try {
      const formData = new FormData();
      formData.append("description", storyData.description);
      formData.append("photo", storyData.photo);

      if (storyData.lat) formData.append("lat", storyData.lat);
      if (storyData.lon) formData.append("lon", storyData.lon);

      const response = await ApiUtil.postFormData(
        API_CONFIG.ENDPOINTS.STORIES,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async addGuestStory(storyData) {
    try {
      const formData = new FormData();
      formData.append("description", storyData.description);
      formData.append("photo", storyData.photo);

      if (storyData.lat) formData.append("lat", storyData.lat);
      if (storyData.lon) formData.append("lon", storyData.lon);

      const response = await ApiUtil.postFormData(
        API_CONFIG.ENDPOINTS.STORIES_GUEST,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default StoryModel;
