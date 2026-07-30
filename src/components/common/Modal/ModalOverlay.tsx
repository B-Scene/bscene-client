import type { ReactNode } from 'react';

interface ModalOverlayProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  panelClassName?: string;
  clipContent?: boolean;
}

export const ModalOverlay = ({
  open,
  onClose,
  children,
  panelClassName = "rounded-2xl",
  clipContent = true,
}: ModalOverlayProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80"
      onClick={onClose}
    >
      <div
        className={`bg-neutral-0 ${clipContent ? "overflow-hidden" : ""} ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
