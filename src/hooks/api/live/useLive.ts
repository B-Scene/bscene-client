import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLive,
  enterLive,
  getLiveHome,
} from "@/api/live/live";
import type { CreateLiveRequest } from "@/types/live/live";

export const liveKeys = {
  all: ["lives"] as const,
  home: () => [...liveKeys.all, "home"] as const,
  enter: (liveId: number) => [...liveKeys.all, "enter", liveId] as const,
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