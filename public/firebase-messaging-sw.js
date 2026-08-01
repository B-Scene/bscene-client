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

// 수락/나중에 액션은 명시적인 공동 진행자 초대 타입일 때만 노출한다.
// (BE가 일반 라이브 시작/예약 알림에도 type=LIVE를 쓰므로 type=LIVE만으로는 초대로 단정할 수 없다)
const shouldUseCoHostInviteActions = (data) => {
  const type = getNotificationType(data);
  const liveId = getLiveIdFromData(data);

  if (!liveId) return false;

  return isCoHostInviteType(type);
};

// BE가 내려주는 deepLink(FE 라우트)를 최우선으로 사용한다.
// type 기반 밴드 라이브 경로는 deepLink가 없는 구버전 payload용 폴백이다
const getBaseDeepLinkFromPayload = (payload) => {
  const data = payload.data || {};

  const deepLink =
    data.deepLink ||
    data.link ||
    payload.fcmOptions?.link ||
    payload.webpush?.fcmOptions?.link ||
    "";

  if (deepLink) return deepLink;

  const type = getNotificationType(data);
  const liveId = getLiveIdFromData(data);

  if ((isCoHostInviteType(type) || isLiveReferenceType(type)) && liveId) {
    return createBandLiveDeepLink(liveId);
  }

  return "/";
};

// 공동 진행자 초대의 "수락" 액션은 밴드 라이브 페이지의 자동 수락 플로우로 보낸다
const getAcceptDeepLink = (data, baseDeepLink) => {
  const liveId = getLiveIdFromData(data);

  if (shouldUseCoHostInviteActions(data) && liveId) {
    return appendQueryParam(createBandLiveDeepLink(liveId), "action", "accept");
  }

  return appendQueryParam(baseDeepLink, "action", "accept");
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
        acceptDeepLink: getAcceptDeepLink(data, baseDeepLink),
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
          // firebase SW 스코프(/firebase-cloud-messaging-push-scope) 밖의 페이지는
          // 이 SW가 제어하지 않아 client.navigate()가 거부된다 → 브로드캐스트로 앱 내 라우팅 위임
          const focusPromise = Promise.resolve(existingClient.focus()).catch(
            () => existingClient,
          );

          return focusPromise.then(() => {
            if ("BroadcastChannel" in self) {
              const channel = new BroadcastChannel("bscene-push-navigate");
              channel.postMessage({ deepLink: targetDeepLink });
              channel.close();
              return undefined;
            }

            return existingClient
              .navigate(targetDeepLink)
              .catch(() => self.clients.openWindow(targetDeepLink));
          });
        }

        return self.clients.openWindow(targetDeepLink);
      }),
  );
});