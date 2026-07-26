export interface BandApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type BandMemberProfilePart =
  | "VOCAL"
  | "GUITAR"
  | "BASS"
  | "KEYBOARD"
  | "DRUM"
  | "ETC";

export interface BandMemberProfileResponse {
  id: number;
  nickname: string;
  part: string;
  active: boolean;
  createdAt: string;
}

export interface CreateBandMemberProfileRequest {
  nickname: string;
  part: BandMemberProfilePart;
}

export type CreateBandMemberProfileResponse = BandMemberProfileResponse;

export interface UpdateBandMemberProfileRequest {
  nickname?: string;
  part?: BandMemberProfilePart;
}

export type UpdateBandMemberProfileResponse = BandMemberProfileResponse;
