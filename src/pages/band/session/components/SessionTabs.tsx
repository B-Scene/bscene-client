import { SESSION_TABS } from "../data/sessionRecruitmentPosts";
import type { SessionTabId } from "../types";

interface SessionTabsProps {
  activeTab: SessionTabId;
  onTabChange: (tab: SessionTabId) => void;
}

export const SessionTabs = ({ activeTab, onTabChange }: SessionTabsProps) => {
  return (
    <nav className="grid h-12 w-full grid-cols-3 border-b-[2px] border-neutral-300 bg-neutral-0">
      {SESSION_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="relative flex h-12 items-center justify-center"
          >
            <span
              className={[
                "flex h-5 w-[116px] items-center justify-center text-body1",
                isActive ? "text-neutral-900" : "text-neutral-400",
              ].join(" ")}
            >
              {tab.label}
            </span>
            {isActive ? (
              <span className="absolute bottom-[-2px] left-1/2 h-[3px] w-[116px] -translate-x-1/2 rounded-full bg-secondary-500" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
};
