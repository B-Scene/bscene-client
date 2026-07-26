export interface BandApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type MusicEtcPlatform = "MELON" | "GENIE" | "BUGS" | "APPLE_MUSIC";

export interface MusicLinksResponse {
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  soundcloudUrl: string | null;
  etcPlatform: MusicEtcPlatform | null;
  etcUrl: string | null;
  otherUrl: string | null;
}

export interface SaveMusicLinksRequest {
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  soundcloudUrl?: string | null;
  etcPlatform?: MusicEtcPlatform | null;
  etcUrl?: string | null;
  otherUrl?: string | null;
}

export type SaveMusicLinksResponse = MusicLinksResponse;
