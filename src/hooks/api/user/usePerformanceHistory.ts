import { useInfiniteQuery } from "@tanstack/react-query";
import { getPerformanceHistory } from "@/api/user/performanceHistory";
import type { PerformanceHistoryFilter } from "@/types/user/performanceHistory";

export const performanceHistoryKeys = {
  all: ["performanceHistory"] as const,
  list: (filter: PerformanceHistoryFilter) =>
    [...performanceHistoryKeys.all, filter] as const,
};

const PAGE_SIZE = 10;

export const usePerformanceHistoryQuery = (
  filter: PerformanceHistoryFilter,
) => {
  return useInfiniteQuery({
    queryKey: performanceHistoryKeys.list(filter),
    queryFn: ({ pageParam }) =>
      getPerformanceHistory({ filter, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
};
