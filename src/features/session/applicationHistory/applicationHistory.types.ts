// src/features/session/applicationHistory/applicationHistory.types.ts

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
  status: ApplicationHistoryStatus;
  title: string;
  bandName: string;
  appliedAgo: string;
  viewedAt?: string;
  canMessage?: boolean;
  canViewApplication?: boolean;
  canCancel?: boolean;
}

export interface RecruitmentHistoryItem {
  id: number;
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