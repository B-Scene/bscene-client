export type FormStep = 1 | 2;
export type SelectBottomSheetType = "genre" | "region" | null;
export type FormMode = "create" | "edit";

export interface BasicFormValues {
  title: string;
  summary: string;
  detail: string;
  part: string;
  skill: string;
  genre: string;
}

export interface DetailFormValues {
  region: string;
  practiceSchedule: string;
  practiceLocation: string;
  deadlineDate: string;
  deadlineTime: string;
  qualification: string;
}

export interface FormErrors {
  title?: string;
  summary?: string;
  detail?: string;
  part?: string;
  genre?: string;
  region?: string;
  practiceSchedule?: string;
  practiceLocation?: string;
  deadlineDate?: string;
  deadlineTime?: string;
  qualification?: string;
}
