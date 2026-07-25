import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowedBands } from "@/api/user/followedBands";

export const followedBandsKeys = {
  all: ["followedBands"] as const,
};

const PAGE_SIZE = 10;

export const useFollowedBandsQuery = () => {
  return useInfiniteQuery({
    queryKey: followedBandsKeys.all,
    queryFn: ({ pageParam }) =>
      getFollowedBands({ page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
};
