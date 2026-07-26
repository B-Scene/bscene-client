export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type MyProfileListType = "all" | "band";

export interface GetMyProfilesParams {
  type?: MyProfileListType;
}

export interface MyBandProfileSummary {
  bandId: number;
  bandMemberProfileId: number;
  profileImageUrl: string | null;
  bandName: string;
  genre: string;
  region: string;
  isActive: boolean;
}

export interface MyFanProfileSummary {
  fanProfileId: number;
  profileImageUrl: string | null;
  nickname: string;
  email: string;
  isActive: boolean;
}

export interface MyProfilesResponse {
  bandProfiles: MyBandProfileSummary[];
  fanProfile: MyFanProfileSummary | null;
}
