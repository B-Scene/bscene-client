import type { AxiosError } from "axios";
import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import {
  useMySessionApplicationSummaryQuery,
  useUpdateSessionApplicationVisibility,
} from "@/hooks/api/session/useSessionApplication";
import type { SessionApiResponse } from "@/types/session/sessionApplication";

interface SessionApplicationsScreenProps {
  onEditBasicInfo: () => void;
}

export const SessionApplicationsScreen = ({
  onEditBasicInfo,
}: SessionApplicationsScreenProps) => {
  const summaryQuery = useMySessionApplicationSummaryQuery();
  const visibilityMutation = useUpdateSessionApplicationVisibility();

  const summary = summaryQuery.data;
  const hasApplications = Boolean(summary?.applications.length);

  const handleToggleVisibility = (sessionApplicationId: number, isPublic: boolean) => {
    visibilityMutation.mutate({
      sessionApplicationId,
      body: {
        isPublic: !isPublic,
      },
    });
  };

  const visibilityErrorMessage = (
    visibilityMutation.error as AxiosError<SessionApiResponse<null>> | null
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
          onClick={() => summaryQuery.refetch()}
          className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
        >
          다시 시도
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 bg-neutral-0 px-6 pt-5">
      <article className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <h2 className="text-label1 text-neutral-900">기본 지원서</h2>
          <button
            type="button"
            onClick={onEditBasicInfo}
            className="flex h-[30px] items-center justify-center rounded-[8px] bg-secondary-0 px-3 text-caption3 font-semibold text-secondary-500"
          >
            기본정보 수정
          </button>
        </div>

        <div className="mt-4 flex gap-4">
          <img
            src={summary?.profileImageUrl || UserDefaultProfileIcon}
            alt=""
            className="size-[58px] shrink-0 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <strong className="text-label1 text-neutral-900">
                {summary?.nickname ?? "닉네임 없음"}
              </strong>
              {summary?.skillLevel ? (
                <span className="inline-flex h-[22px] min-w-[48px] items-center justify-center rounded-full bg-secondary-0 px-3 text-caption3 font-semibold text-secondary-500">
                  {summary.skillLevel}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-caption2 text-neutral-600">
              {[summary?.part, summary?.genre, summary?.region].filter(Boolean).join(" · ") ||
                "기본 지원서가 아직 없어요"}
            </p>
            <p className="mt-3 text-caption2 text-neutral-800">
              지원 {summary?.applicationCount ?? 0}건 · 제출 {summary?.submissionCount ?? 0}건 · 진행 중{" "}
              {summary?.inProgressCount ?? 0}건
            </p>
          </div>
        </div>

        {!summary?.hasDefaultApplication ? (
          <p className="mt-4 text-caption2 text-neutral-600">
            아직 기본 지원서가 없어 세션 찾기 노출 정보가 제한될 수 있어요.
          </p>
        ) : null}

        {visibilityErrorMessage ? (
          <p className="mt-3 text-caption2 text-error">{visibilityErrorMessage}</p>
        ) : null}
      </article>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-label1 text-neutral-900">내 지원 현황</h2>
          <span className="text-caption2 text-neutral-500">
            {summary?.applications.length ?? 0}건
          </span>
        </div>

        {hasApplications ? (
          <div className="mt-3 flex flex-col gap-3">
            {summary?.applications.map((application) => (
              <article
                key={application.sessionApplicationId}
                className="rounded-[12px] bg-neutral-0 px-5 py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-label1 text-neutral-900">
                      {application.title}
                    </h3>
                    <p className="mt-1 text-caption3 text-neutral-600">
                      {application.purpose} · {application.isModified ? "수정" : "작성"}
                    </p>
                  </div>

                  {typeof application.isPublic === "boolean" ? (
                    <button
                      type="button"
                      disabled={visibilityMutation.isPending}
                      onClick={() =>
                        handleToggleVisibility(
                          application.sessionApplicationId,
                          application.isPublic ?? false,
                        )
                      }
                      className="inline-flex h-[24px] shrink-0 items-center justify-center rounded-full bg-secondary-0 px-3 text-caption3 font-semibold text-secondary-500"
                    >
                      {application.isPublic ? "공개" : "비공개"}
                    </button>
                  ) : (
                    <span className="inline-flex h-[24px] shrink-0 items-center justify-center rounded-full bg-neutral-300 px-3 text-caption3 font-semibold text-neutral-600">
                      {application.purpose}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-caption2 text-neutral-600">
                  {formatDisplayDate(application.displayDate)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex min-h-[228px] flex-col items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center shadow-[0_0_8px_rgba(0,0,0,0.08)]">
            <p className="text-label1 text-neutral-900">아직 지원한 공고가 없어요</p>
            <p className="mt-2 text-caption2 text-neutral-600">
              마음에 드는 세션 모집 공고에 지원하면
              <br />
              내 지원서에서 확인할 수 있어요
            </p>
          </div>
        )}
      </section>
    </section>
  );
};

const formatDisplayDate = (value: string) => {
  if (!value) return "";

  return value.replace("T", " ").slice(0, 16);
};