import {
  deleteToken,
  getToken,
  onMessage,
  type MessagePayload,
} from "firebase/messaging";
import { deletePushToken, registerPushToken } from "@/api/notification";
import {
  firebaseConfig,
  firebaseVapidKey,
  getFirebaseMessaging,
  hasFirebaseMessagingConfig,
} from "@/lib/firebase";

const FCM_TOKEN_STORAGE_KEY = "fcmRegistrationToken";
const FIREBASE_MESSAGING_SW_PATH = "/firebase-messaging-sw.js";
const FIREBASE_MESSAGING_SW_SCOPE = "/firebase-cloud-messaging-push-scope";

type PushPermissionResult = NotificationPermission | "unsupported";

const getFirebaseMessagingServiceWorkerUrl = () => {
  const params = new URLSearchParams({
    apiKey: String(firebaseConfig.apiKey ?? ""),
    authDomain: String(firebaseConfig.authDomain ?? ""),
    projectId: String(firebaseConfig.projectId ?? ""),
    storageBucket: String(firebaseConfig.storageBucket ?? ""),
    messagingSenderId: String(firebaseConfig.messagingSenderId ?? ""),
    appId: String(firebaseConfig.appId ?? ""),
  });

  return `${FIREBASE_MESSAGING_SW_PATH}?${params.toString()}`;
};

export const isWebPushAvailable = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  hasFirebaseMessagingConfig;

export const requestWebPushPermission =
  async (): Promise<PushPermissionResult> => {
    if (!isWebPushAvailable()) return "unsupported";

    if (Notification.permission !== "default") {
      return Notification.permission;
    }

    return Notification.requestPermission();
  };

export const registerFirebaseMessagingServiceWorker = async () => {
  if (!isWebPushAvailable()) return null;

  return navigator.serviceWorker.register(getFirebaseMessagingServiceWorkerUrl(), {
    scope: FIREBASE_MESSAGING_SW_SCOPE,
    updateViaCache: "none",
  });
};

export const requestAndRegisterWebPushToken = async () => {
  const permission = await requestWebPushPermission();

  if (permission !== "granted") return null;

  const messaging = await getFirebaseMessaging();
  const serviceWorkerRegistration =
    await registerFirebaseMessagingServiceWorker();

  if (!messaging || !serviceWorkerRegistration || !firebaseVapidKey) {
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration,
  });

  if (!token) return null;

  await registerPushToken({
    token,
    platform: "WEB",
  });

  localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

  return token;
};

export const deleteRegisteredWebPushToken = async () => {
  const storedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

  if (storedToken) {
    await deletePushToken({ token: storedToken });
  }

  const messaging = await getFirebaseMessaging();

  if (messaging) {
    await deleteToken(messaging);
  }

  localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
};

export const onForegroundPushMessage = async (
  handler: (payload: MessagePayload) => void,
) => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) return () => undefined;

  return onMessage(messaging, handler);
};

export const getWebPushDebugInfo = async () => {
  const registrations = "serviceWorker" in navigator
    ? await navigator.serviceWorker.getRegistrations()
    : [];
  const storedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

  return {
    available: isWebPushAvailable(),
    permission:
      typeof Notification === "undefined" ? "unsupported" : Notification.permission,
    hasFirebaseMessagingConfig,
    hasVapidKey: Boolean(firebaseVapidKey),
    storedTokenPrefix: storedToken ? storedToken.slice(0, 16) : null,
    serviceWorkers: registrations.map((registration) => ({
      scope: registration.scope,
      activeScriptURL: registration.active?.scriptURL ?? null,
      installingScriptURL: registration.installing?.scriptURL ?? null,
      waitingScriptURL: registration.waiting?.scriptURL ?? null,
    })),
  };
};
