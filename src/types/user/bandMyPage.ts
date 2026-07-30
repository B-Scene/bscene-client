export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export interface BandMyPageResponse {
  bandMemberProfileId: number;
  nickname: string;
  bandName: string;
  parts: string[];
  currentMode: "BAND" | "FAN";
  follower: number;
  applicant: number;
  performance: number;
  isBandMember: boolean;
}
