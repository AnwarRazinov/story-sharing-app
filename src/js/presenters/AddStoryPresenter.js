import StoryService from "../services/story-service.js";
import Router from "../router.js";

class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.photoBlob = null;
    this.selectedLocation = null;
  }

  async init() {
    this.view.initCamera();
    this.view.initMap();
    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('add-story-form');
    const startCameraBtn = document.getElementById('start-camera');
    const capturePhotoBtn = document.getElementById('capture-photo');
    const switchCameraBtn = document.getElementById('switch-camera');
    const stopCameraBtn = document.getElementById('stop-camera');
    const retakePhotoBtn = document.getElementById('retake-photo');
    const fileInput = document.getElementById('photo-file');
    const useCurrentLocationBtn = document.getElementById('use-current-location');
    const clearLocationBtn = document.getElementById('clear-location');
  
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    startCameraBtn.addEventListener('click', () => this.startCamera());
    capturePhotoBtn.addEventListener('click', () => this.capturePhoto());
    switchCameraBtn.addEventListener('click', () => this.switchCamera());
    stopCameraBtn.addEventListener('click', () => this.stopCamera());
    retakePhotoBtn.addEventListener('click', () => this.retakePhoto());
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    useCurrentLocationBtn.addEventListener('click', () => this.useCurrentLocation());
    
    if (clearLocationBtn) {
      clearLocationBtn.addEventListener('click', () => this.clearLocation());
    }
  
    this.view.mapComponent.enableClickToGetLocation((lat, lng) => {
      this.setLocation(lat, lng);
    });
  }

  async startCamera() {
    try {
      await this.view.cameraHandler.startCamera();
    } catch (error) {
      this.view.showError('photo-error', 'Failed to access camera. Please check permissions.');
    }
  }

  stopCamera() {
    try {
      this.view.cameraHandler.stopCamera();
    } catch (error) {
      this.view.showError('photo-error', 'Failed to stop camera. Please try again.');
    }
  }

  async capturePhoto() {
    try {
      this.photoBlob = await this.view.cameraHandler.capturePhoto();
      this.view.cameraHandler.showPhotoPreview(this.photoBlob);
      this.view.cameraHandler.stopCamera();
    } catch (error) {
      this.view.showError('photo-error', 'Failed to capture photo. Please try again.');
    }
  }

  async switchCamera() {
    try {
      await this.view.cameraHandler.switchCamera();
    } catch (error) {
      this.view.showError("photo-error", "Failed to switch camera.");
    }
  }

  retakePhoto() {
    this.photoBlob = null;
    this.startCamera();
  }

  async handleFileSelect(event) {
    try {
      this.photoBlob = await this.view.cameraHandler.handleFileSelect(event);
      this.view.cameraHandler.showPhotoPreview(this.photoBlob);
    } catch (error) {
      this.view.showError('photo-error', error.message);
    }
  }

  async useCurrentLocation() {
    try {
      const location = await this.view.mapComponent.getCurrentLocation();
      this.setLocation(location.lat, location.lon);
      this.view.mapComponent.setView(location.lat, location.lon, 15);
    } catch (error) {
      this.view.showError('location-error', 'Failed to get current location.');
    }
  }

  setLocation(lat, lon) {
    this.selectedLocation = { lat, lon };
    this.view.mapComponent.clearMarkers();
    this.view.mapComponent.addMarker(lat, lon, 'Selected location');
    
    const locationContainer = document.getElementById('selected-location');
    const locationText = document.getElementById('location-text');
    
    if (locationContainer && locationText) {
      locationContainer.style.display = 'flex';
      locationText.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  }

  clearLocation() {
    this.selectedLocation = null;
    this.view.mapComponent.clearMarkers();
    
    const locationContainer = document.getElementById('selected-location');
    if (locationContainer) {
      locationContainer.style.display = 'none';
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Clear previous errors
    this.view.clearError("description-error");
    this.view.clearError("photo-error");

    // Validate form
    const description = document
      .getElementById("story-description")
      .value.trim();

    if (!description) {
      this.view.showError("description-error", "Description is required");
      return;
    }

    if (!this.photoBlob) {
      this.view.showError("photo-error", "Photo is required");
      return;
    }

    try {
      this.view.setLoadingState(true);

      const storyData = {
        description,
        photo: this.photoBlob,
        lat: this.selectedLocation?.lat,
        lon: this.selectedLocation?.lon,
      };

      await StoryService.addStory(storyData);

      // Server will automatically send push notification
      // No need for manual notification here

      this.view.showSuccess("Story added successfully!");

      // Stop camera if still running
      if (this.view.cameraHandler) {
        this.view.cameraHandler.stopCamera();
      }

      // Redirect to home
      setTimeout(() => {
        Router.navigateTo("/");
      }, 1500);
    } catch (error) {
      this.view.showError(
        "form-error",
        "Failed to add story. Please try again."
      );
      console.error("Error adding story:", error);
    } finally {
      this.view.setLoadingState(false);
    }
  }
}

export default AddStoryPresenter;