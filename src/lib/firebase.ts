import { initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    "AIzaSyDfgFDjyvqgZMP0MxPq1mMSBo4KPyPoBZk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "bscene-2b878.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "bscene-2b878",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "bscene-2b878.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "1039012909710",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:1039012909710:web:6c0607dd662d7c56662fdf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-97HB912NQN",
};

export const firebaseVapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ??
  "BKfX1BUwjZqH8HKjclciO9j0fdg-Mm5c_Nfb1j3FZj9bcZvtW-9qlqFycSf8ZSsU_yYflNOOTFFPtVDw7ll69Yk";

let firebaseApp: FirebaseApp | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

export const getFirebaseApp = () => {
  firebaseApp ??= initializeApp(firebaseConfig);

  return firebaseApp;
};

export const getFirebaseMessaging = () => {
  messagingPromise ??= isSupported()
    .then((supported) => (supported ? getMessaging(getFirebaseApp()) : null))
    .catch(() => null);

  return messagingPromise;
};

export const hasFirebaseMessagingConfig = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.messagingSenderId);
