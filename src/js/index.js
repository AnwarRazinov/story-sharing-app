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
    this.router.init();
    SkipToContent.init();
    
    if ('serviceWorker' in navigator) {
      try {
        const isProduction = process.env.NODE_ENV === 'production';
        const swPath = isProduction ? './service-worker.js' : './sw-dev.js';
        
        console.log('Registering service worker:', swPath);
        
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('Service Worker registered:', registration);
        
        await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');
        
        if (AuthService.isAuthenticated()) {
          await NotificationService.init(registration);
        }
        
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    window.addEventListener('auth-changed', async () => {
      if (this.router.navigation) {
        this.router.navigation.render();
      }
      this.router.handleRoute();

      if (AuthService.isAuthenticated()) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await NotificationService.init(registration);
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      }
    });
    
    window.addEventListener('popstate', () => {
      this.router.handleRoute();
    });

    this.handleOfflineStatus();
    this.handleInstallPrompt();
  }

  handleOfflineStatus() {
    const showOfflineMessage = () => {
      if (!navigator.onLine) {
        console.log('📴 App is offline - using cached content');
        this.showOfflineBanner();
      } else {
        console.log('🌐 App is online');
        this.hideOfflineBanner();
      }
    };

    showOfflineMessage();
    window.addEventListener('online', showOfflineMessage);
    window.addEventListener('offline', showOfflineMessage);
  }

  showOfflineBanner() {
    const existing = document.getElementById('offline-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        right: 0; 
        background: #ff9800; 
        color: white; 
        text-align: center; 
        padding: 8px; 
        z-index: 9999;
        font-size: 14px;
      ">
        📴 You're offline - Viewing cached content
      </div>
    `;
    document.body.appendChild(banner);
  }

  hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.remove();
  }

  handleInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      const installBtn = document.createElement('button');
      installBtn.textContent = '📱 Install App';
      installBtn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; 
        background: #2196F3; color: white; border: none; 
        padding: 10px 15px; border-radius: 25px; 
        cursor: pointer; z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
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

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('app')) {
    new App();
  } else {
    console.error('Root element not found');
  }
});