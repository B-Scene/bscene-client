export type ApplicationHistoryTab =
  | "application"
  | "scrap"
  | "recent";

export type ApplicationHistoryStatus =
  | "completed"
  | "accepted"
  | "rejected"
  | "canceled";

export interface ApplicationHistoryItem {
  id: number;
  applicationSubmissionId?: number;
  sessionRecruitmentId?: number;
  sessionApplicationId?: number;
  status: ApplicationHistoryStatus;
  title: string;
  bandName: string;
  appliedAgo: string;
  viewedAt?: string;
  canMessage?: boolean;
  canViewApplication?: boolean;
  canCancel?: boolean;
  canFinalize?: boolean;
}

export interface RecruitmentHistoryItem {
  id: number;
  interestId?: number;
  viewId?: number;
  deadlineLabel: string;
  isClosed: boolean;
  title: string;
  bandName: string;
  genre: string;
  region: string;
  viewedAgo: string;
  description: string;
  part: string;
  skillLevel: string;
  bookmarked: boolean;
}