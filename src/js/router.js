import HomePage from "./views/pages/HomePage.js";
import HomePresenter from "./presenters/HomePresenter.js";
import LoginPage from "./views/pages/LoginPage.js";
import LoginPresenter from "./presenters/LoginPresenter.js";
import RegisterPage from "./views/pages/RegisterPage.js";
import RegisterPresenter from "./presenters/RegisterPresenter.js";
import AddStoryPage from "./views/pages/AddStoryPage.js";
import AddStoryPresenter from "./presenters/AddStoryPresenter.js";
import DetailStoryPage from "./views/pages/DetailStoryPage.js";
import DetailStoryPresenter from "./presenters/DetailStoryPresenter.js";
import OfflinePage from "./views/pages/OfflinePage.js";
import OfflinePresenter from "./presenters/OfflinePresenter.js";
import Navigation from "./views/components/Navigation.js";
import AuthService from "./services/auth-service.js";

class Router {
  constructor() {
    this.routes = {
      "/": { page: HomePage, presenter: HomePresenter, requiresAuth: false },
      "/login": { page: LoginPage, presenter: LoginPresenter, requiresAuth: false },
      "/register": { page: RegisterPage, presenter: RegisterPresenter, requiresAuth: false },
      "/add": { page: AddStoryPage, presenter: AddStoryPresenter, requiresAuth: true },
      "/story/:id": { page: DetailStoryPage, presenter: DetailStoryPresenter, requiresAuth: false },
      "/offline": { page: OfflinePage, presenter: OfflinePresenter, requiresAuth: false }
    };
    this.navigation = new Navigation();
  }

  init() {
    this.navigation.render();
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const route = this.findRoute(path);

    if (!route) {
      this.navigateTo("/");
      return;
    }

    // Check authentication
    if (route.requiresAuth && !AuthService.isAuthenticated()) {
      this.navigateTo("/login");
      return;
    }

    this.renderPage(route, path);
  }

  findRoute(path) {
    // Exact match first
    if (this.routes[path]) {
      return this.routes[path];
    }

    // Pattern matching for dynamic routes
    for (const routePath in this.routes) {
      if (routePath.includes(":")) {
        const routeRegex = new RegExp(
          "^" + routePath.replace(/:([^/]+)/g, "([^/]+)") + "$"
        );
        if (routeRegex.test(path)) {
          return this.routes[routePath];
        }
      }
    }

    return null;
  }

  async renderPage(route, path) {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) {
      console.error('Main content container not found');
      return;
    }

    try {
      // Show loading state
      mainContent.innerHTML = '<div class="loading-spinner" style="text-align: center; padding: 50px;">Loading...</div>';

      // Create page instance
      const page = new route.page();
      
      // Render page content
      const pageContent = page.render();
      mainContent.innerHTML = pageContent;

      // Create and initialize presenter
      const presenter = new route.presenter(page);
      
      // Extract parameters for dynamic routes
      let storyId = null;
      if (path.includes("/story/")) {
        storyId = path.split("/story/")[1];
        console.log('Extracted story ID:', storyId);
      }

      // Extract query parameters for drafts
      let draftId = null;
      if (path.includes("/add")) {
        const urlParams = new URLSearchParams(window.location.search);
        draftId = urlParams.get('draft');
        if (draftId) {
          console.log('Extracted draft ID:', draftId);
        }
      }

      // Initialize presenter with parameters
      if (storyId) {
        await presenter.init(storyId);
      } else if (draftId) {
        presenter.draftId = draftId;
        await presenter.init();
      } else {
        await presenter.init();
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      mainContent.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 50px; color: #f44336;">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page.</p>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh
          </button>
        </div>
      `;
    }
  }

  static navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

export default Router;