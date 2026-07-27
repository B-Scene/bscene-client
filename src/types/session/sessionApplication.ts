export interface SessionApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export interface SessionApplicationSearchParams {
  part?: string;
  skillLevel?: string;
  genre?: string;
  region?: string;
  keyword?: string;
  cursorId?: number;
  size?: number;
}

export interface SessionApplicationSearchItem {
  sessionApplicationId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  skillLevel: string;
  part: string;
  genre: string;
  region: string;
  title: string;
  oneLineIntro: string;
}

export interface SessionApplicationSearchResponse {
  content: SessionApplicationSearchItem[];
  size: number;
  nextCursor: number | null;
  hasNext: boolean;
}

export interface SessionApplicationCareer {
  sessionApplicationCareerId: number;
  name: string;
  period: string;
  description: string;
}

export interface SessionApplicationPortfolioLink {
  sessionApplicationLinkId: number;
  url: string;
  title: string | null;
  thumbnailUrl: string | null;
  mediaType: string | null;
}

export interface SessionApplicationDetailResponse {
  sessionApplicationId: number;
  title: string;
  purpose: string;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  isPublic: boolean;
  oneLineIntro: string;
  intro: string;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  availableActivities: string[];
  careers: SessionApplicationCareer[];
  portfolioLinks: SessionApplicationPortfolioLink[];
}

export interface MySessionApplicationDetailResponse {
  modifiedAt: string;
  profileImageUrl: string | null;
  name: string;
  defaultPart: string;
  defaultSkillLevel: string;
  defaultRegion: string;
  purpose: string;
  title: string;
  oneLineIntro: string;
  intro: string;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  availableActivities: string[];
  careers: SessionApplicationCareer[];
  portfolioLinks: SessionApplicationPortfolioLink[];
}

export interface SessionApplicationCareerRequest {
  name: string;
  period: string;
  description?: string;
}

export interface SessionApplicationPortfolioLinkRequest {
  url: string;
}

export interface CreateSessionApplicationRequest {
  purpose: string;
  title: string;
  oneLineIntro: string;
  intro: string;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  availableActivities: string[];
  careers?: SessionApplicationCareerRequest[];
  portfolioLinks?: SessionApplicationPortfolioLinkRequest[];
}

export type UpdateSessionApplicationRequest = CreateSessionApplicationRequest;

export interface CreateSessionApplicationResponse {
  hasApplication: boolean;
  sessionApplicationId: number;
  userId: number;
  nickname: string;
  title: string;
  purpose: string;
  oneLineIntro: string;
  profileImageUrl: string | null;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  intro: string;
  portfolioLinks: SessionApplicationPortfolioLink[];
  availableActivities: string[];
  careers: SessionApplicationCareer[];
}

export type UpdateSessionApplicationResponse = CreateSessionApplicationResponse;

export type DeleteSessionApplicationResponse = null;

export interface UpdateSessionApplicationVisibilityRequest {
  isPublic: boolean;
}

export interface UpdateSessionApplicationVisibilityResponse {
  sessionApplicationId: number;
  isPublic: boolean;
}

export interface SessionApplicationSummaryItem {
  sessionApplicationId: number;
  displayDate: string;
  isModified: boolean;
  isPublic?: boolean;
  purpose: string;
  title: string;
}

export interface SessionApplicationSummaryResponse {
  hasDefaultApplication: boolean;
  sessionApplicationId: number | null;
  nickname: string;
  profileImageUrl: string | null;
  skillLevel: string | null;
  part: string | null;
  genre: string | null;
  region: string | null;
  applicationCount: number;
  submissionCount: number;
  inProgressCount: number;
  applications: SessionApplicationSummaryItem[];
}

export interface ApplySessionRecruitmentRequest {
  sessionApplicationId: number;
}

export interface ApplySessionRecruitmentResponse {
  applicationSubmissionId: number;
  recruitmentTitle: string;
  bandName: string;
  applicationTitle: string;
}

export type CancelSessionApplicationSubmissionResponse = null;

export interface ApplicationSubmissionItem {
  applicationSubmissionId: number;
  sessionRecruitmentId: number;
  sessionApplicationId: number;
  checkedAt: string | null;
  status: string;
  recruitmentTitle: string;
  bandName: string;
  appliedAgo: number;
}

export interface ApplicationSubmissionsParams {
  cursorId?: number;
  size?: number;
}

export interface ApplicationSubmissionsResponse {
  content: ApplicationSubmissionItem[];
  size: number;
  nextCursor: number | null;
  hasNext: boolean;
}