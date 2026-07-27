import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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

interface SessionApplicationHistoryPageProps {
  open: boolean;
  onClose: () => void;
  onBrowseRecruitments: () => void;
  onViewApplication?: (application: ApplicationHistoryItem) => void;
  onMessage?: (application: ApplicationHistoryItem) => void;
  onOpenRecruitment?: (recruitment: RecruitmentHistoryItem) => void;
}

interface ServerApplicationSubmissionItem {
  applicationSubmissionId: number;
  sessionRecruitmentId: number;
  sessionApplicationId: number;
  checkedAt: string | null;
  status: string;
  recruitmentTitle: string;
  bandName: string;
  appliedAgo: number | string;
}

interface ServerRecruitmentHistoryItem {
  interestId?: number;
  viewId?: number;
  sessionRecruitmentId: number;
  dDay: number;
  isClosed: boolean;
  isInterested: boolean;
  recruitmentTitle: string;
  bandName: string;
  bandGenre: string;
  bandRegion: string;
  postedAgo: number | string;
  summary: string;
  part: string;
  skillLevel: string;
}

const getContent = <T,>(data: unknown): T[] => {
  const content = (data as { content?: T[] } | null | undefined)?.content;

  return Array.isArray(content) ? content : [];
};

const toApplicationStatus = (status: string): ApplicationHistoryStatus => {
  if (status.includes("수락")) return "accepted";
  if (status.includes("거절")) return "rejected";
  if (status.includes("취소")) return "canceled";

  return "completed";
};

const toAppliedAgoLabel = (value: number | string) => {
  if (typeof value === "number") {
    if (value <= 0) return "오늘 지원";
    return `${value}일 전 지원`;
  }

  if (value.includes("지원")) {
    return value;
  }

  return `${value} 지원`;
};

const toViewedAtLabel = (value: string | null) => {
  if (!value) return undefined;

  const dateValue = value.includes("T") ? value.split("T")[0] : value;
  const [, month, day] = dateValue.split("-").map(Number);

  if (!month || !day) {
    return value;
  }

  return `${month}월 ${day}일 열람`;
};

const toDeadlineLabel = (dDay: number) => {
  if (dDay < 0) return "마감";
  if (dDay === 0) return "오늘 마감";
  return `D-${dDay}`;
};

const mapSubmissionToApplicationHistory = (
  submission: ServerApplicationSubmissionItem,
): ApplicationHistoryItem => {
  const status = toApplicationStatus(submission.status);
  const isPending = status === "completed";
  const isAccepted = status === "accepted";

  return {
    id: submission.applicationSubmissionId,
    status,
    title: submission.recruitmentTitle,
    bandName: submission.bandName,
    appliedAgo: toAppliedAgoLabel(submission.appliedAgo),
    viewedAt: toViewedAtLabel(submission.checkedAt),
    canMessage: isPending || isAccepted,
    canViewApplication: isPending,
    canCancel: isPending,
  };
};

