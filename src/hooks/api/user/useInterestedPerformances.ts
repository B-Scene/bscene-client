import { useInfiniteQuery } from "@tanstack/react-query";
import { getInterestedPerformances } from "@/api/user/interestedPerformance";
import type { InterestedPerformanceFilter } from "@/types/user/interestedPerformance";

export const interestedPerformancesKeys = {
  all: ["interestedPerformances"] as const,
  list: (filter: InterestedPerformanceFilter) =>
    [...interestedPerformancesKeys.all, filter] as const,
};

const PAGE_SIZE = 10;

export const useInterestedPerformancesQuery = (
  filter: InterestedPerformanceFilter,
) => {
  return useInfiniteQuery({
    queryKey: interestedPerformancesKeys.list(filter),
    queryFn: ({ pageParam }) =>
      getInterestedPerformances({ filter, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
};
