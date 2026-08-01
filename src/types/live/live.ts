export interface LiveApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timestamp?: string;
  timeStamp?: string;
}

export interface LiveCoHostItem {
  userId?: number;
  memberId?: number;
  bandMemberId?: number;
  bandMemberProfileId?: number;
  nickname: string;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  bandMemberProfileImageUrl?: string | null;
  bandName?: string;
  part?: string | string[];
  isOwner?: boolean;
  isMe?: boolean;
  status?: string | null;
}

export interface LiveNowItem {
  liveId: number;
  bandProfileImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  bandName: string;
  title: string;
  viewerCount: number;
  viewCount?: number;
  isMine?: boolean;
  // 진행자(송출자 + 공동 진행자)로 등록된 유저 ID 목록. 조회자가 없으면 업그레이드 요청 모달 노출
  coHost?: number[];
  coHosts?: LiveCoHostItem[];
  coHostList?: LiveCoHostItem[];
}

export interface LiveReplayItem {
  liveId: number;
  replayId?: number;
  thumbnailImageUrl?: string | null;
  title: string;
  bandName: string;
  viewCount: number;
  durationSeconds?: number;
  durationSec?: number;
}

export interface ScheduledLiveItem {
  liveId: number;
  bandProfileImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  bandName: string;
  title: string;
  scheduledAt: string;
  notificationEnabled?: boolean;
  isAlarmSet?: boolean;
  alarmSet?: boolean;
  isMine?: boolean;
  coHost?: number[];
  coHosts?: LiveCoHostItem[];
  coHostList?: LiveCoHostItem[];
}

export interface LiveHomeResponse {
  // 밴드 모드 응답의 조회자 유저 ID (coHost 목록과 비교해 업그레이드 요청 모달 노출 판단)
  userId?: number;
  liveNow: LiveNowItem[];
  replays: LiveReplayItem[];
  scheduled: ScheduledLiveItem[];
  myNickname?: string | null;
  nickname?: string | null;
  myProfileImageUrl?: string | null;
  profileImageUrl?: string | null;
  coHosts?: LiveCoHostItem[];
  coHostList?: LiveCoHostItem[];
}

export type LiveNowListFilter = "following" | "all";

export interface LiveNowListItem {
  liveId: number;
  bandProfileImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  title: string;
  bandName: string;
  viewCount: number;
  viewerCount?: number;
  isMine?: boolean;
  coHosts?: LiveCoHostItem[];
  coHostList?: LiveCoHostItem[];
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
  bandProfileImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  title: string;
  bandName: string;
  scheduledAt: string;
  isAlarmSet?: boolean;
  alarmSet?: boolean;
  notificationEnabled?: boolean;
  isMine?: boolean;
  coHosts?: LiveCoHostItem[];
  coHostList?: LiveCoHostItem[];
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
  bandProfileImageUrl?: string | null;
  thumbnailImageUrl?: string | null;
  viewCount: number;
  durationSec: number;
  durationSeconds?: number;
  playbackUrl: string;
}

export interface CreateLiveRequest {
  title: string;
  description?: string | null;
  thumbnailImageUrl?: string | null;
  scheduledAt?: string | null;
  coHost?: number[];
  cohosts?: number[] | null;
  coHostIds?: number[] | null;
  cohostIds?: number[] | null;
}

export interface CreateLiveResponse {
  audioStreamId: number;
  path: string;
  title: string;
  liveId?: number;
  startedAt?: string;
  playback?: LivePlayback;
}

export type PlaybackRole = "BROADCASTER" | "LISTENER" | "CO_HOST";

export type PlaybackProtocol = "WHIP" | "HLS" | "WHEP";

export interface LivePlayback {
  role: PlaybackRole;
  protocol: PlaybackProtocol;
  playbackUrl: string;
}

// 진행자 전용: 본인을 제외한 다른 진행자의 WHEP 모니터링 정보 (청취자 응답에서는 null)
export interface LiveCoPublisher {
  userId: number;
  whepUrl: string;
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
  coPublishers?: LiveCoPublisher[] | null;

  myNickname?: string | null;
  nickname?: string | null;
  myProfileImageUrl?: string | null;
  profileImageUrl?: string | null;
  isCoHost?: boolean;
  isBroadcaster?: boolean;
  coHosts?: LiveCoHostItem[];
  coHostList?: LiveCoHostItem[];
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
  profileImageUrl?: string | null;
  isOwner?: boolean;
  isCoHost?: boolean;
}

export interface LiveMembersResponse {
  members: LiveMemberItem[];
}

export type LiveReservationCoHostStatus =
  | "OWNER"
  | "APPROVED"
  | "INVITED"
  // 라이브 진행 중 공동 송출자 업그레이드 요청 상태 (예약 편집 화면에는 사실상 등장하지 않음)
  | "REQUESTED"
  | "REJECTED"
  | null;

export interface LiveReservationCoHostCandidate {
  bandMemberId: number;
  bandMemberProfileId: number;
  bandMemberProfileImageUrl: string | null;
  nickname: string;
  part: string;
  status: LiveReservationCoHostStatus;
  userId?: number;
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
  description?: string | null;
  thumbnailImageUrl?: string | null;
  scheduledAt: string;
  coHost?: number[] | null;
  cohosts?: number[] | null;
  coHostIds?: number[] | null;
  cohostIds?: number[] | null;
}

export interface UpdateLiveReservationResponse {
  liveId?: number;
}

export interface RespondCoHostInvitationRequest {
  isAccepted: boolean;
}

export type RespondCoHostInvitationResponse = null;

export type RequestCoHostUpgradeResponse = null;

export interface AcceptCoHostUpgradeRequest {
  // 업그레이드를 요청한 밴드 멤버의 유저 ID (coHostUpgradeRequested SSE payload의 userId)
  userId: number;
}

export type AcceptCoHostUpgradeResponse = null;

// 공동 송출자 업그레이드 SSE 이벤트 payload
export interface CoHostUpgradeEvent {
  userId: number;
  nickname: string | null;
}