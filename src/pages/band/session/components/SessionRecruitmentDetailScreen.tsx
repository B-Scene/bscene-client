import { useState } from "react";
import type { AxiosError } from "axios";
import ArrowRightIcon from "@/assets/Arrow.svg";
import BandProfileImage from "@/assets/Img_Band.png";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import {
  useDeleteSessionRecruitment,
  useSessionRecruitmentDetailQuery,
} from "@/hooks/api/session/useSessionRecruitment";
import type { SessionApiResponse } from "@/types/session/sessionRecruitment";
import type { SessionRecruitmentPost } from "../types";

interface SessionRecruitmentDetailScreenProps {
  post: SessionRecruitmentPost;
  onBack: () => void;
  onToggleBookmark: (postId: number) => void;
  onDeletePost?: (postId: number) => void;
}

const toDeadlineLabel = (dDay?: number) => {
  if (dDay === undefined) {
    return "";
  }

  if (dDay < 0) {
    return "마감";
  }

  if (dDay === 0) {
    return "오늘 마감";
  }

  return `D-${dDay}`;
};

const formatDeadlineAt = (deadlineAt?: string) => {
  if (!deadlineAt) {
    return "";
  }

  const [dateValue, timeValueWithSecond] = deadlineAt.split("T");
  const timeValue = timeValueWithSecond?.slice(0, 5);

  if (!dateValue || !timeValue) {
    return deadlineAt;
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) {
    return `${dateValue} ${timeValue} 마감`;
  }

  const weekDay = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(year, month - 1, day).getDay()
  ];

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
    2,
    "0",
  )}. (${weekDay}) ${timeValue} 마감`;
};

export const SessionRecruitmentDetailScreen = ({
  post,
  onBack,
  onDeletePost,
}: SessionRecruitmentDetailScreenProps) => {
  const detailQuery = useSessionRecruitmentDetailQuery(post.id);
  const deleteRecruitmentMutation = useDeleteSessionRecruitment();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const detail = detailQuery.data;

  const title = detail?.recruitmentTitle ?? post.title;
  const bandName = detail?.bandName ?? post.bandName;
  const bandGenre = detail?.bandGenre ?? post.genre;
  const bandRegion = detail?.bandRegion ?? post.location;
  const content = detail?.content ?? post.description;
  const deadlineText = formatDeadlineAt(detail?.deadlineAt);
  const dDayText = detail ? toDeadlineLabel(detail.dDay) : post.deadline;
  const bandProfileImageUrl = detail?.bandProfileImageUrl || BandProfileImage;
  const shortLocation = bandRegion.split(" ")[0] ?? bandRegion;

  const infoRows = [
    { label: "모집 파트", value: detail?.part ?? post.tags[0] ?? "-" },
    { label: "실력대", value: detail?.skillLevel ?? post.tags[1] ?? "-" },
    { label: "장르", value: detail?.genre ?? post.genre ?? "-" },
    { label: "활동 지역", value: detail?.region ?? post.location ?? "-" },
    { label: "연습 일정", value: detail?.practiceSchedule ?? "-" },
    { label: "연습 장소", value: detail?.practicePlace ?? "-" },
    { label: "지원 자격", value: detail?.qualification ?? "-" },
  ];

  const handleDeleteModalOpen = () => {
    setDeleteErrorMessage("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    if (deleteRecruitmentMutation.isPending) {
      return;
    }

    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteRecruitmentMutation.isPending) {
      return;
    }

    setDeleteErrorMessage("");

    try {
      const sessionRecruitmentId = detail?.sessionRecruitmentId ?? post.id;

      await deleteRecruitmentMutation.mutateAsync(sessionRecruitmentId);
      setIsDeleteModalOpen(false);
      onDeletePost?.(sessionRecruitmentId);
      onBack();
    } catch (error) {
      const apiMessage = (error as AxiosError<SessionApiResponse<null>>).response?.data
        ?.message;

      setDeleteErrorMessage(
        apiMessage ?? "세션 모집 공고 삭제에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+92px)]">
      <DetailTopBar onBack={onBack} onDelete={handleDeleteModalOpen} />

      {detailQuery.isLoading ? (
        <section className="flex min-h-[360px] items-center justify-center px-6 text-caption1 text-neutral-500">
          모집 공고 상세 정보를 불러오고 있어요
        </section>
      ) : detailQuery.isError ? (
        <section className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
          <p className="text-caption1 text-neutral-500">
            모집 공고 상세 정보를 불러오지 못했어요
          </p>
          <button
            type="button"
            onClick={() => detailQuery.refetch()}
            className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
          >
            다시 시도
          </button>
        </section>
      ) : (
        <>
          <section className="pt-[56px] pb-4">
            <div className="mx-auto flex w-[330px] flex-col items-start gap-1">
              {detail?.isNew ? (
                <span className="inline-flex h-4 items-center justify-center rounded-[3px] bg-secondary-500 px-[5px] text-[8px] leading-[10px] font-semibold text-neutral-0">
                  NEW
                </span>
              ) : null}

              <h1 className="text-label1 text-neutral-900">{title}</h1>

              <div className="flex items-center gap-[10px] text-caption2 text-neutral-600">
                <span>{deadlineText || "마감일 정보 없음"}</span>
                {dDayText ? (
                  <>
                    <span className="h-3.5 w-px bg-neutral-300" aria-hidden="true" />
                    <span className="text-secondary-500">{dDayText}</span>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <div className="h-0.5 w-[393px] max-w-full bg-neutral-300" aria-hidden="true" />

          <section className="mx-auto flex w-[330px] flex-col gap-3 pt-5">
            <button
              type="button"
              className="flex h-[60px] w-full items-center rounded-[8px] bg-neutral-0 py-3 pr-[15px] pl-3 text-left shadow-[0_0_8px_rgba(0,0,0,0.08)]"
            >
              <img
                src={bandProfileImageUrl}
                alt=""
                className="size-9 shrink-0 rounded-full object-cover"
              />
              <div className="ml-5 min-w-0 flex-1">
                <strong className="block truncate text-body1 text-neutral-900">
                  {bandName}
                </strong>
                <span className="mt-0.5 block truncate text-caption2 text-neutral-600">
                  {bandGenre} · {shortLocation}
                </span>
              </div>
              <img src={ArrowRightIcon} alt="" className="size-6 shrink-0" />
            </button>

            <article className="rounded-[8px] bg-neutral-0 px-3 py-3 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
              <h2 className="text-body1 text-neutral-900">상세 내용</h2>
              <p className="mt-3 whitespace-pre-line text-caption2 text-neutral-800">
                {content || "상세 내용이 없습니다."}
              </p>
            </article>

            <article className="rounded-[8px] bg-neutral-0 px-3 py-3 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
              <dl className="grid grid-cols-[128px_minmax(0,1fr)] gap-y-[14px]">
                {infoRows.map((row) => (
                  <DetailInfoRow key={row.label} label={row.label} value={row.value} />
                ))}
              </dl>
            </article>

            {deleteErrorMessage ? (
              <p className="text-center text-caption2 text-error">{deleteErrorMessage}</p>
            ) : null}
          </section>

          <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-20 bg-neutral-0 px-5 py-5">
            <button
              type="button"
              className="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-secondary-500 text-label2 text-neutral-0"
            >
              지원 하기
            </button>
          </div>
        </>
      )}

      <ModalOverlay open={isDeleteModalOpen} onClose={handleDeleteModalClose}>
        <Modal
          tone="orange"
          title="세션 모집 공고를 삭제할까요?"
          description={
            <>
              삭제한 모집 공고는
              <br />
              다시 복구할 수 없어요.
              {deleteErrorMessage ? (
                <>
                  <br />
                  <span className="text-error">{deleteErrorMessage}</span>
                </>
              ) : null}
            </>
          }
          cancelLabel="취소"
          confirmLabel={deleteRecruitmentMutation.isPending ? "삭제 중" : "삭제"}
          onCancel={handleDeleteModalClose}
          onConfirm={handleDeleteConfirm}
        />
      </ModalOverlay>
    </main>
  );
};

interface DetailTopBarProps {
  onBack: () => void;
  onDelete: () => void;
}

const DetailTopBar = ({ onBack, onDelete }: DetailTopBarProps) => {
  return (
    <header className="relative flex h-12 w-full items-center justify-center bg-neutral-0 px-[15px] py-[5px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute top-[5px] left-[15px] flex size-[38px] items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <h1 className="text-body1 text-neutral-900">모집 공고</h1>

      <button
        type="button"
        onClick={onDelete}
        className="absolute top-[10px] right-[20px] text-caption2 font-semibold text-error"
      >
        삭제
      </button>
    </header>
  );
};

interface DetailInfoRowProps {
  label: string;
  value: string;
}

const DetailInfoRow = ({ label, value }: DetailInfoRowProps) => {
  return (
    <>
      <dt className="text-body1 text-neutral-900">{label}</dt>
      <dd className="min-w-0 text-caption2 font-medium text-neutral-900">{value}</dd>
    </>
  );
};