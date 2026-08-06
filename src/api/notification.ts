import { axiosInstance } from "@/api/axiosInstance";
import type { ApiResponse } from "@/types/auth/auth";
import type {
  GetNotificationsParams,
  GetNotificationSettingsParams,
  DeletePushTokenRequest,
  NotificationBandInvite,
  NotificationItem,
  NotificationSettingsMode,
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
    actionable:
      toBoolean(item.actionable) ||
      toBoolean(isRecord(item.bandInvite) ? item.bandInvite.actionable : null),
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

  return {
    mode: isRecord(result) ? toNotificationMode(result.mode) : null,
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

type RouteBuilder = (id: string | number, suffix: string) => string;

export type NotificationMode = "FAN" | "BAND";

export interface NotificationRouteMapping {
  post: RouteBuilder;
  concert: RouteBuilder;
  live: RouteBuilder;
  band: RouteBuilder;
  message?: RouteBuilder;
  application?: RouteBuilder;
  recruitment?: RouteBuilder;
  knownPrefixes: string[];
  fallback: (notification: NotificationItem) => string | null;
}

export const formatNotificationTime = (createdAt: string) => {
  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) return "";

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / 60_000),
  );

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return `${createdDate.getFullYear()}.${
    createdDate.getMonth() + 1
  }.${createdDate.getDate()}.`;
};

