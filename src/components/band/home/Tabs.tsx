import { useLayoutEffect, useRef, useState } from "react";

export interface TabItem {
  id: string;
  label: string;
}

export type TabsColorVariant = "secondary" | "primary";

const COLOR_CLASSES: Record<
  TabsColorVariant,
  { text: string; indicator: string }
> = {
  secondary: { text: "text-secondary-500", indicator: "bg-secondary-500" },
  primary: { text: "text-primary-400", indicator: "bg-primary-400" },
};

interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (tabId: string) => void;
  colorVariant?: TabsColorVariant;
  edgeClassName?: string;
  paddingClassName?: string;
  textClassName?: string;
  inactiveTextClassName?: string;
  indicatorWidth?: number;
  indicatorRounded?: boolean;
}

export const Tabs = ({
  tabs,
  activeTabId,
  onChange,
  colorVariant = "secondary",
  edgeClassName = "-mx-5",
  paddingClassName = "px-5",
  textClassName = "text-body1",
  inactiveTextClassName,
  indicatorWidth,
  indicatorRounded = false,
}: TabsProps) => {
  const inactiveText = inactiveTextClassName ?? textClassName;
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const colors = COLOR_CLASSES[colorVariant];
  const tabsKey = tabs.map((tab) => tab.id).join("|");

  useLayoutEffect(() => {
    const syncIndicator = () => {
      const activeButton = buttonRefs.current[activeTabId];
      if (!activeButton) return;

      const width = indicatorWidth ?? activeButton.offsetWidth;
      const left = indicatorWidth
        ? activeButton.offsetLeft +
          (activeButton.offsetWidth - indicatorWidth) / 2
        : activeButton.offsetLeft;

      setIndicatorStyle({ left, width });
    };

    syncIndicator();

    window.addEventListener("resize", syncIndicator);
    return () => window.removeEventListener("resize", syncIndicator);
  }, [activeTabId, tabsKey, indicatorWidth]);

  return (
    <div className={`relative ${edgeClassName}`}>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-400" />

      <div className={`relative flex ${paddingClassName}`}>
        <span
          className={`absolute bottom-0 h-0.5 transition-all duration-150 ease-out ${colors.indicator} ${
            indicatorRounded ? "rounded-full" : ""
          }`}
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                buttonRefs.current[tab.id] = el;
              }}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 flex-col items-center pb-2.5 ${
                isActive
                  ? `${textClassName} ${colors.text}`
                  : `${inactiveText} text-neutral-400`
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
