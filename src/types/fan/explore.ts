export interface FanExploreApiResponse<T> {
  isSuccess: boolean;
  status?: number;
  code: string;
  message: string;
  result: T;
  timeStamp?: string;
}

export type FanExploreSort = "ACCURACY" | "RECOMMEND" | "POPULAR";
export type FanExploreSearchType = "ALL" | "BAND" | "PERFORMANCE" | "POST";
export type FanExploreContentType = Exclude<FanExploreSearchType, "ALL">;

export interface FanExploreListParams {
  sort?: FanExploreSort;
  genre?: string;
  region?: string;
  contentType?: FanExploreContentType;
  page?: number;
  size?: number;
}

export interface FanExploreRecommendationParams {
  cursor?: number;
  size?: number;
}

export interface FanExploreSearchParams {
  keyword: string;
  type?: FanExploreSearchType;
  sort?: FanExploreSort;
  genre?: string;
  region?: string;
  cursor?: string;
  size?: number;
}

export interface FanExploreRecentSearch {
  recentSearchId?: number | string;
  keywordId?: number | string;
  id?: number | string;
  keyword?: string;
  searchKeyword?: string;
  searchTerm?: string;
  searchWord?: string;
  query?: string;
  value?: string;
}

export interface FanExploreBandDetail {
  band?: FanExploreBandDetail;
  profile?: FanExploreBandDetail;
  bandProfile?: FanExploreBandDetail;
  bandDetail?: FanExploreBandDetail;
  bandInfo?: FanExploreBandDetail;
  profileInfo?: FanExploreBandDetail;
  detail?: FanExploreBandDetail;
  bandId?: number;
  id?: number | string;
  name?: string;
  bandName?: string;
  nickname?: string;
  genre?: string | null;
  bandGenre?: string | null;
  region?: string | null;
  bandRegion?: string | null;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  profileImage?: string | null;
  image?: string | null;
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  bandDescription?: string | null;
  introduction?: string | null;
  introduce?: string | null;
  followerCount?: number;
  followersCount?: number;
  followCount?: number;
  followerCnt?: number;
  followers?: number;
  isFollowing?: boolean;
  following?: boolean;
  followed?: boolean;
  isOfficial?: boolean;
  official?: boolean;
  isLive?: boolean;
  live?: boolean;
  liveId?: number | string | null;
}

export type FanExplorePostMediaType = "PHOTO" | "VIDEO" | "TEXT";

export interface FanExplorePostDetailBand {
  bandId?: number;
  id?: number | string;
  name?: string;
  bandName?: string;
  genre?: string | null;
  region?: string | null;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  imageUrl?: string | null;
}

export interface FanExplorePostDetail {
  post?: FanExplorePostDetail;
  content?: FanExplorePostDetail | string | null;
  detail?: FanExplorePostDetail;
  band?: FanExplorePostDetailBand;
  bandId?: number;
  bandName?: string | null;
  name?: string | null;
  genre?: string | null;
  region?: string | null;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  postId?: number;
  contentId?: number;
  id?: number | string;
  type?: FanExplorePostMediaType | string | null;
  mediaType?: FanExplorePostMediaType | string | null;
  contentType?: FanExplorePostMediaType | string | null;
  mediaUrls?: string[] | string | null;
  mediaUrl?: string[] | string | null;
  imageUrls?: string[] | string | null;
  images?: string[] | string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  videoThumbnailUrl?: string | null;
  title?: string | null;
  contentText?: string | null;
  body?: string | null;
  text?: string | null;
  tags?: string[] | string | null;
  likeCount?: number;
  likes?: number;
  commentCount?: number;
  comments?: number;
  isLiked?: boolean;
  liked?: boolean;
  createdAt?: string | null;
}

export interface FanExplorePostLikeResponse {
  isLiked?: boolean;
  liked?: boolean;
  likeCount?: number;
  likes?: number;
}

