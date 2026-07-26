// src/pages/band/session/components/SessionApplicationsScreen.tsx

import { useState } from "react";
import type { AxiosError } from "axios";

import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import { StatRow } from "@/components/band/home/StatRow";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { SessionApplicationCard } from "@/features/session/applicationList/SessionApplicationCard";
import { useSessionApplicationsState } from "@/features/session/applicationList/useSessionApplicationsState";
import {
  useMySessionApplicationSummaryQuery,
  useUpdateSessionApplicationVisibility,
} from "@/hooks/api/session/useSessionApplication";
import type { SessionApiResponse } from "@/types/session/sessionApplication";

import { MyApplicationDetail } from "./MyApplicationDetail";
import { SessionApplicationCreatePage } from "./SessionApplicationCreatePage";
import { SessionApplicationHistoryPage } from "@/features/session/applicationHistory/SessionApplicationHistoryPage";
import type {
  ApplicationHistoryItem,
  RecruitmentHistoryItem,
} from "@/features/session/applicationHistory/applicationHistory.types";

interface SessionApplicationsScreenProps {
  onEditBasicInfo: () => void;

  onViewApplicationHistory?: () => void;

  onBrowseRecruitments?: () => void;

  onViewHistoryApplication?: (
    application: ApplicationHistoryItem,
  ) => void;

  onMessage?: (
    application: ApplicationHistoryItem,
  ) => void;

  onOpenRecruitment?: (
    recruitment: RecruitmentHistoryItem,
  ) => void;

  onDeleteApplication?: (
    sessionApplicationId: number,
  ) => void;
}

