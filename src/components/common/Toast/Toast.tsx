import type { ReactNode } from "react";
import CloseIcon from "@/assets/icons/close.svg";

interface ToastProps {
  open: boolean;
  message: ReactNode;
  onClose: () => void;
}

export const Toast = ({ open, message, onClose }: ToastProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-x-5 bottom-24 z-50 flex items-center gap-3 rounded-xl bg-neutral-900 px-4 py-3.5 text-body1 text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-4 shrink-0"
      >
        <circle cx="12" cy="12" r="12" fill="var(--color-neutral-0)" />
        <path
          d="M16 9L10.8 14.2L8 11.4"
          stroke="var(--color-neutral-900)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="flex size-6 shrink-0 items-center justify-center"
      >
        <img
          src={CloseIcon}
          alt=""
          className="size-[18px] brightness-0 invert"
        />
      </button>
    </div>
  );
};
