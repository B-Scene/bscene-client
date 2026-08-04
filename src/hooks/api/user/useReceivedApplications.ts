import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  acceptApplicationSubmission,
  getReceivedApplications,
} from "@/api/user/receivedApplications";
import { sessionApplicationKeys } from "@/hooks/api/session/useSessionApplication";
import type { RecruitmentStatusFilter } from "@/types/user/receivedApplications";

export const receivedApplicationsKeys = {
  all: ["receivedApplications"] as const,
  list: (status: RecruitmentStatusFilter) =>
    [...receivedApplicationsKeys.all, status] as const,
};

const PAGE_SIZE = 10;

export const useReceivedApplicationsQuery = (
  status: RecruitmentStatusFilter,
) => {
  return useInfiniteQuery({
    queryKey: receivedApplicationsKeys.list(status),
    queryFn: ({ pageParam }) =>
      getReceivedApplications({ status, cursor: pageParam, size: PAGE_SIZE }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
  });
};

export const useAcceptApplicationSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applySubmissionId,
      isApproved,
    }: {
      applySubmissionId: number;
      isApproved: boolean;
    }) => acceptApplicationSubmission(applySubmissionId, { isApproved }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: receivedApplicationsKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: sessionApplicationKeys.submissionDetail(
          variables.applySubmissionId,
        ),
      });
    },
  });
};
