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

    setAppHeight();

    window.addEventListener("resize", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
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