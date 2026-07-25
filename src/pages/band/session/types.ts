export type SessionTabId = "recruitment" | "find" | "applications";

export interface SessionTabItem {
  id: SessionTabId;
  label: string;
}

export interface SessionRecruitmentPost {
  id: number;
  deadline: string;
  title: string;
  bandName: string;
  genre: string;
  location: string;
  description: string;
  tags: string[];
  practiceSchedule?: string;
  practiceLocation?: string;
  deadlineDate?: string;
  deadlineTime?: string;
  qualification?: string;
  bookmarked: boolean;
}

export interface SessionFindCandidate {
  id: number;
  name: string;
  part: string;
  skill: string;
  genre: string;
  location: string;
  applicationTitle: string;
  summary: string;
  bookmarked: boolean;
}

export type SessionFilterKey = "part" | "skill" | "genre" | "region";

export type SessionFilterValues = Record<SessionFilterKey, string>;

export interface SessionFilterGroup {
  id: SessionFilterKey;
  title: string;
  options: string[];
}
