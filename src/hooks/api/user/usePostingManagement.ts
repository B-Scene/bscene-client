import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostingManagement } from "@/api/user/postingManagement";

export const postingManagementKeys = {
  all: ["postingManagement"] as const,
  list: (bandId: number) => [...postingManagementKeys.all, bandId] as const,
};

const PAGE_SIZE = 10;

export const usePostingManagementQuery = (bandId: number) => {
  return useInfiniteQuery({
    queryKey: postingManagementKeys.list(bandId),
    queryFn: ({ pageParam }) =>
      getPostingManagement({ bandId, cursorId: pageParam, size: PAGE_SIZE }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Number.isFinite(bandId),
  });
};
