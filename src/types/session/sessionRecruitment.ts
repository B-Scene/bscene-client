export interface SessionApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export interface CreateSessionRecruitmentRequest {
  bandMemberId: number;
  recruitmentTitle: string;
  summary: string;
  content: string;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  practiceSchedule: string;
  practicePlace: string;
  deadlineAt: string;
  qualification: string;
}

export interface CreateSessionRecruitmentResponse {
  sessionRecruitmentId: number;
  bandId: number;
  recruitmentTitle: string;
  summary: string;
  content: string;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  practiceSchedule: string;
  practicePlace: string;
  deadlineAt: string;
  qualification: string;
  createdAt: string;
}

export type UpdateSessionRecruitmentRequest = Omit<
  CreateSessionRecruitmentRequest,
  "bandMemberId"
>;

export type UpdateSessionRecruitmentResponse = CreateSessionRecruitmentResponse;

export type DeleteSessionRecruitmentResponse = null;

export type SessionRecruitmentSort = "LATEST" | "IMMINENT";

export interface SessionRecruitmentListParams {
  part?: string;
  skillLevel?: string;
  genre?: string;
  region?: string;
  keyword?: string;
  sort?: SessionRecruitmentSort;
  cursorId?: number;
  size?: number;
}

export interface SessionRecruitmentListItem {
  sessionRecruitmentId: number;
  bandId: number;
  dDay: number;
  isNew: boolean;
  isInterested: boolean;
  recruitmentTitle: string;
  bandName: string;
  bandGenre: string;
  bandRegion: string;
  postedAgo: number;
  summary: string;
  part: string;
  skillLevel: string;
}

export interface SessionRecruitmentListResponse {
  content: SessionRecruitmentListItem[];
  size: number;
  nextCursor: number | null;
  hasNext: boolean;
}

export interface SessionRecruitmentDetailResponse {
  sessionRecruitmentId: number;
  isNew: boolean;
  recruitmentTitle: string;
  deadlineAt: string;
  dDay: number;
  content: string;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  practiceSchedule: string;
  practicePlace: string;
  qualification: string;
  bandId: number;
  bandName: string;
  bandProfileImageUrl: string;
  bandGenre: string;
  bandRegion: string;
}

export interface SessionRecruitmentInterestResponse {
  sessionRecruitmentId: number;
  isInterested: boolean;
}

export interface SessionSearchHistoryItem {
  keywordId: number;
  keyword: string;
}

export type DeleteSessionSearchHistoryResponse = null;