import type { ReactNode } from "react";
import CheckCircleActiveIcon from "@/assets/icons/check-circle-active.svg";

interface ToastProps {
  open: boolean;
  message: ReactNode;
  onClose: () => void;
}

export const Toast = ({ open, message, onClose }: ToastProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-x-5 bottom-24 z-50 flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3.5 text-body1 text-white">
      <img src={CheckCircleActiveIcon} alt="" className="size-6 shrink-0" />
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0 text-white">
        ✕
      </button>
    </div>
  );
};
