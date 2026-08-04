import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowedBands } from "@/api/user/followedBands";

export const followedBandsKeys = {
  all: ["followedBands"] as const,
  list: (pageSize: number) => [...followedBandsKeys.all, pageSize] as const,
};

const PAGE_SIZE = 10;

export const useFollowedBandsQuery = (pageSize = PAGE_SIZE, enabled = true) => {
  return useInfiniteQuery({
    queryKey: followedBandsKeys.list(pageSize),
    queryFn: ({ pageParam }) =>
      getFollowedBands({ page: pageParam, size: pageSize }),
    initialPageParam: 0,
    enabled,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
};
