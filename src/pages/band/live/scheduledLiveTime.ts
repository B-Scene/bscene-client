import { useEffect, useState } from "react";

const KOREAN_SCHEDULE_PATTERN =
  /(?:(\d{4})[.\-/년]\s*)?(\d{1,2})[.\-/월]\s*(\d{1,2})(?:[.\-/일])?(?:\s*\([^)]*\))?\s*(오전|오후|AM|PM)?\s*(\d{1,2}):(\d{2})/i;

export const parseScheduledAtTime = (scheduledAt: string) => {
  const value = scheduledAt.trim();
  if (!value) return null;

  const nativeDate = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (!Number.isNaN(nativeDate.getTime())) return nativeDate.getTime();

  const matched = value.match(KOREAN_SCHEDULE_PATTERN);
  if (!matched) return null;

  const [, yearValue, monthValue, dayValue, meridiem, hourValue, minuteValue] =
    matched;
  const year = yearValue ? Number(yearValue) : new Date().getFullYear();
  const month = Number(monthValue);
  const day = Number(dayValue);
  let hour = Number(hourValue);
  const minute = Number(minuteValue);
  const normalizedMeridiem = meridiem?.toUpperCase();

  if ((normalizedMeridiem === "오후" || normalizedMeridiem === "PM") && hour < 12) {
    hour += 12;
  }

  if ((normalizedMeridiem === "오전" || normalizedMeridiem === "AM") && hour === 12) {
    hour = 0;
  }

  const parsedDate = new Date(year, month - 1, day, hour, minute);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getTime();
};

export const isScheduledLiveStartable = (
  scheduledAt: string,
  now = Date.now(),
) => {
  const scheduledTime = parseScheduledAtTime(scheduledAt);
  return scheduledTime !== null && scheduledTime <= now;
};

export const useScheduledLiveNow = () => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
};
