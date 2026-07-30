// src/features/session/applicationHistory/ApplicationHistoryCard.tsx

import type {
  ApplicationHistoryItem,
  ApplicationHistoryStatus,
} from "./applicationHistory.types";

interface ApplicationHistoryCardProps {
  application: ApplicationHistoryItem;

  onViewApplication: (
    application: ApplicationHistoryItem,
  ) => void;

  onCancelApplication: (
    applicationId: number,
  ) => void;

  onMessage: (
    application: ApplicationHistoryItem,
  ) => void;
}

const STATUS_STYLE: Record<
  ApplicationHistoryStatus,
  {
    label: string;
    className: string;
  }
> = {
  completed: {
    label: "지원 완료",
    className:
      "bg-[#FFF6E5] text-secondary-500",
  },
  accepted: {
    label: "지원 수락",
    className:
      "bg-secondary-400 text-neutral-0",
  },
  rejected: {
    label: "지원 거절",
    className:
      "bg-neutral-300 text-neutral-600",
  },
  canceled: {
    label: "지원 취소",
    className:
      "border border-neutral-400 bg-neutral-0 text-neutral-400",
  },
};

export const ApplicationHistoryCard = ({
  application,
  onViewApplication,
  onCancelApplication,
  onMessage,
}: ApplicationHistoryCardProps) => {
  const status =
    STATUS_STYLE[application.status];

  return (
    <article className="flex flex-col gap-[10px] rounded-[12px] bg-neutral-0 px-6 py-3 shadow-[0_0_8px_rgba(0,0,0,0.10)]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex h-[22px] items-center justify-center rounded-full px-3 text-caption3 ${status.className}`}
        >
          {status.label}
        </span>

        {application.viewedAt ? (
          <span className="text-caption3 text-neutral-500">
            {application.viewedAt}
          </span>
        ) : null}
      </div>

      <div className="flex min-h-[42px] items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-label1 text-neutral-900">
            {application.title}
          </h3>

          <p className="mt-1 flex items-center text-caption3 text-neutral-600">
            <span>{application.bandName}</span>

            <span
              aria-hidden="true"
              className="mx-2 h-[14px] w-px bg-neutral-400"
            />

            <span className="text-caption2 text-secondary-500">
              {application.appliedAgo}
            </span>
          </p>
        </div>

        {application.canMessage ? (
          <button
            type="button"
            aria-label={`${application.bandName}에게 채팅하기`}
            onClick={() =>
              onMessage(application)
            }
            className="flex w-9 shrink-0 flex-col items-center text-neutral-800"
          >
            <MessageIcon />

            <span className="text-caption5">
              채팅하기
            </span>
          </button>
        ) : null}
      </div>

      {application.canViewApplication ||
      application.canCancel ? (
        <div className="grid grid-cols-2 gap-[18px]">
          {application.canViewApplication ? (
            <button
              type="button"
              onClick={() =>
                onViewApplication(
                  application,
                )
              }
              className="flex h-[30px] items-center justify-center rounded-[5px] bg-[#FFF6E5] text-caption3 text-neutral-600"
            >
              지원서 보기
            </button>
          ) : (
            <span />
          )}

          {application.canCancel ? (
            <button
              type="button"
              onClick={() =>
                onCancelApplication(
                  application.id,
                )
              }
              className="flex h-[30px] items-center justify-center rounded-[5px] bg-neutral-300 text-caption3 text-neutral-600"
            >
              지원 취소
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

const MessageIcon = () => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-6"
    >
      <path
        d="M5 4.75h14A1.25 1.25 0 0 1 20.25 6v9A1.25 1.25 0 0 1 19 16.25h-1.5v3.25l-4.3-3.25H5A1.25 1.25 0 0 1 3.75 15V6A1.25 1.25 0 0 1 5 4.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="M7.5 9h9M7.5 12h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
