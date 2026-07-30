import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/band/home/Header";
import { SessionApplicationProfile } from "@/components/band/my/SessionApplicationProfile";
import type { SessionApplicationProfileData } from "@/components/band/my/SessionApplicationProfile";
import { useApplicationSubmissionDetailQuery } from "@/hooks/api/session/useSessionApplication";
import { useAcceptApplicationSubmissionMutation } from "@/hooks/api/user/useReceivedApplications";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

const MOCK_IS_BAND_OWNER = true;

const formatDeadline = (deadlineAt: string) => {
  const date = new Date(deadlineAt);

  if (Number.isNaN(date.getTime())) {
    return deadlineAt;
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}. ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ApplicationDetailPage = () => {
  const navigate = useNavigate();
  const { applySubmissionId } = useParams<{ applySubmissionId: string }>();
  const applicationSubmissionId = Number(applySubmissionId);

  const { data: detail, isLoading, isError, refetch } =
    useApplicationSubmissionDetailQuery(applicationSubmissionId);

  const acceptMutation = useAcceptApplicationSubmissionMutation();

  const handleDecision = async (isApproved: boolean) => {
    if (acceptMutation.isPending) return;

    try {
      await acceptMutation.mutateAsync({
        applySubmissionId: applicationSubmissionId,
        isApproved,
      });

      navigate(-1);
    } catch (error) {
      window.alert(
        getApiErrorMessage(
          error,
          isApproved
            ? "지원 수락에 실패했어요. 잠시 후 다시 시도해주세요."
            : "지원 거절에 실패했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    }
  };

  const applicantProfile: SessionApplicationProfileData | null = detail
    ? {
        part: detail.part,
        nickname: detail.nickname,
        level: detail.skillLevel,
        region: detail.region,
        profileImageUrl: detail.profileImageUrl,
        introQuote: detail.oneLineIntro,
        introText: detail.intro,
        preferredGenres: detail.genre
          .split(/[,/·]/)
          .map((value) => value.trim())
          .filter(Boolean),
        availableActivities: detail.availableActivities,
        careers: detail.careers.map((career) => ({
          id: career.sessionApplicationCareerId,
          title: career.name,
          period: career.period,
          description: career.description,
        })),
        portfolioLinks: detail.portfolioLinks.map((link) => ({
          id: link.sessionApplicationLinkId,
          title: link.title ?? link.url,
          url: link.url,
          thumbnailUrl: link.thumbnailUrl,
        })),
      }
    : null;

  return (
    <main className="relative min-h-dvh bg-neutral-0">
      <Header title="" />

      {isLoading ? (
        <section className="flex min-h-[560px] items-center justify-center text-caption1 text-neutral-500">
          지원서 정보를 불러오고 있어요
        </section>
      ) : isError || !detail || !applicantProfile ? (
        <section className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
          <p className="text-caption1 text-neutral-500">
            지원서 정보를 불러오지 못했어요
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-4 px-6 pt-4">
            <span className="text-body1 text-neutral-900">지원 공고</span>
            <div className="flex flex-col gap-1">
              <h1 className="text-label1 text-neutral-900">
                {detail.recruitmentTitle} · {detail.bandName}
              </h1>
              <span className="text-caption3 text-neutral-600">
                모집 마감 {formatDeadline(detail.deadlineAt)}
              </span>
            </div>
          </section>

          <div className="mt-4 h-4 bg-secondary-0" aria-hidden="true" />

          <SessionApplicationProfile
            data={applicantProfile}
            isBandOwner={MOCK_IS_BAND_OWNER}
          />

          <div className="flex items-center justify-center gap-4 px-8 pt-3 pb-9">
            <button
              type="button"
              onClick={() => handleDecision(false)}
              disabled={acceptMutation.isPending}
              className="flex h-9.5 w-39.25 items-center justify-center rounded-lg border border-secondary-500 text-body1 text-secondary-500 disabled:opacity-60"
            >
              거절
            </button>
            <button
              type="button"
              onClick={() => handleDecision(true)}
              disabled={acceptMutation.isPending}
              className="flex h-9.5 w-39.25 items-center justify-center rounded-lg bg-secondary-500 text-body1 text-neutral-0 disabled:opacity-60"
            >
              수락
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default ApplicationDetailPage;
