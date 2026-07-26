export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type InterestedPerformanceFilter =
  | "ALL"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "BEFORE";

export type ParticipationStatus = "SCHEDULED" | "COMPLETED" | null;

export interface GetInterestedPerformancesParams {
  filter?: InterestedPerformanceFilter;
  page?: number;
  size?: number;
}

export interface InterestedPerformanceItem {
  performanceId: number;
  title: string;
  venue: string;
  performanceDate: string;
  startTime: string;
  posterImageUrl: string | null;
  participationStatus: ParticipationStatus;
}

export interface InterestedPerformanceResponse {
  totalCount: number | null;
  appliedFilter: InterestedPerformanceFilter;
  baseYear: number;
  items: InterestedPerformanceItem[];
  page: number;
  hasNext: boolean;
}
