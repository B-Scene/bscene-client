import type { NotificationItem } from "@/types/notification";

const STORAGE_KEY = "bscenePendingPushNotificationReads";
const MAX_PENDING_READS = 10;

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

const normalizeText = (value: string) => value.trim();

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
    notification.deepLink?.trim() === pendingRead.deepLink.trim()
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
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredMatches[0]?.notification ?? unreadNotifications[0] ?? null;
};
