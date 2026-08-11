import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationAsRead } from "@/api/notification";
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
import {
  findNotificationForPendingPushRead,
  getAllPendingPushNotificationReads,
  removeAllPendingPushNotificationReads,
  savePendingPushNotificationRead,
  saveIndexedDbPendingPushNotificationRead,
} from "@/utils/pushNotificationReadTracking";
import { markPushNotificationEntry } from "@/utils/pushNotificationBackNavigation";
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
const PUSH_CLICKED_QUERY_KEY = "pushNotificationClicked";
const PUSH_TITLE_QUERY_KEY = "pushTitle";
const PUSH_BODY_QUERY_KEY = "pushBody";
const PUSH_TYPE_QUERY_KEY = "pushType";
const PUSH_REFERENCE_ID_QUERY_KEY = "pushReferenceId";
const PUSH_DEEP_LINK_QUERY_KEY = "pushDeepLink";
const processedPushNotificationIds = new Set<number>();

type ClickedPushNotification = {
  notificationId: number | null;
  title: string;
  body: string;
  type: string;
  referenceId: number | null;
  deepLink: string;
};

type PushNotificationClickMessage = ClickedPushNotification & {
  targetDeepLink: string;
};

const getPayloadNotificationId = (data?: Record<string, string>) => {
  const notificationId = Number(
    data?.notificationId ??
      data?.notification_id ??
      data?.["notification-id"] ??
      data?.pushNotificationId ??
      data?.id ??
      data?.alarmId ??
      data?.notificationSeq,
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

const appendPushClickContextToDeepLink = (
  deepLink: string,
  context: ClickedPushNotification,
) => {
  try {
    const url = new URL(deepLink, window.location.origin);

    if (url.origin !== window.location.origin) return deepLink;

    url.searchParams.set(PUSH_CLICKED_QUERY_KEY, "1");

    if (context.notificationId !== null) {
      url.searchParams.set(
        PUSH_NOTIFICATION_ID_QUERY_KEY,
        String(context.notificationId),
      );
    }

    if (context.title) url.searchParams.set(PUSH_TITLE_QUERY_KEY, context.title);
    if (context.body) url.searchParams.set(PUSH_BODY_QUERY_KEY, context.body);
    if (context.type) url.searchParams.set(PUSH_TYPE_QUERY_KEY, context.type);
    if (context.referenceId !== null) {
      url.searchParams.set(
        PUSH_REFERENCE_ID_QUERY_KEY,
        String(context.referenceId),
      );
    }
    if (context.deepLink) {
      url.searchParams.set(PUSH_DEEP_LINK_QUERY_KEY, context.deepLink);
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return appendNotificationIdToDeepLink(deepLink, context.notificationId);
  }
};

const toPositiveNumberOrNull = (value: string | null) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const getClickedPushNotificationFromCurrentUrl =
  (): ClickedPushNotification | null => {
    const params = new URLSearchParams(window.location.search);
    const notificationId = toPositiveNumberOrNull(
      params.get(PUSH_NOTIFICATION_ID_QUERY_KEY),
    );

    if (!params.has(PUSH_CLICKED_QUERY_KEY) && notificationId === null) {
      return null;
    }

    return {
      notificationId,
      title: params.get(PUSH_TITLE_QUERY_KEY) ?? "",
      body: params.get(PUSH_BODY_QUERY_KEY) ?? "",
      type: params.get(PUSH_TYPE_QUERY_KEY) ?? "",
      referenceId: toPositiveNumberOrNull(
        params.get(PUSH_REFERENCE_ID_QUERY_KEY),
      ),
      deepLink: params.get(PUSH_DEEP_LINK_QUERY_KEY) ?? "",
    };
  };

const removePushClickContextFromCurrentUrl = () => {
  const url = new URL(window.location.href);

  if (
    !url.searchParams.has(PUSH_CLICKED_QUERY_KEY) &&
    !url.searchParams.has(PUSH_NOTIFICATION_ID_QUERY_KEY)
  ) {
    return;
  }

  url.searchParams.delete(PUSH_CLICKED_QUERY_KEY);
  url.searchParams.delete(PUSH_NOTIFICATION_ID_QUERY_KEY);
  url.searchParams.delete(PUSH_TITLE_QUERY_KEY);
  url.searchParams.delete(PUSH_BODY_QUERY_KEY);
  url.searchParams.delete(PUSH_TYPE_QUERY_KEY);
  url.searchParams.delete(PUSH_REFERENCE_ID_QUERY_KEY);
  url.searchParams.delete(PUSH_DEEP_LINK_QUERY_KEY);
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
};

const getClickedPushNotificationFromMessage = (
  data: unknown,
): PushNotificationClickMessage | null => {
  if (typeof data !== "object" || data === null) return null;

  const message = data as {
    type?: unknown;
    notificationId?: unknown;
    title?: unknown;
    body?: unknown;
    notificationType?: unknown;
    referenceId?: unknown;
    deepLink?: unknown;
    targetDeepLink?: unknown;
  };

  if (message.type !== "BSCENE_PUSH_NOTIFICATION_CLICK") return null;

  return {
    notificationId: toPositiveNumberOrNull(String(message.notificationId ?? "")),
    title: typeof message.title === "string" ? message.title : "",
    body: typeof message.body === "string" ? message.body : "",
    type:
      typeof message.notificationType === "string"
        ? message.notificationType
        : "",
    referenceId: toPositiveNumberOrNull(String(message.referenceId ?? "")),
    deepLink: typeof message.deepLink === "string" ? message.deepLink : "",
    targetDeepLink:
      typeof message.targetDeepLink === "string" ? message.targetDeepLink : "",
  };
};

const navigateToPushTarget = (targetDeepLink: string) => {
  if (!targetDeepLink) return;

  try {
    const url = new URL(targetDeepLink, window.location.origin);
    const nextUrl =
      url.origin === window.location.origin
        ? `${url.pathname}${url.search}${url.hash}`
        : targetDeepLink;

    if (
      url.origin === window.location.origin &&
      nextUrl ===
        `${window.location.pathname}${window.location.search}${window.location.hash}`
    ) {
      return;
    }

    window.location.assign(nextUrl);
  } catch {
    window.location.assign(targetDeepLink);
  }
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
    let isProcessingStoredPendingReads = false;

    window.__bscenePushDebug = getWebPushDebugInfo;

    const markPushNotificationIdAsRead = (
      notificationId: number,
      pendingReadKey?: string,
    ) => {
      if (processedPushNotificationIds.has(notificationId)) return;

      processedPushNotificationIds.add(notificationId);
      markNotificationReadInCache(queryClient, notificationId);

      void markNotificationAsRead(notificationId)
        .then(() =>
          Promise.all([
            queryClient.invalidateQueries({ queryKey: fanHomeKeys.main() }),
            queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
          ]),
        )
        .then(() => {
          if (pendingReadKey) {
            removeAllPendingPushNotificationReads([pendingReadKey]);
          }
        })
        .catch((error) => {
          processedPushNotificationIds.delete(notificationId);
          console.error("[BScene Push] failed to mark notification as read", error);
        });
    };

    const processStoredPendingPushReads = () => {
      if (isProcessingStoredPendingReads) return;

      isProcessingStoredPendingReads = true;

      void getAllPendingPushNotificationReads()
        .then(async (pendingReads) => {
          if (pendingReads.length === 0) return;

          const notificationsPage = await getNotifications({ size: 50 });
          const readPendingKeys: string[] = [];

          pendingReads.forEach((pendingRead) => {
            const matchedNotification = findNotificationForPendingPushRead(
              notificationsPage.items,
              pendingRead,
            );

            if (!matchedNotification) return;

            if (matchedNotification.isRead) {
              readPendingKeys.push(pendingRead.key);
              return;
            }

            markPushNotificationIdAsRead(
              matchedNotification.notificationId,
              pendingRead.key,
            );
          });

          removeAllPendingPushNotificationReads(readPendingKeys);
        })
        .catch((error) => {
          console.error(
            "[BScene Push] failed to process pending notification reads",
            error,
          );
        })
        .finally(() => {
          isProcessingStoredPendingReads = false;
        });
    };

    const markClickedPushNotificationAsRead = (
      clickedNotification: ClickedPushNotification,
      targetDeepLink = "",
    ) => {
      markPushNotificationEntry(targetDeepLink || window.location.href, currentMode);

      const pendingRead = savePendingPushNotificationRead(clickedNotification);

      void saveIndexedDbPendingPushNotificationRead(pendingRead).finally(() => {
        processStoredPendingPushReads();
      });

      void getNotifications({ size: 50 })
        .then((notificationsPage) => {
          const matchedNotification = findNotificationForPendingPushRead(
            notificationsPage.items,
            clickedNotification,
          );

          if (!matchedNotification) return;

          if (matchedNotification.isRead) {
            removeAllPendingPushNotificationReads([pendingRead.key]);
            return;
          }

          markPushNotificationIdAsRead(
            matchedNotification.notificationId,
            pendingRead.key,
          );
        })
        .catch((error) => {
          console.error("[BScene Push] failed to find clicked notification", error);
        });
    };

    const processCurrentUrlPushClick = () => {
      const clickedNotificationFromUrl =
        getClickedPushNotificationFromCurrentUrl();

      if (!clickedNotificationFromUrl) return;

      removePushClickContextFromCurrentUrl();
      markClickedPushNotificationAsRead(
        clickedNotificationFromUrl,
        window.location.href,
      );
    };

    processCurrentUrlPushClick();
    processStoredPendingPushReads();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        processCurrentUrlPushClick();
        processStoredPendingPushReads();
      }
    };

    const handleFocus = () => {
      processCurrentUrlPushClick();
      processStoredPendingPushReads();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("popstate", processCurrentUrlPushClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const urlCheckIntervalId = window.setInterval(
      processCurrentUrlPushClick,
      1000,
    );

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const clickedNotification =
        getClickedPushNotificationFromMessage(event.data);

      if (clickedNotification === null) return;

      markClickedPushNotificationAsRead(
        clickedNotification,
        clickedNotification.targetDeepLink,
      );
      navigateToPushTarget(clickedNotification.targetDeepLink);
    };

    navigator.serviceWorker?.addEventListener(
      "message",
      handleServiceWorkerMessage,
    );

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
      const referenceId = toPositiveNumberOrNull(
        payload.data?.liveId ??
          payload.data?.referenceId ??
          payload.data?.targetId ??
          payload.data?.resourceId ??
          null,
      );
      const clickedNotification: ClickedPushNotification = {
        notificationId,
        title,
        body: body ?? "",
        type:
          payload.data?.type ??
          payload.data?.notificationType ??
          payload.data?.eventType ??
          "",
        referenceId,
        deepLink,
      };
      const trackedDeepLink = appendPushClickContextToDeepLink(
        deepLink,
        clickedNotification,
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
      window.clearInterval(urlCheckIntervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("popstate", processCurrentUrlPushClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.serviceWorker?.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
      broadcastChannel?.close();
      delete window.__bscenePushDebug;
    };
  }, [currentMode, queryClient]);

  return null;
};
