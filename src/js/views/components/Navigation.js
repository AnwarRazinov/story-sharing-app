import AuthService from "../../services/auth-service.js";
import Router from "../../router.js";

class Navigation {
  render() {
    const nav = document.getElementById("app-header");
    if (!nav) return;

    // Add error handling for AuthService calls
    let isAuthenticated = false;
    let currentUserName = 'User';
    
    try {
      isAuthenticated = AuthService.isAuthenticated();
      if (isAuthenticated) {
        const user = AuthService.getCurrentUser();
        currentUserName = user?.name || 'User';
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      isAuthenticated = false;
    }

    const currentPath = window.location.pathname;

    nav.innerHTML = `
      <nav class="main-navigation" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
          <div class="nav-brand">
            <a href="/" class="brand-link" data-route="/">
              📖 Dicoding Story
            </a>
          </div>
          
          <button class="nav-toggle" aria-label="Toggle navigation menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div class="nav-menu">
            <div class="nav-links">
              <a href="/" class="nav-link ${currentPath === "/" ? "active" : ""}" data-route="/">
                🏠 Home
              </a>
              
              <a href="/offline" class="nav-link ${currentPath === "/offline" ? "active" : ""}" data-route="/offline">
                📱 Offline
              </a>

              ${isAuthenticated ? `
                <a href="/add" class="nav-link ${currentPath === "/add" ? "active" : ""}" data-route="/add">
                  ➕ Add Story
                </a>
                <button class="nav-link logout-btn" id="logout-btn">
                  🚪 Logout
                </button>
              ` : `
                <a href="/login" class="nav-link ${currentPath === "/login" ? "active" : ""}" data-route="/login">
                  🔑 Login
                </a>
                <a href="/register" class="nav-link ${currentPath === "/register" ? "active" : ""}" data-route="/register">
                  📝 Register
                </a>
              `}
            </div>

            ${isAuthenticated ? `
              <div class="nav-user">
                <span class="user-greeting">
                  👋 ${currentUserName}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      </nav>

      <style>
        .main-navigation {
          background: #2196F3;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 60px;
        }

        .nav-brand .brand-link {
          color: white;
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .nav-toggle span {
          width: 25px;
          height: 3px;
          background: white;
          margin: 3px 0;
          border-radius: 2px;
          transition: 0.3s;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-link.active {
          background: rgba(255, 255, 255, 0.2);
          font-weight: 500;
        }

        .logout-btn {
          color: #ffcdd2;
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          margin-left: 10px;
          padding-left: 20px;
        }

        .logout-btn:hover {
          background: rgba(244, 67, 54, 0.2);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-greeting {
          font-size: 0.9rem;
          opacity: 0.9;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }

        @media (max-width: 768px) {
          .nav-toggle {
            display: flex;
          }

          .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #2196F3;
            flex-direction: column;
            padding: 20px;
            gap: 10px;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
          }

          .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-links {
            flex-direction: column;
            width: 100%;
            gap: 5px;
          }

          .nav-link {
            padding: 12px 16px;
            width: 100%;
            text-align: left;
            justify-content: flex-start;
          }

          .logout-btn {
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            margin-left: 0;
            margin-top: 10px;
            padding-left: 16px;
            padding-top: 20px;
          }

          .nav-user {
            width: 100%;
            justify-content: center;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }
        }
      </style>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Handle navigation clicks
    document.querySelectorAll("[data-route]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const route = e.currentTarget.getAttribute("data-route");
        Router.navigateTo(route);
      });
    });

    // Handle logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        try {
          AuthService.logout();
          Router.navigateTo("/");
          window.dispatchEvent(new CustomEvent("auth-changed"));
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });
    }

    // Handle mobile menu toggle
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
      });

      // Close mobile menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove("active");
        }
      });

      // Close mobile menu when navigating
      document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("active");
        });
      });
    }
  }
}

export default Navigation;