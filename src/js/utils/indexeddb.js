class SimpleIndexedDB {
    constructor() {
      this.dbName = 'StoryApp';
      this.version = 1;
      this.db = null;
    }
  
    async init() {
      if (this.db) return this.db;
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
  
        request.onsuccess = () => {
          this.db = request.result;
          console.log('IndexedDB initialized');
          resolve(this.db);
        };
  
        request.onerror = () => reject(request.error);
  
        request.onupgradeneeded = (event) => {
          this.db = event.target.result;
          
          // Simple favorites store
          if (!this.db.objectStoreNames.contains('favorites')) {
            this.db.createObjectStore('favorites', { keyPath: 'id' });
          }
        };
      });
    }
  
    async addFavorite(story) {
      await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        const request = store.put({ ...story, savedAt: Date.now() });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    async removeFavorite(id) {
      await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    async getFavorites() {
      await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
  
    async isFavorite(id) {
      await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        const request = store.get(id);
        
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => reject(request.error);
      });
    }
  
    async clearAll() {
      await this.init();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
  
  export default new SimpleIndexedDB();