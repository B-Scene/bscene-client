import { useEffect } from "react";
import {
  getWebPushDebugInfo,
  onForegroundPushMessage,
} from "@/utils/webPushNotifications";
import { useModeStore } from "@/stores/useModeStore";
import { getNotificationMode } from "@/utils/notificationDeepLink";
import type {
  NotificationItem,
  NotificationSettingsMode,
} from "@/types/notification";

declare global {
  interface Window {
    __bscenePushDebug?: () => Promise<unknown>;
  }
}

const getPayloadDeepLink = ({
  data,
  title,
  body,
}: {
  data?: Record<string, string>;
  title: string;
  body: string;
}) => {
  if (data?.deepLink || data?.link) {
    return data.deepLink ?? data.link ?? "/";
  }

  const type = (
    data?.type ??
    data?.notificationType ??
    data?.eventType ??
    ""
  ).toUpperCase();
  const content = `${title} ${body}`.toUpperCase();
  const liveId =
    data?.liveId ?? data?.referenceId ?? data?.targetId ?? data?.resourceId;
  const isCoHostUpgradeRequest =
    (type.includes("CO_HOST") ||
      type.includes("COHOST") ||
      content.includes("공동 송출") ||
      content.includes("공동 진행")) &&
    (type.includes("UPGRADE") ||
      type.includes("REQUEST") ||
      type.includes("ACCEPT") ||
      type.includes("APPROVAL") ||
      content.includes("업그레이드 요청") ||
      content.includes("승급 요청") ||
      content.includes("권한 요청") ||
      content.includes("공동 진행 요청") ||
      content.includes("공동 송출 요청") ||
      content.includes("승인") ||
      content.includes("수락"));

  if (isCoHostUpgradeRequest && liveId) {
    return `/band/live?type=LIVE_CO_HOST_UPGRADE_REQUEST&liveId=${encodeURIComponent(
      liveId,
    )}&action=approve`;
  }

  return "/";
};

const toNotificationMode = (
  value?: string,
): NotificationSettingsMode | null => {
  const mode = value?.toUpperCase();

  return mode === "FAN" || mode === "BAND" ? mode : null;
};

const getPayloadMode = ({
  data,
  title,
  body,
  deepLink,
}: {
  data?: Record<string, string>;
  title: string;
  body: string;
  deepLink: string;
}) => {
  const notification: NotificationItem = {
    notificationId: -1,
    type: data?.type ?? data?.notificationType ?? data?.eventType ?? "UNKNOWN",
    mode:
      toNotificationMode(data?.mode) ??
      toNotificationMode(data?.notificationMode) ??
      toNotificationMode(data?.receiverMode) ??
      toNotificationMode(data?.targetMode) ??
      toNotificationMode(data?.userMode),
    deepLink,
    referenceId: null,
    title,
    body,
    isRead: false,
    readAt: null,
    createdAt: new Date().toISOString(),
    actionable: false,
    bandInvite: null,
  };

  return getNotificationMode(notification);
};

export const PushNotificationBridge = () => {
  const currentMode = useModeStore((state) => state.mode);

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
      const deepLink = getPayloadDeepLink({
        data: payload.data,
        title,
        body: body ?? "",
      });
      const payloadMode = getPayloadMode({
        data: payload.data,
        title,
        body: body ?? "",
        deepLink,
      });
      const currentNotificationMode = currentMode === "band" ? "BAND" : "FAN";

      if (payloadMode !== null && payloadMode !== currentNotificationMode) {
        return;
      }

      const notification = new Notification(title, {
        body,
        icon: payload.notification?.icon ?? "/favicon/favicon-96x96.png",
        data: {
          deepLink,
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
  }, [currentMode]);

  return null;
};
