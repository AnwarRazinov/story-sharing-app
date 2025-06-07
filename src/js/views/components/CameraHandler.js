class CameraHandler {
  constructor(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.stream = null;
    this.facingMode = "user";
  }

  showCameraUI() {
    this.videoElement.style.display = "block";
    document.getElementById("photo-preview").style.display = "none";
    document.getElementById("start-camera").style.display = "none";
    document.getElementById("capture-photo").style.display = "inline-block";
    document.getElementById("switch-camera").style.display = "inline-block";
    document.getElementById("stop-camera").style.display = "inline-block";
    document.getElementById("retake-photo").style.display = "none";
  }

  showPhotoPreview(photoBlob) {
    const photoPreview = document.getElementById("photo-preview");
    photoPreview.src = URL.createObjectURL(photoBlob);
    photoPreview.style.display = "block";
    this.videoElement.style.display = "none";
    document.getElementById("capture-photo").style.display = "none";
    document.getElementById("switch-camera").style.display = "none";
    document.getElementById("stop-camera").style.display = "none";
    document.getElementById("retake-photo").style.display = "inline-block";
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode },
        audio: false,
      });
      this.videoElement.srcObject = this.stream;
      this.showCameraUI();
      return true;
    } catch (err) {
      console.error("Error accessing camera:", err);
      throw err;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.videoElement.srcObject = null;

    // Reset UI
    this.videoElement.style.display = "none";
    document.getElementById("start-camera").style.display = "inline-block";
    document.getElementById("capture-photo").style.display = "none";
    document.getElementById("switch-camera").style.display = "none";
    document.getElementById("stop-camera").style.display = "none";
    document.getElementById("retake-photo").style.display = "none";
  }

  async capturePhoto() {
    if (!this.stream) return null;

    const context = this.canvasElement.getContext("2d");
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;
    context.drawImage(
      this.videoElement,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    return new Promise((resolve) => {
      this.canvasElement.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  }

  async switchCamera() {
    this.facingMode = this.facingMode === "user" ? "environment" : "user";
    await this.stopCamera();
    await this.startCamera();
  }

  handleFileSelect(event) {
    return new Promise((resolve, reject) => {
      const file = event.target.files[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      if (!file.type.match("image.*")) {
        reject(new Error("Please select an image file"));
        return;
      }

      resolve(file);
    });
  }
}

export default CameraHandler;
