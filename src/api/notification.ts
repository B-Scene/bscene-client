import { axiosInstance } from "@/api/axiosInstance";
import type { ApiResponse } from "@/types/auth/auth";
import type {
  GetNotificationsParams,
  GetNotificationSettingsParams,
  DeletePushTokenRequest,
  NotificationBandInvite,
  NotificationItem,
  NotificationSettingType,
  NotificationSettingsResponse,
  NotificationsPageResponse,
  RegisterPushTokenRequest,
  SendTestNotificationRequest,
  UpdateNotificationSettingRequest,
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

const toBooleanOrNull = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null;

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
    deepLink: toStringOrNull(item.deepLink),
    referenceId: toNumberOrNull(item.referenceId),
    title: toStringOrNull(item.title) ?? "",
    body: toStringOrNull(item.body) ?? "",
    isRead: toBoolean(item.isRead),
    readAt: toStringOrNull(item.readAt),
    createdAt: toStringOrNull(item.createdAt) ?? "",
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

export const getNotificationSettingKey = (settingType: string) => {
  const mappedKey =
    NOTIFICATION_SETTING_KEY_BY_TYPE[settingType as NotificationSettingType];

  return mappedKey ?? normalizeSettingKey(settingType);
};

const getSettingBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  if (!isRecord(value)) return null;

  return (
    toBooleanOrNull(value.enabled) ??
    toBooleanOrNull(value.isEnabled) ??
    toBooleanOrNull(value.value) ??
    toBooleanOrNull(value.checked) ??
    toBooleanOrNull(value.on)
  );
};

const getSettingItemKey = (item: RawRecord): string | null => {
  const key =
    toStringOrNull(item.key) ??
    toStringOrNull(item.settingKey) ??
    toStringOrNull(item.type) ??
    toStringOrNull(item.name) ??
    toStringOrNull(item.id);

  return key ? getNotificationSettingKey(key) : null;
};

const getSettingsSource = (result: unknown): unknown => {
  if (!isRecord(result)) return result;

  return (
    result.settings ??
    result.notificationSettings ??
    result.items ??
    result.content ??
    result.data ??
    result
  );
};

const normalizeNotificationSettings = (
  result: unknown,
): NotificationSettingsResponse => {
  const source = getSettingsSource(result);
  const values: Record<string, boolean> = {};

  if (Array.isArray(source)) {
    source.forEach((item) => {
      if (!isRecord(item)) return;

      const key = getSettingItemKey(item);
      const value = getSettingBoolean(item);

      if (key && value !== null) {
        values[key] = value;
      }
    });
  } else if (isRecord(source)) {
    Object.entries(source).forEach(([key, value]) => {
      const normalizedKey = getNotificationSettingKey(key);
      const normalizedValue = getSettingBoolean(value);

      if (normalizedValue !== null) {
        values[normalizedKey] = normalizedValue;
      }
    });
  }

  const mode = isRecord(result) ? toStringOrNull(result.mode) : null;

  return {
    mode: mode === "FAN" || mode === "BAND" ? mode : null,
    values,
  };
};

export const getNotifications = async (
  params: GetNotificationsParams = {},
): Promise<NotificationsPageResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<unknown>>(
    "/notifications",
    { params },
  );

  if (data.isSuccess === false) {
    throw new Error(data.message || "알림 목록을 불러오지 못했어요");
  }

  return normalizeNotificationsPage(data.result);
};

export const getNotificationSettings = async ({
  mode,
}: GetNotificationSettingsParams): Promise<NotificationSettingsResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<unknown>>(
    "/users/me/notification-settings",
    { params: { mode } },
  );

  if (data.isSuccess === false) {
    throw new Error("알림 설정을 불러오지 못했어요");
  }

  return normalizeNotificationSettings(data.result);
};

export const updateNotificationSetting = async ({
  settingType,
  enabled,
}: UpdateNotificationSettingRequest) => {
  const { data } = await axiosInstance.patch<ApiResponse<unknown>>(
    `/users/me/notification-settings/${settingType}`,
    { enabled },
  );

  if (data.isSuccess === false) {
    throw new Error(data.message || "알림 설정을 변경하지 못했어요");
  }

  return data.result;
};

export const registerPushToken = async (body: RegisterPushTokenRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<unknown>>(
    "/notifications/tokens",
    body,
  );

  if (data.isSuccess === false) {
    throw new Error(data.message || "푸시 알림 토큰을 등록하지 못했어요");
  }

  return data.result;
};

export const deletePushToken = async (body: DeletePushTokenRequest) => {
  const { data } = await axiosInstance.delete<ApiResponse<unknown>>(
    "/notifications/tokens",
    { data: body },
  );

  if (data.isSuccess === false) {
    throw new Error(data.message || "푸시 알림 토큰을 삭제하지 못했어요");
  }

  return data.result;
};

export const sendTestNotification = async (
  body: SendTestNotificationRequest,
) => {
  const { data } = await axiosInstance.post<ApiResponse<unknown>>(
    "/notifications/test",
    body,
  );

  if (data.isSuccess === false) {
    throw new Error(data.message || "테스트 알림을 보내지 못했어요");
  }

  return data.result;
};

export const markNotificationAsRead = async (notificationId: number) => {
  const { data } = await axiosInstance.patch<ApiResponse<unknown>>(
    `/notifications/${notificationId}/read`,
  );

  if (data.isSuccess === false) {
    throw new Error(data.message || "알림을 읽음 처리하지 못했어요");
  }

  return data.result;
};
