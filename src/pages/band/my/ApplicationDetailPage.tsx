import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/common/Header/Header";
import { SessionApplicationProfile } from "@/components/band/my/SessionApplicationProfile";
import type { SessionApplicationProfileData } from "@/components/band/my/SessionApplicationProfile";
import { useApplicationSubmissionDetailQuery } from "@/hooks/api/session/useSessionApplication";
import { useCreateSessionChatRoomMutation } from "@/hooks/api/session/useSessionChat";
import { useAcceptApplicationSubmissionMutation } from "@/hooks/api/user/useReceivedApplications";
import type { ApplicantStatus } from "@/types/user/receivedApplications";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

interface ApplicationDetailLocationState {
  status?: ApplicantStatus;
}

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
  const location = useLocation();
  const { applySubmissionId } = useParams<{ applySubmissionId: string }>();
  const applicationSubmissionId = Number(applySubmissionId);
  const initialStatus = (location.state as ApplicationDetailLocationState | null)
    ?.status;
  const isAlreadyDecided =
    initialStatus != null && initialStatus !== "PENDING";

  const { data: detail, isLoading, isError, refetch } =
    useApplicationSubmissionDetailQuery(applicationSubmissionId);

  const acceptMutation = useAcceptApplicationSubmissionMutation();
  const createChatRoom = useCreateSessionChatRoomMutation();

  const handleChatClick = async () => {
    if (createChatRoom.isPending) return;

    try {
      const room = await createChatRoom.mutateAsync({
        contextType: "RECRUITMENT",
        applicationSubmissionId: applicationSubmissionId,
      });

      navigate(`/band/session/messages/${room.chatRoomId}`, {
        state: {
          senderName: room.recipientName,
          profileImageUrl: detail?.profileImageUrl ?? undefined,
          chatRoomId: room.chatRoomId,
          canSend: true,
        },
      });
    } catch (error) {
      window.alert(
        getApiErrorMessage(
          error,
          "채팅방 생성에 실패했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    }
  };

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
            isBandOwner={detail.isOwner}
            onChatClick={handleChatClick}
          />

          <div className="flex flex-col items-center gap-2 px-8 pt-3 pb-9">
            {isAlreadyDecided ? (
              <p className="text-caption2 text-neutral-500">
                이미 처리되었거나 취소된 지원이에요
              </p>
            ) : null}

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleDecision(false)}
                disabled={isAlreadyDecided || acceptMutation.isPending}
                className={`flex h-9.5 w-39.25 items-center justify-center rounded-lg border text-body1 disabled:cursor-not-allowed ${
                  isAlreadyDecided
                    ? "border-neutral-400 text-neutral-400"
                    : "border-secondary-500 text-secondary-500 disabled:opacity-60"
                }`}
              >
                거절
              </button>
              <button
                type="button"
                onClick={() => handleDecision(true)}
                disabled={isAlreadyDecided || acceptMutation.isPending}
                className={`flex h-9.5 w-39.25 items-center justify-center rounded-lg text-body1 disabled:cursor-not-allowed ${
                  isAlreadyDecided
                    ? "bg-neutral-300 text-neutral-500"
                    : "bg-secondary-500 text-neutral-0 disabled:opacity-60"
                }`}
              >
                수락
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default ApplicationDetailPage;
