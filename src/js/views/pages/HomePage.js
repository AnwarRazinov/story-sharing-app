import StoryCard from "../components/StoryCard.js";
import AuthService from "../../services/auth-service.js";

class HomePage {
  render() {
    return `
      <section class="home-page">
        <header class="page-header">
          <h1>Dicoding Story Sharing</h1>
          <p>Bagikan momen mu bersama komunitas Dicoding!!</p>
        </header>
        
        <div class="stories-map-container">
          <div id="stories-map" class="stories-map" role="application" aria-label="Stories location map"></div>
        </div>
        
        <div class="stories-list" id="stories-list" role="feed" aria-busy="true">
          ${this.renderLoadingSkeletons()}
        </div>
        
        ${AuthService.isAuthenticated() ? `
          <div class="load-more-container">
            <button id="load-more" class="btn btn-secondary" aria-label="Load more stories">
              Load More Stories
            </button>
          </div>
        ` : `
          <div class="auth-prompt">
            <p>Please <a href="/login" data-route="/login">login</a> or <a href="/register" data-route="/register">register</a> to view and share stories</p>
          </div>
        `}
      </section>
    `;
  }

  renderSkeletons() {
    const container = document.getElementById('stories-list');
    if (container) {
      container.innerHTML = this.renderLoadingSkeletons();
      container.setAttribute('aria-busy', 'true');
    }
  }

  renderLoadingSkeletons() {
    return Array(6)
      .fill("")
      .map(() => StoryCard.renderSkeleton())
      .join("");
  }

  displayStories(stories) {
    const storiesList = document.getElementById("stories-list");
    if (!storiesList) return;
    
    storiesList.setAttribute("aria-busy", "false");
    
    if (!AuthService.isAuthenticated()) {
      storiesList.innerHTML = `
        <div class="no-stories">
          <i class="fas fa-lock fa-3x" aria-hidden="true"></i>
          <p>Please login to view stories</p>
          <div class="auth-actions">
            <a href="/login" data-route="/login" class="btn btn-primary">Login</a>
            <a href="/register" data-route="/register" class="btn btn-secondary">Register</a>
          </div>
        </div>
      `;
      return;
    }
    
    if (!stories || stories.length === 0) {
      storiesList.innerHTML = `
        <div class="no-stories">
          <i class="fas fa-inbox fa-3x" aria-hidden="true"></i>
          <p>No stories yet. Be the first to share!</p>
          <a href="/add" data-route="/add" class="btn btn-primary">Add Story</a>
        </div>
      `;
      return;
    }
    
    storiesList.innerHTML = stories
      .map((story) => {
        const storyCard = new StoryCard(story);
        return storyCard.render();
      })
      .join("");

    // Attach event listeners to the story cards
    this.attachStoryCardListeners();
  }

  appendStories(stories) {
    const storiesList = document.getElementById("stories-list");
    if (!storiesList || !stories) return;
    
    const newStories = stories
      .map((story) => {
        const storyCard = new StoryCard(story);
        return storyCard.render();
      })
      .join("");

    storiesList.insertAdjacentHTML("beforeend", newStories);

    // Attach event listeners to the new story cards
    this.attachStoryCardListeners();
  }

  attachStoryCardListeners() {
    // Use the StoryCard's static method to attach listeners
    StoryCard.attachEventListeners();
    
    // Also attach listeners to other navigation elements
    document.querySelectorAll('[data-route]').forEach(link => {
      if (!link.hasAttribute('data-listener-attached')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const route = e.currentTarget.getAttribute('data-route');
          if (route) {
            console.log('Navigating to:', route);
            window.history.pushState({}, '', route);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        });
        link.setAttribute('data-listener-attached', 'true');
      }
    });
  }

  showError(message) {
    const storiesList = document.getElementById("stories-list");
    if (!storiesList) return;
    
    storiesList.setAttribute("aria-busy", "false");
    storiesList.innerHTML = `
      <div class="error-message" role="alert">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn-secondary">Try Again</button>
      </div>
    `;
  }

  showLoadMoreButton(show) {
    const loadMoreBtn = document.getElementById("load-more");
    if (loadMoreBtn) {
      loadMoreBtn.style.display = show ? "block" : "none";
    }
  }

  setLoadingState(isLoading) {
    const loadMoreBtn = document.getElementById("load-more");
    if (loadMoreBtn) {
      loadMoreBtn.disabled = isLoading;
      loadMoreBtn.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Loading...'
        : "Load More Stories";
    }
  }
}

export default HomePage;