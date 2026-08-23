import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const MobileLayout = ({
  children,
  showBottomNav = true,
}: MobileLayoutProps) => {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Android Chrome can report 100dvh based on a stale toolbar state right
    // after a (re)load, leaving fixed-position children below the visible
    // viewport until a scroll forces a recalculation. window.innerHeight
    // reflects the toolbar state immediately and (unlike visualViewport)
    // stays stable when the on-screen keyboard opens, so it won't conflict
    // with keyboard-offset logic elsewhere (e.g. TimePickerSheet).
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`,
      );
    };

    // iOS Safari (non-standalone tab) shows/hides its address and toolbar
    // as the user scrolls, changing the visible height without firing
    // window's resize event, so --app-height goes stale and fixed-position
    // bottom bars (e.g. live action bar) end up misaligned. visualViewport
    // reports that change reliably. Skipped while an input is focused so it
    // doesn't fight the keyboard-offset logic above.
    const setAppHeightFromVisualViewport = () => {
      const activeElement = document.activeElement;
      const isEditableFocused =
        activeElement instanceof HTMLElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable);

      if (isEditableFocused || !window.visualViewport) return;

      document.documentElement.style.setProperty(
        "--app-height",
        `${window.visualViewport.height}px`,
      );
    };

    setAppHeight();

    window.addEventListener("resize", setAppHeight);
    window.visualViewport?.addEventListener(
      "resize",
      setAppHeightFromVisualViewport,
    );

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.visualViewport?.removeEventListener(
        "resize",
        setAppHeightFromVisualViewport,
      );
    };
  }, []);

  return (
    <div className="page-frame">
      <div className="phone-frame relative overflow-hidden">
        <div ref={scrollRef} className="phone-frame-scroll">
          {children}
        </div>
        {showBottomNav && <BottomNavBar />}
      </div>
    </div>
  );
};