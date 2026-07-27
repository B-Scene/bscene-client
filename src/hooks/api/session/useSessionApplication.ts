import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSessionApplication,
  deleteSessionApplication,
  getMySessionApplicationDetail,
  getMySessionApplicationSummary,
  getSessionApplicationDetail,
  getSessionApplicationsSearch,
  updateSessionApplication,
  updateSessionApplicationVisibility,
} from "@/api/session/sessionApplication";
import type {
  CreateSessionApplicationRequest,
  SessionApplicationSearchParams,
  UpdateSessionApplicationRequest,
  UpdateSessionApplicationVisibilityRequest,
} from "@/types/session/sessionApplication";

interface UpdateVisibilityVariables {
  sessionApplicationId: number;
  body: UpdateSessionApplicationVisibilityRequest;
}

interface UpdateSessionApplicationVariables {
  sessionApplicationId: number;
  body: UpdateSessionApplicationRequest;
}

export const sessionApplicationKeys = {
  all: ["sessionApplications"] as const,
  searches: () => [...sessionApplicationKeys.all, "search"] as const,
  search: (params: SessionApplicationSearchParams) =>
    [...sessionApplicationKeys.searches(), params] as const,
  detail: (sessionApplicationId: number) =>
    [...sessionApplicationKeys.all, "detail", sessionApplicationId] as const,
  myDetail: (sessionApplicationId: number) =>
    [...sessionApplicationKeys.all, "myDetail", sessionApplicationId] as const,
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

export const useMySessionApplicationDetailQuery = (
  sessionApplicationId?: number | null,
) => {
  return useQuery({
    queryKey: sessionApplicationKeys.myDetail(sessionApplicationId ?? 0),
    queryFn: () => getMySessionApplicationDetail(sessionApplicationId as number),
    enabled: !!sessionApplicationId,
    staleTime: 1000 * 30,
  });
};

export const useFetchMySessionApplicationDetail = () => {
  const queryClient = useQueryClient();

  return (sessionApplicationId: number) =>
    queryClient.fetchQuery({
      queryKey: sessionApplicationKeys.myDetail(sessionApplicationId),
      queryFn: () => getMySessionApplicationDetail(sessionApplicationId),
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

export const useCreateSessionApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSessionApplicationRequest) =>
      createSessionApplication(body),
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

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.myDetail(result.sessionApplicationId),
      });
    },
  });
};

export const useUpdateSessionApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionApplicationId,
      body,
    }: UpdateSessionApplicationVariables) =>
      updateSessionApplication(sessionApplicationId, body),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.searches(),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.detail(variables.sessionApplicationId),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.myDetail(
          variables.sessionApplicationId,
        ),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.detail(result.sessionApplicationId),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.myDetail(result.sessionApplicationId),
      });
    },
  });
};

export const useDeleteSessionApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionApplicationId: number) =>
      deleteSessionApplication(sessionApplicationId),
    onSuccess: (_, sessionApplicationId) => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.searches(),
      });

      queryClient.removeQueries({
        queryKey: sessionApplicationKeys.detail(sessionApplicationId),
      });

      queryClient.removeQueries({
        queryKey: sessionApplicationKeys.myDetail(sessionApplicationId),
      });
    },
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

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.myDetail(result.sessionApplicationId),
      });
    },
  });
};