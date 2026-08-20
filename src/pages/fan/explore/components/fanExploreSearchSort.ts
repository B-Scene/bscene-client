import type { FanExploreSort } from "@/types/fan/explore";

export const SEARCH_RESULT_SORT_OPTIONS = ["정확도순", "인기순"] as const;
export type SearchResultSortOption = (typeof SEARCH_RESULT_SORT_OPTIONS)[number];

export const SEARCH_SORT_TO_API: Record<SearchResultSortOption, FanExploreSort> = {
  정확도순: "ACCURACY",
  인기순: "POPULAR",
};

export const SEARCH_SORT_LABELS: Record<FanExploreSort, SearchResultSortOption> = {
  ACCURACY: "정확도순",
  POPULAR: "인기순",
  RECOMMEND: "정확도순",
};
