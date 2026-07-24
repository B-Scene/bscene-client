import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSessionRecruitmentInterest,
  createSessionRecruitment,
  deleteSessionRecruitment,
  deleteSessionSearchHistory,
  getSessionRecruitmentDetail,
  getSessionRecruitments,
  getSessionSearchHistory,
  removeSessionRecruitmentInterest,
  updateSessionRecruitment,
} from "@/api/session/sessionRecruitment";
import type {
  CreateSessionRecruitmentRequest,
  SessionRecruitmentListParams,
  UpdateSessionRecruitmentRequest,
} from "@/types/session/sessionRecruitment";

interface UpdateSessionRecruitmentVariables {
  sessionRecruitmentId: number;
  body: UpdateSessionRecruitmentRequest;
}

export const sessionRecruitmentKeys = {
  all: ["sessionRecruitments"] as const,
  lists: () => [...sessionRecruitmentKeys.all, "list"] as const,
  list: (params: SessionRecruitmentListParams) =>
    [...sessionRecruitmentKeys.lists(), params] as const,
  detail: (sessionRecruitmentId: number) =>
    [...sessionRecruitmentKeys.all, "detail", sessionRecruitmentId] as const,
  searchHistory: () => [...sessionRecruitmentKeys.all, "searchHistory"] as const,
};

export const useSessionRecruitmentsQuery = (
  params: SessionRecruitmentListParams = {},
  enabled = true,
) => {
  return useQuery({
    queryKey: sessionRecruitmentKeys.list(params),
    queryFn: () => getSessionRecruitments(params),
    enabled,
    staleTime: 1000 * 30,
  });
};

export const useSessionRecruitmentDetailQuery = (
  sessionRecruitmentId: number,
) => {
  return useQuery({
    queryKey: sessionRecruitmentKeys.detail(sessionRecruitmentId),
    queryFn: () => getSessionRecruitmentDetail(sessionRecruitmentId),
    enabled: sessionRecruitmentId > 0,
    staleTime: 1000 * 30,
  });
};

export const useCreateSessionRecruitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSessionRecruitmentRequest) =>
      createSessionRecruitment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.lists(),
      });
    },
  });
};

export const useUpdateSessionRecruitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionRecruitmentId,
      body,
    }: UpdateSessionRecruitmentVariables) =>
      updateSessionRecruitment(sessionRecruitmentId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.detail(variables.sessionRecruitmentId),
      });
    },
  });
};

export const useDeleteSessionRecruitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionRecruitmentId: number) =>
      deleteSessionRecruitment(sessionRecruitmentId),
    onSuccess: (_, sessionRecruitmentId) => {
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.lists(),
      });
      queryClient.removeQueries({
        queryKey: sessionRecruitmentKeys.detail(sessionRecruitmentId),
      });
    },
  });
};

export const useAddSessionRecruitmentInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionRecruitmentId: number) =>
      addSessionRecruitmentInterest(sessionRecruitmentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.detail(result.sessionRecruitmentId),
      });
    },
  });
};

export const useRemoveSessionRecruitmentInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionRecruitmentId: number) =>
      removeSessionRecruitmentInterest(sessionRecruitmentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.detail(result.sessionRecruitmentId),
      });
    },
  });
};

export const useSessionSearchHistoryQuery = () => {
  return useQuery({
    queryKey: sessionRecruitmentKeys.searchHistory(),
    queryFn: getSessionSearchHistory,
    staleTime: 1000 * 30,
  });
};

export const useDeleteSessionSearchHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keywordId: number) => deleteSessionSearchHistory(keywordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionRecruitmentKeys.searchHistory(),
      });
    },
  });
};