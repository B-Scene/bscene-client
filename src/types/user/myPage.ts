export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export interface FanMyPageResponse {
  nickname: string;
  genre: string;
  additionalGenreCount: number;
  regions: string[];
  currentMode: "FAN" | "BAND";
  followingCount: number;
  interestedPerformanceCount: number;
  participatedPerformanceCount: number;
}
