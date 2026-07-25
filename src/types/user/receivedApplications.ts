export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type RecruitmentStatusFilter = "OPEN" | "CLOSE";

export type ApplicantStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface GetReceivedApplicationsParams {
  status?: RecruitmentStatusFilter;
  cursor?: number;
  size?: number;
}

export interface ReceivedApplicant {
  sessionProfileId: number;
  applySubmissionId: number;
  profileImageUrl: string | null;
  nickname: string;
  part: string;
  level: string;
  region: string;
  status: ApplicantStatus;
}

export interface ReceivedRecruitmentPost {
  recruitmentPostId: number;
  dueDate: string;
  title: string;
  part: string;
  genre: string;
  region: string;
  recruiters: ReceivedApplicant[];
}

export interface PageInfo {
  nextCursor: number | null;
  hasNext: boolean;
}

export interface ReceivedApplicationsResponse {
  items: ReceivedRecruitmentPost[];
  pageInfo: PageInfo;
}
