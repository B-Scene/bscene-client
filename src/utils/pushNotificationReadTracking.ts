import type { NotificationItem } from "@/types/notification";

const STORAGE_KEY = "bscenePendingPushNotificationReads";
const MAX_PENDING_READS = 10;
const DB_NAME = "bscenePushNotificationReads";
const DB_VERSION = 1;
const STORE_NAME = "pendingReads";

export type PendingPushNotificationRead = {
  key: string;
  notificationId: number | null;
  title: string;
  body: string;
  type: string;
  referenceId: number | null;
  deepLink: string;
  createdAt: number;
};

export type PushNotificationReadContext = Omit<
  PendingPushNotificationRead,
  "key" | "createdAt"
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toPositiveNumberOrNull = (value: unknown) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const toString = (value: unknown) => (typeof value === "string" ? value : "");

const normalizePendingRead = (
  value: unknown,
): PendingPushNotificationRead | null => {
  if (!isRecord(value)) return null;

  const createdAt = Number(value.createdAt);

  return {
    key: toString(value.key) || `${Date.now()}`,
    notificationId: toPositiveNumberOrNull(value.notificationId),
    title: toString(value.title),
    body: toString(value.body),
    type: toString(value.type),
    referenceId: toPositiveNumberOrNull(value.referenceId),
    deepLink: toString(value.deepLink),
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  };
};

export const getPendingPushNotificationReads = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

    return Array.isArray(parsed)
      ? parsed.map(normalizePendingRead).filter((item) => item !== null)
      : [];
  } catch {
    return [];
  }
};

const openPendingReadDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const getIndexedDbPendingPushNotificationReads = async () => {
  try {
    const db = await openPendingReadDb();

    return await new Promise<PendingPushNotificationRead[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(
          Array.isArray(request.result)
            ? request.result
                .map(normalizePendingRead)
                .filter((item) => item !== null)
            : [],
        );
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  } catch {
    return [];
  }
};

export const getAllPendingPushNotificationReads = async () => {
  const pendingReads = [
    ...getPendingPushNotificationReads(),
    ...(await getIndexedDbPendingPushNotificationReads()),
  ];
  const seenKeys = new Set<string>();
  const seenNotificationIds = new Set<number>();

  return pendingReads.filter((item) => {
    if (seenKeys.has(item.key)) return false;

    if (item.notificationId !== null) {
      if (seenNotificationIds.has(item.notificationId)) return false;
      seenNotificationIds.add(item.notificationId);
    }

    seenKeys.add(item.key);
    return true;
  });
};

export const savePendingPushNotificationRead = (
  context: PushNotificationReadContext,
) => {
  const pendingRead: PendingPushNotificationRead = {
    ...context,
    key:
      context.notificationId !== null
        ? `id:${context.notificationId}`
        : `push:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
  const nextPendingReads = [
    pendingRead,
    ...getPendingPushNotificationReads().filter((item) =>
      pendingRead.notificationId !== null
        ? item.notificationId !== pendingRead.notificationId
        : item.key !== pendingRead.key,
    ),
  ].slice(0, MAX_PENDING_READS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPendingReads));

  return pendingRead;
};

export const saveIndexedDbPendingPushNotificationRead = async (
  pendingRead: PendingPushNotificationRead,
) => {
  try {
    const db = await openPendingReadDb();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(pendingRead);

      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    // localStorage fallback above is enough when IndexedDB is unavailable.
  }
};

export const removePendingPushNotificationReads = (keys: readonly string[]) => {
  if (keys.length === 0) return;

  const keySet = new Set(keys);
  const nextPendingReads = getPendingPushNotificationReads().filter(
    (item) => !keySet.has(item.key),
  );

  if (nextPendingReads.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPendingReads));
};

export const removeIndexedDbPendingPushNotificationReads = async (
  keys: readonly string[],
) => {
  if (keys.length === 0) return;

  try {
    const db = await openPendingReadDb();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      keys.forEach((key) => store.delete(key));

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    // Nothing to clean up if IndexedDB is unavailable.
  }
};

export const removeAllPendingPushNotificationReads = (keys: readonly string[]) => {
  removePendingPushNotificationReads(keys);
  void removeIndexedDbPendingPushNotificationReads(keys);
};

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

const normalizeDeepLink = (value: string | null | undefined) => {
  if (!value) return "";

  try {
    const url = new URL(value, window.location.origin);

    [
      "pushNotificationClicked",
      "notificationId",
      "pushTitle",
      "pushBody",
      "pushType",
      "pushReferenceId",
      "pushDeepLink",
    ].forEach((key) => url.searchParams.delete(key));

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value.trim();
  }
};

const getNotificationMatchScore = (
  notification: NotificationItem,
  pendingRead: PushNotificationReadContext,
) => {
  let score = 0;

  if (
    pendingRead.title &&
    normalizeText(notification.title) === normalizeText(pendingRead.title)
  ) {
    score += 4;
  }

  if (
    pendingRead.body &&
    normalizeText(notification.body) === normalizeText(pendingRead.body)
  ) {
    score += 4;
  }

  if (
    pendingRead.type &&
    notification.type.toUpperCase() === pendingRead.type.toUpperCase()
  ) {
    score += 2;
  }

  if (
    pendingRead.referenceId !== null &&
    notification.referenceId === pendingRead.referenceId
  ) {
    score += 2;
  }

  if (
    pendingRead.deepLink &&
    normalizeDeepLink(notification.deepLink) ===
      normalizeDeepLink(pendingRead.deepLink)
  ) {
    score += 2;
  }

  return score;
};

export const findNotificationForPendingPushRead = (
  notifications: readonly NotificationItem[],
  pendingRead: PushNotificationReadContext,
) => {
  const idMatchedNotification =
    pendingRead.notificationId !== null
      ? notifications.find(
          (notification) =>
            notification.notificationId === pendingRead.notificationId,
        )
      : null;

  if (idMatchedNotification) return idMatchedNotification;

  const unreadNotifications = notifications
    .filter((notification) => !notification.isRead)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const scoredMatches = unreadNotifications
    .map((notification) => ({
      notification,
      score: getNotificationMatchScore(notification, pendingRead),
    }))
    .filter(({ score }) => score >= 6)
    .sort((a, b) => b.score - a.score);

  return scoredMatches[0]?.notification ?? null;
};
