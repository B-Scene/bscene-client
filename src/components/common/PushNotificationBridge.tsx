import { useEffect } from "react";
import {
  getWebPushDebugInfo,
  onForegroundPushMessage,
} from "@/utils/webPushNotifications";

declare global {
  interface Window {
    __bscenePushDebug?: () => Promise<unknown>;
  }
}

const getPayloadDeepLink = (data?: Record<string, string>) =>
  data?.deepLink ?? data?.link ?? "/";

export const PushNotificationBridge = () => {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const broadcastChannel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("bscene-push")
        : null;

    window.__bscenePushDebug = getWebPushDebugInfo;

    broadcastChannel?.addEventListener("message", (event) => {
      console.info("[BScene Push] background message", event.data);
    });

    void onForegroundPushMessage((payload) => {
      console.info("[BScene Push] foreground message", payload);

      if (Notification.permission !== "granted") return;

      const title =
        payload.notification?.title ?? payload.data?.title ?? "B:Scene";
      const body = payload.notification?.body ?? payload.data?.body;
      const notification = new Notification(title, {
        body,
        icon: payload.notification?.icon ?? "/favicon/favicon-96x96.png",
        data: {
          deepLink: getPayloadDeepLink(payload.data),
        },
      });

      notification.onclick = () => {
        window.focus();
        window.location.assign(notification.data.deepLink);
        notification.close();
      };
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      unsubscribe?.();
      broadcastChannel?.close();
      delete window.__bscenePushDebug;
    };
  }, []);

  return null;
};
