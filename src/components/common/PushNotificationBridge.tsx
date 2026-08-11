import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "@/api/notification";
import {
  getWebPushDebugInfo,
  onForegroundPushMessage,
} from "@/utils/webPushNotifications";
import { fanHomeKeys } from "@/hooks/api/fan/useFanHome";
import {
  markNotificationReadInCache,
  notificationKeys,
} from "@/hooks/api/useNotifications";
import { useModeStore } from "@/stores/useModeStore";
import {
  getLiveReferencePath,
  getNotificationMode,
} from "@/utils/notificationDeepLink";
import type {
  NotificationItem,
  NotificationSettingsMode,
} from "@/types/notification";

declare global {
  interface Window {
    __bscenePushDebug?: () => Promise<unknown>;
  }
}

const PUSH_NOTIFICATION_ID_QUERY_KEY = "notificationId";
const processedPushNotificationIds = new Set<number>();

const getPayloadNotificationId = (data?: Record<string, string>) => {
  const notificationId = Number(
    data?.notificationId ?? data?.notification_id ?? data?.id,
  );

  return Number.isFinite(notificationId) && notificationId > 0
    ? notificationId
    : null;
};

const appendNotificationIdToDeepLink = (
  deepLink: string,
  notificationId: number | null,
) => {
  if (notificationId === null) return deepLink;

  try {
    const url = new URL(deepLink, window.location.origin);

    if (url.origin !== window.location.origin) return deepLink;

    url.searchParams.set(
      PUSH_NOTIFICATION_ID_QUERY_KEY,
      String(notificationId),
    );

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const separator = deepLink.includes("?") ? "&" : "?";

    return `${deepLink}${separator}${PUSH_NOTIFICATION_ID_QUERY_KEY}=${notificationId}`;
  }
};

const getNotificationIdFromCurrentUrl = () => {
  const notificationId = Number(
    new URLSearchParams(window.location.search).get(
      PUSH_NOTIFICATION_ID_QUERY_KEY,
    ),
  );

  return Number.isFinite(notificationId) && notificationId > 0
    ? notificationId
    : null;
};

const removeNotificationIdFromCurrentUrl = () => {
  const url = new URL(window.location.href);

  if (!url.searchParams.has(PUSH_NOTIFICATION_ID_QUERY_KEY)) return;

  url.searchParams.delete(PUSH_NOTIFICATION_ID_QUERY_KEY);
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
};

const getPayloadDeepLink = ({
  data,
  title,
  body,
}: {
  data?: Record<string, string>;
  title: string;
  body: string;
}) => {
  const suppliedDeepLink = data?.deepLink ?? data?.link ?? null;

  const referenceIdValue =
    data?.liveId ?? data?.referenceId ?? data?.targetId ?? data?.resourceId;
  const referenceId = Number(referenceIdValue);
  const notification: NotificationItem = {
    notificationId: -1,
    type: data?.type ?? data?.notificationType ?? data?.eventType ?? "UNKNOWN",
    mode: null,
    deepLink: suppliedDeepLink,
    referenceId: Number.isFinite(referenceId) ? referenceId : null,
    title,
    body,
    isRead: false,
    readAt: null,
    createdAt: new Date().toISOString(),
    actionable: false,
    bandInvite: null,
  };

  return getLiveReferencePath(notification) ?? suppliedDeepLink ?? "/";
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
  const queryClient = useQueryClient();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const broadcastChannel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("bscene-push")
        : null;

    window.__bscenePushDebug = getWebPushDebugInfo;

    const readNotificationId = getNotificationIdFromCurrentUrl();

    if (
      readNotificationId !== null &&
      !processedPushNotificationIds.has(readNotificationId)
    ) {
      processedPushNotificationIds.add(readNotificationId);
      removeNotificationIdFromCurrentUrl();
      markNotificationReadInCache(queryClient, readNotificationId);

      void markNotificationAsRead(readNotificationId)
        .then(() =>
          Promise.all([
            queryClient.invalidateQueries({ queryKey: fanHomeKeys.main() }),
            queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
          ]),
        )
        .catch((error) => {
          console.error("[BScene Push] failed to mark notification as read", error);
        });
    }

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
      const notificationId = getPayloadNotificationId(payload.data);
      const trackedDeepLink = appendNotificationIdToDeepLink(
        deepLink,
        notificationId,
      );
      const payloadMode = getPayloadMode({
        data: payload.data,
        title,
        body: body ?? "",
        deepLink: trackedDeepLink,
      });
      const currentNotificationMode = currentMode === "band" ? "BAND" : "FAN";

      if (payloadMode !== null && payloadMode !== currentNotificationMode) {
        return;
      }

      const notification = new Notification(title, {
        body,
        icon: payload.notification?.icon ?? "/favicon/favicon-96x96.png",
        data: {
          deepLink: trackedDeepLink,
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
  }, [currentMode, queryClient]);

  return null;
};
