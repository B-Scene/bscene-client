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