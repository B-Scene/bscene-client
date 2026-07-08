import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className = '' }: PageContainerProps) => {
  return <div className={`pb-(--bottom-nav-height) ${className}`}>{children}</div>;
};
