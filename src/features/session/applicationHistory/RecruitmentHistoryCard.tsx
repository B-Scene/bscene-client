// src/features/session/applicationHistory/RecruitmentHistoryCard.tsx

import type { RecruitmentHistoryItem } from "./applicationHistory.types";

interface RecruitmentHistoryCardProps {
  recruitment: RecruitmentHistoryItem;

  onToggleBookmark: (
    recruitmentId: number,
  ) => void;

  onOpen: (
    recruitment: RecruitmentHistoryItem,
  ) => void;
}

export const RecruitmentHistoryCard = ({
  recruitment,
  onToggleBookmark,
  onOpen,
}: RecruitmentHistoryCardProps) => {
  return (
    <article className="rounded-[12px] bg-neutral-0 px-6 py-3 shadow-[0_0_8px_rgba(0,0,0,0.10)]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex h-[22px] items-center justify-center rounded-full px-3 text-caption3 ${
            recruitment.isClosed
              ? "bg-neutral-300 text-neutral-600"
              : "bg-secondary-500 text-neutral-0"
          }`}
        >
          {recruitment.deadlineLabel}
        </span>

        <button
          type="button"
          aria-label={
            recruitment.bookmarked
              ? "스크랩 취소"
              : "스크랩"
          }
          aria-pressed={
            recruitment.bookmarked
          }
          onClick={() =>
            onToggleBookmark(
              recruitment.id,
            )
          }
          className={`flex size-6 items-center justify-center ${
            recruitment.bookmarked
              ? "text-secondary-500"
              : "text-neutral-400"
          }`}
        >
          <StarIcon
            filled={
              recruitment.bookmarked
            }
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          onOpen(recruitment)
        }
        className="mt-3 block w-full text-left"
      >
        <h3 className="truncate text-label1 text-neutral-900">
          {recruitment.title}
        </h3>

        <p className="mt-1 flex min-w-0 items-center text-caption3 text-neutral-600">
          <span className="truncate">
            {recruitment.bandName}
            {" · "}
            {recruitment.genre}
            {" · "}
            {recruitment.region}
          </span>

          <span
            aria-hidden="true"
            className="mx-2 h-[14px] w-px shrink-0 bg-neutral-400"
          />

          <span className="shrink-0 text-caption2 text-secondary-500">
            {recruitment.viewedAgo}
          </span>
        </p>

        <p className="mt-3 line-clamp-2 text-body3 text-neutral-800">
          {recruitment.description}
        </p>

        <p className="mt-2 text-caption2 text-secondary-500">
          {recruitment.part}
          {" · "}
          {recruitment.skillLevel}
        </p>
      </button>
    </article>
  );
};

interface StarIconProps {
  filled: boolean;
}

const StarIcon = ({
  filled,
}: StarIconProps) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
    >
      <path
        d="m12 3.75 2.45 4.97 5.49.8-3.97 3.87.94 5.47L12 16.28l-4.91 2.58.94-5.47-3.97-3.87 5.49-.8L12 3.75Z"
        fill={
          filled
            ? "currentColor"
            : "none"
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
