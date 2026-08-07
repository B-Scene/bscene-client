export interface BandFollowerItem {
  userId: number;
  fanProfileImageUrl: string | null;
  nickname: string;
}

export interface GetBandFollowersParams {
  cursor?: number;
  size?: number;
}

export interface BandFollowersResponse {
  items: BandFollowerItem[];
  pageInfo: {
    nextCursor: number | null;
    hasNext: boolean;
  };
}
