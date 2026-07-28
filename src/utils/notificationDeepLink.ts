import type { NotificationItem } from "@/types/notification";

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

  return `${createdDate.getFullYear()}.${createdDate.getMonth() + 1}.${createdDate.getDate()}.`;
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
  const deepLink = notification.deepLink?.trim();

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

  if (type === "BAND_INVITE" || type.startsWith("BAND_")) return "BAND";
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
  const title = notification.title;
  const body = notification.body;

  return (
    type.includes("POST") ||
    type.includes("CONTENT") ||
    type.includes("NEWS") ||
    title.includes("게시물") ||
    title.includes("게시글") ||
    title.includes("콘텐츠") ||
    body.includes("게시물") ||
    body.includes("게시글") ||
    body.includes("콘텐츠")
  );
};

export const isNotificationForMode = (
  notification: NotificationItem,
  mode: NotificationMode,
) => {
  const notificationMode = getNotificationMode(notification);

  return notificationMode === null || notificationMode === mode;
};
