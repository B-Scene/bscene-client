import type { ReactNode } from 'react';

interface ModalOverlayProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  panelClassName?: string;
}

export const ModalOverlay = ({
  open,
  onClose,
  children,
  panelClassName = "rounded-2xl",
}: ModalOverlayProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80"
      onClick={onClose}
    >
      <div
        className={`overflow-hidden bg-neutral-0 ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
