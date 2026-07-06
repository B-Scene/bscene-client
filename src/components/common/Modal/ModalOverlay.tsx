import type { ReactNode } from 'react';

interface ModalOverlayProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export const ModalOverlay = ({ open, onClose, children }: ModalOverlayProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80"
      onClick={onClose}
    >
      <div
        className="overflow-hidden rounded-2xl bg-neutral-0"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
