import { useState } from "react";
import type { AxiosError } from "axios";

import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import { StatRow } from "@/components/band/home/StatRow";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import type { SessionApplicationDraft } from "@/features/session/applicationForm/applicationForm.types";
import { SessionApplicationCard } from "@/features/session/applicationList/SessionApplicationCard";
import type { ApplicationCardItem } from "@/features/session/applicationList/sessionApplicationList.types";
import { useSessionApplicationsState } from "@/features/session/applicationList/useSessionApplicationsState";
import type {
  ApplicationHistoryItem,
  RecruitmentHistoryItem,
} from "@/features/session/applicationHistory/applicationHistory.types";
import {
  useCreateSessionApplication,
  useDeleteSessionApplication,
  useFetchMySessionApplicationDetail,
  useMySessionApplicationSummaryQuery,
  useUpdateSessionApplication,
  useUpdateSessionApplicationVisibility,
} from "@/hooks/api/session/useSessionApplication";
import { useSessionProfileQuery } from "@/hooks/api/session/useSessionProfile";
import { getRenderableProfileImageUrl } from "@/utils/profileImageUrl";
import type {
  CreateSessionApplicationRequest,
  MySessionApplicationDetailResponse,
  SessionApiResponse,
} from "@/types/session/sessionApplication";

import { MyApplicationDetail } from "./MyApplicationDetail";
import { SessionApplicationCreatePage } from "./SessionApplicationCreatePage";
import { SessionApplicationHistoryPage } from "./SessionApplicationHistoryPage";

interface SessionApplicationsScreenProps {
  onEditBasicInfo: () => void;
  onViewApplicationHistory?: () => void;
  onCloseApplicationHistory?: () => void;
  onBrowseRecruitments?: () => void;
  onViewHistoryApplication?: (application: ApplicationHistoryItem) => void;
  onMessage?: (application: ApplicationHistoryItem) => void;
  onOpenRecruitment?: (recruitment: RecruitmentHistoryItem) => void;
  onDeleteApplication?: (sessionApplicationId: number) => void;
}

const normalizeSessionEnumValue = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue.toLowerCase() === "etc.") {
    return "etc";
  }

  return trimmedValue;
};

const createApplicationRequestFromDraft = (
  draft: SessionApplicationDraft,
  purposeOverride?: string,
): CreateSessionApplicationRequest => {
  const careers = draft.experiences
    .filter(
      (experience) =>
        experience.title.trim().length > 0 &&
        experience.period.trim().length > 0,
    )
    .map((experience) => ({
      name: experience.title.trim(),
      period: experience.period.trim(),
      description: experience.description.trim() || undefined,
    }));

  const portfolioLinks = draft.portfolioLinks
    .map((link) => link.trim())
    .filter(Boolean)
    .map((url) => ({
      url,
    }));

  return {
    purpose: purposeOverride ?? draft.applicationType.trim(),
    title: draft.title.trim(),
    oneLineIntro: draft.shortIntroduction.trim(),
    intro: draft.introduction.trim(),
    part: normalizeSessionEnumValue(draft.part),
    skillLevel: normalizeSessionEnumValue(draft.skillLevel),
    genre: normalizeSessionEnumValue(draft.genre),
    region: normalizeSessionEnumValue(draft.region),
    availableActivities: draft.activities.map(normalizeSessionEnumValue),
    careers: careers.length > 0 ? careers : undefined,
    portfolioLinks: portfolioLinks.length > 0 ? portfolioLinks : undefined,
  };
};

