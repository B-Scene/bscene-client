export type NotificationType = "BAND_INVITE" | string;

export interface NotificationBandInvite {
  bandInviteId?: number | null;
  bandMemberId?: number | null;
  bandId?: number | null;
  bandName?: string | null;
  position?: string | null;
  part?: string | null;
  role?: string | null;
  genre?: string | null;
  region?: string | null;
  memberCount?: number | null;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  [key: string]: unknown;
}

export interface NotificationItem {
  notificationId: number;
  type: NotificationType;
  deepLink: string | null;
  referenceId: number | null;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  actionable: boolean;
  bandInvite: NotificationBandInvite | null;
}

export interface GetNotificationsParams {
  cursor?: number;
  size?: number;
}

export interface NotificationsPageResponse {
  items: NotificationItem[];
  hasNext: boolean;
  nextCursor: number | null;
}

export type NotificationSettingsMode = "FAN" | "BAND";

export type NotificationSettingType =
  | "FAN_FOLLOWED_BAND_PERFORMANCE"
  | "FAN_PERFORMANCE_REMINDER"
  | "FAN_PERFORMANCE_UPDATE"
  | "FAN_FOLLOWED_BAND_LIVE_START"
  | "FAN_SCHEDULED_LIVE_REMINDER"
  | "FAN_LIVE_REPLAY_READY"
  | "BAND_NEW_SESSION_APPLICATION"
  | "BAND_SESSION_APPLICATION_STATUS"
  | "BAND_SESSION_RECRUITMENT_DEADLINE"
  | "BAND_SCHEDULED_LIVE_REMINDER"
  | "BAND_LIVE_START_STATUS";

export type NotificationSettingsValues = Record<string, boolean>;

export interface GetNotificationSettingsParams {
  mode: NotificationSettingsMode;
}

export interface NotificationSettingsResponse {
  mode: NotificationSettingsMode | null;
  values: NotificationSettingsValues;
}

export interface UpdateNotificationSettingRequest {
  settingType: NotificationSettingType;
  enabled: boolean;
}

export interface UpdateNotificationSettingParams
  extends UpdateNotificationSettingRequest {
  mode: NotificationSettingsMode;
}

export type PushTokenPlatform = "WEB";

export interface RegisterPushTokenRequest {
  token: string;
  platform: PushTokenPlatform;
}

export interface DeletePushTokenRequest {
  token: string;
}

export interface SendTestNotificationRequest {
  title: string;
  body: string;
}
