import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteAllFanExploreRecentSearches,
  deleteFanExploreRecentSearch,
  followExploreBand,
  getFanExploreBandDetail,
  getFanExplorePostDetail,
  getFanExploreRecentSearches,
  getRecommendedExploreBands,
  likeFanExplorePost,
  searchFanExplore,
  searchFanExploreContents,
  searchFanExplorePerformances,
  unlikeFanExplorePost,
  unfollowExploreBand,
} from "@/api/fan/explore";
import type {
  FanExplorePostDetail,
  FanExploreRecommendationParams,
  FanExploreSearchParams,
} from "@/types/fan/explore";
import { fanHomeKeys } from "@/hooks/api/fan/useFanHome";
import { followedBandsKeys } from "@/hooks/api/user/useFollowedBands";

export const fanExploreKeys = {
  all: ["fanExplore"] as const,
  recommendedBands: (params: FanExploreRecommendationParams) =>
    [...fanExploreKeys.all, "recommendedBands", params] as const,
  bandDetail: (bandId: number) =>
    [...fanExploreKeys.all, "bandDetail", bandId] as const,
  postDetail: (postId: number) =>
    [...fanExploreKeys.all, "postDetail", postId] as const,
  search: (params: FanExploreSearchParams) =>
    [...fanExploreKeys.all, "search", params] as const,
  searchPerformances: (params: FanExploreSearchParams) =>
    [...fanExploreKeys.all, "searchPerformances", params] as const,
  searchContents: (params: FanExploreSearchParams) =>
    [...fanExploreKeys.all, "searchContents", params] as const,
  recentSearches: () => [...fanExploreKeys.all, "recentSearches"] as const,
};

export const useRecommendedExploreBandsInfiniteQuery = (
  params: FanExploreRecommendationParams = {},
) => {
  return useInfiniteQuery({
    queryKey: fanExploreKeys.recommendedBands(params),
    queryFn: ({ pageParam }) =>
      getRecommendedExploreBands({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 1000 * 30,
  });
};

export const useFanExploreBandDetailQuery = (bandId?: number) => {
  return useQuery({
    queryKey: fanExploreKeys.bandDetail(bandId ?? 0),
    queryFn: () => getFanExploreBandDetail(bandId as number),
    enabled: typeof bandId === "number" && Number.isFinite(bandId) && bandId > 0,
    staleTime: 1000 * 30,
  });
};

export const useFanExplorePostDetailQuery = (postId?: number) => {
  return useQuery({
    queryKey: fanExploreKeys.postDetail(postId ?? 0),
    queryFn: () => getFanExplorePostDetail(postId as number),
    enabled: typeof postId === "number" && Number.isFinite(postId) && postId > 0,
    staleTime: 1000 * 30,
  });
};

export const useLikeFanExplorePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeFanExplorePost,
    onSuccess: (result, postId) => {
      queryClient.setQueryData(
        fanExploreKeys.postDetail(postId),
        (currentData: FanExplorePostDetail | undefined) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            isLiked: result.isLiked,
            likeCount: result.likeCount ?? currentData.likeCount,
          };
        },
      );

      return queryClient.invalidateQueries({
        queryKey: fanExploreKeys.all,
      });
    },
  });
};

export const useUnlikeFanExplorePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlikeFanExplorePost,
    onSuccess: (result, postId) => {
      queryClient.setQueryData(
        fanExploreKeys.postDetail(postId),
        (currentData: FanExplorePostDetail | undefined) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            isLiked: result.isLiked,
            likeCount: result.likeCount ?? currentData.likeCount,
          };
        },
      );

      return queryClient.invalidateQueries({
        queryKey: fanExploreKeys.all,
      });
    },
  });
};

export const useFanExploreSearchQuery = (params: FanExploreSearchParams) => {
  return useQuery({
    queryKey: fanExploreKeys.search(params),
    queryFn: () => searchFanExplore(params),
    enabled: params.keyword.trim().length > 0,
    staleTime: 1000 * 30,
  });
};

export const useFanExploreRecentSearchesQuery = () => {
  return useQuery({
    queryKey: fanExploreKeys.recentSearches(),
    queryFn: getFanExploreRecentSearches,
    staleTime: 0,
  });
};

export const useDeleteFanExploreRecentSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recentSearchId: number) =>
      deleteFanExploreRecentSearch(recentSearchId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: fanExploreKeys.recentSearches(),
      }),
  });
};

export const useDeleteAllFanExploreRecentSearches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllFanExploreRecentSearches,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: fanExploreKeys.recentSearches(),
      }),
  });
};

export const useFanExplorePerformanceSearchQuery = (
  params: Omit<FanExploreSearchParams, "cursor" | "type">,
) => {
  return useInfiniteQuery({
    queryKey: fanExploreKeys.searchPerformances(params),
    queryFn: ({ pageParam }) =>
      searchFanExplorePerformances({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? String(lastPage.nextCursor ?? "") || undefined : undefined,
    enabled: params.keyword.trim().length > 0,
    staleTime: 1000 * 30,
  });
};

export const useFanExploreContentSearchQuery = (
  params: Omit<FanExploreSearchParams, "cursor" | "type">,
) => {
  return useInfiniteQuery({
    queryKey: fanExploreKeys.searchContents(params),
    queryFn: ({ pageParam }) =>
      searchFanExploreContents({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? String(lastPage.nextCursor ?? "") || undefined : undefined,
    enabled: params.keyword.trim().length > 0,
    staleTime: 1000 * 30,
  });
};

export const useFollowExploreBand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followExploreBand,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: fanExploreKeys.all }),
        queryClient.invalidateQueries({ queryKey: fanHomeKeys.all }),
        queryClient.invalidateQueries({ queryKey: followedBandsKeys.all }),
      ]),
  });
};

export const useUnfollowExploreBand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowExploreBand,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: fanExploreKeys.all }),
        queryClient.invalidateQueries({ queryKey: fanHomeKeys.all }),
        queryClient.invalidateQueries({ queryKey: followedBandsKeys.all }),
      ]),
  });
};
