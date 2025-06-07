class PWAInstaller {
    constructor() {
      this.deferredPrompt = null;
      this.isInstalled = false;
      this.init();
    }
  
    init() {
      // Listen for beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA install prompt available');
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Save the event so it can be triggered later
        this.deferredPrompt = e;
        // Show install button/banner
        this.showInstallPromotion();
      });
  
      // Listen for app installed event
      window.addEventListener('appinstalled', (e) => {
        console.log('PWA was installed');
        this.isInstalled = true;
        this.hideInstallPromotion();
        this.deferredPrompt = null;
      });
  
      // Check if app is already installed
      this.checkIfInstalled();
    }
  
    checkIfInstalled() {
      // Check if running in standalone mode (PWA installed)
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        this.isInstalled = true;
        console.log('PWA is running in standalone mode');
      }
  
      // Check for iOS standalone mode
      if (window.navigator.standalone === true) {
        this.isInstalled = true;
        console.log('PWA is running in iOS standalone mode');
      }
    }
  
    showInstallPromotion() {
      if (this.isInstalled) return;
  
      // Create install banner if it doesn't exist
      let installBanner = document.getElementById('pwa-install-banner');
      if (!installBanner) {
        installBanner = this.createInstallBanner();
        document.body.appendChild(installBanner);
      }
  
      installBanner.style.display = 'block';
    }
  
    hideInstallPromotion() {
      const installBanner = document.getElementById('pwa-install-banner');
      if (installBanner) {
        installBanner.style.display = 'none';
      }
    }
  
    createInstallBanner() {
      const banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #2196F3;
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
  
      banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 600px; margin: 0 auto;">
          <span>📱 Install Dicoding Story app for better experience</span>
          <div>
            <button id="pwa-install-btn" style="background: white; color: #2196F3; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px; cursor: pointer;">
              Install
            </button>
            <button id="pwa-dismiss-btn" style="background: transparent; color: white; border: 1px solid white; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
              ✕
            </button>
          </div>
        </div>
      `;
  
      // Add event listeners
      banner.querySelector('#pwa-install-btn').addEventListener('click', () => {
        this.installApp();
      });
  
      banner.querySelector('#pwa-dismiss-btn').addEventListener('click', () => {
        this.hideInstallPromotion();
      });
  
      return banner;
    }
  
    async installApp() {
      if (!this.deferredPrompt) {
        console.log('Install prompt not available');
        return;
      }
  
      try {
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Clear the deferredPrompt
        this.deferredPrompt = null;
        this.hideInstallPromotion();
      } catch (error) {
        console.error('Error during app installation:', error);
      }
    }
  
    // Method to manually trigger install (can be called from UI)
    triggerInstall() {
      this.installApp();
    }
  }
  
  export default PWAInstaller;