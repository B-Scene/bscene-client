import { SESSION_TABS } from "../data/sessionRecruitmentPosts";
import type { SessionTabId } from "../types";

interface SessionTabsProps {
  activeTab: SessionTabId;
  onTabChange: (tab: SessionTabId) => void;
}

export const SessionTabs = ({ activeTab, onTabChange }: SessionTabsProps) => {
  const activeTabIndex = SESSION_TABS.findIndex((tab) => tab.id === activeTab);

  return (
    <nav className="relative grid h-12 w-full grid-cols-3 border-b-[2px] border-neutral-300 bg-neutral-0">
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
                "flex h-5 w-[114px] items-center justify-center text-body1 transition-colors duration-300 ease-out",
                isActive ? "text-neutral-900" : "text-neutral-400",
              ].join(" ")}
            >
              {tab.label}
            </span>
          </button>
        );
      })}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-2px] left-0 flex h-[2px] w-1/3 justify-center transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          transform: `translateX(${Math.max(activeTabIndex, 0) * 100}%)`,
        }}
      >
        <span className="h-full w-[114px] max-w-full bg-secondary-500" />
      </span>
    </nav>
  );
};
