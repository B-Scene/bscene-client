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
    // SW가 제어권 밖 클라이언트를 navigate()할 수 없어, 알림 클릭 이동을 브로드캐스트로 위임받는다
    const navigateChannel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("bscene-push-navigate")
        : null;

    window.__bscenePushDebug = getWebPushDebugInfo;

    broadcastChannel?.addEventListener("message", (event) => {
      console.info("[BScene Push] background message", event.data);
    });

    navigateChannel?.addEventListener("message", (event) => {
      const deepLink = (event.data as { deepLink?: string } | null)?.deepLink;

      if (typeof deepLink === "string" && deepLink) {
        window.focus();
        window.location.assign(deepLink);
      }
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
      navigateChannel?.close();
      delete window.__bscenePushDebug;
    };
  }, []);

  return null;
};
