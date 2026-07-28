import { useMemo, useState } from "react";
import type { AxiosError } from "axios";

import EmptyApplicationHistoryIcon from "@/assets/icons/band/empty-application-history.svg";
import EmptyScrapHistoryIcon from "@/assets/icons/band/empty-scrap-history.svg";
import EmptyRecentHistoryIcon from "@/assets/icons/band/empty-recent-history.svg";

import { ApplicationHistoryCard } from "@/features/session/applicationHistory/ApplicationHistoryCard";
import type {
  ApplicationHistoryItem,
  ApplicationHistoryStatus,
  ApplicationHistoryTab,
  RecruitmentHistoryItem,
} from "@/features/session/applicationHistory/applicationHistory.types";
import { RecruitmentHistoryCard } from "@/features/session/applicationHistory/RecruitmentHistoryCard";
import {
  ApplicationHistoryEmptyContent,
  ApplicationHistoryHeader,
  ApplicationHistoryTabs,
} from "@/features/session/applicationHistory/SessionApplicationHistoryView";

import {
  useApplicationSubmissionsQuery,
  useCancelApplicationSubmissionMutation,
} from "@/hooks/api/session/useSessionApplication";
import {
  useAddSessionRecruitmentInterest,
  useInterestedSessionRecruitmentsQuery,
  useRecentlyViewedSessionRecruitmentsQuery,
  useRemoveSessionRecruitmentInterest,
} from "@/hooks/api/session/useSessionRecruitment";

import type {
  ApplicationSubmissionItem,
  SessionApiResponse,
} from "@/types/session/sessionApplication";
import type {
  InterestedSessionRecruitmentItem,
  RecentlyViewedSessionRecruitmentItem,
} from "@/types/session/sessionRecruitment";

interface SessionApplicationHistoryPageProps {
  open: boolean;
  onClose: () => void;
  onBrowseRecruitments: () => void;
  onViewApplication?: (application: ApplicationHistoryItem) => void;
  onMessage?: (application: ApplicationHistoryItem) => void;
  onOpenRecruitment?: (recruitment: RecruitmentHistoryItem) => void;
}

interface MappedApplicationHistoryItem extends ApplicationHistoryItem {
  applicationSubmissionId: number;
  sessionApplicationId: number;
  sessionRecruitmentId: number;
}

const HISTORY_QUERY_SIZE = 20;

const toApplicationStatus = (status: string): ApplicationHistoryStatus => {
  if (status === "지원 수락" || status === "ACCEPTED") {
    return "accepted";
  }

  if (status === "지원 거절" || status === "REJECTED") {
    return "rejected";
  }

  if (status === "지원 취소" || status === "CANCELED" || status === "CANCELLED") {
    return "canceled";
  }

  return "completed";
};

const toDeadlineLabel = (dDay: number) => {
  if (dDay < 0) {
    return "마감";
  }

  if (dDay === 0) {
    return "오늘 마감";
  }

  return `D-${dDay}`;
};

const toAppliedAgoLabel = (appliedAgo: number) => {
  if (appliedAgo <= 0) {
    return "오늘 지원";
  }

  return `${appliedAgo}일 전 지원`;
};

