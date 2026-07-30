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
  getLiveMembers,
  getLiveNowList,
  getLiveReservation,
  getLiveSummary,
  getReplayList,
  getReplayPlayback,
  getScheduledLiveList,
  leaveLive,
  reportLiveUser,
  requestLiveReplay,
  respondCoHostInvitation,
  toggleLiveAlarm,
  unblockLiveUser,
  updateLiveReservation,
} from "@/api/live/live";
import type {
  BlockLiveUserRequest,
  CreateLiveRequest,
  GetLiveNowListParams,
  GetReplayListParams,
  GetScheduledLiveListParams,
  ReportLiveUserRequest,
  RespondCoHostInvitationRequest,
  UpdateLiveReservationRequest,
} from "@/types/live/live";

const LIVE_PAGE_SIZE = 10;

export const liveKeys = {
  all: ["live"] as const,
  home: () => [...liveKeys.all, "home"] as const,
  enter: (liveId?: number | null) =>
    [...liveKeys.all, "enter", liveId ?? "empty"] as const,
  liveNow: (filter: GetLiveNowListParams["filter"]) =>
    [...liveKeys.all, "live-now", filter] as const,
  scheduled: (following: GetScheduledLiveListParams["following"]) =>
    [...liveKeys.all, "scheduled", following] as const,
  replays: (
    filter: GetReplayListParams["filter"],
    sort: GetReplayListParams["sort"],
  ) => [...liveKeys.all, "replays", filter, sort] as const,
  replayPlayback: (liveId?: number | null) =>
    [...liveKeys.all, "replay-playback", liveId ?? "empty"] as const,
  reservation: (liveId?: number | null) =>
    [...liveKeys.all, "reservation", liveId ?? "empty"] as const,
  members: (liveId?: number | null) =>
    [...liveKeys.all, "members", liveId ?? "empty"] as const,
  summary: (liveId?: number | null) =>
    [...liveKeys.all, "summary", liveId ?? "empty"] as const,
};

