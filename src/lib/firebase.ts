import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const hasFirebaseMessagingConfig =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.messagingSenderId) &&
  Boolean(firebaseConfig.appId) &&
  Boolean(firebaseVapidKey);

const getFirebaseApp = () => {
  if (!hasFirebaseMessagingConfig) return null;

  return getApps()[0] ?? initializeApp(firebaseConfig);
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (!hasFirebaseMessagingConfig) return null;

  const supported = await isSupported();

  if (!supported) return null;

  const app = getFirebaseApp();

  return app ? getMessaging(app) : null;
};