const toViewedAtLabel = (checkedAt: string | null) => {
  if (!checkedAt) {
    return undefined;
  }

  const date = new Date(checkedAt);

  if (Number.isNaN(date.getTime())) {
    return "열람";
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일 열람`;
};

const mapSubmissionToApplication = (
  submission: ApplicationSubmissionItem,
): MappedApplicationHistoryItem => {
  const status = toApplicationStatus(submission.status);
  const isCompleted = status === "completed";

  return {
    id: submission.applicationSubmissionId,
    applicationSubmissionId: submission.applicationSubmissionId,
    sessionApplicationId: submission.sessionApplicationId,
    sessionRecruitmentId: submission.sessionRecruitmentId,
    status,
    title: submission.recruitmentTitle,
    bandName: submission.bandName,
    appliedAgo: toAppliedAgoLabel(submission.appliedAgo),
    viewedAt: toViewedAtLabel(submission.checkedAt),
    canMessage: status === "completed" || status === "accepted",
    canViewApplication: isCompleted,
    canCancel: isCompleted,
  };
};

const mapInterestedRecruitmentToHistoryItem = (
  recruitment: InterestedSessionRecruitmentItem,
): RecruitmentHistoryItem => ({
  id: recruitment.sessionRecruitmentId,
  deadlineLabel: toDeadlineLabel(recruitment.dDay),
  isClosed: recruitment.isClosed,
  title: recruitment.recruitmentTitle,
  bandName: recruitment.bandName,
  genre: recruitment.bandGenre,
  region: recruitment.bandRegion,
  viewedAgo:
    recruitment.postedAgo <= 0 ? "오늘" : `${recruitment.postedAgo}일 전`,
  description: recruitment.summary,
  part: recruitment.part,
  skillLevel: recruitment.skillLevel,
  bookmarked: recruitment.isInterested,
});

const mapRecentlyViewedRecruitmentToHistoryItem = (
  recruitment: RecentlyViewedSessionRecruitmentItem,
): RecruitmentHistoryItem => ({
  id: recruitment.sessionRecruitmentId,
  deadlineLabel: toDeadlineLabel(recruitment.dDay),
  isClosed: recruitment.isClosed,
  title: recruitment.recruitmentTitle,
  bandName: recruitment.bandName,
  genre: recruitment.bandGenre,
  region: recruitment.bandRegion,
  viewedAgo:
    recruitment.postedAgo <= 0 ? "오늘" : `${recruitment.postedAgo}일 전`,
  description: recruitment.summary,
  part: recruitment.part,
  skillLevel: recruitment.skillLevel,
  bookmarked: recruitment.isInterested,
});

export const SessionApplicationHistoryPage = ({
  open,
  onClose,
  onBrowseRecruitments,
  onViewApplication,
  onMessage,
  onOpenRecruitment,
}: SessionApplicationHistoryPageProps) => {
  const [activeTab, setActiveTab] =
    useState<ApplicationHistoryTab>("application");

  const [canceledSubmissionIds, setCanceledSubmissionIds] = useState<
    Set<number>
  >(() => new Set());

  const applicationSubmissionsQuery = useApplicationSubmissionsQuery({
    size: HISTORY_QUERY_SIZE,
  });

  const interestedRecruitmentsQuery = useInterestedSessionRecruitmentsQuery({
    size: HISTORY_QUERY_SIZE,
  });

  const recentlyViewedRecruitmentsQuery =
    useRecentlyViewedSessionRecruitmentsQuery({
      size: HISTORY_QUERY_SIZE,
    });

  const cancelApplicationMutation = useCancelApplicationSubmissionMutation();
  const addInterestMutation = useAddSessionRecruitmentInterest();
  const removeInterestMutation = useRemoveSessionRecruitmentInterest();

  const applications = useMemo(() => {
    const content = applicationSubmissionsQuery.data?.content ?? [];

    return content.map((submission) => {
      const mappedApplication = mapSubmissionToApplication(submission);

      if (canceledSubmissionIds.has(mappedApplication.applicationSubmissionId)) {
        return {
          ...mappedApplication,
          status: "canceled" as const,
          canMessage: false,
          canViewApplication: false,
          canCancel: false,
        };
      }

      return mappedApplication;
    });
  }, [applicationSubmissionsQuery.data?.content, canceledSubmissionIds]);

  const scrapItems = useMemo(() => {
    const content = interestedRecruitmentsQuery.data?.content ?? [];

    return content.map(mapInterestedRecruitmentToHistoryItem);
  }, [interestedRecruitmentsQuery.data?.content]);

  const recentItems = useMemo(() => {
    const content = recentlyViewedRecruitmentsQuery.data?.content ?? [];

    return content.map(mapRecentlyViewedRecruitmentToHistoryItem);
  }, [recentlyViewedRecruitmentsQuery.data?.content]);

  if (!open) {
    return null;
  }

  const handleCancelApplication = async (applicationSubmissionId: number) => {
    if (cancelApplicationMutation.isPending) {
      return;
    }

    try {
      await cancelApplicationMutation.mutateAsync(applicationSubmissionId);

      setCanceledSubmissionIds((previousIds) => {
        const nextIds = new Set(previousIds);
        nextIds.add(applicationSubmissionId);
        return nextIds;
      });
    } catch (error) {
      const apiMessage = (
        error as AxiosError<SessionApiResponse<null>>
      ).response?.data?.message;

      window.alert(
        apiMessage ?? "지원 취소에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleToggleScrap = async (sessionRecruitmentId: number) => {
    const selectedRecruitment = scrapItems.find(
      (item) => item.id === sessionRecruitmentId,
    );

    if (!selectedRecruitment) {
      return;
    }

    try {
      if (selectedRecruitment.bookmarked) {
        await removeInterestMutation.mutateAsync(sessionRecruitmentId);
      } else {
        await addInterestMutation.mutateAsync(sessionRecruitmentId);
      }
    } catch (error) {
      const apiMessage = (
        error as AxiosError<SessionApiResponse<null>>
      ).response?.data?.message;

      window.alert(
        apiMessage ?? "스크랩 변경에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleToggleRecentBookmark = async (sessionRecruitmentId: number) => {
    const selectedRecruitment = recentItems.find(
      (item) => item.id === sessionRecruitmentId,
    );

    if (!selectedRecruitment) {
      return;
    }

    try {
      if (selectedRecruitment.bookmarked) {
        await removeInterestMutation.mutateAsync(sessionRecruitmentId);
      } else {
        await addInterestMutation.mutateAsync(sessionRecruitmentId);
      }
    } catch (error) {
      const apiMessage = (
        error as AxiosError<SessionApiResponse<null>>
      ).response?.data?.message;

      window.alert(
        apiMessage ?? "스크랩 변경에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleClose = () => {
    setActiveTab("application");
    onClose();
  };

  const handleBrowseRecruitments = () => {
    handleClose();
    onBrowseRecruitments();
  };

  const renderApplicationTab = () => {
    if (applicationSubmissionsQuery.isLoading) {
      return (
        <div className="flex min-h-[420px] items-center justify-center text-caption2 text-neutral-500">
          지원 내역을 불러오고 있어요
        </div>
      );
    }

    if (applicationSubmissionsQuery.isError) {
      return (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <p className="text-caption2 text-neutral-500">
            지원 내역을 불러오지 못했어요
          </p>

          <button
            type="button"
            onClick={() => applicationSubmissionsQuery.refetch()}
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <ApplicationHistoryEmptyContent
          icon={EmptyApplicationHistoryIcon}
          title="지원한 내역이 없어요"
          description={
            <>
              마음에 드는 공고를 찾아
              <br />
              지원해보세요
            </>
          }
          onBrowseRecruitments={handleBrowseRecruitments}
        />
      );
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {applications.map((application) => (
          <ApplicationHistoryCard
            key={application.applicationSubmissionId}
            application={application}
            onViewApplication={(selectedApplication) =>
              onViewApplication?.(selectedApplication)
            }
            onCancelApplication={handleCancelApplication}
            onMessage={(selectedApplication) => onMessage?.(selectedApplication)}
          />
        ))}
      </div>
    );
  };

  const renderScrapTab = () => {
    if (interestedRecruitmentsQuery.isLoading) {
      return (
        <div className="flex min-h-[420px] items-center justify-center text-caption2 text-neutral-500">
          스크랩한 공고를 불러오고 있어요
        </div>
      );
    }

    if (interestedRecruitmentsQuery.isError) {
      return (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <p className="text-caption2 text-neutral-500">
            스크랩한 공고를 불러오지 못했어요
          </p>

          <button
            type="button"
            onClick={() => interestedRecruitmentsQuery.refetch()}
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (scrapItems.length === 0) {
      return (
        <ApplicationHistoryEmptyContent
          icon={EmptyScrapHistoryIcon}
          title="스크랩한 공고가 없어요"
          description={
            <>
              마음에 드는 공고를
              <br />
              스크랩해보세요
              <br />
              여기서 모아 볼 수 있어요
            </>
          }
          onBrowseRecruitments={handleBrowseRecruitments}
        />
      );
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {scrapItems.map((recruitment) => (
          <RecruitmentHistoryCard
            key={recruitment.id}
            recruitment={recruitment}
            onToggleBookmark={handleToggleScrap}
            onOpen={(selectedRecruitment) =>
              onOpenRecruitment?.(selectedRecruitment)
            }
          />
        ))}
      </div>
    );
  };

  const renderRecentTab = () => {
    if (recentlyViewedRecruitmentsQuery.isLoading) {
      return (
        <div className="flex min-h-[420px] items-center justify-center text-caption2 text-neutral-500">
          최근 본 공고를 불러오고 있어요
        </div>
      );
    }

    if (recentlyViewedRecruitmentsQuery.isError) {
      return (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <p className="text-caption2 text-neutral-500">
            최근 본 공고를 불러오지 못했어요
          </p>

          <button
            type="button"
            onClick={() => recentlyViewedRecruitmentsQuery.refetch()}
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (recentItems.length === 0) {
      return (
        <ApplicationHistoryEmptyContent
          icon={EmptyRecentHistoryIcon}
          title="최근 본 공고가 없어요"
          description={
            <>
              모집공고 탭에서 본 공고가
              <br />
              여기에 표시돼요
            </>
          }
          onBrowseRecruitments={handleBrowseRecruitments}
        />
      );
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {recentItems.map((recruitment) => (
          <RecruitmentHistoryCard
            key={recruitment.id}
            recruitment={recruitment}
            onToggleBookmark={handleToggleRecentBookmark}
            onOpen={(selectedRecruitment) =>
              onOpenRecruitment?.(selectedRecruitment)
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-[99999] flex h-full w-full flex-col overflow-hidden bg-neutral-0">
      <ApplicationHistoryHeader onBack={handleClose} onClose={handleClose} />

      <ApplicationHistoryTabs activeTab={activeTab} onChange={setActiveTab} />

      <section className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5">
        {activeTab === "application" ? renderApplicationTab() : null}
        {activeTab === "scrap" ? renderScrapTab() : null}
        {activeTab === "recent" ? renderRecentTab() : null}
      </section>
    </div>
  );
};

export default SessionApplicationHistoryPage;