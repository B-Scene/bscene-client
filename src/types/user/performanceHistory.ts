export interface ApiResponse<T> {
  isSuccess: boolean;
  status: number;
  code: string;
  message: string;
  result: T;
  timeStamp: string;
}

export type PerformanceHistoryFilter =
  | "ALL"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "BEFORE";

export interface GetPerformanceHistoryParams {
  filter?: PerformanceHistoryFilter;
  page?: number;
  size?: number;
}

export interface PerformanceHistoryItem {
  performanceId: number;
  title: string;
  venue: string;
  performanceDate: string;
  startTime: string;
  posterImageUrl: string | null;
  status: "COMPLETED";
}

export interface PerformanceHistoryResponse {
  totalCount: number | null;
  appliedFilter: PerformanceHistoryFilter;
  baseYear: number;
  items: PerformanceHistoryItem[];
  page: number;
  hasNext: boolean;
}
