import type { ReactNode } from 'react';
import { BottomNavBar } from '@/components/layout/BottomNavBar';

interface MobileLayoutProps {
  children: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="page-frame">
      <div className="phone-frame">
        <div className="phone-frame-scroll">{children}</div>
        <BottomNavBar />
      </div>
    </div>
  );
};
