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

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed to push notifications");
        return;
      }

      console.log("Attempting to subscribe to push notifications...");
      console.log("VAPID Key:", API_CONFIG.VAPID_PUBLIC_KEY);

      // Convert VAPID key with better error handling
      let applicationServerKey;
      try {
        applicationServerKey = this.urlBase64ToUint8Array(API_CONFIG.VAPID_PUBLIC_KEY);
        console.log("VAPID key converted successfully");
      } catch (vapidError) {
        console.error("Failed to convert VAPID key:", vapidError);
        throw new Error("Invalid VAPID key format");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log("Push subscription created:", subscription);

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

      console.log("Sending subscription to server...");

      // Use only the endpoint path if ApiUtil handles BASE_URL
      const response = await ApiUtil.post(
        API_CONFIG.ENDPOINTS.SUBSCRIBE,
        subscriptionData,
        {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      );

      console.log("Successfully subscribed to push notifications:", response);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        console.error("Push service rejected the subscription. This might be due to:");
        console.error("1. Invalid VAPID public key");
        console.error("2. Browser's push service is unavailable");
        console.error("3. Domain not allowlisted for push notifications");
      } else if (error.name === 'NotSupportedError') {
        console.error("Push messaging is not supported by this browser");
      } else if (error.name === 'NotAllowedError') {
        console.error("Permission for notifications was denied");
      }
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
          API_CONFIG.ENDPOINTS.UNSUBSCRIBE,
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
    try {
      // Clean the base64 string
      const cleanBase64 = base64String.replace(/[^A-Za-z0-9+/=]/g, '');
      
      const padding = "=".repeat((4 - (cleanBase64.length % 4)) % 4);
      const base64 = (cleanBase64 + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      
      return outputArray;
    } catch (error) {
      console.error("Error converting VAPID key:", error);
      throw error;
    }
  }

  // Test function to verify VAPID key
  static testVapidKey() {
    try {
      const converted = this.urlBase64ToUint8Array(API_CONFIG.VAPID_PUBLIC_KEY);
      console.log("✅ VAPID key is valid, length:", converted.length);
      return true;
    } catch (error) {
      console.error("❌ VAPID key is invalid:", error);
      return false;
    }
  }
}

export default NotificationService;