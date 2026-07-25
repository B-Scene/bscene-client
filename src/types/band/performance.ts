import type { BandRegion } from "@/types/band/band";

export interface BandApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type PerformanceGenre =
  | "ROCK"
  | "INDIE_POP"
  | "JAZZ"
  | "METAL"
  | "FOLK"
  | "RNB"
  | "BLUES"
  | "PUNK"
  | "ACOUSTIC";

export type PerformanceAgeRating = "ALL" | "AGE_12" | "AGE_15" | "AGE_19";

export interface CreatePerformanceRequest {
  title: string;
  performanceDate: string;
  startTime: string;
  region: BandRegion;
  venue: string;
  description: string;
  ticketPrice: string;
  ticketLink?: string;
  posterImageUrl?: string;
  genre: PerformanceGenre;
  ageRating: PerformanceAgeRating;
  tags?: string[];
}

export interface PerformanceResponse {
  performanceId: number;
  title: string;
  genre: PerformanceGenre;
  performanceDate: string;
  startTime: string;
  region: BandRegion;
  venue: string;
  description: string;
  ticketPrice: string;
  ticketLink: string | null;
  posterImageUrl: string | null;
  ageRating: PerformanceAgeRating;
  tags: string[];
  interestCount: number;
  isInterested: boolean;
}

export type CreatePerformanceResponse = PerformanceResponse;

export interface UpdatePerformanceRequest {
  title?: string;
  performanceDate?: string;
  startTime?: string;
  region?: BandRegion;
  venue?: string;
  description?: string;
  ticketPrice?: number;
  ticketLink?: string;
  posterImageUrl?: string;
  ageRating?: PerformanceAgeRating;
  tags?: string[];
}

export type UpdatePerformanceResponse = PerformanceResponse;

export interface PerformanceListItem {
  performanceId: number;
  title: string;
  performanceDate: string;
  venue: string;
  posterImageUrl: string | null;
}

export interface PerformanceListResponse {
  performances: PerformanceListItem[];
}
