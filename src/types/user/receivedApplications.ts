export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type RecruitmentStatusFilter = "OPEN" | "CLOSE";

export type ApplicantStatus =
  | "PENDING"
  | "BAND_ACCEPTED"
  | "ACCEPTED"
  | "REJECTED";

export interface GetReceivedApplicationsParams {
  status?: RecruitmentStatusFilter;
  cursor?: number;
  size?: number;
}

export interface ReceivedApplicant {
  applySubmissionId: number;
  sessionApplicationId: number;
  profileImageUrl: string | null;
  name: string;
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
  totalApplicants: number;
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

export interface AcceptApplicationSubmissionRequest {
  isApproved: boolean;
}
