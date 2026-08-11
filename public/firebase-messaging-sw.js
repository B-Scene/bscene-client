/* global firebase */

const firebaseConfig = Object.fromEntries(
  new URL(self.location.href).searchParams.entries(),
);

const getStringValue = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const getNotificationIdFromData = (data) => {
  return (
    getStringValue(data.notificationId) ||
    getStringValue(data.notification_id) ||
    getStringValue(data["notification-id"]) ||
    getStringValue(data.pushNotificationId) ||
    getStringValue(data.notificationSeq) ||
    getStringValue(data.alarmId) ||
    getStringValue(data.id)
  );
};

const isCoHostInviteType = (value) => {
  const type = getStringValue(value).toUpperCase();

  return (
    (type.includes("CO_HOST") || type.includes("COHOST")) &&
    (type.includes("INVITE") || type.includes("INVITATION"))
  );
};

const isLiveReferenceType = (value) => {
  return getStringValue(value).toUpperCase() === "LIVE";
};

const isCoHostUpgradeRequest = (data, notification = {}) => {
  const type = getNotificationType(data).toUpperCase();

  if (isCoHostInviteType(type)) return false;

  const content = `${getStringValue(notification.title || data.title)} ${getStringValue(
    notification.body || data.body,
  )}`.toUpperCase();
  const hasCoHostKeyword =
    type.includes("CO_HOST") ||
    type.includes("COHOST") ||
    content.includes("CO_HOST") ||
    content.includes("COHOST") ||
    content.includes("공동 송출") ||
    content.includes("공동 진행");
  const hasRequestKeyword =
    type.includes("UPGRADE") ||
    type.includes("REQUEST") ||
    type.includes("ACCEPT") ||
    type.includes("APPROVAL") ||
    content.includes("업그레이드 요청") ||
    content.includes("승급 요청") ||
    content.includes("권한 요청") ||
    content.includes("공동 진행 요청") ||
    content.includes("공동 송출 요청") ||
    content.includes("승인") ||
    content.includes("수락");

  return hasCoHostKeyword && hasRequestKeyword;
};

const getLiveIdFromData = (data) => {
  return (
    getStringValue(data.liveId) ||
    getStringValue(data.referenceId) ||
    getStringValue(data.targetId) ||
    getStringValue(data.resourceId)
  );
};

const createBandLiveDeepLink = (liveId) => {
  return `/band/live?type=LIVE&liveId=${encodeURIComponent(
    String(liveId),
  )}&action=accept`;
};

const createCoHostUpgradeApprovalDeepLink = (liveId) => {
  return `/band/live?type=LIVE_CO_HOST_UPGRADE_REQUEST&liveId=${encodeURIComponent(
    String(liveId),
  )}&action=approve`;
};

const appendQueryParam = (deepLink, key, value) => {
  try {
    const url = new URL(deepLink, self.location.origin);

    if (url.origin !== self.location.origin) return deepLink;

    url.searchParams.set(key, value);

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const separator = deepLink.includes("?") ? "&" : "?";

    return `${deepLink}${separator}${encodeURIComponent(key)}=${encodeURIComponent(
      value,
    )}`;
  }
};

const appendPushClickContext = (deepLink, context) => {
  try {
    const url = new URL(deepLink, self.location.origin);

    if (url.origin !== self.location.origin) return deepLink;

    url.searchParams.set("pushNotificationClicked", "1");

    Object.entries({
      notificationId: context.notificationId,
      pushTitle: context.title,
      pushBody: context.body,
      pushType: context.type,
      pushReferenceId: context.referenceId,
      pushDeepLink: context.deepLink,
    }).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return context.notificationId
      ? appendQueryParam(deepLink, "notificationId", context.notificationId)
      : deepLink;
  }
};

const getNotificationType = (data) => {
  return (
    data.type ||
    data.notificationType ||
    data.eventType ||
    data.kind ||
    data.category ||
    ""
  );
};

