import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
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

  onViewApplication?: (
    application: ApplicationHistoryItem,
  ) => void;

  onMessage?: (
    application: ApplicationHistoryItem,
  ) => void;

  onOpenRecruitment?: (
    recruitment: RecruitmentHistoryItem,
  ) => void;
}

const toApplicationStatus = (
  status: string,
): ApplicationHistoryStatus => {
  if (
    status.includes("수락") ||
    status.toUpperCase() === "ACCEPTED"
  ) {
    return "accepted";
  }

  if (
    status.includes("거절") ||
    status.toUpperCase() === "REJECTED"
  ) {
    return "rejected";
  }

  if (
    status.includes("취소") ||
    status.toUpperCase() === "CANCELED" ||
    status.toUpperCase() === "CANCELLED"
  ) {
    return "canceled";
  }

  return "completed";
};

const toDeadlineLabel = (
  dDay: number,
  isClosed: boolean,
) => {
  if (isClosed || dDay < 0) return "마감";
  if (dDay === 0) return "오늘 마감";
  return `D-${dDay}`;
};

const toAgoLabel = (
  value: number | string | null | undefined,
  suffix: string,
) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return `${value}일 전${suffix}`;
};

const formatCheckedAt = (
  value: string | null,
) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return `${value.slice(0, 10)} 열람`;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일 열람`;
};

const mapSubmissionToHistoryItem = (
  item: ApplicationSubmissionItem,
): ApplicationHistoryItem => {
  const status = toApplicationStatus(item.status);
  const isPending = status === "completed";

  return {
    id: item.applicationSubmissionId,
    applicationSubmissionId:
      item.applicationSubmissionId,
    sessionRecruitmentId:
      item.sessionRecruitmentId,
    sessionApplicationId:
      item.sessionApplicationId,
    status,
    title: item.recruitmentTitle,
    bandName: item.bandName,
    appliedAgo: toAgoLabel(
      item.appliedAgo,
      " 지원",
    ),
    viewedAt: formatCheckedAt(item.checkedAt),
    canMessage:
      status === "completed" ||
      status === "accepted",
    canViewApplication: true,
    canCancel: isPending,
  };
};

const mapInterestToRecruitmentHistoryItem = (
  item: InterestedSessionRecruitmentItem,
): RecruitmentHistoryItem => {
  return {
    id: item.sessionRecruitmentId,
    interestId: item.interestId,
    deadlineLabel: toDeadlineLabel(
      item.dDay,
      item.isClosed,
    ),
    isClosed: item.isClosed,
    title: item.recruitmentTitle,
    bandName: item.bandName,
    genre: item.bandGenre,
    region: item.bandRegion,
    viewedAgo: toAgoLabel(
      item.postedAgo,
      " 전",
    ),
    description: item.summary,
    part: item.part,
    skillLevel: item.skillLevel,
    bookmarked: item.isInterested,
  };
};

const mapRecentToRecruitmentHistoryItem = (
  item: RecentlyViewedSessionRecruitmentItem,
): RecruitmentHistoryItem => {
  return {
    id: item.sessionRecruitmentId,
    viewId: item.viewId,
    deadlineLabel: toDeadlineLabel(
      item.dDay,
      item.isClosed,
    ),
    isClosed: item.isClosed,
    title: item.recruitmentTitle,
    bandName: item.bandName,
    genre: item.bandGenre,
    region: item.bandRegion,
    viewedAgo: toAgoLabel(
      item.postedAgo,
      " 전",
    ),
    description: item.summary,
    part: item.part,
    skillLevel: item.skillLevel,
    bookmarked: item.isInterested,
  };
};

export const SessionApplicationHistoryPage = ({
  open,
  onClose,
  onBrowseRecruitments,
  onViewApplication,
  onMessage,
  onOpenRecruitment,
}: SessionApplicationHistoryPageProps) => {
  const [activeTab, setActiveTab] =
    useState<ApplicationHistoryTab>(
      "application",
    );

  const submissionsQuery =
    useApplicationSubmissionsQuery({
      size: 10,
    });

  const interestsQuery =
    useInterestedSessionRecruitmentsQuery({
      size: 10,
    });

  const recentlyViewedQuery =
    useRecentlyViewedSessionRecruitmentsQuery({
      size: 10,
    });

  const cancelSubmissionMutation =
    useCancelApplicationSubmissionMutation();

  const addInterestMutation =
    useAddSessionRecruitmentInterest();

  const removeInterestMutation =
    useRemoveSessionRecruitmentInterest();

  const applications = useMemo(
    () =>
      submissionsQuery.data?.content.map(
        mapSubmissionToHistoryItem,
      ) ?? [],
    [submissionsQuery.data],
  );

  const scrapItems = useMemo(
    () =>
      interestsQuery.data?.content.map(
        mapInterestToRecruitmentHistoryItem,
      ) ?? [],
    [interestsQuery.data],
  );

  const recentItems = useMemo(
    () =>
      recentlyViewedQuery.data?.content.map(
        mapRecentToRecruitmentHistoryItem,
      ) ?? [],
    [recentlyViewedQuery.data],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleCancelApplication = async (
    applicationSubmissionId: number,
  ) => {
    try {
      await cancelSubmissionMutation.mutateAsync(
        applicationSubmissionId,
      );
    } catch (error) {
      const apiMessage = (
        error as AxiosError<
          SessionApiResponse<null>
        >
      ).response?.data?.message;

      window.alert(
        apiMessage ??
          "지원 취소에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleToggleBookmark = (
    recruitmentId: number,
  ) => {
    const scrapItem = scrapItems.find(
      (item) => item.id === recruitmentId,
    );

    const recentItem = recentItems.find(
      (item) => item.id === recruitmentId,
    );

    const isBookmarked =
      scrapItem?.bookmarked ??
      recentItem?.bookmarked ??
      false;

    const mutation = isBookmarked
      ? removeInterestMutation
      : addInterestMutation;

    mutation.mutate(recruitmentId, {
      onError: (error) => {
        const apiMessage = (
          error as AxiosError<
            SessionApiResponse<null>
          >
        ).response?.data?.message;

        window.alert(
          apiMessage ??
            "스크랩 상태 변경에 실패했어요.",
        );
      },
    });
  };

  const handleClose = () => {
    setActiveTab("application");
    onClose();
  };

  const renderApplicationTab = () => {
    if (submissionsQuery.isLoading) {
      return (
        <HistoryLoading message="지원 내역을 불러오고 있어요" />
      );
    }

    if (submissionsQuery.isError) {
      return (
        <HistoryError
          message="지원 내역을 불러오지 못했어요"
          onRetry={() =>
            submissionsQuery.refetch()
          }
        />
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
              지원해보세요
            </>
          }
          onBrowseRecruitments={
            onBrowseRecruitments
          }
        />
      );
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {applications.map((application) => (
          <ApplicationHistoryCard
            key={application.id}
            application={application}
            onViewApplication={(selected) =>
              onViewApplication?.(selected)
            }
            onCancelApplication={
              handleCancelApplication
            }
            onMessage={(selected) =>
              onMessage?.(selected)
            }
          />
        ))}
      </div>
    );
  };

  const renderScrapTab = () => {
    if (interestsQuery.isLoading) {
      return (
        <HistoryLoading message="스크랩한 공고를 불러오고 있어요" />
      );
    }

    if (interestsQuery.isError) {
      return (
        <HistoryError
          message="스크랩한 공고를 불러오지 못했어요"
          onRetry={() => interestsQuery.refetch()}
        />
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
              스크랩해보세요
              <br />
              여기서 모아 볼 수 있어요
            </>
          }
          onBrowseRecruitments={
            onBrowseRecruitments
          }
        />
      );
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {scrapItems.map((recruitment) => (
          <RecruitmentHistoryCard
            key={recruitment.id}
            recruitment={recruitment}
            onToggleBookmark={
              handleToggleBookmark
            }
            onOpen={(selectedRecruitment) =>
              onOpenRecruitment?.(
                selectedRecruitment,
              )
            }
          />
        ))}
      </div>
    );
  };

  const renderRecentTab = () => {
    if (recentlyViewedQuery.isLoading) {
      return (
        <HistoryLoading message="최근 본 공고를 불러오고 있어요" />
      );
    }

    if (recentlyViewedQuery.isError) {
      return (
        <HistoryError
          message="최근 본 공고를 불러오지 못했어요"
          onRetry={() =>
            recentlyViewedQuery.refetch()
          }
        />
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
          onBrowseRecruitments={
            onBrowseRecruitments
          }
        />
      );
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {recentItems.map((recruitment) => (
          <RecruitmentHistoryCard
            key={recruitment.id}
            recruitment={recruitment}
            onToggleBookmark={
              handleToggleBookmark
            }
            onOpen={(selectedRecruitment) =>
              onOpenRecruitment?.(
                selectedRecruitment,
              )
            }
          />
        ))}
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-neutral-0">
      <main className="mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
        <ApplicationHistoryHeader
          onBack={handleClose}
          onClose={handleClose}
        />

        <ApplicationHistoryTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <section className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5">
          {activeTab === "application"
            ? renderApplicationTab()
            : null}

          {activeTab === "scrap"
            ? renderScrapTab()
            : null}

          {activeTab === "recent"
            ? renderRecentTab()
            : null}
        </section>
      </main>
    </div>,
    document.body,
  );
};

const HistoryLoading = ({
  message,
}: {
  message: string;
}) => {
  return (
    <div className="flex min-h-[420px] items-center justify-center text-caption1 text-neutral-500">
      {message}
    </div>
  );
};

const HistoryError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <p className="text-caption1 text-neutral-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
      >
        다시 시도
      </button>
    </div>
  );
};