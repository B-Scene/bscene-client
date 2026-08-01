import type { BandMemberPart } from "@/types/band/bandMember";

export interface FanApiResponse<T> {
  isSuccess: boolean;
  status?: number;
  code: string;
  message: string;
  result: T;
  timeStamp?: string;
}

export interface FanHomeNewsItem {
  newsId?: number;
  contentId?: number;
  id?: number | string;
  bandId?: number;
  bandName?: string;
  bandProfileImageUrl?: string | null;
  bandImageUrl?: string | null;
  bandProfileUrl?: string | null;
  bandLogoUrl?: string | null;
  profileImageUrl?: string | null;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  genre?: string | null;
  region?: string | null;
  title?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  contentImageUrl?: string | null;
  mainImageUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImageUrl?: string | null;
  mediaUrl?: string[] | string;
  mediaUrls?: string[] | string;
  imageUrls?: string[] | string;
  images?: string[] | string;
  tags?: string[];
  createdAt?: string | null;
  postedAgo?: number | null;
}

export interface FanHomeRecommendedBand {
  band?: FanHomeRecommendedBand;
  bandId?: number;
  targetBandId?: number;
  followingBandId?: number;
  followedBandId?: number;
  recommendedBandId?: number;
  bandProfileId?: number;
  profileId?: number;
  id?: number | string;
  bandName?: string;
  name?: string;
  bandProfileImageUrl?: string | null;
  bandImageUrl?: string | null;
  bandProfileUrl?: string | null;
  bandLogoUrl?: string | null;
  profileImageUrl?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  genre?: string | null;
  region?: string | null;
  description?: string | null;
  bandDescription?: string | null;
  introduction?: string | null;
  introduce?: string | null;
  followerCount?: number;
  followersCount?: number;
  followerCnt?: number;
  followCount?: number;
  followers?: number;
  isFollowing?: boolean;
  following?: boolean;
  followed?: boolean;
}

export interface FanHomeConcert {
  performanceId?: number;
  concertId?: number;
  id?: number | string;
  performanceTitle?: string;
  performanceName?: string;
  concertName?: string;
  showTitle?: string;
  showName?: string;
  name?: string;
  title?: string;
  concertTitle?: string;
  location?: string | null;
  venue?: string | null;
  place?: string | null;
  performanceImageUrl?: string | null;
  posterImageUrl?: string | null;
  posterUrl?: string | null;
  posterImage?: string | null;
  performancePosterUrl?: string | null;
  imageUrl?: string | null;
  mainImageUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImageUrl?: string | null;
  imageUrls?: string[] | string;
  startAt?: string | null;
  startedAt?: string | null;
  startDateTime?: string | null;
  performanceDate?: string | null;
  performanceTime?: string | null;
  startDate?: string | null;
  startTime?: string | null;
  time?: string | null;
  dDay?: number | null;
  status?: string | null;
  isInterested?: boolean;
  createdAt?: string | null;
  popularity?: number | null;
}

export interface PendingPerformanceParticipationItem {
  performanceId: number;
  performanceTitle?: string;
  performanceName?: string;
  concertName?: string;
  showTitle?: string;
  showName?: string;
  name?: string;
  title?: string;
  location?: string | null;
  venue?: string | null;
  startAt?: string | null;
  startDateTime?: string | null;
  startDate?: string | null;
  startTime?: string | null;
  time?: string | null;
}

export interface PendingPerformanceParticipationResponse {
  items: PendingPerformanceParticipationItem[];
}

export type PerformanceParticipationStatus = "SCHEDULED" | "COMPLETED";
export type PerformanceAgeRating = "ALL" | "AGE_12" | "AGE_15" | "AGE_19";

export interface FanPerformanceCastingBand {
  bandId: number;
  bandName?: string;
  name?: string;
  profileImageUrl?: string | null;
  bandProfileImageUrl?: string | null;
  bandImageUrl?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  genre?: string | null;
  region?: string | null;
}

export interface FanPerformanceDetailResponse {
  performanceId: number;
  performanceTitle?: string;
  performanceName?: string;
  concertTitle?: string;
  concertName?: string;
  showTitle?: string;
  showName?: string;
  name?: string;
  title?: string;
  genre?: string | null;
  region?: string | null;
  location?: string | null;
  venue?: string | null;
  performanceDate?: string | null;
  performanceTime?: string | null;
  startAt?: string | null;
  startDateTime?: string | null;
  ticketPrice?: string | number | null;
  price?: string | number | null;
  ageRating?: PerformanceAgeRating | string | null;
  ticketLink?: string | null;
  introduction?: string | null;
  description?: string | null;
  content?: string | null;
  tags?: string[];
  posterImageUrl?: string | null;
  performanceImageUrl?: string | null;
  posterUrl?: string | null;
  posterImage?: string | null;
  performancePosterUrl?: string | null;
  imageUrl?: string | null;
  mainImageUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImageUrl?: string | null;
  imageUrls?: string[] | string;
  isInterested: boolean;
  interestCount?: number;
  participationStatus: PerformanceParticipationStatus | null;
  casting: FanPerformanceCastingBand[];
}

