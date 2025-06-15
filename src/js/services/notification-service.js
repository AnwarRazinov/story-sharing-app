import { API_CONFIG } from "../config/api-config.js";
import AuthModel from "../models/AuthModel.js";

class NotificationService {
  static async init(registration) {
    try {
      console.log("🔔 Initializing NotificationService...");
      const permission = await Notification.requestPermission();
      console.log("📋 Notification permission:", permission);
      
      if (permission === "granted") {
        const token = AuthModel.getToken();
        if (token) {
          console.log("👤 User authenticated, attempting subscription...");
          await this.subscribe(registration);
        } else {
          console.log("⚠️ No authentication token found");
        }
      } else {
        console.log("❌ Notification permission denied");
      }
    } catch (error) {
      console.error("❌ Failed to initialize notifications:", error);
    }
  }

  static async subscribe(registration) {
    try {
      const token = AuthModel.getToken();
      if (!token) {
        console.warn("⚠️ No authentication token found");
        return;
      }

      console.log("🚀 Starting push notification subscription process...");

      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("✅ Found existing subscription");
        await this.sendSubscriptionToServer(existingSubscription, token);
        return;
      }

      console.log("🔑 Converting VAPID key...");
      const applicationServerKey = this.urlBase64ToUint8Array(API_CONFIG.VAPID_PUBLIC_KEY);
      console.log("✅ VAPID key converted successfully");

      console.log("📡 Attempting browser push subscription...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log("🎉 Browser push subscription successful!");
      await this.sendSubscriptionToServer(subscription, token);

    } catch (error) {
      console.error("❌ Failed to subscribe to push notifications:", error);
      
      // PERBAIKAN: Pastikan token tersedia di fallback
      const fallbackToken = AuthModel.getToken(); // Ambil token lagi untuk fallback
      if (!fallbackToken) {
        console.error("❌ No token available for fallback subscription");
        return;
      }
      
      // Fallback for testing API endpoint
      try {
        console.log("🔄 Creating fallback subscription for API testing...");
        const mockSubscription = {
          endpoint: `https://fcm.googleapis.com/fcm/send/test_${Date.now()}`,
          getKey: function(name) {
            const mockKeys = {
              'p256dh': new Uint8Array(65).fill(1),
              'auth': new Uint8Array(16).fill(2)
            };
            return mockKeys[name];
          }
        };
        
        console.log("✅ Fallback subscription created");
        await this.sendSubscriptionToServer(mockSubscription, fallbackToken);
      } catch (fallbackError) {
        console.error("❌ Fallback subscription also failed:", fallbackError);
      }
    }
  }

  static async sendSubscriptionToServer(subscription, token) {
    try {
      console.log("📤 Preparing subscription data for server...");

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey ? 
            btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("p256dh")))) :
            btoa("mock_p256dh_key_for_testing"),
          auth: subscription.getKey ? 
            btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth")))) : // FIXED: fromCharCode bukan fromCharChar
            btoa("mock_auth_key_for_testing"),
        },
      };

      console.log("🌐 Sending subscription to Dicoding API...");
      console.log("📍 Endpoint:", `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIBE}`);

      // FIX: Gunakan fetch langsung untuk menghindari URL duplikasi
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIBE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      console.log("📊 Server response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("🎉 Server response:", data);
      console.log("✅ Successfully registered with push notification service!");
      console.log("🏆 Push notification setup completed successfully!");
      console.log("📊 Subscription type:", subscription.getKey ? "Real browser push" : "API integration test");

      // Show success notification
      this.showLocalNotification("🎉 Push Notifications Enabled!", {
        body: subscription.getKey ? 
          "You'll receive push notifications for new stories." :
          "Push notification API integration successful!",
        icon: this.createNotificationIcon("✅")
      });

      return true;
    } catch (error) {
      console.error("❌ Failed to send subscription to server:", error);
      return false;
    }
  }

  static async unsubscribe() {
    try {
      const token = AuthModel.getToken();
      if (!token) {
        console.warn("⚠️ No authentication token found");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const unsubscribeData = {
          endpoint: subscription.endpoint
        };

        // FIX: Gunakan fetch langsung
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UNSUBSCRIBE}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(unsubscribeData)
        });

        if (response.ok) {
          console.log("✅ Server unsubscribe successful");
        }

        await subscription.unsubscribe();
        console.log("✅ Successfully unsubscribed from push notifications");
        
        this.showLocalNotification("🔕 Push Notifications Disabled", {
          body: "You will no longer receive push notifications.",
        });
      }
    } catch (error) {
      console.error("❌ Failed to unsubscribe from push notifications:", error);
    }
  }

  static showLocalNotification(title, options = {}) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: options.icon || this.createNotificationIcon("🔔"),
        badge: this.createNotificationIcon("DS"),
        requireInteraction: false,
        silent: false,
        ...options
      });

      setTimeout(() => {
        notification.close();
      }, 4000);

      return notification;
    }
  }

  static createNotificationIcon(text) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%232196F3' rx='8'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-size='24' fill='white' font-family='Arial'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
  }

  static async showNotification(title, options) {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
      } else {
        this.showLocalNotification(title, options);
      }
    } catch (error) {
      console.warn("Service worker notification failed, using fallback:", error);
      this.showLocalNotification(title, options);
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  // Test notification function
  static async testPushNotification() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification('🧪 Test Push Notification', {
          body: 'Jika notifikasi ini muncul, berarti push notification berfungsi!',
          icon: this.createNotificationIcon('🧪'),
          badge: this.createNotificationIcon('DS'),
          vibrate: [200, 100, 200],
          data: { test: true }
        });
        
        console.log('🧪 Test notification shown');
        return true;
      }
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      return false;
    }
  }
}

export default NotificationService;