class OfflinePage {
    render() {
      return `
        <div class="offline-page">
          <div class="container">
            <header class="page-header">
              <h1>📱 Offline Storage</h1>
              <p>Manage your saved stories</p>
            </header>
  
            <div class="offline-content">
              <div class="storage-section">
                <h2>Favorite Stories</h2>
                <div id="favorites-list" class="stories-grid">
                  <div class="loading">Loading favorites...</div>
                </div>
                <div class="actions">
                  <button id="clear-favorites" class="btn-secondary">Clear All Favorites</button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <style>
          .offline-page {
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
          }
  
          .page-header {
            text-align: center;
            margin-bottom: 30px;
          }
  
          .page-header h1 {
            margin: 0 0 10px 0;
            font-size: 2rem;
          }
  
          .storage-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
  
          .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
  
          .story-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: #f9f9f9;
          }
  
          .story-card img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
          }
  
          .story-card h3 {
            margin: 0 0 8px 0;
            font-size: 1.1rem;
          }
  
          .story-card p {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9rem;
          }
  
          .story-actions {
            display: flex;
            gap: 8px;
          }
  
          .btn-small {
            padding: 5px 10px;
            font-size: 0.8rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
  
          .btn-view {
            background: #2196F3;
            color: white;
          }
  
          .btn-remove {
            background: #f44336;
            color: white;
          }
  
          .btn-secondary {
            background: #666;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
  
          .loading, .empty-state {
            text-align: center;
            padding: 40px;
            color: #666;
            grid-column: 1 / -1;
          }
  
          .actions {
            text-align: center;
            margin-top: 20px;
          }
        </style>
      `;
    }
  }
  
  export default OfflinePage;