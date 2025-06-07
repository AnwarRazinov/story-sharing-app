import StoryService from "../services/story-service.js";
import SimpleIndexedDB from "../utils/indexeddb.js";

class DetailStoryPresenter {
  constructor(view) {
    this.view = view;
    this.currentStory = null;
  }

  async init(storyId) {
    try {
      const response = await StoryService.getStoryDetail(storyId);
      if (response.story) {
        this.currentStory = response.story;
        this.view.displayStory(response.story);
        await this.addFavoriteButton(response.story);
      }
    } catch (error) {
      this.view.showError("Story not found or failed to load.");
      console.error("Error loading story detail:", error);
    }
  }

  async addFavoriteButton(story) {
    // Wait a bit for the DOM to be ready
    setTimeout(async () => {
      try {
        const container = document.querySelector('.story-detail') || document.querySelector('.container');
        if (!container) return;

        // Check if button already exists
        if (document.getElementById('favorite-btn')) return;

        const isFav = await SimpleIndexedDB.isFavorite(story.id);
        
        const favBtn = document.createElement('button');
        favBtn.id = 'favorite-btn';
        favBtn.innerHTML = isFav ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
        favBtn.style.cssText = `
          background: ${isFav ? '#f44336' : '#4CAF50'}; 
          color: white; 
          padding: 12px 20px; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          margin: 15px 0;
          font-size: 16px;
          display: block;
          width: 100%;
          max-width: 300px;
        `;
        
        favBtn.addEventListener('click', async () => {
          await this.toggleFavorite(story, favBtn);
        });
        
        container.appendChild(favBtn);
      } catch (error) {
        console.error('Error adding favorite button:', error);
      }
    }, 100);
  }

  async toggleFavorite(story, button) {
    try {
      const isFav = await SimpleIndexedDB.isFavorite(story.id);
      
      if (isFav) {
        await SimpleIndexedDB.removeFavorite(story.id);
        button.innerHTML = '🤍 Add to Favorites';
        button.style.background = '#4CAF50';
        this.showMessage('Removed from favorites');
      } else {
        await SimpleIndexedDB.addFavorite(story);
        button.innerHTML = '❤️ Remove from Favorites';
        button.style.background = '#f44336';
        this.showMessage('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      this.showMessage('Error updating favorites');
    }
  }

  showMessage(text) {
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #4CAF50; 
      color: white; 
      padding: 12px 20px; 
      border-radius: 6px; 
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    msg.textContent = text;
    document.body.appendChild(msg);
    
    setTimeout(() => {
      if (msg.parentNode) {
        msg.parentNode.removeChild(msg);
      }
    }, 2000);
  }
}

export default DetailStoryPresenter;