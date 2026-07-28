importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDfgFDjyvqgZMP0MxPq1mMSBo4KPyPoBZk",
  authDomain: "bscene-2b878.firebaseapp.com",
  projectId: "bscene-2b878",
  storageBucket: "bscene-2b878.firebasestorage.app",
  messagingSenderId: "1039012909710",
  appId: "1:1039012909710:web:6c0607dd662d7c56662fdf",
  measurementId: "G-97HB912NQN",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "BScene";
  const options = {
    body: payload.notification?.body,
    icon: "/favicon/favicon-96x96.png",
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.deepLink || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
