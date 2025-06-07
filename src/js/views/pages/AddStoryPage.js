import CameraHandler from "../components/CameraHandler.js";
import MapComponent from "../components/MapComponent.js";

class AddStoryPage {
  constructor() {
    this.cameraHandler = null;
    this.mapComponent = null;
  }

  render() {
    return `
      <section class="add-story-page">
        <header class="page-header">
          <h1>Bagi Ceritamu</h1>
          <p>Bagikan momen mu bersama komunitas Dicoding!!</p>
        </header>

        <form id="add-story-form" class="story-form" novalidate>
          <div class="form-group">
            <label for="story-description">Deskripsi Cerita</label>
            <textarea 
              id="story-description" 
              name="description" 
              class="form-control"
              rows="4"
              placeholder="What's your story?"
              required
              aria-required="true"
              aria-describedby="description-error"
            ></textarea>
            <div id="description-error" class="error-message" role="alert" aria-live="polite"></div>
          </div>

          <div class="form-group">
            <label for="story-photo">Foto Cerita</label>
            <div class="photo-capture-container">
              <div class="camera-preview">
                <video id="camera-video" autoplay playsinline></video>
                <canvas id="camera-canvas" style="display: none;"></canvas>
                <img id="photo-preview" alt="Photo preview" style="display: none;">
              </div>
              
              <div class="file-upload">
                <input 
                  type="file" 
                  id="photo-file" 
                  accept="image/*" 
                  class="form-control"
                  aria-describedby="photo-error"
                >
                <div class="btn mt-3">
                  <label for="photo-file" class="btn btn-secondary">
                    <i class="fas fa-upload" aria-hidden="true"></i> Upload from device
                  </label>
                </div>

                <div class="camera-controls">
                <button type="button" id="start-camera" class="btn btn-secondary">
                  <i class="fas fa-camera" aria-hidden="true"></i> Start Camera
                </button>
                <button type="button" id="stop-camera" class="btn btn-danger" style="display: none;">
                  <i class="fas fa-power-off" aria-hidden="true"></i> Turn Off
                </button>
                <button type="button" id="capture-photo" class="btn btn-primary" style="display: none;">
                  <i class="fas fa-camera" aria-hidden="true"></i> Capture
                </button>
                <button type="button" id="switch-camera" class="btn btn-secondary" style="display: none;">
                  <i class="fas fa-sync-alt" aria-hidden="true"></i> Switch
                </button>
                <button type="button" id="retake-photo" class="btn btn-secondary" style="display: none;">
                  <i class="fas fa-redo" aria-hidden="true"></i> Retake
                </button>
              </div>

              </div>
              <div id="photo-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>
          </div>

          <div class="form-group">
            <label>Lokasi (Opsional)</label>
            <div class="location-container">
              <div id="location-map" class="location-map" role="application" aria-label="Select story location"></div>
              <div class="location-controls">
                <button type="button" id="use-current-location" class="btn btn-secondary">
                  <i class="fas fa-location-arrow" aria-hidden="true"></i> Use Current Location
                </button>
                <p class="location-hint">Click on the map to select location</p>
              </div>
              <div class="selected-location" id="selected-location" style="display: none;">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span id="location-text"></span>
                <button type="button" id="clear-location" class="btn-icon" aria-label="Clear location">
                  <i class="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="submit-story">
              <i class="fas fa-paper-plane" aria-hidden="true"></i> Bagikan
            </button>
            <a href="/" data-route="/" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </section>
    `;
  }

  initCamera() {
    const videoElement = document.getElementById('camera-video');
    const canvasElement = document.getElementById('camera-canvas');
    if (videoElement && canvasElement) {
      this.cameraHandler = new CameraHandler(videoElement, canvasElement);
      return this.cameraHandler;
    }
    return null;
  }

  initMap() {
    const mapContainer = document.getElementById("location-map");
    if (mapContainer) {
      this.mapComponent = new MapComponent("location-map", {
        center: [-6.2, 106.816666],
        zoom: 13,
      });
      return this.mapComponent.init();
    }
    return null;
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }
  }

  setLoadingState(isLoading) {
    const submitButton = document.getElementById("submit-story");
    const form = document.getElementById("add-story-form");

    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Sharing...'
        : '<i class="fas fa-paper-plane"></i> Share Story';
    }

    if (form) {
      form.setAttribute("aria-busy", isLoading.toString());
    }
  }

  showSuccess(message) {
    // Create a simple success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

export default AddStoryPage;