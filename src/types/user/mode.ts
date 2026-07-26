export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type UserModeType = "BAND" | "FAN";

export interface ChangeUserModeRequest {
  profileId: number;
  type: UserModeType;
}
