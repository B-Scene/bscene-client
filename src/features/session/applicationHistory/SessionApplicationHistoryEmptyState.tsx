// src/features/session/applicationHistory/SessionApplicationHistoryEmptyState.tsx

import type { ReactNode } from "react";

interface SessionApplicationHistoryEmptyStateProps {
  icon: string;
  title: string;
  description: ReactNode;
  onBrowseRecruitments: () => void;
}

export const SessionApplicationHistoryEmptyState = ({
  icon,
  title,
  description,
  onBrowseRecruitments,
}: SessionApplicationHistoryEmptyStateProps) => {
  return (
    <section className="flex flex-col items-center text-center">
      <img
        src={icon}
        alt=""
        className="size-[88px] object-contain"
      />

      <h2 className="mt-4 text-label1 text-neutral-900">
        {title}
      </h2>

      <p className="mt-2 text-caption1 text-neutral-600">
        {description}
      </p>

      <button
        type="button"
        onClick={onBrowseRecruitments}
        className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-[12px] bg-secondary-500 px-[15px] py-[11px] text-body6 text-neutral-0"
      >
        공고 보러가기
      </button>
    </section>
  );
};