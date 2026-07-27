import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  applySessionRecruitment,
  cancelApplicationSubmission,
  createSessionApplication,
  deleteSessionApplication,
  getApplicationSubmissions,
  getMySessionApplicationDetail,
  getMySessionApplicationSummary,
  getSessionApplicationDetail,
  getSessionApplicationsSearch,
  updateSessionApplication,
  updateSessionApplicationVisibility,
} from "@/api/session/sessionApplication";
import type {
  ApplicationSubmissionListParams,
  ApplySessionRecruitmentRequest,
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

interface ApplySessionRecruitmentVariables {
  sessionRecruitmentId: number;
  body: ApplySessionRecruitmentRequest;
}

export const sessionApplicationKeys = {
  all: ["sessionApplications"] as const,
  searches: () =>
    [...sessionApplicationKeys.all, "search"] as const,
  search: (params: SessionApplicationSearchParams) =>
    [...sessionApplicationKeys.searches(), params] as const,
  detail: (sessionApplicationId: number) =>
    [
      ...sessionApplicationKeys.all,
      "detail",
      sessionApplicationId,
    ] as const,
  myDetail: (sessionApplicationId: number) =>
    [
      ...sessionApplicationKeys.all,
      "myDetail",
      sessionApplicationId,
    ] as const,
  summary: () =>
    [...sessionApplicationKeys.all, "summary"] as const,
  submissions: () =>
    [...sessionApplicationKeys.all, "submissions"] as const,
  submissionList: (params: ApplicationSubmissionListParams) =>
    [
      ...sessionApplicationKeys.submissions(),
      params,
    ] as const,
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
    queryKey:
      sessionApplicationKeys.detail(sessionApplicationId),
    queryFn: () =>
      getSessionApplicationDetail(sessionApplicationId),
    enabled: sessionApplicationId > 0,
    staleTime: 1000 * 30,
  });
};

export const useMySessionApplicationDetailQuery = (
  sessionApplicationId?: number | null,
) => {
  return useQuery({
    queryKey: sessionApplicationKeys.myDetail(
      sessionApplicationId ?? 0,
    ),
    queryFn: () =>
      getMySessionApplicationDetail(
        sessionApplicationId as number,
      ),
    enabled: Boolean(sessionApplicationId),
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

export const useCreateSessionApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSessionApplicationRequest) =>
      createSessionApplication(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.searches(),
      });
    },
  });
};

export const useUpdateSessionApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionApplicationId,
      body,
    }: UpdateSessionApplicationVariables) =>
      updateSessionApplication(sessionApplicationId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.searches(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.myDetail(
          variables.sessionApplicationId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.detail(
          variables.sessionApplicationId,
        ),
      });
    },
  });
};

export const useDeleteSessionApplicationMutation = () => {
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
        queryKey: sessionApplicationKeys.myDetail(
          sessionApplicationId,
        ),
      });
      queryClient.removeQueries({
        queryKey: sessionApplicationKeys.detail(
          sessionApplicationId,
        ),
      });
    },
  });
};

export const useUpdateSessionApplicationVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionApplicationId,
      body,
    }: UpdateVisibilityVariables) =>
      updateSessionApplicationVisibility(
        sessionApplicationId,
        body,
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.searches(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.detail(
          result.sessionApplicationId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.myDetail(
          result.sessionApplicationId,
        ),
      });
    },
  });
};

export const useApplySessionRecruitmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionRecruitmentId,
      body,
    }: ApplySessionRecruitmentVariables) =>
      applySessionRecruitment(sessionRecruitmentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.submissions(),
      });
    },
  });
};

export const useApplicationSubmissionsQuery = (
  params: ApplicationSubmissionListParams = {},
) => {
  return useQuery({
    queryKey:
      sessionApplicationKeys.submissionList(params),
    queryFn: () => getApplicationSubmissions(params),
    staleTime: 1000 * 30,
  });
};

export const useCancelApplicationSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationSubmissionId: number) =>
      cancelApplicationSubmission(
        applicationSubmissionId,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.submissions(),
      });
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });
    },
  });
};