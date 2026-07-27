export interface LiveApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timestamp?: string;
  timeStamp?: string;
}

export interface LiveNowItem {
  liveId: number;
  bandProfileImageUrl: string | null;
  bandName: string;
  title: string;
  viewerCount: number;
  isMine?: boolean;
}

export interface LiveReplayItem {
  liveId: number;
  replayId?: number;
  thumbnailImageUrl: string | null;
  title: string;
  bandName: string;
  viewCount: number;
  durationSeconds?: number;
  durationSec?: number;
}

export interface ScheduledLiveItem {
  liveId: number;
  bandName: string;
  title: string;
  scheduledAt: string;
  notificationEnabled?: boolean;
  isMine?: boolean;
}

export interface LiveHomeResponse {
  liveNow: LiveNowItem[];
  replays: LiveReplayItem[];
  scheduled: ScheduledLiveItem[];
}

export type LiveNowListFilter = "following" | "all";

export interface LiveNowListItem {
  liveId: number;
  bandProfileImageUrl: string | null;
  title: string;
  bandName: string;
  viewCount: number;
}

export interface LiveNowPageInfo {
  nextCursor: number | null;
  hasNext: boolean;
}

export interface LiveNowListResponse {
  items: LiveNowListItem[];
  pageInfo: LiveNowPageInfo;
}

export interface GetLiveNowListParams {
  filter: LiveNowListFilter;
  cursor?: number;
  size?: number;
}

export interface ScheduledLiveListItem {
  liveId: number;
  bandProfileImageUrl: string | null;
  title: string;
  bandName: string;
  scheduledAt: string;
  isAlarmSet?: boolean;
  alarmSet?: boolean;
  notificationEnabled?: boolean;
}

export interface ScheduledLiveListResponse {
  items: ScheduledLiveListItem[];
  pageInfo: LiveNowPageInfo;
}

export interface GetScheduledLiveListParams {
  following: boolean;
  cursor?: number;
  size?: number;
}

export interface ToggleLiveAlarmResponse {
  alarmSet: boolean;
}

export type ReplayListFilter = "following" | "all";
export type ReplaySort = "LATEST" | "POPULAR";

export interface ReplayListItem {
  liveId: number;
  replayId?: number;
  thumbnailImageUrl?: string | null;
  title: string;
  bandName: string;
  viewCount: number;
  durationSeconds?: number;
  durationSec?: number;
}

export interface ReplayListResponse {
  items: ReplayListItem[];
  pageInfo: LiveNowPageInfo;
}

export interface GetReplayListParams {
  filter: ReplayListFilter;
  sort: ReplaySort;
  cursor?: number;
  size?: number;
}

export interface ReplayPlaybackResponse {
  title: string;
  bandName: string;
  bandProfileImageUrl: string | null;
  viewCount: number;
  durationSec: number;
  durationSeconds?: number;
  playbackUrl: string;
}

export interface CreateLiveRequest {
  title: string;
  description?: string;
  thumbnailImageUrl?: string;
  scheduledAt?: string | null;
  coHost: number[];
}

export interface CreateLiveResponse {
  audioStreamId: number;
  path: string;
  title: string;
}

export type PlaybackRole = "BROADCASTER" | "LISTENER";

export type PlaybackProtocol = "WHIP" | "HLS";

export interface LivePlayback {
  role: PlaybackRole;
  protocol: PlaybackProtocol;
  playbackUrl: string;
}

export interface EnterLiveResponse {
  liveId: number;
  isLive: boolean;
  startedAt: string;
  viewerCount?: number;
  viewCount?: number;
  bandProfileImageUrl: string | null;
  bandName: string;
  title: string;
  description: string | null;
  playback: LivePlayback;
}

export type LiveReportType =
  | "SPAM"
  | "ABUSE"
  | "SEXUAL"
  | "VIOLENCE"
  | "COPYRIGHT"
  | "ETC";

export interface ReportLiveUserRequest {
  targetUserId: number;
  reportType: LiveReportType;
  chatMessage?: string | null;
  comment?: string | null;
}

export interface ReportLiveUserResponse {
  targetUserId: number;
}

export interface BlockLiveUserRequest {
  liveId: number;
  targetUserId: number;
}

export interface CloseLiveResponse {
  liveId: string;
  endedAt: string;
}

export interface LiveSummaryResponse {
  title: string;
  durationSec: number;
  closedViewerCount: number;
}

export interface LiveMemberItem {
  bandProfileImageUrl: string | null;
  nickname: string;
  bandName: string;
  part: string[];
  isLeader: boolean;
}

export interface LiveMembersResponse {
  members: LiveMemberItem[];
}

export type LiveReservationCoHostStatus =
  | "OWNER"
  | "APPROVED"
  | "INVITED"
  | "REJECTED"
  | null;

export interface LiveReservationCoHostCandidate {
  bandMemberId: number;
  bandMemberProfileId: number;
  bandMemberProfileImageUrl: string | null;
  nickname: string;
  part: string;
  status: LiveReservationCoHostStatus;
}

export interface LiveReservationResponse {
  liveId: number;
  title: string;
  description: string | null;
  thumbnailImageUrl: string | null;
  scheduledAt: string;
  cohostCandidates: LiveReservationCoHostCandidate[];
}

export interface UpdateLiveReservationRequest {
  title: string;
  description: string;
  thumbnailImageUrl: string;
  scheduledAt: string;
  cohosts: number[] | null;
}

export interface UpdateLiveReservationResponse {
  liveId?: number;
}
