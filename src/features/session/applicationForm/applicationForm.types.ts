// src/features/session/applicationForm/applicationForm.types.ts

export type SessionApplicationFormMode = "create" | "edit";

export interface SessionApplicationExperience {
  id: number;
  title: string;
  period: string;
  description: string;
}

export interface SessionApplicationDraft {
  applicationType: string;
  title: string;
  shortIntroduction: string;
  introduction: string;
  part: string;
  skillLevel: string;
  genre: string;
  region: string;
  activities: string[];
  experiences: SessionApplicationExperience[];
  portfolioLinks: string[];
}