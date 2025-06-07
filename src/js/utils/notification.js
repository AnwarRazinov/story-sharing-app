class NotificationHelper {
    static async requestPermission() {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications.');
        return 'denied';
      }
  
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission;
      }
  
      return Notification.permission;
    }
  
    static async checkServiceWorkerSupport() {
      return 'serviceWorker' in navigator;
    }
  
    static async registerServiceWorker() {
      if (!await this.checkServiceWorkerSupport()) {
        throw new Error('Service Worker not supported');
      }
  
      try {
        const registration = await navigator.serviceWorker.register('/service_worker.js');
        console.log('Service Worker registered successfully:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
  
    static async showLocalNotification(title, options = {}) {
      const permission = await this.requestPermission();
      
      if (permission === 'granted') {
        const defaultOptions = {
          icon: '/images/icons/icon-192x192.png',
          badge: '/images/icons/icon-192x192.png',
          vibrate: [100, 50, 100],
          tag: 'story-notification',
          requireInteraction: false
        };
  
        const notificationOptions = { ...defaultOptions, ...options };
  
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          return registration.showNotification(title, notificationOptions);
        } else {
          return new Notification(title, notificationOptions);
        }
      }
    }
  }
  
  export default NotificationHelper;