const mapMyApplicationDetailToDraft = (
  detail: MySessionApplicationDetailResponse,
): SessionApplicationDraft => {
  return {
    applicationType: detail.purpose ?? "",
    title: detail.title ?? "",
    shortIntroduction: detail.oneLineIntro ?? "",
    introduction: detail.intro ?? "",
    part: detail.part ?? detail.defaultPart ?? "",
    skillLevel: detail.skillLevel ?? detail.defaultSkillLevel ?? "",
    genre: detail.genre ?? "",
    region: detail.region ?? detail.defaultRegion ?? "",
    activities: detail.availableActivities ?? [],
    experiences:
      detail.careers?.map((career, index) => ({
        id: career.sessionApplicationCareerId ?? Date.now() + index,
        title: career.name ?? "",
        period: career.period ?? "",
        description: career.description ?? "",
      })) ?? [],
    portfolioLinks:
      detail.portfolioLinks && detail.portfolioLinks.length > 0
        ? detail.portfolioLinks.map((link) => link.url)
        : [""],
  };
};

const isDefaultApplicationDraft = (
  draft: SessionApplicationDraft,
  isFirstApplication: boolean,
) => {
  const applicationType = draft.applicationType.trim();

  return (
    isFirstApplication ||
    applicationType === "기본" ||
    applicationType.toUpperCase() === "DEFAULT" ||
    applicationType.toUpperCase() === "BASIC"
  );
};

