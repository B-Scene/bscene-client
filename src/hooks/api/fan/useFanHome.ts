import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  addPerformanceInterest,
  completePerformanceParticipation,
  deletePerformanceAlarm,
  deletePerformanceInterest,
  deletePerformanceParticipation,
  getBandMemberProfiles,
  getFanHome,
  getFanPerformanceDetail,
  getFollowingPosts,
  getPerformanceCalendar,
  getPerformancesByDate,
  getPendingPerformanceParticipation,
  getRecommendedPerformances,
  getUpcomingPerformances,
  setPerformanceAlarm,
} from "@/api/fan/home";
import type {
  PerformanceCalendarParams,
  PerformancesByDateParams,
  RecommendedPerformanceSort,
  UpcomingPerformanceSort,
} from "@/types/fan/home";
import { interestedPerformancesKeys } from "@/hooks/api/user/useInterestedPerformances";

export const fanHomeKeys = {
  all: ["fanHome"] as const,
  main: () => [...fanHomeKeys.all, "main"] as const,
  bandMemberProfiles: (bandId: number) =>
    [...fanHomeKeys.all, "bandMemberProfiles", bandId] as const,
  performanceDetail: (performanceId: number) =>
    [...fanHomeKeys.all, "performanceDetail", performanceId] as const,
  followingPosts: (size: number) =>
    [...fanHomeKeys.all, "followingPosts", size] as const,
  upcomingPerformances: (sort: UpcomingPerformanceSort, size: number) =>
    [...fanHomeKeys.all, "upcomingPerformances", sort, size] as const,
  upcomingPerformancesLists: () =>
    [...fanHomeKeys.all, "upcomingPerformances"] as const,
  recommendedPerformances: (sort: RecommendedPerformanceSort, size: number) =>
    [...fanHomeKeys.all, "recommendedPerformances", sort, size] as const,
  recommendedPerformancesLists: () =>
    [...fanHomeKeys.all, "recommendedPerformances"] as const,
  performanceCalendar: ({ year, month }: PerformanceCalendarParams) =>
    [...fanHomeKeys.all, "performanceCalendar", year ?? null, month ?? null] as const,
  performancesByDate: (date: string | undefined, size: number) =>
    [...fanHomeKeys.all, "performancesByDate", date ?? null, size] as const,
  performancesByDateLists: () =>
    [...fanHomeKeys.all, "performancesByDate"] as const,
  pendingPerformanceParticipation: () =>
    [...fanHomeKeys.all, "pendingPerformanceParticipation"] as const,
};

export const invalidatePerformanceInterestQueries = (
  queryClient: QueryClient,
  performanceId: number,
) => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: fanHomeKeys.all }),
    queryClient.invalidateQueries({ queryKey: interestedPerformancesKeys.all }),
    queryClient.invalidateQueries({
      queryKey: fanHomeKeys.performanceDetail(performanceId),
    }),
    queryClient.invalidateQueries({
      queryKey: fanHomeKeys.upcomingPerformancesLists(),
    }),
    queryClient.invalidateQueries({
      queryKey: fanHomeKeys.recommendedPerformancesLists(),
    }),
    queryClient.invalidateQueries({
      queryKey: fanHomeKeys.performancesByDateLists(),
    }),
  ]);
};

export const useFanHomeQuery = () => {
  return useQuery({
    queryKey: fanHomeKeys.main(),
    queryFn: getFanHome,
    staleTime: 1000 * 30,
  });
};

export const useBandMemberProfilesQuery = (bandId: number) => {
  return useQuery({
    queryKey: fanHomeKeys.bandMemberProfiles(bandId),
    queryFn: () => getBandMemberProfiles(bandId),
    enabled: bandId > 0,
    staleTime: 1000 * 30,
  });
};

export const usePendingPerformanceParticipationQuery = () => {
  return useQuery({
    queryKey: fanHomeKeys.pendingPerformanceParticipation(),
    queryFn: getPendingPerformanceParticipation,
    refetchOnMount: "always",
    staleTime: 0,
    retry: false,
  });
};

export const useFanPerformanceDetailQuery = (performanceId: number) => {
  return useQuery({
    queryKey: fanHomeKeys.performanceDetail(performanceId),
    queryFn: () => getFanPerformanceDetail(performanceId),
    enabled: performanceId > 0,
    staleTime: 1000 * 30,
  });
};

export const useFollowingPostsInfiniteQuery = (size = 10) => {
  return useInfiniteQuery({
    queryKey: fanHomeKeys.followingPosts(size),
    queryFn: ({ pageParam }) =>
      getFollowingPosts({
        cursor: pageParam,
        size,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 1000 * 30,
  });
};

export const useUpcomingPerformancesInfiniteQuery = (
  sort: UpcomingPerformanceSort = "IMMINENT",
  size = 10,
  enabled = true,
) => {
  return useInfiniteQuery({
    queryKey: fanHomeKeys.upcomingPerformances(sort, size),
    queryFn: ({ pageParam }) =>
      getUpcomingPerformances({
        sort,
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasNext) return undefined;
      return lastPage.nextPage ?? pages.length;
    },
    enabled,
    staleTime: 1000 * 30,
  });
};

export const useRecommendedPerformancesInfiniteQuery = (
  sort: RecommendedPerformanceSort = "POPULAR",
  size = 10,
  enabled = true,
) => {
  return useInfiniteQuery({
    queryKey: fanHomeKeys.recommendedPerformances(sort, size),
    queryFn: ({ pageParam }) =>
      getRecommendedPerformances({
        sort,
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasNext) return undefined;
      return lastPage.nextPage ?? pages.length;
    },
    enabled,
    staleTime: 1000 * 30,
  });
};

export const usePerformanceCalendarQuery = (
  params: PerformanceCalendarParams = {},
) => {
  return useQuery({
    queryKey: fanHomeKeys.performanceCalendar(params),
    queryFn: () => getPerformanceCalendar(params),
    staleTime: 1000 * 30,
  });
};

export const usePerformancesByDateInfiniteQuery = (
  params: Omit<PerformancesByDateParams, "page" | "size"> = {},
  size = 10,
) => {
  return useInfiniteQuery({
    queryKey: fanHomeKeys.performancesByDate(params.date, size),
    queryFn: ({ pageParam }) =>
      getPerformancesByDate({
        ...params,
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasNext) return undefined;
      return lastPage.nextPage ?? pages.length;
    },
    enabled: Boolean(params.date),
    staleTime: 1000 * 30,
  });
};

export const useCompletePerformanceParticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completePerformanceParticipation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fanHomeKeys.pendingPerformanceParticipation(),
      });
    },
  });
};

export const useDeletePerformanceParticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePerformanceParticipation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fanHomeKeys.pendingPerformanceParticipation(),
      });
    },
  });
};

export const useSetPerformanceAlarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setPerformanceAlarm,
    onSuccess: (_data, performanceId) =>
      invalidatePerformanceInterestQueries(queryClient, performanceId),
  });
};

export const useDeletePerformanceAlarm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePerformanceAlarm,
    onSuccess: (_data, performanceId) =>
      invalidatePerformanceInterestQueries(queryClient, performanceId),
  });
};

export const useAddPerformanceInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPerformanceInterest,
    onSuccess: (_result, performanceId) =>
      invalidatePerformanceInterestQueries(queryClient, performanceId),
  });
};

export const useDeletePerformanceInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePerformanceInterest,
    onSuccess: (_result, performanceId) =>
      invalidatePerformanceInterestQueries(queryClient, performanceId),
  });
};
