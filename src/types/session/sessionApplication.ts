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
  title: string;
  thumbnailUrl: string | null;
  mediaType: string;
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