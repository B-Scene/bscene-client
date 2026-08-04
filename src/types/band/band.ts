export interface BandApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type BandGenre =
  | "METAL"
  | "BLUES"
  | "PSYCHEDELIC_ROCK"
  | "ALTERNATIVE_ROCK"
  | "INDIE"
  | "ELECTRONIC_ROCK"
  | "JAZZ"
  | "POP"
  | "POP_ROCK"
  | "PUNK_ROCK"
  | "FOLK_ROCK"
  | "HARD_ROCK"
  | "ETC";

export type BandRegion =
  | "SEOUL"
  | "GYEONGGI"
  | "INCHEON"
  | "BUSAN"
  | "DAEGU"
  | "GWANGJU"
  | "DAEJEON"
  | "ULSAN"
  | "SEJONG"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "JEONBUK"
  | "JEONNAM"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "GANGWON"
  | "JEJU";

export interface BandResponse {
  id: number;
  ownerId: number;
  name: string;
  genre: BandGenre;
  region: BandRegion;
  profileImageUrl: string | null;
  description: string | null;
}

export interface CreateBandRequest {
  name: string;
  genre: BandGenre;
  region: BandRegion;
  bandMemberProfileId: number;
  profileImageUrl?: string;
  description?: string;
}

export type CreateBandResponse = BandResponse;

export interface CheckBandNameResponse {
  available: boolean;
}

export interface BandDetailResponse {
  bandId: number;
  name: string;
  genre: BandGenre;
  region: BandRegion;
  profileImageUrl: string | null;
  description: string | null;
  followerCount: number;
  memberCount: number;
  performanceCount: number;
}

export interface UpdateBandRequest {
  name?: string;
  genre?: BandGenre;
  region?: BandRegion;
  profileImageUrl?: string;
  deleteProfileImage?: boolean;
  description?: string;
}

export type UpdateBandResponse = BandDetailResponse;
