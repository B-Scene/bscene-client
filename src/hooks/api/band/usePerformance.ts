import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPerformance,
  deletePerformance,
  getPerformance,
  getPerformances,
  updatePerformance,
} from "@/api/band/performance";
import type {
  CreatePerformanceRequest,
  UpdatePerformanceRequest,
} from "@/types/band/performance";

export const performanceKeys = {
  all: ["performance"] as const,
  listsRoot: (bandId: number) =>
    [...performanceKeys.all, "list", bandId] as const,
  detail: (performanceId: number) =>
    [...performanceKeys.all, "detail", performanceId] as const,
};

export const usePerformancesQuery = (bandId: number) => {
  return useQuery({
    queryKey: performanceKeys.listsRoot(bandId),
    queryFn: () => getPerformances(bandId),
    staleTime: 1000 * 30,
    enabled: Number.isFinite(bandId),
  });
};

export const usePerformanceQuery = (performanceId: number) => {
  return useQuery({
    queryKey: performanceKeys.detail(performanceId),
    queryFn: () => getPerformance(performanceId),
    staleTime: 1000 * 30,
    enabled: Number.isFinite(performanceId),
  });
};

export const useCreatePerformance = (bandId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePerformanceRequest) =>
      createPerformance(bandId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: performanceKeys.listsRoot(bandId),
      });
    },
  });
};

export const useDeletePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (performanceId: number) => deletePerformance(performanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
};

export const useUpdatePerformance = (performanceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePerformanceRequest) =>
      updatePerformance(performanceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: performanceKeys.detail(performanceId),
      });
      queryClient.invalidateQueries({ queryKey: performanceKeys.all });
    },
  });
};
