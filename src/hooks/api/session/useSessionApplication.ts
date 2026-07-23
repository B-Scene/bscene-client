import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMySessionApplicationSummary,
  getSessionApplicationDetail,
  getSessionApplicationsSearch,
  updateSessionApplicationVisibility,
} from "@/api/session/sessionApplication";
import type {
  SessionApplicationSearchParams,
  UpdateSessionApplicationVisibilityRequest,
} from "@/types/session/sessionApplication";

interface UpdateVisibilityVariables {
  sessionApplicationId: number;
  body: UpdateSessionApplicationVisibilityRequest;
}

export const sessionApplicationKeys = {
  all: ["sessionApplications"] as const,
  searches: () => [...sessionApplicationKeys.all, "search"] as const,
  search: (params: SessionApplicationSearchParams) =>
    [...sessionApplicationKeys.searches(), params] as const,
  detail: (sessionApplicationId: number) =>
    [...sessionApplicationKeys.all, "detail", sessionApplicationId] as const,
  summary: () => [...sessionApplicationKeys.all, "summary"] as const,
};

export const useSessionApplicationsSearchQuery = (
  params: SessionApplicationSearchParams = {},
) => {
  return useQuery({
    queryKey: sessionApplicationKeys.search(params),
    queryFn: () => getSessionApplicationsSearch(params),
    staleTime: 1000 * 30,
  });
};

export const useSessionApplicationDetailQuery = (
  sessionApplicationId: number,
) => {
  return useQuery({
    queryKey: sessionApplicationKeys.detail(sessionApplicationId),
    queryFn: () => getSessionApplicationDetail(sessionApplicationId),
    enabled: sessionApplicationId > 0,
    staleTime: 1000 * 30,
  });
};

export const useMySessionApplicationSummaryQuery = () => {
  return useQuery({
    queryKey: sessionApplicationKeys.summary(),
    queryFn: getMySessionApplicationSummary,
    staleTime: 1000 * 30,
  });
};

export const useUpdateSessionApplicationVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionApplicationId, body }: UpdateVisibilityVariables) =>
      updateSessionApplicationVisibility(sessionApplicationId, body),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.searches(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.detail(result.sessionApplicationId),
      });
    },
  });
};