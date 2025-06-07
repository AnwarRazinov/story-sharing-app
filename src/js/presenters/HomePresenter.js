import StoryService from "../services/story-service.js";
import MapComponent from "../views/components/MapComponent.js";
import AuthService from "../services/auth-service.js";

class HomePresenter {
  constructor(view) {
    this.view = view;
    this.currentPage = 1;
    this.pageSize = 10;
    this.isLoading = false;
    this.hasMoreStories = true;
    this.mapComponent = null;
    this.pendingMarkers = [];
  }

  async init() {
    try {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        console.log('User not authenticated, showing login prompt');
        this.showLoginPrompt();
        return;
      }

      console.log('User authenticated, loading stories...');
      
      // Initialize skeletons first
      this.view.renderSkeletons();
      
      // Clean up any existing map and initialize new one
      await this.initializeMap();
      
      // Load initial stories after map is ready
      await this.loadStories();
      
      // Attach event listeners
      this.attachEventListeners();
    } catch (error) {
      console.error('Error initializing home page:', error);
      this.view.showError('Failed to load stories. Please try again later.');
    }
  }

  async initializeMap() {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Clean up any existing map first
          if (this.mapComponent) {
            this.mapComponent.cleanup();
            this.mapComponent = null;
          }

          // Also clean up the container statically
          MapComponent.cleanupContainer('stories-map');

          const mapContainer = document.getElementById('stories-map');
          if (!mapContainer) {
            console.warn('Map container not found, will retry...');
            // Retry after another delay
            setTimeout(() => {
              try {
                MapComponent.cleanupContainer('stories-map');
                this.mapComponent = new MapComponent('stories-map', {
                  center: [-6.2, 106.816666],
                  zoom: 5
                });
                this.mapComponent.init();
                console.log('✅ Map initialized successfully (retry)');
                this.addPendingMarkers();
                resolve();
              } catch (error) {
                console.error('❌ Error initializing map (retry):', error);
                resolve(); // Continue without map
              }
            }, 500);
            return;
          }

          this.mapComponent = new MapComponent('stories-map', {
            center: [-6.2, 106.816666],
            zoom: 5
          });
          this.mapComponent.init();
          console.log('✅ Map initialized successfully');
          
          // Add any pending markers
          this.addPendingMarkers();
          
          resolve();
        } catch (error) {
          console.error('❌ Error initializing map:', error);
          // Try to clean up and continue without map
          MapComponent.cleanupContainer('stories-map');
          resolve();
        }
      }, 300);
    });
  }

  addPendingMarkers() {
    if (this.pendingMarkers.length > 0 && this.mapComponent) {
      console.log(`🗺️ Adding ${this.pendingMarkers.length} pending markers...`);
      
      this.pendingMarkers.forEach((marker, index) => {
        try {
          const result = this.mapComponent.addMarker(marker.lat, marker.lon, marker.popup);
          if (result) {
            console.log(`  ✅ Added pending marker ${index + 1}: ${marker.name}`);
          }
        } catch (error) {
          console.error(`  ❌ Failed to add pending marker ${index + 1}:`, error);
        }
      });
      
      this.pendingMarkers = []; // Clear pending markers
    }
  }

  showLoginPrompt() {
    const storiesList = document.getElementById("stories-list");
    if (storiesList) {
      storiesList.innerHTML = `
        <div class="auth-required" style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px 0;">
          <div style="font-size: 4rem; margin-bottom: 20px;">🔐</div>
          <h2 style="color: #333; margin-bottom: 15px;">Authentication Required</h2>
          <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
            The Dicoding Story API requires you to be logged in to view stories.<br>
            Please log in or create an account to continue.
          </p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <a href="/login" data-route="/login" class="btn btn-primary" style="padding: 12px 24px; text-decoration: none; background: #2196F3; color: white; border-radius: 6px; font-weight: 500;">
              🔑 Login
            </a>
            <a href="/register" data-route="/register" class="btn btn-secondary" style="padding: 12px 24px; text-decoration: none; background: #666; color: white; border-radius: 6px; font-weight: 500;">
              📝 Register
            </a>
          </div>
        </div>
      `;

      // Add click handlers for the buttons
      document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const route = e.target.getAttribute('data-route');
          window.history.pushState({}, '', route);
          window.dispatchEvent(new PopStateEvent('popstate'));
        });
      });
    }
  }

  attachEventListeners() {
    const loadMoreBtn = document.getElementById("load-more");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => this.loadMoreStories());
    }
  }

  async loadStories() {
    if (this.isLoading) return;
    
    try {
      this.isLoading = true;
      this.view.setLoadingState(true);
      
      console.log(`🔄 Fetching stories page ${this.currentPage}...`);
      
      const response = await StoryService.getStories({
        page: this.currentPage,
        size: this.pageSize,
        location: 1
      });
      
      console.log(`✅ Got response with ${response.listStory?.length || 0} stories`);
      
      if (response && response.listStory) {
        if (this.currentPage === 1) {
          this.view.displayStories(response.listStory);
        } else {
          this.view.appendStories(response.listStory);
        }
        
        // Add markers to map
        console.log('🗺️ Processing story locations...');
        let storiesWithLocation = 0;
        
        response.listStory.forEach((story, index) => {
          if (story.lat && story.lon) {
            storiesWithLocation++;
            const markerData = {
              lat: story.lat,
              lon: story.lon,
              popup: `<b>${story.name}</b><br>${story.description.substring(0, 50)}...`,
              name: story.name
            };
            
            if (this.mapComponent && this.mapComponent.map) {
              try {
                const result = this.mapComponent.addMarker(markerData.lat, markerData.lon, markerData.popup);
                if (result) {
                  console.log(`  ✅ Added marker ${index + 1}: ${story.name} at ${story.lat}, ${story.lon}`);
                } else {
                  console.log(`  ⚠️ Failed to add marker for ${story.name} - will queue for later`);
                  this.pendingMarkers.push(markerData);
                }
              } catch (error) {
                console.error(`  ❌ Failed to add marker for ${story.name}:`, error);
                this.pendingMarkers.push(markerData);
              }
            } else {
              // Map not ready yet, store for later
              this.pendingMarkers.push(markerData);
              console.log(`  ⏳ Queued marker ${index + 1}: ${story.name}`);
            }
          }
        });
        
        console.log(`📍 Total stories with location: ${storiesWithLocation} out of ${response.listStory.length}`);
        console.log(`📍 Pending markers: ${this.pendingMarkers.length}`);
        
        this.hasMoreStories = response.listStory.length === this.pageSize;
        this.view.showLoadMoreButton(this.hasMoreStories);
        
        console.log('✅ Stories loaded successfully');
      } else {
        console.log('⚠️ No stories in response');
        this.view.displayStories([]);
      }
    } catch (error) {
      console.error('❌ Failed to load stories:', error);
      
      // If 401 error, likely token expired
      if (error.message.includes('401')) {
        console.log('401 error - token may be expired, showing login prompt');
        AuthService.logout(); // Clear invalid token
        this.showLoginPrompt();
      } else {
        this.view.showError('Failed to load stories. Please try again.');
      }
    } finally {
      this.isLoading = false;
      this.view.setLoadingState(false);
    }
  }

  async loadMoreStories() {
    if (!this.hasMoreStories || this.isLoading) return;

    this.currentPage++;
    await this.loadStories();
  }

  // Cleanup method to be called when leaving the page
  cleanup() {
    if (this.mapComponent) {
      this.mapComponent.cleanup();
      this.mapComponent = null;
    }
    this.pendingMarkers = [];
  }
}

export default HomePresenter;