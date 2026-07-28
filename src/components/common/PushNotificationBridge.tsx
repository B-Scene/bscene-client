import { useEffect } from "react";
import { listenForegroundPushNotifications } from "@/utils/webPushNotifications";

export const PushNotificationBridge = () => {
  useEffect(() => {
    return listenForegroundPushNotifications((payload) => {
      const notification = payload as {
        notification?: { title?: string; body?: string };
      };
      const title = notification.notification?.title;

      if (document.visibilityState === "visible" && title) {
        // Foreground FCM messages do not automatically display browser UI.
        // Keep this hook in place so the app can react without duplicating toasts.
      }
    });
  }, []);

  return null;
};