export const SessionApplicationsScreen = ({
  onEditBasicInfo,
  onViewApplicationHistory,
  onBrowseRecruitments,
  onViewHistoryApplication,
  onMessage,
  onOpenRecruitment,
  onDeleteApplication,
}: SessionApplicationsScreenProps) => {
  const [
    isApplicationHistoryOpen,
    setIsApplicationHistoryOpen,
  ] = useState(false);

  const summaryQuery =
    useMySessionApplicationSummaryQuery();

  const visibilityMutation =
    useUpdateSessionApplicationVisibility();

  const summary = summaryQuery.data;

  const {
    applications,
    hasApplications,
    localApplicationCount,

    isApplicationFormOpen,
    applicationFormMode,
    editingInitialValue,

    selectedApplicationDetail,

    handleOpenCreatePage,
    handleOpenEditPage,
    handleCloseApplicationForm,

    handleOpenApplicationDetail,
    handleCloseApplicationDetail,

    handleSubmitApplication,
    handleToggleVisibility,
    handleDeleteApplication,
  } = useSessionApplicationsState({
    summary,

    onServerVisibilityChange: (
      sessionApplicationId,
      isPublic,
    ) => {
      visibilityMutation.mutate({
        sessionApplicationId,

        body: {
          isPublic,
        },
      });
    },

    onServerDelete:
      onDeleteApplication,
  });

  const handleOpenApplicationHistory =
    () => {
      setIsApplicationHistoryOpen(true);

      onViewApplicationHistory?.();
    };

  const handleCloseApplicationHistory =
    () => {
      setIsApplicationHistoryOpen(false);
    };

  const handleBrowseRecruitments = () => {
    setIsApplicationHistoryOpen(false);

    onBrowseRecruitments?.();
  };

  const visibilityErrorMessage = (
    visibilityMutation.error as AxiosError<
      SessionApiResponse<null>
    > | null
  )?.response?.data?.message;

  if (summaryQuery.isLoading) {
    return (
      <section className="flex min-h-[360px] items-center justify-center bg-neutral-0 px-6 text-caption1 text-neutral-500">
        내 지원서를 불러오고 있어요
      </section>
    );
  }

  if (summaryQuery.isError) {
    return (
      <section className="flex min-h-[360px] flex-col items-center justify-center bg-neutral-0 px-6 text-center">
        <p className="text-caption1 text-neutral-500">
          내 지원서를 불러오지 못했어요
        </p>

        <button
          type="button"
          onClick={() =>
            summaryQuery.refetch()
          }
          className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
        >
          다시 시도
        </button>
      </section>
    );
  }

  const profileDescription =
    [
      summary?.part,
      summary?.genre,
      summary?.region,
    ]
      .filter(Boolean)
      .join(" · ") ||
    "기본 정보를 등록해주세요";

  const stats = [
    {
      label: "지원서",

      value:
        (summary?.applicationCount ??
          0) +
        localApplicationCount,
    },
    {
      label: "지원",

      value:
        summary?.submissionCount ?? 0,
    },
    {
      label: "진행중",

      value:
        summary?.inProgressCount ?? 0,
    },
  ];

  return (
    <>
      <section className="flex min-h-[calc(100dvh_-_154px_-_var(--bottom-nav-height))] flex-col bg-neutral-0">
        <section className="flex flex-col gap-4 bg-secondary-0 px-[22px] py-6">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={
                  summary?.profileImageUrl ||
                  UserDefaultProfileIcon
                }
                alt=""
                className="size-[42px] shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <strong className="truncate text-label1 text-neutral-900">
                    {summary?.nickname ??
                      "닉네임 없음"}
                  </strong>

                  {summary?.skillLevel ? (
                    <span className="inline-flex h-6 shrink-0 items-center justify-center rounded-full border border-secondary-500 bg-secondary-0 px-[15px] text-caption3 text-secondary-500">
                      {
                        summary.skillLevel
                      }
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 truncate text-caption3 text-neutral-600">
                  {profileDescription}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onEditBasicInfo}
              className="inline-flex h-[30px] shrink-0 items-center justify-center rounded-[8px] border border-neutral-400 bg-neutral-0 px-[9px] text-caption3 text-neutral-600"
            >
              기본 정보 수정
            </button>
          </div>

          <StatRow stats={stats} />

          <button
            type="button"
            onClick={
              handleOpenApplicationHistory
            }
            className="flex h-[38px] w-full items-center justify-center rounded-[8px] bg-secondary-400 text-body1 text-neutral-0"
          >
            지원 내역
          </button>

          {visibilityErrorMessage ? (
            <p className="text-center text-caption2 text-error">
              {
                visibilityErrorMessage
              }
            </p>
          ) : null}
        </section>

        <section className="flex min-h-[360px] flex-1 flex-col px-[22px] pt-6 pb-8">
          <header className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-label1 text-neutral-900">
                지원서
              </h2>

              <p className="mt-1 text-caption2 text-neutral-600">
                지원할 때 선택할 소개서를
                관리해요
              </p>
            </div>

            {hasApplications ? (
              <button
                type="button"
                onClick={
                  handleOpenCreatePage
                }
                className="shrink-0 text-caption3 text-secondary-500 underline underline-offset-[3px]"
              >
                + 지원서 추가
              </button>
            ) : null}
          </header>

          {hasApplications ? (
            <div className="mt-6 flex flex-col gap-3">
              {applications.map(
                (application) => (
                  <SessionApplicationCard
                    key={
                      application.sessionApplicationId
                    }
                    application={
                      application
                    }
                    visibilityDisabled={
                      visibilityMutation.isPending
                    }
                    onView={
                      handleOpenApplicationDetail
                    }
                    onEdit={
                      handleOpenEditPage
                    }
                    onDelete={
                      handleDeleteApplication
                    }
                    onToggleVisibility={
                      handleToggleVisibility
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <EmptyState
              title="내 지원서가 없어요"
              description={
                <>
                  모집공고에 바로 지원할 수
                  있도록
                  <br />
                  파트, 실력대, 소개글을 담은
                  지원서를 먼저 만들어보세요
                </>
              }
              actionLabel="지원서 작성"
              onAction={
                handleOpenCreatePage
              }
            />
          )}
        </section>
      </section>

      <SessionApplicationCreatePage
        open={isApplicationFormOpen}
        mode={applicationFormMode}
        initialValue={
          editingInitialValue
        }
        onClose={
          handleCloseApplicationForm
        }
        onSubmit={
          handleSubmitApplication
        }
      />

      <MyApplicationDetail
        open={Boolean(
          selectedApplicationDetail,
        )}
        application={
          selectedApplicationDetail
        }
        onClose={
          handleCloseApplicationDetail
        }
      />

      <SessionApplicationHistoryPage
        open={
          isApplicationHistoryOpen
        }
        onClose={
          handleCloseApplicationHistory
        }
        onBrowseRecruitments={
          handleBrowseRecruitments
        }
        onViewApplication={(application) => {
          setIsApplicationHistoryOpen(false);
          onViewHistoryApplication?.(application);
        }}
        onMessage={onMessage}
        onOpenRecruitment={(recruitment) => {
          setIsApplicationHistoryOpen(false);
          onOpenRecruitment?.(recruitment);
        }}
      />
    </>
  );
};
