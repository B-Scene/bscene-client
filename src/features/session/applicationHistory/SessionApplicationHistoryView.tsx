import type { ReactNode } from "react";

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseIcon from "@/assets/icons/close-header.svg";

import { SessionApplicationHistoryEmptyState } from "./SessionApplicationHistoryEmptyState";
import type { ApplicationHistoryTab } from "./applicationHistory.types";

const HISTORY_TABS: Array<{
  id: ApplicationHistoryTab;
  label: string;
}> = [
  { id: "application", label: "지원" },
  { id: "scrap", label: "스크랩" },
  { id: "recent", label: "최근 본 글" },
];

export const ApplicationHistoryTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: ApplicationHistoryTab;
  onChange: (tab: ApplicationHistoryTab) => void;
}) => (
  <nav
    aria-label="지원 내역 분류"
    className="grid h-12 shrink-0 grid-cols-3 border-b-2 border-neutral-300 bg-neutral-0"
  >
    {HISTORY_TABS.map((tab) => {
      const isActive = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          aria-current={isActive ? "page" : undefined}
          onClick={() => onChange(tab.id)}
          className={`relative flex h-full items-center justify-center text-body1 ${
            isActive ? "text-secondary-500" : "text-neutral-400"
          }`}
        >
          {tab.label}
          {isActive ? (
            <span
              aria-hidden="true"
              className="absolute bottom-[-2px] left-1/2 h-0.5 w-[116px] -translate-x-1/2 bg-secondary-500"
            />
          ) : null}
        </button>
      );
    })}
  </nav>
);

export const ApplicationHistoryEmptyContent = ({
  icon,
  title,
  description,
  onBrowseRecruitments,
}: {
  icon: string;
  title: string;
  description: ReactNode;
  onBrowseRecruitments: () => void;
}) => (
  <div className="flex min-h-[520px] items-center justify-center pb-[100px]">
    <SessionApplicationHistoryEmptyState
      icon={icon}
      title={title}
      description={description}
      onBrowseRecruitments={onBrowseRecruitments}
    />
  </div>
);

export const ApplicationHistoryHeader = ({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) => (
  <header className="relative flex h-12 shrink-0 items-center justify-center bg-neutral-0">
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={onBack}
      className="absolute left-5 flex size-8 items-center justify-center"
    >
      <img src={ArrowLeftIcon} alt="" className="size-6" />
    </button>

    <h1 className="text-label2 text-neutral-900">지원 내역</h1>

    <button
      type="button"
      aria-label="지원 내역 닫기"
      onClick={onClose}
      className="absolute right-5 flex size-8 items-center justify-center"
    >
      <img src={CloseIcon} alt="" className="size-6" />
    </button>
  </header>
);
