import type { ReactNode } from "react";
import InviteToastIcon from "@/assets/icons/band/invite-toast.svg";

interface ToastProps {
  open: boolean;
  message: ReactNode;
  onClose: () => void;
}

export const Toast = ({ open, message, onClose }: ToastProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-x-5 bottom-7 z-50 flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-3.5 text-body1 text-white">
      <img src={InviteToastIcon} alt="" className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="shrink-0 text-white"
      >
        ✕
      </button>
    </div>
  );
};
