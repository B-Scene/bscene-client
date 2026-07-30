import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/common/Header/Header";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import {
  postingManagementKeys,
  usePostingManagementQuery,
} from "@/hooks/api/user/usePostingManagement";
import { useDeleteSessionRecruitment } from "@/hooks/api/session/useSessionRecruitment";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import { formatDDayLabel } from "@/utils/getDDay";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { SessionRecruitmentFormScreen } from "@/pages/band/session/components/SessionRecruitmentFormScreen";

const PostingManagementPage = () => {
  const queryClient = useQueryClient();
  const activeBandId = useActiveBandId();
  const bandId = activeBandId ?? NaN;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostingManagementQuery(bandId);
  const deleteRecruitment = useDeleteSessionRecruitment();

  const bandName = data?.pages[0]?.bandName ?? "";
  const postings = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data],
  );

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [editTargetId, setEditTargetId] = useState<number | null>(null);

  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  const handleOpenDeleteModal = (sessionRecruitmentId: number) => {
    setDeleteErrorMessage("");
    setDeleteTargetId(sessionRecruitmentId);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;

    try {
      await deleteRecruitment.mutateAsync(deleteTargetId);
      queryClient.invalidateQueries({ queryKey: postingManagementKeys.all });
      setDeleteTargetId(null);
    } catch (error) {
      setDeleteErrorMessage(
        getApiErrorMessage(
          error,
          "모집 공고 삭제에 실패했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
    }
  };

  if (editTargetId !== null) {
    return (
      <SessionRecruitmentFormScreen
        editSessionRecruitmentId={editTargetId}
        onBack={() => setEditTargetId(null)}
        onClose={() => setEditTargetId(null)}
        onSaved={() => {
          queryClient.invalidateQueries({
            queryKey: postingManagementKeys.all,
          });
          setEditTargetId(null);
        }}
      />
    );
  }

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-24">
      <Header title="모집 공고 관리" />

      <div className="px-6 pt-4">
        <NotificationBandBanner
          bandName={bandName}
          description="현재 선택된 밴드의 모집 공고"
        />

        <div className="mt-6 flex flex-col gap-3">
          {postings.map((posting) => (
            <div
              key={posting.sessionRecruitmentId}
              className="flex flex-col gap-2.5 rounded-lg bg-neutral-0 py-3 px-6 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
            >
              <div className="flex flex-col gap-3">
                <span className="self-start rounded-full px-3 py-0.5 bg-secondary-500 text-center text-caption3 text-white">
                  {formatDDayLabel(posting.dDay)}
                </span>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-label1 text-neutral-900">
                      {posting.recruitmentTitle}
                    </h3>
                    <p className="text-caption3 text-neutral-600">
                      {posting.bandName} · {posting.bandGenre} ·{" "}
                      {posting.bandRegion}
                      <span className="mx-1.5 text-neutral-300">|</span>
                      <span className="text-caption2 text-secondary-500">
                        {posting.postedAgo === 0
                          ? "오늘"
                          : `${posting.postedAgo}일 전`}
                      </span>
                    </p>
                  </div>
                  <p className="text-caption2 text-neutral-800">
                    {posting.summary}
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <button
                  type="button"
                  onClick={() => setEditTargetId(posting.sessionRecruitmentId)}
                  className="flex h-7.5 flex-1 items-center justify-center rounded-md bg-secondary-0 text-caption3 text-neutral-600"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenDeleteModal(posting.sessionRecruitmentId)
                  }
                  className="flex h-7.5 flex-1 items-center justify-center rounded-md bg-neutral-300 text-caption3 text-neutral-600"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>

      <ModalOverlay
        open={deleteTargetId !== null}
        onClose={() => {
          if (deleteRecruitment.isPending) return;
          setDeleteTargetId(null);
        }}
      >
        <Modal
          tone="orange"
          title="해당 모집 공고를 삭제할까요?"
          description={
            <>
              공고를 삭제하면 더 이상 지원을
              <br />
              받을 수 없으며,
              <br />
              삭제된 내용은 복구할 수 없어요
              {deleteErrorMessage ? (
                <>
                  <br />
                  <span className="text-error">{deleteErrorMessage}</span>
                </>
              ) : null}
            </>
          }
          confirmLabel={deleteRecruitment.isPending ? "삭제 중" : "확인"}
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={handleConfirmDelete}
        />
      </ModalOverlay>
    </main>
  );
};

export default PostingManagementPage;