const mapRecruitmentToHistoryItem = (
  recruitment: ServerRecruitmentHistoryItem,
): RecruitmentHistoryItem => {
  return {
    id: recruitment.sessionRecruitmentId,
    deadlineLabel: toDeadlineLabel(recruitment.dDay),
    isClosed: recruitment.isClosed,
    title: recruitment.recruitmentTitle,
    bandName: recruitment.bandName,
    genre: recruitment.bandGenre,
    region: recruitment.bandRegion,
    viewedAgo:
      typeof recruitment.postedAgo === "number"
        ? `${recruitment.postedAgo}일 전`
        : recruitment.postedAgo,
    description: recruitment.summary,
    part: recruitment.part,
    skillLevel: recruitment.skillLevel,
    bookmarked: recruitment.isInterested,
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
    useState<ApplicationHistoryTab>("application");

  const submissionsQuery = useApplicationSubmissionsQuery({
    size: 10,
  });

  const interestedRecruitmentsQuery = useInterestedSessionRecruitmentsQuery({
    size: 10,
  });

  const recentlyViewedRecruitmentsQuery =
    useRecentlyViewedSessionRecruitmentsQuery({
      size: 10,
    });

  const cancelApplicationMutation = useCancelApplicationSubmissionMutation();
  const addInterestMutation = useAddSessionRecruitmentInterest();
  const removeInterestMutation = useRemoveSessionRecruitmentInterest();

  const applications = useMemo(() => {
    return getContent<ServerApplicationSubmissionItem>(
      submissionsQuery.data,
    ).map(mapSubmissionToApplicationHistory);
  }, [submissionsQuery.data]);

  const scrapItems = useMemo(() => {
    return getContent<ServerRecruitmentHistoryItem>(
      interestedRecruitmentsQuery.data,
    ).map(mapRecruitmentToHistoryItem);
  }, [interestedRecruitmentsQuery.data]);

  const recentItems = useMemo(() => {
    return getContent<ServerRecruitmentHistoryItem>(
      recentlyViewedRecruitmentsQuery.data,
    ).map(mapRecruitmentToHistoryItem);
  }, [recentlyViewedRecruitmentsQuery.data]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleClose = () => {
    setActiveTab("application");
    onClose();
  };

  const handleCancelApplication = (applicationSubmissionId: number) => {
    if (cancelApplicationMutation.isPending) {
      return;
    }

    cancelApplicationMutation.mutate(applicationSubmissionId);
  };

  const handleToggleScrap = (sessionRecruitmentId: number) => {
    if (removeInterestMutation.isPending || addInterestMutation.isPending) {
      return;
    }

    removeInterestMutation.mutate(sessionRecruitmentId);
  };

  const handleToggleRecentBookmark = (sessionRecruitmentId: number) => {
    if (removeInterestMutation.isPending || addInterestMutation.isPending) {
      return;
    }

    const targetRecruitment = recentItems.find(
      (item) => item.id === sessionRecruitmentId,
    );

    if (targetRecruitment?.bookmarked) {
      removeInterestMutation.mutate(sessionRecruitmentId);
      return;
    }

    addInterestMutation.mutate(sessionRecruitmentId);
  };

  const renderApplicationTab = () => {
    if (submissionsQuery.isLoading) {
      return (
        <div className="flex min-h-[520px] items-center justify-center text-caption2 text-neutral-500">
          지원 내역을 불러오고 있어요
        </div>
      );
    }

    if (submissionsQuery.isError) {
      return (
        <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
          <p className="text-caption2 text-neutral-500">
            지원 내역을 불러오지 못했어요
          </p>
          <button
            type="button"
            onClick={() => submissionsQuery.refetch()}
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
          onBrowseRecruitments={onBrowseRecruitments}
        />
      );
    }

    return (
      <div className="flex flex-col gap-[10px]">
        {applications.map((application) => (
          <ApplicationHistoryCard
            key={application.id}
            application={application}
            onViewApplication={(selectedApplication) =>
              onViewApplication?.(selectedApplication)
            }
            onCancelApplication={handleCancelApplication}
            onMessage={(selectedApplication) =>
              onMessage?.(selectedApplication)
            }
          />
        ))}
      </div>
    );
  };

  const renderScrapTab = () => {
    if (interestedRecruitmentsQuery.isLoading) {
      return (
        <div className="flex min-h-[520px] items-center justify-center text-caption2 text-neutral-500">
          스크랩한 공고를 불러오고 있어요
        </div>
      );
    }

    if (interestedRecruitmentsQuery.isError) {
      return (
        <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
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
            </>
          }
          onBrowseRecruitments={onBrowseRecruitments}
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
        <div className="flex min-h-[520px] items-center justify-center text-caption2 text-neutral-500">
          최근 본 공고를 불러오고 있어요
        </div>
      );
    }

    if (recentlyViewedRecruitmentsQuery.isError) {
      return (
        <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
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
          onBrowseRecruitments={onBrowseRecruitments}
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-center bg-neutral-900/70">
      <main className="flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
        <ApplicationHistoryHeader onBack={handleClose} onClose={handleClose} />

        <ApplicationHistoryTabs activeTab={activeTab} onChange={setActiveTab} />

        <section className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5">
          {activeTab === "application" ? renderApplicationTab() : null}
          {activeTab === "scrap" ? renderScrapTab() : null}
          {activeTab === "recent" ? renderRecentTab() : null}
        </section>
      </main>
    </div>,
    document.body,
  );
};

export default SessionApplicationHistoryPage;