export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export interface GetFollowedBandsParams {
  page?: number;
  size?: number;
}

export interface FollowedBandItem {
  bandId: number;
  name: string;
  genre: string;
  region: string;
  profileImageUrl: string | null;
  followerCount: number;
}

export interface FollowedBandsResponse {
  totalCount: number | null;
  items: FollowedBandItem[];
  page: number;
  hasNext: boolean;
}
