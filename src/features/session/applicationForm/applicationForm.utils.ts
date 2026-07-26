// src/features/session/applicationForm/applicationForm.utils.ts

import type { SessionApplicationDraft } from "@/features/session/applicationForm/applicationForm.types";

export const cloneApplicationDraft = (
  value: SessionApplicationDraft,
): SessionApplicationDraft => ({
  ...value,
  activities: [...value.activities],
  experiences: value.experiences.map((experience) => ({
    ...experience,
  })),
  portfolioLinks: [...value.portfolioLinks],
});

export const normalizeApplicationDraft = (
  value: SessionApplicationDraft,
): SessionApplicationDraft => ({
  ...value,
  applicationType: value.applicationType.trim(),
  title: value.title.trim(),
  shortIntroduction: value.shortIntroduction.trim(),
  introduction: value.introduction.trim(),
  experiences: value.experiences.map((experience) => ({
    ...experience,
    title: experience.title.trim(),
    period: experience.period.trim(),
    description: experience.description.trim(),
  })),
  portfolioLinks: value.portfolioLinks
    .map((link) => link.trim())
    .filter(Boolean),
});