export interface FanExplorePostComment {
  comment?: FanExplorePostComment;
  author?: FanExplorePostComment;
  user?: FanExplorePostComment;
  member?: FanExplorePostComment;
  writer?: FanExplorePostComment;
  commentId?: number | string;
  id?: number | string;
  userId?: number | string;
  memberId?: number | string;
  authorId?: number | string;
  writerId?: number | string;
  nickname?: string | null;
  authorName?: string | null;
  userName?: string | null;
  memberName?: string | null;
  writerName?: string | null;
  name?: string | null;
  profileImageUrl?: string | null;
  authorProfileImageUrl?: string | null;
  userProfileImageUrl?: string | null;
  memberProfileImageUrl?: string | null;
  writerProfileImageUrl?: string | null;
  content?: string | null;
  body?: string | null;
  text?: string | null;
  commentText?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isMine?: boolean;
  mine?: boolean;
  owner?: boolean;
  editable?: boolean;
}

export interface NormalizedFanExplorePostComment {
  commentId: number | null;
  authorId: number | null;
  authorName: string;
  profileImageUrl: string | null;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
  isMine: boolean;
}

export interface FanExplorePostCommentsResponse {
  items: NormalizedFanExplorePostComment[];
  myComments: NormalizedFanExplorePostComment[];
  hasNext: boolean;
  nextCursor: number | null;
}

export interface FanExplorePostCommentsParams {
  cursor?: number;
  size?: number;
}

export interface UpsertFanExplorePostCommentRequest {
  content: string;
}

export interface FanExploreBand {
  band?: FanExploreBand;
  bandId?: number;
  id?: number | string;
  name?: string;
  bandName?: string;
  genre?: string | null;
  region?: string | null;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  introduction?: string | null;
  followerCount?: number;
  followers?: number;
  isFollowing?: boolean;
  following?: boolean;
  score?: number;
  recommendationScore?: number;
  contentTypes?: string[];
}

export interface FanExplorePerformance {
  performanceId?: number;
  concertId?: number;
  id?: number | string;
  performanceTitle?: string;
  performanceName?: string;
  concertTitle?: string;
  concertName?: string;
  title?: string;
  name?: string;
  location?: string | null;
  venue?: string | null;
  place?: string | null;
  posterImageUrl?: string | null;
  posterUrl?: string | null;
  posterImage?: string | null;
  performancePosterUrl?: string | null;
  performanceImageUrl?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  startAt?: string | null;
  startedAt?: string | null;
  startDateTime?: string | null;
  performanceDate?: string | null;
  performanceTime?: string | null;
  startDate?: string | null;
  startTime?: string | null;
  time?: string | null;
  status?: string | null;
}

export interface FanExploreContent {
  post?: FanExploreContent;
  content?: FanExploreContent | string | null;
  detail?: FanExploreContent;
  band?: FanExploreBand;
  contentId?: number;
  postId?: number;
  id?: number | string;
  bandId?: number;
  bandName?: string | null;
  name?: string | null;
  genre?: string | null;
  region?: string | null;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  type?: string | null;
  title?: string | null;
  contentText?: string | null;
  body?: string | null;
  text?: string | null;
  mediaType?: string | null;
  contentType?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  videoThumbnailUrl?: string | null;
  mediaUrl?: string[] | string;
  mediaUrls?: string[] | string;
  imageUrls?: string[] | string;
  images?: string[] | string;
  tags?: string[] | string | null;
  likes?: number;
  comments?: number;
  liked?: boolean;
  createdAt?: string | null;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
}

