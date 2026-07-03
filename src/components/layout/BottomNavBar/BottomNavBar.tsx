import { useState } from "react";
import { useModeStore } from "@/stores/useModeStore";
import { BAND_NAV_TABS, FAN_NAV_TABS } from "./BottomNavBar.constants";

const ACTIVE_COLOR_CLASS = {
  fan: "text-primary-500",
  band: "text-secondary-500",
} as const;

export const BottomNavBar = () => {
  const mode = useModeStore((state) => state.mode);
  const tabs = mode === "fan" ? FAN_NAV_TABS : BAND_NAV_TABS;
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [prevMode, setPrevMode] = useState(mode);

  if (mode !== prevMode) {
    setPrevMode(mode);
    setActiveTabId(tabs[0].id);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 flex h-20 border-t border-neutral-200 bg-neutral-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const Icon = isActive ? tab.ActiveIcon : tab.Icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-2 ${
              isActive ? ACTIVE_COLOR_CLASS[mode] : "text-neutral-900"
            }`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="text-caption2">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
