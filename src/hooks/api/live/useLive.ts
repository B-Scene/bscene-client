import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelLiveReservation,
  closeLive,
  createLive,
  enterLive,
  getLiveHome,
  getLiveReservation,
  getLiveSummary,
  requestLiveReplay,
  updateLiveReservation,
} from "@/api/live/live";
import type {
  CreateLiveRequest,
  UpdateLiveReservationRequest,
} from "@/types/live/live";

export const liveKeys = {
  all: ["lives"] as const,
  home: () => [...liveKeys.all, "home"] as const,
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
  return useMutation({
    mutationFn: (liveId: number) => enterLive(liveId),
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