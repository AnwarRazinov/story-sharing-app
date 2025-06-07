class MapComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      center: options.center || [0, 0],
      zoom: options.zoom || 10,
      ...options
    };
    this.map = null;
    this.markers = [];
  }

  init() {
    try {
      const container = document.getElementById(this.containerId);
      if (!container) {
        throw new Error(`Map container with ID '${this.containerId}' not found`);
      }

      // Check if container already has a map and clean it up
      if (container._leaflet_id) {
        console.log('Map container already initialized, cleaning up...');
        this.cleanup();
      }

      // Clear any existing content
      container.innerHTML = '';
      
      // Remove any Leaflet-specific attributes
      container.removeAttribute('data-leaflet-id');
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      // Initialize the new map
      this.map = L.map(this.containerId).setView(this.options.center, this.options.zoom);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      console.log(`✅ Map initialized successfully for container: ${this.containerId}`);
      return this.map;
    } catch (error) {
      console.error(`❌ Error initializing map for ${this.containerId}:`, error);
      throw error;
    }
  }

  addMarker(lat, lon, popupContent = '') {
    if (!this.map) {
      console.warn('⚠️ Map not initialized, cannot add marker');
      return null;
    }

    try {
      const marker = L.marker([lat, lon]).addTo(this.map);
      
      if (popupContent) {
        marker.bindPopup(popupContent);
      }

      this.markers.push(marker);
      return marker;
    } catch (error) {
      console.error('❌ Error adding marker:', error);
      return null;
    }
  }

  removeMarker(marker) {
    if (!this.map || !marker) return;

    try {
      this.map.removeLayer(marker);
      const index = this.markers.indexOf(marker);
      if (index > -1) {
        this.markers.splice(index, 1);
      }
    } catch (error) {
      console.error('❌ Error removing marker:', error);
    }
  }

  clearMarkers() {
    if (!this.map) return;

    try {
      this.markers.forEach(marker => {
        this.map.removeLayer(marker);
      });
      this.markers = [];
      console.log('✅ All markers cleared');
    } catch (error) {
      console.error('❌ Error clearing markers:', error);
    }
  }

  setView(lat, lon, zoom = null) {
    if (!this.map) {
      console.warn('⚠️ Map not initialized, cannot set view');
      return;
    }

    try {
      const zoomLevel = zoom !== null ? zoom : this.map.getZoom();
      this.map.setView([lat, lon], zoomLevel);
    } catch (error) {
      console.error('❌ Error setting map view:', error);
    }
  }

  cleanup() {
    try {
      if (this.map) {
        console.log('🧹 Cleaning up map...');
        this.clearMarkers();
        this.map.remove();
        this.map = null;
      }

      // Clean up container
      const container = document.getElementById(this.containerId);
      if (container) {
        if (container._leaflet_id) {
          delete container._leaflet_id;
        }
        container.innerHTML = '';
      }

      console.log('✅ Map cleanup completed');
    } catch (error) {
      console.error('❌ Error during map cleanup:', error);
    }
  }

  // Static method to clean up all maps in a container
  static cleanupContainer(containerId) {
    try {
      const container = document.getElementById(containerId);
      if (container && container._leaflet_id) {
        // Try to find and remove the Leaflet map
        if (window.L && window.L.DomUtil) {
          const map = container._leaflet_map;
          if (map) {
            map.remove();
          }
        }
        delete container._leaflet_id;
        container.innerHTML = '';
        console.log(`✅ Cleaned up container: ${containerId}`);
      }
    } catch (error) {
      console.error(`❌ Error cleaning up container ${containerId}:`, error);
    }
  }
}

export default MapComponent;