export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export interface GetPostingManagementParams {
  bandId: number;
  cursorId?: number;
  size?: number;
}

export interface PostingManagementItem {
  sessionRecruitmentId: number;
  dDay: number;
  recruitmentTitle: string;
  bandName: string;
  bandGenre: string;
  bandRegion: string;
  postedAgo: number;
  summary: string;
}

export interface PostingManagementResponse {
  bandId: number;
  bandName: string;
  bandProfileImageUrl: string | null;
  content: PostingManagementItem[];
  size: number;
  nextCursor: number | null;
  hasNext: boolean;
}
