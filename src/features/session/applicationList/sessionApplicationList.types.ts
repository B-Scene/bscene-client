// src/features/session/applicationList/sessionApplicationList.types.ts

import type {
  SessionApplicationDraft,
  SessionApplicationExperience,
} from "@/features/session/applicationForm/applicationForm.types";

export interface ApplicationDetailFields {
  shortIntroduction?: string | null;
  introduction?: string | null;
  part?: string | null;
  skillLevel?: string | null;
  genre?: string | null;
  region?: string | null;
  activities?: readonly string[] | null;
  experiences?: readonly SessionApplicationExperience[] | null;
  portfolioLinks?: readonly string[] | null;
}

export interface SessionApplicationSummaryItem
  extends ApplicationDetailFields {
  sessionApplicationId: number;
  displayDate?: string | null;
  title?: string | null;
  purpose?: string | null;
  isPublic?: boolean | null;
}

export interface SessionApplicationSummary {
  nickname?: string | null;
  profileImageUrl?: string | null;
  part?: string | null;
  skillLevel?: string | null;
  genre?: string | null;
  region?: string | null;
  applicationCount?: number | null;
  submissionCount?: number | null;
  inProgressCount?: number | null;
  applications?: readonly SessionApplicationSummaryItem[] | null;
}

export interface ApplicationCardItem {
  sessionApplicationId: number;
  displayDate: string;
  title: string;
  purpose: string;
  isPublic: boolean;
  isLocal: boolean;
  draft: SessionApplicationDraft;
}

export interface MyApplicationDetailData {
  sessionApplicationId: number;
  displayDate: string;
  applicationType: string;
  title: string;
  nickname: string;

  // API에서 null이 올 수 있으므로 null도 허용
  profileImageUrl?: string | null;

  draft: SessionApplicationDraft;
}