export const normalizeDeepLink = (deepLink: string) => {
  if (/^https?:\/\//i.test(deepLink)) {
    try {
      const url = new URL(deepLink);

      if (url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      return deepLink;
    }

    return deepLink;
  }

  return deepLink.startsWith("/") ? deepLink : `/${deepLink}`;
};

export const getRouteSuffix = (path: string) =>
  path.match(/[?#].*$/)?.[0] ?? "";

const isCoHostInviteNotification = (type: string) => {
  const normalizedType = type.toUpperCase();

  return (
    (normalizedType.includes("CO_HOST") ||
      normalizedType.includes("COHOST")) &&
    (normalizedType.includes("INVITE") ||
      normalizedType.includes("INVITATION"))
  );
};

const getLiveIdFromDeepLink = (deepLink?: string | null) => {
  if (!deepLink) return null;

  const path = normalizeDeepLink(deepLink.trim());

  try {
    const url = /^https?:\/\//i.test(path)
      ? new URL(path)
      : new URL(path, window.location.origin);

    const queryLiveId =
      url.searchParams.get("coHostInviteLiveId") ||
      url.searchParams.get("liveId") ||
      url.searchParams.get("referenceId");

    if (queryLiveId) return queryLiveId;
  } catch {
    return null;
  }

  return path.match(/\/lives?\/(\d+)(?=[/?#]|$)/i)?.[1] ?? null;
};

const getCoHostInvitePath = (liveId: string | number) =>
  `/band/live?type=LIVE_CO_HOST_INVITE&liveId=${encodeURIComponent(
    String(liveId),
  )}`;

export const FAN_NOTIFICATION_ROUTES: NotificationRouteMapping = {
  post: (id, suffix) => `/fan/explore/contents/${id}${suffix}`,
  concert: (id, suffix) => `/fan/home/concerts/${id}${suffix}`,
  live: (id, suffix) => `/fan/live/room/${id}${suffix}`,
  band: (id, suffix) => `/fan/bands/${id}${suffix}`,
  knownPrefixes: [
    "/fan/explore/contents/",
    "/fan/home/concerts/",
    "/fan/live/room/",
    "/fan/bands/",
    "/band/session/messages/",
  ],
  fallback: (notification) => {
    if (notification.referenceId == null) return null;

    const type = notification.type.toUpperCase();

    if (type.includes("INVITE")) return null;

    if (
      type.includes("POST") ||
      type.includes("CONTENT") ||
      type.includes("NEWS")
    ) {
      return `/fan/explore/contents/${notification.referenceId}`;
    }

    if (type.includes("PERFORMANCE") || type.includes("CONCERT")) {
      return `/fan/home/concerts/${notification.referenceId}`;
    }

    if (type.includes("LIVE")) {
      return `/fan/live/room/${notification.referenceId}`;
    }

    return `/fan/explore/contents/${notification.referenceId}`;
  },
};

export const BAND_NOTIFICATION_ROUTES: NotificationRouteMapping = {
  post: (_id, suffix) => `/band/home${suffix}`,
  concert: (id, suffix) => `/band/concerts/${id}/edit${suffix}`,
  live: (_id, suffix) => `/band/live${suffix}`,
  band: (_id, suffix) => `/band/home${suffix}`,
  message: (id, suffix) => `/band/session/messages/${id}${suffix}`,
  application: (id, suffix) => `/band/my/applications/${id}${suffix}`,
  recruitment: (_id, suffix) => `/band/profile/postings${suffix}`,
  knownPrefixes: [
    "/band/home",
    "/band/concerts/",
    "/band/live",
    "/band/profile/",
    "/band/session/messages/",
  ],
  fallback: (notification) => {
    if (notification.referenceId == null) return null;

    const type = notification.type.toUpperCase();

    if (isCoHostInviteNotification(type)) {
      return getCoHostInvitePath(notification.referenceId);
    }

    if (type.includes("INVITE")) return null;

    if (
      type.includes("MESSAGE") ||
      type.includes("CHAT") ||
      type.includes("DM")
    ) {
      return `/band/session/messages/${notification.referenceId}`;
    }

    if (type.includes("APPLICATION")) {
      return `/band/my/applications/${notification.referenceId}`;
    }

    if (type.includes("RECRUITMENT")) {
      return "/band/profile/postings";
    }

    if (
      type.includes("POST") ||
      type.includes("CONTENT") ||
      type.includes("NEWS")
    ) {
      return "/band/home";
    }

    if (type.includes("PERFORMANCE") || type.includes("CONCERT")) {
      return `/band/concerts/${notification.referenceId}/edit`;
    }

    if (type.includes("LIVE")) {
      return "/band/live";
    }

    return "/band/home";
  },
};

export const getMappedDeepLink = (
  deepLink: string,
  routes: NotificationRouteMapping,
) => {
  const path = normalizeDeepLink(deepLink);
  const suffix = getRouteSuffix(path);

  if (/^https?:\/\//i.test(path)) return path;

  const postId = path.match(
    /\/(?:posts?|contents?|news)\/(\d+)(?=[/?#]|$)/i,
  )?.[1];

  if (postId) return routes.post(postId, suffix);

  const concertId = path.match(
    /\/(?:performances?|concerts?)\/(\d+)(?=[/?#]|$)/i,
  )?.[1];

  if (concertId) return routes.concert(concertId, suffix);

  const liveId = path.match(/\/lives?\/(\d+)(?=[/?#]|$)/i)?.[1];

  if (liveId) return routes.live(liveId, suffix);

  const messageId = path.match(
    /\/(?:session\/messages?|messages?|chat\/rooms?|chat-rooms?|chatrooms?)\/(\d+)(?=[/?#]|$)/i,
  )?.[1];

  if (messageId && routes.message) return routes.message(messageId, suffix);

  const applicationId = path.match(
    /\/(?:applications?|apply-submissions?)\/(\d+)(?=[/?#]|$)/i,
  )?.[1];

  if (applicationId && routes.application) {
    return routes.application(applicationId, suffix);
  }

  const recruitmentId = path.match(
    /\/(?:recruitments?|postings?)\/(\d+)(?=[/?#]|$)/i,
  )?.[1];

  if (recruitmentId && routes.recruitment) {
    return routes.recruitment(recruitmentId, suffix);
  }

  const bandId = path.match(/\/bands?\/(\d+)(?=[/?#]|$)/i)?.[1];

  if (bandId) return routes.band(bandId, suffix);

  if (routes.knownPrefixes.some((prefix) => path.startsWith(prefix))) {
    return path;
  }

  return null;
};

export const getNotificationTargetPath = (
  notification: NotificationItem,
  routes: NotificationRouteMapping,
) => {
  const type = notification.type.toUpperCase();
  const deepLink = notification.deepLink?.trim();

  if (isCoHostInviteNotification(type)) {
    const liveId = getLiveIdFromDeepLink(deepLink) ?? notification.referenceId;

    if (liveId != null) {
      return getCoHostInvitePath(liveId);
    }
  }

  if (deepLink) {
    const mappedPath = getMappedDeepLink(deepLink, routes);

    if (mappedPath) return mappedPath;
  }

  return routes.fallback(notification);
};

const getDeepLinkMode = (deepLink?: string | null): NotificationMode | null => {
  const normalizedPath = deepLink ? normalizeDeepLink(deepLink.trim()) : "";

  if (normalizedPath.startsWith("/band/")) return "BAND";
  if (normalizedPath.startsWith("/fan/")) return "FAN";

  return null;
};

export const getNotificationMode = (
  notification: NotificationItem,
): NotificationMode | null => {
  if (notification.mode === "FAN" || notification.mode === "BAND") {
    return notification.mode;
  }

  const deepLinkMode = getDeepLinkMode(notification.deepLink);

  if (deepLinkMode) return deepLinkMode;

  const type = notification.type.toUpperCase();

  if (
    type === "BAND_INVITE" ||
    type.startsWith("BAND_") ||
    isCoHostInviteNotification(type)
  ) {
    return "BAND";
  }

  if (type.startsWith("FAN_")) return "FAN";

  if (
    type.includes("MESSAGE") ||
    type.includes("CHAT") ||
    type.includes("DM") ||
    type.includes("SESSION_APPLICATION") ||
    type.includes("APPLICATION_STATUS") ||
    type.includes("RECRUITMENT") ||
    type.includes("NEW_SESSION") ||
    type.includes("LIVE_START_STATUS")
  ) {
    return "BAND";
  }

  if (
    type.includes("FOLLOWED") ||
    type.includes("FOLLOW") ||
    type.includes("PERFORMANCE") ||
    type.includes("CONCERT") ||
    type.includes("PERFORMANCE_REMINDER") ||
    type.includes("PERFORMANCE_UPDATE") ||
    type.includes("LIVE_START") ||
    type.includes("LIVE_REMINDER") ||
    type.includes("LIVE_REPLAY")
  ) {
    return "FAN";
  }

  return null;
};

export const isPostRegistrationNotification = (
  notification: NotificationItem,
) => {
  const type = notification.type.toUpperCase();

  return (
    type.includes("POST") ||
    type.includes("CONTENT") ||
    type.includes("NEWS")
  );
};

export const isNotificationForMode = (
  notification: NotificationItem,
  mode: NotificationMode,
) => {
  const notificationMode = getNotificationMode(notification);

  return notificationMode === null || notificationMode === mode;
};
