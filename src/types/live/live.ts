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
  isMine: boolean;
}

export interface ScheduledLiveItem {
  liveId: number;
  bandName: string;
  title: string;
  scheduledAt: string;
  isMine: boolean;
}

export interface LiveHomeResponse {
  liveNow: LiveNowItem[];
  scheduled: ScheduledLiveItem[];
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
  viewerCount: number;
  bandProfileImageUrl: string | null;
  bandName: string;
  title: string;
  description: string | null;
  playback: LivePlayback;
}

export interface ViewerCountEvent {
  viewerCount: number;
}