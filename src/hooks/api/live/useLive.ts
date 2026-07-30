import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  blockLiveUser,
  cancelLiveReservation,
  closeLive,
  createLive,
  enterLive,
  getLiveHome,
  getLiveNowList,
  getLiveReservation,
  getReplayList,
  getReplayPlayback,
  getScheduledLiveList,
  getLiveSummary,
  leaveLive,
  requestLiveReplay,
  reportLiveUser,
  toggleLiveAlarm,
  updateLiveReservation,
  unblockLiveUser,
} from "@/api/live/live";
import type {
  BlockLiveUserRequest,
  CreateLiveRequest,
  LiveNowListFilter,
  ReportLiveUserRequest,
  ReplayListFilter,
  ReplaySort,
  UpdateLiveReservationRequest,
} from "@/types/live/live";

export const liveKeys = {
  all: ["lives"] as const,
  home: () => [...liveKeys.all, "home"] as const,
  now: (filter: LiveNowListFilter) =>
    [...liveKeys.all, "liveNow", filter] as const,
  scheduled: (following: boolean) =>
    [...liveKeys.all, "scheduled", following] as const,
  replays: (filter: ReplayListFilter, sort: ReplaySort) =>
    [...liveKeys.all, "replays", filter, sort] as const,
  replay: (liveId: number) => [...liveKeys.all, "replay", liveId] as const,
  enter: (liveId: number) => [...liveKeys.all, "enter", liveId] as const,
  summary: (liveId: number) => [...liveKeys.all, "summary", liveId] as const,
  reservation: (liveId: number) =>
    [...liveKeys.all, "reservation", liveId] as const,
};

export const useLiveHomeQuery = () => {
  return useQuery({
    queryKey: liveKeys.home(),
    queryFn: getLiveHome,
    staleTime: 1000 * 20,
  });
};

const LIVE_NOW_PAGE_SIZE = 10;

export const useLiveNowQuery = (filter: LiveNowListFilter) => {
  return useInfiniteQuery({
    queryKey: liveKeys.now(filter),
    queryFn: ({ pageParam }) =>
      getLiveNowList({
        filter,
        cursor: pageParam,
        size: LIVE_NOW_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
};

export const useScheduledLiveQuery = (following: boolean) => {
  return useInfiniteQuery({
    queryKey: liveKeys.scheduled(following),
    queryFn: ({ pageParam }) =>
      getScheduledLiveList({
        following,
        cursor: pageParam,
        size: LIVE_NOW_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
};

export const useToggleLiveAlarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liveId: number) => toggleLiveAlarm(liveId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: liveKeys.home(),
      });
    },
  });
};

export const useReplayListQuery = (
  filter: ReplayListFilter,
  sort: ReplaySort,
) => {
  return useInfiniteQuery({
    queryKey: liveKeys.replays(filter, sort),
    queryFn: ({ pageParam }) =>
      getReplayList({
        filter,
        sort,
        cursor: pageParam,
        size: LIVE_NOW_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
};

export const useReplayPlaybackQuery = (liveId?: number | null) => {
  return useQuery({
    queryKey: liveKeys.replay(liveId ?? 0),
    queryFn: () => getReplayPlayback(liveId as number),
    enabled: !!liveId,
    staleTime: Infinity,
    retry: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useEnterLiveQuery = (
  liveId?: number | null,
  enabled = true,
) => {
  return useQuery({
    queryKey: liveKeys.enter(liveId ?? 0),
    queryFn: () => enterLive(liveId as number),
    enabled: enabled && !!liveId,
    staleTime: 1000 * 30,
    retry: false,
  });
};

export const useCreateLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateLiveRequest) => createLive(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: liveKeys.home(),
      });
    },
  });
};

export const useEnterLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liveId: number) => enterLive(liveId),
    onSuccess: (data, liveId) => {
      queryClient.setQueryData(liveKeys.enter(liveId), data);
      queryClient.invalidateQueries({
        queryKey: liveKeys.home(),
      });
      queryClient.invalidateQueries({
        queryKey: [...liveKeys.all, "liveNow"],
      });
    },
  });
};

export const useLeaveLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liveId: number) => leaveLive(liveId),
    onSuccess: (_, liveId) => {
      queryClient.removeQueries({
        queryKey: liveKeys.enter(liveId),
      });
      queryClient.invalidateQueries({
        queryKey: liveKeys.home(),
      });
    },
  });
};

export const useReportLiveUserMutation = () => {
  return useMutation({
    mutationFn: ({
      liveId,
      request,
    }: {
      liveId: number;
      request: ReportLiveUserRequest;
    }) => reportLiveUser({ liveId, request }),
  });
};

export const useBlockLiveUserMutation = () => {
  return useMutation({
    mutationFn: (request: BlockLiveUserRequest) => blockLiveUser(request),
  });
};

export const useUnblockLiveUserMutation = () => {
  return useMutation({
    mutationFn: (request: BlockLiveUserRequest) => unblockLiveUser(request),
  });
};

export const useCloseLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liveId: number) => closeLive(liveId),
    onSuccess: (_, liveId) => {
      queryClient.invalidateQueries({
        queryKey: liveKeys.home(),
      });

      queryClient.invalidateQueries({
        queryKey: liveKeys.summary(liveId),
      });
    },
  });
};

export const useRequestLiveReplayMutation = () => {
  return useMutation({
    mutationFn: (liveId: number) => requestLiveReplay(liveId),
  });
};

export const useLiveSummaryQuery = (liveId?: number | null) => {
  return useQuery({
    queryKey: liveKeys.summary(liveId ?? 0),
    queryFn: () => getLiveSummary(liveId as number),
    enabled: !!liveId,
    staleTime: 1000 * 30,
  });
};

export const useLiveReservationQuery = (liveId?: number | null) => {
  return useQuery({
    queryKey: liveKeys.reservation(liveId ?? 0),
    queryFn: () => getLiveReservation(liveId as number),
    enabled: !!liveId,
    staleTime: 1000 * 30,
  });
};

export const useUpdateLiveReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      liveId,
      body,
    }: {
      liveId: number;
      body: UpdateLiveReservationRequest;
    }) =>
      updateLiveReservation({
        liveId,
        request: body,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: liveKeys.home(),
      });

      queryClient.invalidateQueries({
        queryKey: liveKeys.reservation(variables.liveId),
      });
    },
  });
};

export const useCancelLiveReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liveId: number) => cancelLiveReservation(liveId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: liveKeys.home(),
      });
    },
  });
};
