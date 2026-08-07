import type {
  SessionApplicationDraft,
  SessionApplicationExperience,
} from "@/features/session/applicationForm/applicationForm.types";
import type { SessionApplicationPortfolioLink } from "@/types/session/sessionApplication";

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

export interface SessionApplicationSummaryItem extends ApplicationDetailFields {
  sessionApplicationId: number;
  displayDate?: string | null;
  title?: string | null;
  purpose?: string | null;
  isPublic?: boolean | null;
}

export interface SessionApplicationSummary {
  hasDefaultApplication?: boolean | null;
  sessionApplicationId?: number | null;
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
  isDefault: boolean;
  isLocal: boolean;
  draft: SessionApplicationDraft;
  portfolioLinkDetails?: readonly SessionApplicationPortfolioLink[] | null;
}

export interface MyApplicationDetailData {
  sessionApplicationId: number;
  displayDate: string;
  applicationType: string;
  title: string;
  nickname: string;
  profileImageUrl?: string | null;
  draft: SessionApplicationDraft;
  portfolioLinks?: readonly SessionApplicationPortfolioLink[] | null;
}