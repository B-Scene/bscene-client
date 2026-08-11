import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { SessionApplicationSelectModal } from "@/features/session/applicationSelect/SessionApplicationSelectModal";
import {
  SessionRecruitmentDetailActions,
  SessionRecruitmentDetailContent,
  SessionRecruitmentDetailHeader,
} from "@/features/session/recruitmentDetail/SessionRecruitmentDetailView";
import { useSessionRecruitmentDetail } from "@/features/session/recruitmentDetail/useSessionRecruitmentDetail";

import { SessionApplicationCompletePage } from "./SessionApplicationCompletePage";
import type { SessionRecruitmentPost } from "../types";

interface SessionRecruitmentDetailScreenProps {
  post: SessionRecruitmentPost;
  onBack: () => void;
  onToggleBookmark: (postId: number) => void;
  onDeletePost?: (postId: number) => void;
  onEditPost?: (postId: number) => void;
  onPreviewApplication?: (sessionApplicationId: number) => void;
  onEditApplication?: (sessionApplicationId: number) => void;
  onApplyApplication?: (
    sessionRecruitmentId: number,
    sessionApplicationId: number,
  ) => void | Promise<void>;
}

export const SessionRecruitmentDetailScreen = ({
  post,
  onBack,
  onDeletePost,
  onEditPost,
  onPreviewApplication,
  onEditApplication,
  onApplyApplication,
}: SessionRecruitmentDetailScreenProps) => {
  const screen = useSessionRecruitmentDetail({
    post,
    onBack,
    onDeletePost,
    onEditPost,
    onPreviewApplication,
    onEditApplication,
    onApplyApplication,
  });

  if (screen.completedApplication) {
    return (
      <SessionApplicationCompletePage
        recruitmentTitle={screen.title}
        bandName={screen.bandName}
        applicationTitle={screen.completedApplication.applicationTitle}
        onSendMessage={screen.sendMessage}
        onViewApplication={screen.viewCompletedApplication}
        onGoToSessionHome={onBack}
      />
    );
  }

  return (
    <main className="flex h-[calc(100dvh-var(--bottom-nav-height))] w-full flex-col overflow-hidden bg-neutral-0">
      <SessionRecruitmentDetailHeader onBack={onBack} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {screen.detailQuery.isLoading || screen.myBandProfilesQuery.isLoading ? (
          <section className="flex min-h-full items-center justify-center px-6 text-center text-caption1 text-neutral-500">
            모집 공고 상세 정보를 불러오고 있어요
          </section>
        ) : screen.detailQuery.isError ? (
          <section className="flex min-h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-caption1 text-neutral-500">
              모집 공고 상세 정보를 불러오지 못했어요
            </p>

            <button
              type="button"
              onClick={() => screen.detailQuery.refetch()}
              className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
            >
              다시 시도
            </button>
          </section>
        ) : (
          <SessionRecruitmentDetailContent
            isNew={screen.detailQuery.data?.isNew}
            title={screen.title}
            deadlineText={screen.deadlineText}
            dDayText={screen.dDayText}
            content={screen.content}
            infoRows={screen.infoRows}
            bandProfileImageUrl={screen.bandProfileImageUrl}
            bandName={screen.bandName}
            bandGenre={screen.bandGenre}
            shortLocation={screen.shortLocation}
            errorMessage={screen.cancelErrorMessage}
          />
        )}
      </div>

      {screen.isDetailLoaded ? (
        <SessionRecruitmentDetailActions
          canManage={screen.canManage}
          isCanceling={screen.deleteRecruitmentMutation.isPending}
          onSendMessage={screen.sendMessage}
          onApply={screen.openApplicationModal}
          onEdit={screen.openEditForm}
          onCancelRecruitment={screen.openCancelModal}
        />
      ) : null}

      {screen.canManage ? (
        <ModalOverlay
          open={screen.isCancelModalOpen}
          onClose={
            screen.deleteRecruitmentMutation.isPending
              ? undefined
              : screen.closeCancelModal
          }
        >
          <Modal
            tone="orange"
            title="세션 모집 공고를 취소할까요?"
            description={
              <>
                취소한 모집 공고는
                <br />
                다시 복구할 수 없어요.
                {screen.cancelErrorMessage ? (
                  <>
                    <br />
                    <span className="text-error">
                      {screen.cancelErrorMessage}
                    </span>
                  </>
                ) : null}
              </>
            }
            cancelLabel="닫기"
            confirmLabel={
              screen.deleteRecruitmentMutation.isPending
                ? "취소 중"
                : "취소하기"
            }
            cancelDisabled={screen.deleteRecruitmentMutation.isPending}
            confirmDisabled={screen.deleteRecruitmentMutation.isPending}
            onCancel={screen.closeCancelModal}
            onConfirm={screen.confirmCancel}
          />
        </ModalOverlay>
      ) : null}

      {!screen.canManage ? (
        <SessionApplicationSelectModal
          open={screen.isApplicationModalOpen}
          onClose={screen.closeApplicationModal}
          onPreviewApplication={screen.previewApplication}
          onEditApplication={screen.editApplication}
          onApplyApplication={screen.applyApplication}
        />
      ) : null}
    </main>
  );
};