import { axiosInstance } from "@/api/axiosInstance";
import type { ApiResponse } from "@/types/auth/auth";
import type {
  DeletePushTokenRequest,
  GetNotificationsParams,
  NotificationBandInvite,
  NotificationItem,
  NotificationSettingType,
  NotificationSettingsMode,
  NotificationSettingsResponse,
  NotificationsPageResponse,
  RegisterPushTokenRequest,
  SendTestNotificationRequest,
  UpdateNotificationSettingParams,
} from "@/types/notification";

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toStringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const toBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const toNotificationMode = (value: unknown): NotificationSettingsMode | null => {
  if (typeof value !== "string") return null;

  const mode = value.toUpperCase();

  return mode === "FAN" || mode === "BAND"
    ? (mode as NotificationSettingsMode)
    : null;
};

const normalizeServerDateTime = (value: unknown): string => {
  const dateTime = toStringOrNull(value)?.trim();

  if (!dateTime) return "";

  const isoDateTime = dateTime.includes("T")
    ? dateTime
    : dateTime.replace(" ", "T");

  if (/Z$/i.test(isoDateTime)) return isoDateTime.replace(/z$/, "Z");
  if (/[+-]\d{2}:\d{2}$/.test(isoDateTime)) return isoDateTime;
  if (/[+-]\d{4}$/.test(isoDateTime)) {
    return isoDateTime.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  }

  return /\d[ T]\d/.test(dateTime) ? `${isoDateTime}+09:00` : isoDateTime;
};

const normalizeBandInvite = (value: unknown): NotificationBandInvite | null =>
  isRecord(value) ? value : null;

const normalizeNotification = (
  value: unknown,
  fallbackIndex: number,
): NotificationItem => {
  const item = isRecord(value) ? value : {};
  const notificationId =
    toNumberOrNull(item.notificationId) ??
    toNumberOrNull(item.id) ??
    toNumberOrNull(item.notification_id) ??
    -fallbackIndex - 1;

  return {
    notificationId,
    type: toStringOrNull(item.type) ?? "UNKNOWN",
    mode:
      toNotificationMode(item.mode) ??
      toNotificationMode(item.notificationMode) ??
      toNotificationMode(item.receiverMode) ??
      toNotificationMode(item.targetMode) ??
      toNotificationMode(item.userMode),
    deepLink: toStringOrNull(item.deepLink),
    referenceId: toNumberOrNull(item.referenceId),
    title: toStringOrNull(item.title) ?? "",
    body: toStringOrNull(item.body) ?? "",
    isRead: toBoolean(item.isRead),
    readAt: toStringOrNull(item.readAt),
    createdAt: normalizeServerDateTime(item.createdAt),
    actionable: toBoolean(item.actionable),
    bandInvite: normalizeBandInvite(item.bandInvite),
  };
};

const findItems = (result: unknown): unknown[] => {
  if (Array.isArray(result)) return result;
  if (!isRecord(result)) return [];

  const candidates = [
    result.items,
    result.notifications,
    result.content,
    result.data,
    result.list,
    result.results,
  ];

  return candidates.find(Array.isArray) ?? [];
};

const getPageInfo = (result: unknown): RawRecord => {
  if (!isRecord(result)) return {};

  return isRecord(result.pageInfo) ? result.pageInfo : result;
};

const normalizeNotificationsPage = (
  result: unknown,
): NotificationsPageResponse => {
  const pageInfo = getPageInfo(result);
  const nextCursor =
    toNumberOrNull(pageInfo.nextCursor) ?? toNumberOrNull(pageInfo.cursor);

  return {
    items: findItems(result).map(normalizeNotification),
    hasNext: toBoolean(pageInfo.hasNext, nextCursor !== null),
    nextCursor,
  };
};

const normalizeSettingKey = (key: string) =>
  key
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const NOTIFICATION_SETTING_KEY_BY_TYPE: Record<
  NotificationSettingType,
  string
> = {
  FAN_FOLLOWED_BAND_PERFORMANCE: "new-concert",
  FAN_PERFORMANCE_REMINDER: "concert-reminder",
  FAN_PERFORMANCE_UPDATE: "concert-info-change",
  FAN_FOLLOWED_BAND_LIVE_START: "followed-band-live-start",
  FAN_SCHEDULED_LIVE_REMINDER: "upcoming-live-reminder",
  FAN_LIVE_REPLAY_READY: "live-replay",
  BAND_NEW_SESSION_APPLICATION: "new-applicant",
  BAND_SESSION_APPLICATION_STATUS: "application-status",
  BAND_SESSION_RECRUITMENT_DEADLINE: "recruit-deadline",
  BAND_SCHEDULED_LIVE_REMINDER: "upcoming-live-reminder",
  BAND_LIVE_START_STATUS: "live-start-status",
};

const normalizeNotificationSettings = (
  result: unknown,
): NotificationSettingsResponse => {
  const record = isRecord(result) ? result : {};
  const valuesSource = isRecord(record.values) ? record.values : record;
  const values = Object.entries(valuesSource).reduce<Record<string, boolean>>(
    (acc, [key, value]) => {
      if (typeof value !== "boolean") return acc;

      const mappedKey =
        NOTIFICATION_SETTING_KEY_BY_TYPE[key as NotificationSettingType] ??
        normalizeSettingKey(key);

      acc[mappedKey] = value;
      return acc;
    },
    {},
  );

  return {
    mode:
      record.mode === "FAN" || record.mode === "BAND"
        ? (record.mode as NotificationSettingsMode)
        : null,
    values,
  };
};

export const getNotifications = async ({
  cursor,
  size = 20,
}: GetNotificationsParams = {}) => {
  const { data } = await axiosInstance.get<ApiResponse<unknown>>(
    "/notifications",
    {
      params: { cursor, size },
    },
  );

  return normalizeNotificationsPage(data.result);
};

export const markNotificationAsRead = async (notificationId: number) => {
  const { data } = await axiosInstance.patch<ApiResponse<null>>(
    `/notifications/${notificationId}/read`,
  );

  return data.result;
};

export const getNotificationSettings = async (
  mode: NotificationSettingsMode,
) => {
  const { data } = await axiosInstance.get<ApiResponse<unknown>>(
    "/users/me/notification-settings",
    { params: { mode } },
  );

  return normalizeNotificationSettings(data.result);
};

export const updateNotificationSetting = async ({
  mode,
  settingType,
  enabled,
}: UpdateNotificationSettingParams) => {
  const { data } = await axiosInstance.patch<ApiResponse<null>>(
    `/users/me/notification-settings/${settingType}`,
    { enabled },
    { params: { mode } },
  );

  return data.result;
};

export const registerPushToken = async (body: RegisterPushTokenRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    "/notifications/tokens",
    body,
  );

  return data.result;
};

export const deletePushToken = async (body: DeletePushTokenRequest) => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    "/notifications/tokens",
    { data: body },
  );

  return data.result;
};

export const sendTestNotification = async (
  body: SendTestNotificationRequest,
) => {
  const { data } = await axiosInstance.post<ApiResponse<null>>(
    "/notifications/test",
    body,
  );

  return data.result;
};
