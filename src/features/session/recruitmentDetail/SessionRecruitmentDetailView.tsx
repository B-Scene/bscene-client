import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";

export interface RecruitmentDetailInfoRow {
  label: string;
  value: string;
}

export const SessionRecruitmentDetailHeader = ({
  onBack,
}: {
  onBack: () => void;
}) => (
  <header className="relative z-30 flex h-12 w-full shrink-0 items-center justify-center bg-neutral-0">
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={onBack}
      className="absolute top-1/2 left-[15px] flex size-6 -translate-y-1/2 items-center justify-center"
    >
      <img src={ArrowLeftIcon} alt="" className="size-6" />
    </button>

    <h1 className="text-body1 text-neutral-900">모집 공고</h1>
  </header>
);

interface SessionRecruitmentDetailContentProps {
  isNew?: boolean;
  title: string;
  deadlineText: string;
  dDayText: string;
  content: string;
  infoRows: RecruitmentDetailInfoRow[];
  bandProfileImageUrl: string;
  bandName: string;
  bandGenre: string;
  shortLocation: string;
  errorMessage?: string;
}

export const SessionRecruitmentDetailContent = ({
  isNew,
  title,
  deadlineText,
  dDayText,
  content,
  infoRows,
  bandProfileImageUrl,
  bandName,
  bandGenre,
  shortLocation,
  errorMessage,
}: SessionRecruitmentDetailContentProps) => (
  <>
    <section className="px-8 pt-4 pb-5">
      <div className="inline-flex max-w-full flex-col items-start gap-2">
        {isNew ? (
          <span className="inline-flex h-[13px] items-center justify-center rounded-[2px] bg-secondary-500 px-[3px] text-label4 text-neutral-0">
            NEW
          </span>
        ) : null}

        <div className="flex max-w-full flex-col items-start gap-[2px]">
          <h1 className="max-w-full break-words text-label1 text-neutral-900">
            {title}
          </h1>

          <div className="flex max-w-full flex-wrap items-center text-caption2 text-neutral-600">
            <span>{deadlineText || "마감일 정보 없음"}</span>

            {dDayText ? (
              <>
                <span
                  className="mx-2 h-3.5 w-px bg-neutral-300"
                  aria-hidden="true"
                />
                <span className="text-secondary-500">{dDayText}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>

    <div className="h-0.5 w-full bg-neutral-400" aria-hidden="true" />

    <div className="px-8">
      <section className="pt-6 pb-6">
        <h2 className="text-body6 text-neutral-900">상세 요강</h2>

        <p className="mt-4 whitespace-pre-line break-words text-caption2 text-neutral-800">
          {content || "상세 요강이 없습니다."}
        </p>
      </section>

      <SectionDivider />

      <section className="py-6">
        <h2 className="text-body6 text-neutral-900">모집 조건</h2>

        <dl className="mt-4 flex flex-col gap-3">
          {infoRows.map((row) => (
            <div
              key={row.label}
              className="flex min-h-[18px] items-start gap-8"
            >
              <dt className="w-[52px] shrink-0 text-caption2 text-neutral-700">
                {row.label}
              </dt>

              <dd className="min-w-0 flex-1 break-words text-caption2 text-neutral-800">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <SectionDivider />

      <section className="pt-6 pb-8">
        <h2 className="text-body6 text-neutral-900">밴드 정보</h2>

        <div className="mt-3 flex min-h-[60px] w-full items-center rounded-[8px] bg-neutral-0 py-3 pr-[15px] pl-3 text-left shadow-[0_0_8px_rgba(0,0,0,0.1)]">
          <img
            src={bandProfileImageUrl}
            alt=""
            className="size-[35px] shrink-0 rounded-full object-cover"
          />

          <div className="ml-5 min-w-0 flex-1">
            <strong className="block truncate text-caption3 text-neutral-900">
              {bandName}
            </strong>

            <span className="mt-[1px] block truncate text-caption2 text-neutral-600">
              {bandGenre} · {shortLocation}
            </span>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <p className="pb-5 text-center text-caption2 text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  </>
);

export const SessionRecruitmentDetailActions = ({
  canManage,
  isCanceling = false,
  onSendMessage,
  onApply,
  onEdit,
  onCancelRecruitment,
}: {
  canManage: boolean;
  isCanceling?: boolean;
  onSendMessage: () => void;
  onApply: () => void;
  onEdit: () => void;
  onCancelRecruitment: () => void;
}) => {
  if (canManage) {
    return (
      <footer className="shrink-0 bg-neutral-0 px-8 pt-4 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-secondary-500 bg-neutral-0 text-body6 text-secondary-500"
          >
            수정하기
          </button>

          <button
            type="button"
            onClick={onCancelRecruitment}
            disabled={isCanceling}
            className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-body6 text-neutral-0 disabled:opacity-60"
          >
            {isCanceling ? "취소 중" : "취소하기"}
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="shrink-0 bg-neutral-0 px-8 pt-4 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex gap-[10px]">
        <button
          type="button"
          onClick={onSendMessage}
          className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-secondary-500 bg-neutral-0 text-body6 text-secondary-500"
        >
          쪽지 보내기
        </button>

        <button
          type="button"
          onClick={onApply}
          className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-body6 text-neutral-0"
        >
          지원하기
        </button>
      </div>
    </footer>
  );
};

const SectionDivider = () => (
  <div
    className="-mx-2 h-0.5 w-[calc(100%+16px)] bg-neutral-300"
    aria-hidden="true"
  />
);