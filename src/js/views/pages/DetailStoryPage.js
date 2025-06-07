import MapComponent from "../components/MapComponent.js";
import DOMPurify from "dompurify";

class DetailStoryPage {
  constructor() {
    this.mapComponent = null;
  }

  render() {
    return `
      <section class="detail-story-page">
        <div class="story-detail-skeleton">
          <div class="skeleton-image skeleton-box"></div>
          <div class="skeleton-content">
            <div class="skeleton-text skeleton-box"></div>
            <div class="skeleton-text skeleton-box"></div>
            <div class="skeleton-text skeleton-box"></div>
          </div>
        </div>
      </section>
    `;
  }

  displayStory(story) {
    const container = document.querySelector(".detail-story-page");
    if (!container) return;
    
    const formattedDate = new Date(story.createdAt).toLocaleDateString(
      "id-ID",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    container.innerHTML = `
      <article class="story-detail">
        <button onclick="history.back()" class="btn btn-back" aria-label="Go back">
          <i class="fas fa-arrow-left" aria-hidden="true"></i> Back
        </button>
        
        <div class="story-image">
          <img src="${story.photoUrl}" alt="Story by ${story.name}">
        </div>
        
        <div class="story-content">
          <header class="story-header">
            <h1>${DOMPurify.sanitize(story.name)}</h1>
            <time datetime="${story.createdAt}" class="story-date">
              <i class="far fa-calendar" aria-hidden="true"></i>
              ${formattedDate}
            </time>
          </header>
          
          <div class="story-description">
            <p>${DOMPurify.sanitize(story.description)}</p>
          </div>
          
          ${
            story.lat && story.lon
              ? `
            <div class="story-location">
              <h2>Location</h2>
              <div id="story-location-map" class="story-map" role="application" aria-label="Story location map"></div>
            </div>
          `
              : ""
          }
        </div>
      </article>
    `;

    if (story.lat && story.lon) {
      // Add a small delay to ensure the DOM is ready
      setTimeout(() => {
        this.initMap(story.lat, story.lon, story.name);
      }, 100);
    }
  }

  initMap(lat, lon, name) {
    try {
      this.mapComponent = new MapComponent("story-location-map", {
        center: [lat, lon],
        zoom: 15,
      });

      this.mapComponent.init();
      this.mapComponent.addMarker(lat, lon, `<b>${name}</b><br>Story location`);
      console.log(`✅ Story location map initialized at ${lat}, ${lon}`);
    } catch (error) {
      console.error('❌ Error initializing story location map:', error);
    }
  }

  showError(message) {
    const container = document.querySelector(".detail-story-page");
    if (container) {
      container.innerHTML = `
        <div class="error-message" role="alert">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          <p>${message}</p>
          <button onclick="history.back()" class="btn btn-secondary">Go Back</button>
        </div>
      `;
    }
  }
}

export default DetailStoryPage;