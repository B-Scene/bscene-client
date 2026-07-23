import { useLocation, useNavigate } from "react-router-dom";
import { useModeStore } from "@/stores/useModeStore";
import { BAND_NAV_TABS, FAN_NAV_TABS } from "./BottomNavBar.constants";

const ACTIVE_COLOR_CLASS = {
  fan: "text-primary-500",
  band: "text-secondary-500",
} as const;

interface BottomNavBarProps {
  modeOverride?: "fan" | "band";
  activeColorModeOverride?: "fan" | "band";
}

export const BottomNavBar = ({
  modeOverride,
  activeColorModeOverride,
}: BottomNavBarProps) => {
  const storeMode = useModeStore((state) => state.mode);
  const navigate = useNavigate();
  const location = useLocation();

  const mode =
    modeOverride ??
    (location.pathname.startsWith("/band")
      ? "band"
      : location.pathname.startsWith("/fan")
        ? "fan"
        : storeMode);

  const activeColorMode = activeColorModeOverride ?? mode;
  const tabs = mode === "fan" ? FAN_NAV_TABS : BAND_NAV_TABS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-(--bottom-nav-height) w-full max-w-[393px] items-center justify-between bg-neutral-0 px-7.5 py-4 shadow-[0_-5px_20px_0_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isLiveRoute = location.pathname.includes("/live") && tab.id === "live";
        const isActive =
          isLiveRoute ||
          (tab.activePrefixes ?? [tab.path]).some((prefix) =>
            location.pathname.startsWith(prefix),
          );
        const Icon = isActive ? tab.ActiveIcon : tab.Icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-2 ${
              isActive ? ACTIVE_COLOR_CLASS[activeColorMode] : "text-neutral-900"
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
