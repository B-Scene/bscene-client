import type { BandGenre, BandRegion } from "@/types/band/band";

export interface BandApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type PerformanceGenre = BandGenre;

export type PerformanceAgeRating = "ALL" | "AGE_12" | "AGE_15" | "AGE_19";

// 공연 등록/수정 API는 밴드 프로필의 BandRegion(전체 대문자)과 달리
// 첫 글자만 대문자인 지역명 문자열을 요구한다 (예: "Gyeonggi").
export type PerformanceRegion =
  | "Seoul"
  | "Gyeonggi"
  | "Incheon"
  | "Busan"
  | "Daegu"
  | "Gwangju"
  | "Daejeon"
  | "Ulsan"
  | "Sejong"
  | "Chungbuk"
  | "Chungnam"
  | "Jeonbuk"
  | "Jeonnam"
  | "Gyeongbuk"
  | "Gyeongnam"
  | "Gangwon"
  | "Jeju";

export interface CreatePerformanceRequest {
  title: string;
  performanceDate: string;
  startTime: string;
  region: PerformanceRegion;
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
  genre?: PerformanceGenre;
  performanceDate?: string;
  startTime?: string;
  region?: PerformanceRegion;
  venue?: string;
  description?: string;
  ticketPrice?: string;
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