export const useLiveHomeQuery = () => {
  return useQuery({
    queryKey: liveKeys.home(),
    queryFn: getLiveHome,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};

export const useEnterLiveQuery = (
  liveId?: number | null,
  enabled = Boolean(liveId),
) => {
  return useQuery({
    queryKey: liveKeys.enter(liveId),
    queryFn: () => enterLive(liveId as number),
    enabled: Boolean(liveId) && enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useLiveSummaryQuery = (
  liveId?: number | null,
  enabled = Boolean(liveId),
) => {
  return useQuery({
    queryKey: liveKeys.summary(liveId),
    queryFn: () => getLiveSummary(liveId as number),
    enabled: Boolean(liveId) && enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};

export const useLiveNowQuery = (
  filter: GetLiveNowListParams["filter"] = "all",
) => {
  return useInfiniteQuery({
    queryKey: liveKeys.liveNow(filter),
    queryFn: ({ pageParam }) =>
      getLiveNowList({
        filter,
        cursor: pageParam,
        size: LIVE_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
};

export const useScheduledLiveQuery = (
  following: GetScheduledLiveListParams["following"] = false,
) => {
  return useInfiniteQuery({
    queryKey: liveKeys.scheduled(following),
    queryFn: ({ pageParam }) =>
      getScheduledLiveList({
        following,
        cursor: pageParam,
        size: LIVE_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
};

export const useReplayListQuery = (
  filter: GetReplayListParams["filter"] = "all",
  sort: GetReplayListParams["sort"] = "LATEST",
) => {
  return useInfiniteQuery({
    queryKey: liveKeys.replays(filter, sort),
    queryFn: ({ pageParam }) =>
      getReplayList({
        filter,
        sort,
        cursor: pageParam,
        size: LIVE_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
};

export const useReplayPlaybackQuery = (
  liveId?: number | null,
  enabled = Boolean(liveId),
) => {
  return useQuery({
    queryKey: liveKeys.replayPlayback(liveId),
    queryFn: () => getReplayPlayback(liveId as number),
    enabled: Boolean(liveId) && enabled,
  });
};

export const useLiveReservationQuery = (
  liveId?: number | null,
  enabled = Boolean(liveId),
) => {
  return useQuery({
    queryKey: liveKeys.reservation(liveId),
    queryFn: () => getLiveReservation(liveId as number),
    enabled: Boolean(liveId) && enabled,
  });
};

export const useLiveMembersQuery = (
  liveId?: number | null,
  enabled = Boolean(liveId),
) => {
  return useQuery({
    queryKey: liveKeys.members(liveId),
    queryFn: () => getLiveMembers(liveId as number),
    enabled: Boolean(liveId) && enabled,
  });
};

export const useCreateLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateLiveRequest) => createLive(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({ queryKey: liveKeys.liveNow("all") });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.liveNow("following"),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(false),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(true),
      });
    },
  });
};

export const useEnterLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enterLive,
    onSuccess: (_, liveId) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({ queryKey: liveKeys.enter(liveId) });
      void queryClient.invalidateQueries({ queryKey: liveKeys.liveNow("all") });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.liveNow("following"),
      });
      void queryClient.invalidateQueries({ queryKey: liveKeys.members(liveId) });
    },
  });
};

export const useLeaveLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveLive,
    onSuccess: (_, liveId) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({ queryKey: liveKeys.enter(liveId) });
      void queryClient.invalidateQueries({ queryKey: liveKeys.liveNow("all") });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.liveNow("following"),
      });
      void queryClient.invalidateQueries({ queryKey: liveKeys.members(liveId) });
    },
  });
};

export const useCloseLiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeLive,
    onSuccess: (_, liveId) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({ queryKey: liveKeys.enter(liveId) });
      void queryClient.invalidateQueries({ queryKey: liveKeys.liveNow("all") });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.liveNow("following"),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.replays("all", "LATEST"),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.replays("following", "LATEST"),
      });
      void queryClient.invalidateQueries({ queryKey: liveKeys.members(liveId) });
      void queryClient.invalidateQueries({ queryKey: liveKeys.summary(liveId) });
    },
  });
};

export const useRequestLiveReplayMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestLiveReplay,
    onSuccess: (_, liveId) => {
      void queryClient.invalidateQueries({
        queryKey: liveKeys.replayPlayback(liveId),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.replays("all", "LATEST"),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.replays("following", "LATEST"),
      });
      void queryClient.invalidateQueries({ queryKey: liveKeys.summary(liveId) });
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BlockLiveUserRequest) => blockLiveUser(request),
    onSuccess: (_, request) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.members(request.liveId),
      });
    },
  });
};

export const useUnblockLiveUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BlockLiveUserRequest) => unblockLiveUser(request),
    onSuccess: (_, request) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.members(request.liveId),
      });
    },
  });
};

export const useToggleLiveAlarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLiveAlarm,
    onSuccess: (_, liveId) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(false),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(true),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.reservation(liveId),
      });
    },
  });
};

export const useUpdateLiveReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      liveId,
      request,
    }: {
      liveId: number;
      request: UpdateLiveReservationRequest;
    }) => updateLiveReservation({ liveId, request }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(false),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(true),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.reservation(variables.liveId),
      });
    },
  });
};

export const useCancelLiveReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelLiveReservation,
    onSuccess: (_, liveId) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(false),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(true),
      });
      void queryClient.removeQueries({
        queryKey: liveKeys.reservation(liveId),
      });
    },
  });
};

export const useRespondCoHostInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      liveId,
      request,
    }: {
      liveId: number;
      request: RespondCoHostInvitationRequest;
    }) => respondCoHostInvitation({ liveId, request }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: liveKeys.home() });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.enter(variables.liveId),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(false),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.scheduled(true),
      });
      void queryClient.invalidateQueries({
        queryKey: liveKeys.reservation(variables.liveId),
      });
    },
  });
};