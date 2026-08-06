import { useEffect, useMemo, useState } from "react";
import type { ScheduledLiveCardData } from "./types";
import { parseScheduledAtTime } from "./scheduledLiveTime";

const STORAGE_KEY = "band-live-owned-scheduled-v1";
const CO_HOST_STORAGE_KEY = "band-live-co-host-user-ids-v1";
const LATE_START_RETENTION_MS = 30 * 60 * 1000;

const getScheduledLiveExpiry = (live: ScheduledLiveCardData) => {
  const scheduledTime = parseScheduledAtTime(live.scheduledAt);
  return scheduledTime === null ? null : scheduledTime + LATE_START_RETENTION_MS;
};

export const useRetainedScheduledLiveCards = (
  lives: ScheduledLiveCardData[],
) => {
  const [expiryNow, setExpiryNow] = useState(Date.now);

  const retainedLives = useMemo(() => {
    return lives.filter((live) => {
      const expiry = getScheduledLiveExpiry(live);
      return expiry !== null && expiry > expiryNow;
    });
  }, [expiryNow, lives]);

  useEffect(() => {
    const now = Date.now();
    const nextExpiry = retainedLives.reduce<number | null>((nearest, live) => {
      const expiry = getScheduledLiveExpiry(live);
      if (expiry === null || expiry <= now) return nearest;
      return nearest === null ? expiry : Math.min(nearest, expiry);
    }, null);

    if (nextExpiry === null) return;

    const timeoutId = window.setTimeout(
      () => setExpiryNow(Date.now()),
      Math.max(0, nextExpiry - now + 50),
    );
    return () => window.clearTimeout(timeoutId);
  }, [expiryNow, retainedLives]);

  return retainedLives;
};

const isScheduledLiveCard = (value: unknown): value is ScheduledLiveCardData => {
  if (typeof value !== "object" || value === null) return false;

  const card = value as Partial<ScheduledLiveCardData>;

  return (
    typeof card.id === "number" &&
    typeof card.title === "string" &&
    typeof card.bandName === "string" &&
    typeof card.scheduledAt === "string" &&
    card.isMine === true
  );
};

export const getCachedOwnedScheduledLives = (): ScheduledLiveCardData[] => {
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (!cached) return [];

    const parsed = JSON.parse(cached) as unknown;
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const retainedLives = parsed.filter(isScheduledLiveCard).filter((live) => {
      const expiry = getScheduledLiveExpiry(live);
      return expiry !== null && expiry > now;
    });

    if (retainedLives.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(retainedLives));
    }

    return retainedLives;
  } catch {
    return [];
  }
};

export const cacheOwnedScheduledLives = (
  lives: ScheduledLiveCardData[],
) => {
  const now = Date.now();
  const ownedLives = lives.filter((live) => {
    if (!live.isMine) return false;

    const expiry = getScheduledLiveExpiry(live);
    return expiry !== null && expiry > now;
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ownedLives));
};

export const removeCachedOwnedScheduledLive = (liveId: number) => {
  cacheOwnedScheduledLives(
    getCachedOwnedScheduledLives().filter((live) => live.id !== liveId),
  );
};

const getCoHostUserIdMap = (): Record<string, number[]> => {
  try {
    const cached = window.localStorage.getItem(CO_HOST_STORAGE_KEY);
    if (!cached) return {};

    const parsed = JSON.parse(cached) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(parsed).map(([liveId, userIds]) => [
        liveId,
        Array.isArray(userIds)
          ? userIds.filter(
              (userId): userId is number =>
                typeof userId === "number" && Number.isFinite(userId),
            )
          : [],
      ]),
    );
  } catch {
    return {};
  }
};

export const cacheScheduledCoHostUserIds = (
  liveId: number,
  userIds: number[],
) => {
  if (userIds.length === 0) return;

  const cached = getCoHostUserIdMap();
  cached[String(liveId)] = userIds;
  window.localStorage.setItem(CO_HOST_STORAGE_KEY, JSON.stringify(cached));
};

export const getCachedScheduledCoHostUserIds = (liveId: number) => {
  return getCoHostUserIdMap()[String(liveId)] ?? [];
};
