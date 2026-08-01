/* global firebase */

const firebaseConfig = Object.fromEntries(
  new URL(self.location.href).searchParams.entries(),
);

if (
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
) {
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

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
    const options = {
      body: notification.body || data.body,
      icon: notification.icon || "/favicon/favicon-96x96.png",
      badge: "/favicon/favicon-96x96.png",
      data: {
        deepLink:
          data.deepLink ||
          data.link ||
          payload.fcmOptions?.link ||
          payload.webpush?.fcmOptions?.link ||
          "/",
      },
    };

    return self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const deepLink = event.notification.data?.deepLink || "/";

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
          return existingClient.navigate(deepLink);
        }

        return self.clients.openWindow(deepLink);
      }),
  );
});
