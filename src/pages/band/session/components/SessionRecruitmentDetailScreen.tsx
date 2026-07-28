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
  onPreviewApplication,
  onEditApplication,
  onApplyApplication,
}: SessionRecruitmentDetailScreenProps) => {
  const screen = useSessionRecruitmentDetail({
    post,
    onBack,
    onDeletePost,
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
    <main className="relative mx-auto h-dvh w-full max-w-[393px] overflow-hidden bg-neutral-0">
      <div className="h-full overflow-y-auto overscroll-y-contain pb-[calc(var(--bottom-nav-height)+112px)]">
        <SessionRecruitmentDetailHeader
          onBack={onBack}
          onDelete={screen.canDelete ? screen.openDeleteModal : undefined}
        />

        {screen.detailQuery.isLoading ? (
          <section className="flex min-h-[360px] items-center justify-center px-6 text-caption1 text-neutral-500">
            모집 공고 상세 정보를 불러오고 있어요
          </section>
        ) : screen.detailQuery.isError ? (
          <section className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
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
            deleteErrorMessage={screen.deleteErrorMessage}
          />
        )}
      </div>

      {screen.isDetailLoaded ? (
        <SessionRecruitmentDetailActions
          onSendMessage={screen.sendMessage}
          onApply={screen.openApplicationModal}
        />
      ) : null}

      {screen.canDelete ? (
        <ModalOverlay
          open={screen.isDeleteModalOpen}
          onClose={screen.closeDeleteModal}
        >
          <Modal
            tone="orange"
            title="세션 모집 공고를 삭제할까요?"
            description={
              <>
                삭제한 모집 공고는
                <br />
                다시 복구할 수 없어요.
                {screen.deleteErrorMessage ? (
                  <>
                    <br />
                    <span className="text-error">
                      {screen.deleteErrorMessage}
                    </span>
                  </>
                ) : null}
              </>
            }
            cancelLabel="취소"
            confirmLabel={
              screen.deleteRecruitmentMutation.isPending ? "삭제 중" : "삭제"
            }
            onCancel={screen.closeDeleteModal}
            onConfirm={screen.confirmDelete}
          />
        </ModalOverlay>
      ) : null}

      <SessionApplicationSelectModal
        open={screen.isApplicationModalOpen}
        onClose={screen.closeApplicationModal}
        onPreviewApplication={screen.previewApplication}
        onEditApplication={screen.editApplication}
        onApplyApplication={screen.applyApplication}
      />
    </main>
  );
};
