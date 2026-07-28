import { getToken, onMessage } from "firebase/messaging";
import { registerPushToken } from "@/api/notification";
import {
  firebaseVapidKey,
  getFirebaseMessaging,
  hasFirebaseMessagingConfig,
} from "@/lib/firebase";

const STORED_FCM_TOKEN_KEY = "bscene:fcm-token";

export const getStoredWebPushToken = () =>
  window.localStorage.getItem(STORED_FCM_TOKEN_KEY);

export const requestAndRegisterWebPushToken = async () => {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") return null;

  const messaging = await getFirebaseMessaging();

  if (!messaging || !firebaseVapidKey) return null;

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) return null;

  await registerPushToken({
    token,
    platform: "WEB",
  });
  window.localStorage.setItem(STORED_FCM_TOKEN_KEY, token);

  return token;
};

export const listenForegroundPushNotifications = (
  onReceive?: (payload: unknown) => void,
) => {
  let unsubscribe: (() => void) | null = null;
  let isActive = true;

  void getFirebaseMessaging().then((messaging) => {
    if (!isActive || !messaging) return;

    unsubscribe = onMessage(messaging, (payload) => {
      onReceive?.(payload);
    });
  });

  return () => {
    isActive = false;
    unsubscribe?.();
  };
};

export const getWebPushDebugStatus = async () => {
  const registrations = "serviceWorker" in navigator
    ? await navigator.serviceWorker.getRegistrations()
    : [];

  return {
    available: "Notification" in window && "serviceWorker" in navigator,
    permission: "Notification" in window ? Notification.permission : "unsupported",
    hasFirebaseMessagingConfig: hasFirebaseMessagingConfig(),
    hasVapidKey: Boolean(firebaseVapidKey),
    storedTokenPrefix: getStoredWebPushToken()?.slice(0, 16) ?? null,
    serviceWorkers: registrations.map((registration) => ({
      scope: registration.scope,
      active: Boolean(registration.active),
    })),
  };
};
