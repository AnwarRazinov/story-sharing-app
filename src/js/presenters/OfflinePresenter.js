import SimpleIndexedDB from '../utils/indexeddb.js';

class OfflinePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    try {
      await this.loadFavorites();
      this.attachEventListeners();
    } catch (error) {
      console.error('Error initializing offline page:', error);
    }
  }

  attachEventListeners() {
    document.getElementById('clear-favorites')?.addEventListener('click', () => {
      this.clearFavorites();
    });
  }

  async loadFavorites() {
    const container = document.getElementById('favorites-list');
    if (!container) return;

    try {
      const favorites = await SimpleIndexedDB.getFavorites();
      
      if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-state">No favorite stories saved yet.</div>';
        return;
      }

      container.innerHTML = favorites.map(story => this.createStoryCard(story)).join('');
      this.attachCardListeners();
    } catch (error) {
      container.innerHTML = '<div class="empty-state">Error loading favorites.</div>';
    }
  }

  createStoryCard(story) {
    return `
      <div class="story-card">
        <img src="${story.photoUrl}" alt="${story.description}" loading="lazy">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <div class="story-actions">
          <button class="btn-small btn-view" data-action="view" data-id="${story.id}">View</button>
          <button class="btn-small btn-remove" data-action="remove" data-id="${story.id}">Remove</button>
        </div>
      </div>
    `;
  }

  attachCardListeners() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        const id = e.target.dataset.id;

        if (action === 'view') {
          window.history.pushState({}, '', `/story/${id}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else if (action === 'remove') {
          await this.removeFavorite(id);
        }
      });
    });
  }

  async removeFavorite(id) {
    try {
      await SimpleIndexedDB.removeFavorite(id);
      await this.loadFavorites();
      this.showMessage('Removed from favorites');
    } catch (error) {
      this.showMessage('Failed to remove favorite');
    }
  }

  async clearFavorites() {
    if (!confirm('Clear all favorites?')) return;

    try {
      await SimpleIndexedDB.clearAll();
      await this.loadFavorites();
      this.showMessage('All favorites cleared');
    } catch (error) {
      this.showMessage('Failed to clear favorites');
    }
  }

  showMessage(text) {
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed; top: 20px; right: 20px; 
      background: #4CAF50; color: white; padding: 10px 15px; 
      border-radius: 4px; z-index: 1000;
    `;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  }
}

export default OfflinePresenter;