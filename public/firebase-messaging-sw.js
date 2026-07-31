/* global firebase */

const firebaseConfig = Object.fromEntries(
  new URL(self.location.href).searchParams.entries(),
);

const getStringValue = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
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

const getLiveIdFromData = (data) => {
  return (
    getStringValue(data.liveId) ||
    getStringValue(data.referenceId) ||
    getStringValue(data.targetId) ||
    getStringValue(data.resourceId)
  );
};

const createBandLiveDeepLink = (liveId) => {
  return `/band/live?type=LIVE&liveId=${encodeURIComponent(String(liveId))}`;
};

const appendQueryParam = (deepLink, key, value) => {
  try {
    const url = new URL(deepLink, self.location.origin);

    url.searchParams.set(key, value);

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const separator = deepLink.includes("?") ? "&" : "?";

    return `${deepLink}${separator}${encodeURIComponent(key)}=${encodeURIComponent(
      value,
    )}`;
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

const shouldUseCoHostInviteActions = (data) => {
  const type = getNotificationType(data);
  const liveId = getLiveIdFromData(data);

  if (!liveId) return false;

  return isCoHostInviteType(type) || isLiveReferenceType(type);
};

const getBaseDeepLinkFromPayload = (payload) => {
  const data = payload.data || {};
  const type = getNotificationType(data);
  const liveId = getLiveIdFromData(data);

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
    const shouldShowActions = shouldUseCoHostInviteActions(data);

    const options = {
      body: notification.body || data.body,
      icon: notification.icon || "/favicon/favicon-96x96.png",
      badge: "/favicon/favicon-96x96.png",
      data: {
        deepLink: baseDeepLink,
        acceptDeepLink: appendQueryParam(baseDeepLink, "action", "accept"),
        type: getNotificationType(data) || null,
        liveId: getLiveIdFromData(data) || null,
        referenceId: data.referenceId || null,
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

    self.registration.showNotification(title, options);
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
          existingClient.focus();
          return existingClient.navigate(targetDeepLink);
        }

        return self.clients.openWindow(targetDeepLink);
      }),
  );
});