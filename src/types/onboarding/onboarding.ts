import type { ApiResponse } from "@/types/auth/auth";

export type ModeCode = "FAN" | "BAND";

export type GenreCode =
  | "ROCK"
  | "INDIE_POP"
  | "PUNK"
  | "METAL"
  | "JAZZ"
  | "BLUES";

export type RegionCode = "SEOUL" | "GYEONGGI" | "INCHEON" | "ETC";

export type CodeName = {
  code: string;
  name: string;
};

export type OnboardingStatusResponse = {
  completed: boolean;
  currentMode: ModeCode | null;
  availableModes: ModeCode[];
  fanNickname: string | null;
  selectedGenres: CodeName[];
  selectedRegions: CodeName[];
  requiredSteps: string[];
};

export type CheckFanNicknameResponse = {
  available: boolean;
};

export type SaveOnboardingRequest = {
  selectedModes: ModeCode[];
  initialMode: ModeCode;
  fanNickname?: string;
  genres: string[];
  regions: string[];
};

export type SaveOnboardingResponse = OnboardingStatusResponse;

export type GenresResponse = CodeName[];

export type RegionsResponse = {
  regions: CodeName[];
};

export type OnboardingApiResponse<T> = ApiResponse<T>;