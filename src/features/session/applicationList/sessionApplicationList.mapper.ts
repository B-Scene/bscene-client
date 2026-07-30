// src/features/session/applicationList/sessionApplicationList.mapper.ts

import { createInitialApplicationForm } from "@/features/session/applicationForm/applicationForm.constants";
import type { SessionApplicationDraft } from "@/features/session/applicationForm/applicationForm.types";

import type {
  ApplicationCardItem,
  MyApplicationDetailData,
  SessionApplicationSummary,
  SessionApplicationSummaryItem,
} from "./sessionApplicationList.types";

interface CreateDraftParams {
  application: SessionApplicationSummaryItem;
  summary?: SessionApplicationSummary;
}

export const createApplicationDraftFromSummary = ({
  application,
  summary,
}: CreateDraftParams): SessionApplicationDraft => {
  return {
    ...createInitialApplicationForm(),

    applicationType: application.title ?? "",
    title: application.purpose ?? "",

    shortIntroduction:
      application.shortIntroduction ??
      application.purpose ??
      "",

    introduction: application.introduction ?? "",

    part:
      application.part ??
      summary?.part ??
      "",

    skillLevel:
      application.skillLevel ??
      summary?.skillLevel ??
      "",

    genre:
      application.genre ??
      summary?.genre ??
      "",

    region:
      application.region ??
      summary?.region ??
      "",

    activities: application.activities
      ? [...application.activities]
      : [],

    experiences: application.experiences
      ? [...application.experiences]
      : [],

    portfolioLinks:
      application.portfolioLinks?.length
        ? [...application.portfolioLinks]
        : [""],
  };
};

export const mapServerApplications = (
  summary: SessionApplicationSummary | undefined,
  overrides: Record<number, ApplicationCardItem>,
): ApplicationCardItem[] => {
  const serverApplications =
    summary?.applications ?? [];

  return serverApplications.map((application) => {
    const applicationId =
      application.sessionApplicationId;

    const override =
      overrides[applicationId];

    if (override) {
      return override;
    }

    return {
      sessionApplicationId: applicationId,
      displayDate:
        application.displayDate ?? "",

      title: application.title ?? "",
      purpose: application.purpose ?? "",

      isPublic:
        application.isPublic ?? false,

      isLocal: false,

      draft: createApplicationDraftFromSummary({
        application,
        summary,
      }),
    };
  });
};

export const mapApplicationToDetail = (
  application: ApplicationCardItem,
  summary?: SessionApplicationSummary,
): MyApplicationDetailData => {
  return {
    sessionApplicationId:
      application.sessionApplicationId,

    displayDate: application.displayDate,

    applicationType: application.title,
    title: application.purpose,

    nickname:
      summary?.nickname ?? "닉네임 없음",

    profileImageUrl:
      summary?.profileImageUrl ?? null,

    draft: application.draft,
  };
};