export type FollowingPostMediaType = "IMAGE" | "VIDEO" | string;

export interface FollowingPostItem {
  postId?: number;
  id?: number | string;
  bandId?: number;
  bandName?: string;
  bandProfileImageUrl?: string | null;
  bandImageUrl?: string | null;
  bandProfileUrl?: string | null;
  bandLogoUrl?: string | null;
  profileImageUrl?: string | null;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  genre?: string | null;
  region?: string | null;
  title?: string | null;
  content?: string | null;
  mediaType?: FollowingPostMediaType | null;
  imageUrl?: string | null;
  contentImageUrl?: string | null;
  mainImageUrl?: string | null;
  mediaUrl?: string[] | string;
  mediaUrls?: string[] | string;
  imageUrls?: string[] | string;
  images?: string[] | string;
  thumbnailUrl?: string | null;
  thumbnailImageUrl?: string | null;
  videoThumbnailUrl?: string | null;
  tags?: string[];
  createdAt?: string | null;
  postedAgo?: number | null;
}

export interface FollowingPostsParams {
  cursor?: number;
  size?: number;
}

export interface FollowingPostsResponse {
  items: FollowingPostItem[];
  hasNext: boolean;
  nextCursor: number | null;
}

export type UpcomingPerformanceSort = "IMMINENT" | "LATEST" | "POPULAR";

export interface UpcomingPerformancesParams {
  sort?: UpcomingPerformanceSort;
  page?: number;
  size?: number;
}

export interface UpcomingPerformancesResponse {
  items?: FanHomeConcert[];
  content?: FanHomeConcert[];
  performances?: FanHomeConcert[];
  upcomingPerformances?: FanHomeConcert[];
  data?: FanHomeConcert[];
  list?: FanHomeConcert[];
  hasNext?: boolean;
  nextPage?: number | null;
  page?: number;
  size?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  totalElements?: number;
  total?: number;
}

export type PerformanceCalendarParams =
  | {
      year?: never;
      month?: never;
    }
  | {
      year: number;
      month: number;
    };

export type PerformanceCalendarDateItem =
  | string
  | {
      date?: string | null;
      dateKey?: string | null;
      performanceDate?: string | null;
      startDate?: string | null;
      startAt?: string | null;
      startDateTime?: string | null;
      year?: number | null;
      month?: number | null;
      day?: number | null;
    };

export interface PerformanceCalendarResponse {
  items?: PerformanceCalendarDateItem[];
  dates?: PerformanceCalendarDateItem[];
  performanceDates?: PerformanceCalendarDateItem[];
  calendarDates?: PerformanceCalendarDateItem[];
  days?: PerformanceCalendarDateItem[];
}

export interface NormalizedPerformanceCalendarResponse {
  items: PerformanceCalendarDateItem[];
}

export interface PerformancesByDateParams {
  date?: string;
  page?: number;
  size?: number;
}

export interface PerformancesByDateResponse {
  items?: FanHomeConcert[];
  content?: FanHomeConcert[];
  performances?: FanHomeConcert[];
  data?: FanHomeConcert[];
  list?: FanHomeConcert[];
  hasNext?: boolean;
  nextPage?: number | null;
  page?: number;
  totalCount?: number;
  totalElements?: number;
  total?: number;
}

export interface NormalizedPerformancesByDateResponse
  extends PerformancesByDateResponse {
  items: FanHomeConcert[];
  hasNext: boolean;
}

export interface BandMemberProfile {
  bandMemberId: number;
  nickname: string;
  part: BandMemberPart | string;
  owner: boolean;
  memberId?: number;
  userId?: number;
  id?: number | string;
  name?: string | null;
  profileImageUrl?: string | null;
  imageUrl?: string | null;
  position?: string | null;
  role?: string | null;
}

export interface BandMemberProfilesResponse {
  items?: BandMemberProfile[];
  members?: BandMemberProfile[];
  profiles?: BandMemberProfile[];
  data?: BandMemberProfile[];
  list?: BandMemberProfile[];
}

export interface NormalizedBandMemberProfilesResponse {
  items: BandMemberProfile[];
}

export type FanHomePerformanceType = "UPCOMING" | "RECOMMENDED";

export interface FanHomeResponse {
  hasFollowingBands?: boolean;
  hasUnreadNotification?: boolean;
  hasUnreadNotifications?: boolean;
  performanceType?: FanHomePerformanceType;
  followingBandNews?: FanHomeNewsItem[];
  followedBandNews?: FanHomeNewsItem[];
  followedNews?: FanHomeNewsItem[];
  news?: FanHomeNewsItem[];
  recommendedBands?: FanHomeRecommendedBand[];
  recommendBands?: FanHomeRecommendedBand[];
  performances?: FanHomeConcert[];
  upcomingConcerts?: FanHomeConcert[];
  followedConcerts?: FanHomeConcert[];
  recommendedConcerts?: FanHomeConcert[];
  recommendConcerts?: FanHomeConcert[];
  popularConcerts?: FanHomeConcert[];
}