const shouldUseCoHostInviteActions = (data, notification) => {
  const type = getNotificationType(data);
  const liveId = getLiveIdFromData(data);

  if (!liveId) return false;
  if (isCoHostUpgradeRequest(data, notification)) return false;

  return isCoHostInviteType(type) || isLiveReferenceType(type);
};

const getBaseDeepLinkFromPayload = (payload) => {
  const data = payload.data || {};
  const type = getNotificationType(data);
  const liveId = getLiveIdFromData(data);
  const notification = payload.notification || {};

  if (liveId && isCoHostUpgradeRequest(data, notification)) {
    return createCoHostUpgradeApprovalDeepLink(liveId);
  }

  if ((isCoHostInviteType(type) || isLiveReferenceType(type)) && liveId) {
    return createBandLiveDeepLink(liveId);
  }

  return (
    data.deepLink ||
    data.link ||
    payload.fcmOptions?.link ||
    payload.webpush?.fcmOptions?.link ||
    "/"
  );
};

if (
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
) {
  importScripts(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
  );

  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    if ("BroadcastChannel" in self) {
      const channel = new BroadcastChannel("bscene-push");
      channel.postMessage(payload);
      channel.close();
    }

    console.info("[BScene Push SW] background message", payload);

    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || data.title || "B:Scene";
    const baseDeepLink = getBaseDeepLinkFromPayload(payload);
    const notificationId = getNotificationIdFromData(data);
    const pushClickContext = {
      notificationId,
      title,
      body: notification.body || data.body || "",
      type: getNotificationType(data),
      referenceId:
        data.referenceId ||
        data.liveId ||
        data.targetId ||
        data.resourceId ||
        "",
      deepLink: baseDeepLink,
    };
    const trackedDeepLink = appendPushClickContext(
      baseDeepLink,
      pushClickContext,
    );
    const shouldShowActions = shouldUseCoHostInviteActions(data, notification);

    const options = {
      body: notification.body || data.body,
      icon: notification.icon || "/favicon/favicon-96x96.png",
      badge: "/favicon/favicon-96x96.png",
      data: {
        deepLink: trackedDeepLink,
        acceptDeepLink: appendQueryParam(trackedDeepLink, "action", "accept"),
        notificationId: notificationId || null,
        title,
        body: notification.body || data.body || null,
        type: getNotificationType(data) || null,
        liveId: getLiveIdFromData(data) || null,
        referenceId: data.referenceId || null,
        originalDeepLink: baseDeepLink,
      },
    };

    if (shouldShowActions) {
      options.actions = [
        {
          action: "accept",
          title: "수락",
        },
        {
          action: "later",
          title: "나중에",
        },
      ];
    }

    return self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "later") {
    return;
  }

  const deepLink =
    event.action === "accept"
      ? event.notification.data?.acceptDeepLink
      : event.notification.data?.deepLink;

  const targetDeepLink = deepLink || "/";
  const notificationId = getStringValue(event.notification.data?.notificationId);
  const pushClickMessage = {
    type: "BSCENE_PUSH_NOTIFICATION_CLICK",
    notificationId,
    title: event.notification.title || event.notification.data?.title || "",
    body: event.notification.body || event.notification.data?.body || "",
    notificationType: event.notification.data?.type || "",
    referenceId:
      event.notification.data?.referenceId ||
      event.notification.data?.liveId ||
      "",
    deepLink: event.notification.data?.originalDeepLink || targetDeepLink,
  };

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        const existingClient = clientList.find((client) => {
          try {
            return new URL(client.url).origin === self.location.origin;
          } catch {
            return false;
          }
        });

        if (existingClient) {
          existingClient.postMessage(pushClickMessage);

          existingClient.focus();
          return existingClient.navigate(targetDeepLink);
        }

        return self.clients.openWindow(targetDeepLink);
      }),
  );
});