export interface FanExplorePageResponse<T> {
  items?: T[];
  content?: T[];
  data?: T[];
  list?: T[];
  results?: T[];
  bands?: T[];
  performances?: T[];
  concerts?: T[];
  posts?: T[];
  contents?: T[];
  recommendations?: T[];
  recommendedBands?: T[];
  recommendBands?: T[];
  bandRecommendations?: T[];
  keywords?: T[];
  recentSearches?: T[];
  recentKeywords?: T[];
  searchKeywords?: T[];
  searchHistories?: T[];
  searchHistory?: T[];
  histories?: T[];
  searches?: T[];
  myComments?: T[];
  totalCount?: number;
  totalElements?: number;
  total?: number;
  page?: number;
  cursor?: string | number;
  size?: number;
  pageSize?: number;
  totalPages?: number;
  hasNext?: boolean;
  nextPage?: number | null;
  nextCursor?: string | number | null;
}

export interface FanExploreSearchSections {
  band?: FanExploreBand[] | FanExplorePageResponse<FanExploreBand>;
  bandSection?: FanExploreBand[] | FanExplorePageResponse<FanExploreBand>;
  BAND?: FanExploreBand[] | FanExplorePageResponse<FanExploreBand>;
  bands?: FanExploreBand[] | FanExplorePageResponse<FanExploreBand>;
  bandResults?: FanExploreBand[] | FanExplorePageResponse<FanExploreBand>;
  performance?:
    | FanExplorePerformance[]
    | FanExplorePageResponse<FanExplorePerformance>;
  performanceSection?:
    | FanExplorePerformance[]
    | FanExplorePageResponse<FanExplorePerformance>;
  PERFORMANCE?:
    | FanExplorePerformance[]
    | FanExplorePageResponse<FanExplorePerformance>;
  performances?:
    | FanExplorePerformance[]
    | FanExplorePageResponse<FanExplorePerformance>;
  concerts?:
    | FanExplorePerformance[]
    | FanExplorePageResponse<FanExplorePerformance>;
  performanceResults?:
    | FanExplorePerformance[]
    | FanExplorePageResponse<FanExplorePerformance>;
  post?: FanExploreContent[] | FanExplorePageResponse<FanExploreContent>;
  postSection?: FanExploreContent[] | FanExplorePageResponse<FanExploreContent>;
  POST?: FanExploreContent[] | FanExplorePageResponse<FanExploreContent>;
  contents?: FanExploreContent[] | FanExplorePageResponse<FanExploreContent>;
  posts?: FanExploreContent[] | FanExplorePageResponse<FanExploreContent>;
  contentResults?:
    | FanExploreContent[]
    | FanExplorePageResponse<FanExploreContent>;
  bandCount?: number;
  totalBandCount?: number;
  performanceCount?: number;
  concertCount?: number;
  totalPerformanceCount?: number;
  contentCount?: number;
  postCount?: number;
  totalContentCount?: number;
}

export interface FanExploreSearchResponse extends FanExploreSearchSections {
  sections?: FanExploreSearchSections;
  results?: FanExploreSearchSections;
}

export interface NormalizedFanExploreBandsResponse
  extends FanExplorePageResponse<FanExploreBand> {
  items: FanExploreBand[];
  hasNext: boolean;
  page: number;
  nextCursor: number | null;
}

export interface NormalizedFanExplorePerformancesResponse
  extends FanExplorePageResponse<FanExplorePerformance> {
  items: FanExplorePerformance[];
  hasNext: boolean;
  page: number;
  nextCursor: string | number | null;
}

export interface NormalizedFanExploreContentsResponse
  extends FanExplorePageResponse<FanExploreContent> {
  items: FanExploreContent[];
  hasNext: boolean;
  page: number;
  nextCursor: string | number | null;
}

export interface NormalizedFanExploreSearchResponse {
  bands: FanExploreBand[];
  performances: FanExplorePerformance[];
  contents: FanExploreContent[];
  bandCount: number;
  performanceCount: number;
  contentCount: number;
}

export interface NormalizedFanExploreRecentSearchesResponse {
  items: NormalizedFanExploreRecentSearch[];
  keywords: string[];
}

export interface NormalizedFanExploreRecentSearch {
  recentSearchId: number | null;
  keyword: string;
}