export const SessionApplicationsScreen = ({
  onEditBasicInfo,
  onViewApplicationHistory,
  onCloseApplicationHistory,
  onBrowseRecruitments,
  onViewHistoryApplication,
  onMessage,
  onOpenRecruitment,
  onDeleteApplication,
}: SessionApplicationsScreenProps) => {
  const [isApplicationHistoryOpen, setIsApplicationHistoryOpen] =
    useState(false);
  const [visibilityGuardMessage, setVisibilityGuardMessage] = useState("");

  const summaryQuery = useMySessionApplicationSummaryQuery();
  const sessionProfileQuery = useSessionProfileQuery();
  const visibilityMutation = useUpdateSessionApplicationVisibility();
  const createApplicationMutation = useCreateSessionApplication();
  const updateApplicationMutation = useUpdateSessionApplication();
  const deleteApplicationMutation = useDeleteSessionApplication();
  const fetchMySessionApplicationDetail = useFetchMySessionApplicationDetail();

  const summary = summaryQuery.data;

  const {
    applications,
    hasApplications,
    localApplicationCount,

    isApplicationFormOpen,
    applicationFormMode,
    editingApplicationId,
    editingInitialValue,

    selectedApplicationDetail,

    handleOpenCreatePage,
    handleOpenEditPage,
    handleCloseApplicationForm,

    handleOpenApplicationDetail,
    handleCloseApplicationDetail,

    handleToggleVisibility,
    handleDeleteApplication,
  } = useSessionApplicationsState({
    summary,

    onVisibilityBlocked: () => {
      setVisibilityGuardMessage("기본지원서만 공개 여부를 변경할 수 있어요.");
    },

    onServerVisibilityChange: (sessionApplicationId, isPublic) => {
      setVisibilityGuardMessage("");

      visibilityMutation.mutate({
        sessionApplicationId,
        body: {
          isPublic,
        },
      });
    },

    onServerDelete: async (sessionApplicationId) => {
      try {
        await deleteApplicationMutation.mutateAsync(sessionApplicationId);
        onDeleteApplication?.(sessionApplicationId);
      } catch (error) {
        const apiMessage = (error as AxiosError<SessionApiResponse<null>>)
          .response?.data?.message;

        window.alert(
          apiMessage ??
            "지원서 삭제에 실패했어요. 잠시 후 다시 시도해주세요.",
        );
      }
    },
  });

  const handleOpenApplicationHistory = () => {
    setIsApplicationHistoryOpen(true);
    onViewApplicationHistory?.();
  };

  const handleCloseApplicationHistory = () => {
    setIsApplicationHistoryOpen(false);
    onCloseApplicationHistory?.();
  };

  const handleBrowseRecruitments = () => {
    setIsApplicationHistoryOpen(false);
    onCloseApplicationHistory?.();
    onBrowseRecruitments?.();
  };

  const handleViewApplication = async (application: ApplicationCardItem) => {
    try {
      const detail = await fetchMySessionApplicationDetail(
        application.sessionApplicationId,
      );

      handleOpenApplicationDetail(
        application,
        mapMyApplicationDetailToDraft(detail),
        detail.portfolioLinks,
      );
    } catch (error) {
      const apiMessage = (error as AxiosError<SessionApiResponse<null>>)
        .response?.data?.message;

      window.alert(
        apiMessage ??
          "지원서 상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleEditApplication = async (application: ApplicationCardItem) => {
    try {
      const detail = await fetchMySessionApplicationDetail(
        application.sessionApplicationId,
      );

      handleOpenEditPage(application, mapMyApplicationDetailToDraft(detail));
    } catch (error) {
      const apiMessage = (error as AxiosError<SessionApiResponse<null>>)
        .response?.data?.message;

      window.alert(
        apiMessage ??
          "지원서 수정 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleCreateApplication = async (draft: SessionApplicationDraft) => {
    const isFirstApplication =
      !hasApplications &&
      (summary?.applicationCount ?? 0) + localApplicationCount === 0;

    const isDefaultApplication = isDefaultApplicationDraft(
      draft,
      isFirstApplication,
    );

    try {
      const createdApplication = await createApplicationMutation.mutateAsync(
        createApplicationRequestFromDraft(draft),
      );

      if (isDefaultApplication) {
        await visibilityMutation.mutateAsync({
          sessionApplicationId: createdApplication.sessionApplicationId,
          body: {
            isPublic: false,
          },
        });
      }

      setVisibilityGuardMessage("");
      handleCloseApplicationForm();
    } catch (error) {
      const apiMessage = (error as AxiosError<SessionApiResponse<null>>)
        .response?.data?.message;

      window.alert(
        apiMessage ?? "지원서 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleUpdateApplication = async (draft: SessionApplicationDraft) => {
    if (!editingApplicationId) {
      return;
    }

    const purposeOverride =
      editingInitialValue?.applicationType === "기본"
        ? editingInitialValue.applicationType
        : undefined;

    try {
      await updateApplicationMutation.mutateAsync({
        sessionApplicationId: editingApplicationId,
        body: createApplicationRequestFromDraft(draft, purposeOverride),
      });

      setVisibilityGuardMessage("");
      handleCloseApplicationForm();
    } catch (error) {
      const apiMessage = (error as AxiosError<SessionApiResponse<null>>)
        .response?.data?.message;

      window.alert(
        apiMessage ?? "지원서 수정에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  const handleSubmitApplicationToServer = (draft: SessionApplicationDraft) => {
    if (applicationFormMode === "edit") {
      return handleUpdateApplication(draft);
    }

    return handleCreateApplication(draft);
  };

  const visibilityErrorMessage = (
    visibilityMutation.error as AxiosError<SessionApiResponse<null>> | null
  )?.response?.data?.message;

  const visibilityMessage = visibilityGuardMessage || visibilityErrorMessage;

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
          onClick={() => summaryQuery.refetch()}
          className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
        >
          다시 시도
        </button>
      </section>
    );
  }

  const profileDescription =
    [summary?.part, summary?.genre, summary?.region]
      .filter(Boolean)
      .join(" · ") || "기본 정보를 등록해주세요";

  const stats = [
    {
      label: "지원서",
      value: (summary?.applicationCount ?? 0) + localApplicationCount,
    },
    {
      label: "지원",
      value: summary?.submissionCount ?? 0,
    },
    {
      label: "진행중",
      value: summary?.inProgressCount ?? 0,
    },
  ];

  const isApplicationActionPending =
    createApplicationMutation.isPending ||
    updateApplicationMutation.isPending ||
    deleteApplicationMutation.isPending ||
    visibilityMutation.isPending;

  if (isApplicationFormOpen) {
    return (
      <SessionApplicationCreatePage
        open={isApplicationFormOpen}
        mode={applicationFormMode}
        initialValue={editingInitialValue}
        onClose={handleCloseApplicationForm}
        onSubmit={handleSubmitApplicationToServer}
      />
    );
  }

  if (isApplicationHistoryOpen) {
    return (
      <SessionApplicationHistoryPage
        open={isApplicationHistoryOpen}
        onClose={handleCloseApplicationHistory}
        onBrowseRecruitments={handleBrowseRecruitments}
        onViewApplication={(application) => {
          setIsApplicationHistoryOpen(false);
          onCloseApplicationHistory?.();
          onViewHistoryApplication?.(application);
        }}
        onMessage={(application) => {
          setIsApplicationHistoryOpen(false);
          onCloseApplicationHistory?.();
          onMessage?.(application);
        }}
        onOpenRecruitment={(recruitment) => {
          setIsApplicationHistoryOpen(false);
          onCloseApplicationHistory?.();
          onOpenRecruitment?.(recruitment);
        }}
      />
    );
  }

  return (
    <>
      <section className="relative min-h-[calc(100dvh_-_154px_-_var(--bottom-nav-height))] bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
        <section className="flex flex-col gap-4 bg-secondary-0 px-[22px] py-6">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={
                  getRenderableProfileImageUrl(
                    sessionProfileQuery.data?.profileImageUrl,
                  ) ||
                  getRenderableProfileImageUrl(summary?.profileImageUrl) ||
                  UserDefaultProfileIcon
                }
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = UserDefaultProfileIcon;
                }}
                className="size-[42px] shrink-0 rounded-full object-cover"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <strong className="truncate text-label1 text-neutral-900">
                    {summary?.nickname ?? "닉네임 없음"}
                  </strong>

                  {summary?.skillLevel ? (
                    <span className="inline-flex h-6 shrink-0 items-center justify-center rounded-full border border-secondary-500 bg-secondary-0 px-[15px] text-caption3 text-secondary-500">
                      {summary.skillLevel}
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
            onClick={handleOpenApplicationHistory}
            className="flex h-[38px] w-full items-center justify-center rounded-[8px] bg-secondary-400 text-body1 text-neutral-0"
          >
            지원 내역
          </button>

          {visibilityMessage ? (
            <p className="text-center text-caption2 text-error">
              {visibilityMessage}
            </p>
          ) : null}
        </section>

        <section className="px-[22px] pt-6 pb-8">
          <header className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-label1 text-neutral-900">지원서</h2>

              <p className="mt-1 text-caption2 text-neutral-600">
                지원할 때 선택할 소개서를 관리해요
              </p>
            </div>

            {hasApplications ? (
              <button
                type="button"
                onClick={handleOpenCreatePage}
                disabled={isApplicationActionPending}
                className="shrink-0 text-caption3 text-secondary-500 underline underline-offset-[3px] disabled:text-neutral-400"
              >
                + 지원서 추가
              </button>
            ) : null}
          </header>

          {hasApplications ? (
            <div className="mt-6 flex flex-col gap-3">
              {applications.map((application) => (
                <SessionApplicationCard
                  key={application.sessionApplicationId}
                  application={application}
                  visibilityDisabled={visibilityMutation.isPending}
                  onView={handleViewApplication}
                  onEdit={handleEditApplication}
                  onDelete={handleDeleteApplication}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="내 지원서가 없어요"
              description={
                <>
                  모집공고에 바로 지원할 수 있도록
                  <br />
                  파트, 실력대, 소개글을 담은 지원서를 먼저 만들어보세요
                </>
              }
              actionLabel="지원서 작성"
              onAction={handleOpenCreatePage}
            />
          )}
        </section>
      </section>

      <MyApplicationDetail
        open={Boolean(selectedApplicationDetail)}
        application={selectedApplicationDetail}
        onClose={handleCloseApplicationDetail}
      />
    </>
  );
};

export default SessionApplicationsScreen;