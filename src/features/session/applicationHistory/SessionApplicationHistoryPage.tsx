// src/pages/band/session/components/SessionApplicationHistoryPage.tsx

import {
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

import EmptyApplicationHistoryIcon from "@/assets/icons/band/empty-application-history.svg";
import EmptyScrapHistoryIcon from "@/assets/icons/band/empty-scrap-history.svg";
import EmptyRecentHistoryIcon from "@/assets/icons/band/empty-recent-history.svg";

import { ApplicationHistoryCard } from "@/features/session/applicationHistory/ApplicationHistoryCard";
import {
  INITIAL_APPLICATION_HISTORY,
  INITIAL_RECENT_HISTORY,
  INITIAL_SCRAP_HISTORY,
} from "@/features/session/applicationHistory/applicationHistory.mock";
import type {
  ApplicationHistoryItem,
  ApplicationHistoryTab,
  RecruitmentHistoryItem,
} from "@/features/session/applicationHistory/applicationHistory.types";
import { RecruitmentHistoryCard } from "@/features/session/applicationHistory/RecruitmentHistoryCard";
import {
  ApplicationHistoryEmptyContent,
  ApplicationHistoryHeader,
  ApplicationHistoryTabs,
} from "@/features/session/applicationHistory/SessionApplicationHistoryView";

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

  const [
    applications,
    setApplications,
  ] = useState<ApplicationHistoryItem[]>(
    () =>
      INITIAL_APPLICATION_HISTORY.map(
        (item) => ({ ...item }),
      ),
  );

  const [scrapItems, setScrapItems] =
    useState<RecruitmentHistoryItem[]>(
      () =>
        INITIAL_SCRAP_HISTORY.map(
          (item) => ({ ...item }),
        ),
    );

  const [recentItems, setRecentItems] =
    useState<RecruitmentHistoryItem[]>(
      () =>
        INITIAL_RECENT_HISTORY.map(
          (item) => ({ ...item }),
        ),
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleCancelApplication = (
    applicationId: number,
  ) => {
    setApplications(
      (previousApplications) =>
        previousApplications.map(
          (application) =>
            application.id ===
            applicationId
              ? {
                  ...application,
                  status: "canceled",
                  canMessage: false,
                  canViewApplication: false,
                  canCancel: false,
                }
              : application,
        ),
    );
  };

  const handleToggleScrap = (
    recruitmentId: number,
  ) => {
    setScrapItems(
      (previousItems) =>
        previousItems
          .map((item) =>
            item.id === recruitmentId
              ? {
                  ...item,
                  bookmarked:
                    !item.bookmarked,
                }
              : item,
          )
          .filter(
            (item) => item.bookmarked,
          ),
    );
  };

  const handleToggleRecentBookmark = (
    recruitmentId: number,
  ) => {
    setRecentItems(
      (previousItems) =>
        previousItems.map((item) =>
          item.id === recruitmentId
            ? {
                ...item,
                bookmarked:
                  !item.bookmarked,
              }
            : item,
        ),
    );
  };

  const handleClose = () => {
    setActiveTab("application");
    onClose();
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
          {activeTab ===
          "application" ? (
            applications.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                {applications.map(
                  (application) => (
                    <ApplicationHistoryCard
                      key={application.id}
                      application={
                        application
                      }
                      onViewApplication={(
                        selectedApplication,
                      ) =>
                        onViewApplication?.(
                          selectedApplication,
                        )
                      }
                      onCancelApplication={
                        handleCancelApplication
                      }
                      onMessage={(
                        selectedApplication,
                      ) =>
                        onMessage?.(
                          selectedApplication,
                        )
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <ApplicationHistoryEmptyContent
                icon={
                  EmptyApplicationHistoryIcon
                }
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
            )
          ) : null}

          {activeTab === "scrap" ? (
            scrapItems.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                {scrapItems.map(
                  (recruitment) => (
                    <RecruitmentHistoryCard
                      key={recruitment.id}
                      recruitment={
                        recruitment
                      }
                      onToggleBookmark={
                        handleToggleScrap
                      }
                      onOpen={(
                        selectedRecruitment,
                      ) =>
                        onOpenRecruitment?.(
                          selectedRecruitment,
                        )
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <ApplicationHistoryEmptyContent
                icon={
                  EmptyScrapHistoryIcon
                }
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
            )
          ) : null}

          {activeTab === "recent" ? (
            recentItems.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                {recentItems.map(
                  (recruitment) => (
                    <RecruitmentHistoryCard
                      key={recruitment.id}
                      recruitment={
                        recruitment
                      }
                      onToggleBookmark={
                        handleToggleRecentBookmark
                      }
                      onOpen={(
                        selectedRecruitment,
                      ) =>
                        onOpenRecruitment?.(
                          selectedRecruitment,
                        )
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <ApplicationHistoryEmptyContent
                icon={
                  EmptyRecentHistoryIcon
                }
                title="최근 본 공고가 없어요"
                description={
                  <>
                    모집공고 탭에서 본
                    공고가
                    <br />
                    여기에 표시돼요
                  </>
                }
                onBrowseRecruitments={
                  onBrowseRecruitments
                }
              />
            )
          ) : null}
        </section>
      </main>
    </div>,
    document.body,
  );
};
