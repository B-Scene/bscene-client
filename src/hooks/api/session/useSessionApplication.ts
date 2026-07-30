import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applySessionRecruitment,
  cancelSessionApplicationSubmission,
  createSessionApplication,
  deleteSessionApplication,
  finalizeApplicationSubmission,
  getApplicationSubmissionDetail,
  getApplicationSubmissions,
  getMySessionApplicationDetail,
  getMySessionApplicationSummary,
  getSessionApplicationDetail,
  getSessionApplicationsSearch,
  updateSessionApplication,
  updateSessionApplicationVisibility,
} from "@/api/session/sessionApplication";
import type {
  ApplicationSubmissionsParams,
  ApplySessionRecruitmentRequest,
  CreateSessionApplicationRequest,
  FinalizeApplicationSubmissionRequest,
  SessionApplicationSearchParams,
  UpdateSessionApplicationRequest,
  UpdateSessionApplicationVisibilityRequest,
} from "@/types/session/sessionApplication";
import { notificationKeys } from "@/hooks/api/useNotifications";
import { myProfilesKeys } from "@/hooks/api/user/useMyProfiles";
import { bandMemberProfileKeys } from "@/hooks/api/band/useBandMemberProfile";

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

interface FinalizeApplicationSubmissionVariables {
  applySubmissionId: number;
  body: FinalizeApplicationSubmissionRequest;
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

  submissions: () => [...sessionApplicationKeys.all, "submissions"] as const,

  submissionsList: (params: ApplicationSubmissionsParams) =>
    [...sessionApplicationKeys.submissions(), params] as const,

  submissionDetail: (applicationSubmissionId: number) =>
    [
      ...sessionApplicationKeys.submissions(),
      "detail",
      applicationSubmissionId,
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
    queryKey: sessionApplicationKeys.detail(sessionApplicationId),
    queryFn: () => getSessionApplicationDetail(sessionApplicationId),
    enabled: sessionApplicationId > 0,
    staleTime: 1000 * 30,
  });
};

export const useMySessionApplicationDetailQuery = (
  sessionApplicationId: number,
) => {
  return useQuery({
    queryKey: sessionApplicationKeys.myDetail(sessionApplicationId),
    queryFn: () => getMySessionApplicationDetail(sessionApplicationId),
    enabled: sessionApplicationId > 0,
    staleTime: 1000 * 30,
  });
};

export const useFetchMySessionApplicationDetail = () => {
  return useCallback((sessionApplicationId: number) => {
    return getMySessionApplicationDetail(sessionApplicationId);
  }, []);
};

export const useMySessionApplicationSummaryQuery = () => {
  return useQuery({
    queryKey: sessionApplicationKeys.summary(),
    queryFn: getMySessionApplicationSummary,
    staleTime: 1000 * 30,
  });
};

export const useApplicationSubmissionsQuery = (
  params: ApplicationSubmissionsParams = {},
) => {
  return useQuery({
    queryKey: sessionApplicationKeys.submissionsList(params),
    queryFn: () => getApplicationSubmissions(params),
    staleTime: 1000 * 30,
  });
};

export const useApplicationSubmissionDetailQuery = (
  applicationSubmissionId: number,
) => {
  return useQuery({
    queryKey: sessionApplicationKeys.submissionDetail(applicationSubmissionId),
    queryFn: () => getApplicationSubmissionDetail(applicationSubmissionId),
    enabled: applicationSubmissionId > 0,
    staleTime: 1000 * 30,
  });
};

export const useCreateSessionApplication = () => {
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

export const useUpdateSessionApplication = () => {
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
        queryKey: sessionApplicationKeys.myDetail(sessionApplicationId),
      });

      queryClient.removeQueries({
        queryKey: sessionApplicationKeys.detail(sessionApplicationId),
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
        queryKey: sessionApplicationKeys.submissions(),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });
    },
  });
};

export const useCancelApplicationSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationSubmissionId: number) =>
      cancelSessionApplicationSubmission(applicationSubmissionId),
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

export const useCancelSessionApplicationSubmissionMutation =
  useCancelApplicationSubmissionMutation;

export const useFinalizeApplicationSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applySubmissionId,
      body,
    }: FinalizeApplicationSubmissionVariables) =>
      finalizeApplicationSubmission(applySubmissionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.submissions(),
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.summary(),
      });

      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: myProfilesKeys.all });
      queryClient.invalidateQueries({ queryKey: bandMemberProfileKeys.all });
    },
  });
};