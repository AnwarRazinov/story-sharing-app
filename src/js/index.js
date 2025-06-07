import "../styles/main.css";
import Router from "./router.js";
import AuthService from "./services/auth-service.js";
import NotificationService from "./services/notification-service.js";
import SkipToContent from "./views/components/SkipToContent.js";

class App {
  constructor() {
    this.router = new Router();
    this.init();
  }

  async init() {
    // Initialize router first
    this.router.init();
    SkipToContent.init();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        // Fix: Always use the generated service worker from Workbox
        const swPath = './service-worker.js';
        
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('Service Worker registered:', registration);
        
        // Initialize notifications if user is authenticated
        if (AuthService.isAuthenticated()) {
          await NotificationService.init(registration);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Listen for auth state changes
    window.addEventListener('auth-changed', async () => {
      if (this.router.navigation) {
        this.router.navigation.render();
      }
      this.router.handleRoute();

      // Initialize notifications when user logs in
      if (AuthService.isAuthenticated()) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await NotificationService.init(registration);
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      }
    });
    
    // Listen for popstate
    window.addEventListener('popstate', () => {
      this.router.handleRoute();
    });

    // Show install prompt if available
    this.handleInstallPrompt();
  }

  handleInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or banner
      const installBtn = document.createElement('button');
      installBtn.textContent = '📱 Install App';
      installBtn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; 
        background: #2196F3; color: white; border: none; 
        padding: 10px 15px; border-radius: 25px; 
        cursor: pointer; z-index: 1000;
      `;
      
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('Install prompt result:', outcome);
          deferredPrompt = null;
          installBtn.remove();
        }
      });
      
      document.body.appendChild(installBtn);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
    });
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('app')) {
    new App();
  } else {
    console.error('Root element not found');
  }
});