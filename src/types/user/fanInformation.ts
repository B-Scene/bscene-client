export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export interface FanInformationResponse {
  nickname: string;
  profileImageUrl: string | null;
  genres: string[];
  regions: string[];
}

export interface UpdateFanInformationRequest {
  nickname: string;
  genres: string[];
  regions: string[];
  profileImageUrl?: string | null;
}

export type UpdateFanInformationResponse = FanInformationResponse;
