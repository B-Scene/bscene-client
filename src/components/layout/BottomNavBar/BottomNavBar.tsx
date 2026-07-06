import { useLocation, useNavigate } from "react-router-dom";
import { useModeStore } from "@/stores/useModeStore";
import { BAND_NAV_TABS, FAN_NAV_TABS } from "./BottomNavBar.constants";

const ACTIVE_COLOR_CLASS = {
  fan: "text-primary-500",
  band: "text-secondary-500",
} as const;

export const BottomNavBar = () => {
  const mode = useModeStore((state) => state.mode);
  const tabs = mode === "fan" ? FAN_NAV_TABS : BAND_NAV_TABS;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="absolute inset-x-0 bottom-0 flex h-(--bottom-nav-height) items-center justify-between bg-neutral-0 px-7.5 py-4 shadow-[0_-5px_20px_0_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = isActive ? tab.ActiveIcon : tab.Icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-2 ${
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
