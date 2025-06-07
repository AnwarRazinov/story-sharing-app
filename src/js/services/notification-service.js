import { API_CONFIG } from "../config/api-config.js";
import ApiUtil from "../utils/api.js";
import AuthModel from "../models/AuthModel.js";

class NotificationService {
  static async init(registration) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Check if user is logged in before subscribing
        const token = AuthModel.getToken();
        if (token) {
          await this.subscribe(registration);
        }
      }
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
    }
  }

  static async subscribe(registration) {
    try {
      const token = AuthModel.getToken();
      if (!token) {
        console.warn("No authentication token found");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          API_CONFIG.VAPID_PUBLIC_KEY
        ),
      });

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey("p256dh"))
            )
          ),
          auth: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey("auth"))
            )
          ),
        },
      };

      const response = await ApiUtil.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIBE}`,
        subscriptionData,
        {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      );

      console.log("Successfully subscribed to push notifications:", response);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    }
  }

  static async unsubscribe() {
    try {
      const token = AuthModel.getToken();
      if (!token) {
        console.warn("No authentication token found");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const unsubscribeData = {
          endpoint: subscription.endpoint
        };

        await ApiUtil.delete(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UNSUBSCRIBE}`,
          unsubscribeData,
          {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        );

        await subscription.unsubscribe();
        console.log("Successfully unsubscribed from push notifications");
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
    }
  }

  static async showNotification(title, options) {
    if ("Notification" in window && Notification.permission === "granted") {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
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
}

export default NotificationService;