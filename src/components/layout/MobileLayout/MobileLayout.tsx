import type { ReactNode } from 'react';
import { BottomNavBar } from '@/components/layout/BottomNavBar';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const MobileLayout = ({ children, showBottomNav = true }: MobileLayoutProps) => {
  return (
    <div className="page-frame">
      <div className="phone-frame">
        <div className="phone-frame-scroll">{children}</div>
        {showBottomNav && <BottomNavBar />}
      </div>
    </div>
  );
};
