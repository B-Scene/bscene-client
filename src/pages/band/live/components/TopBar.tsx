import type { ReactNode } from "react";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import BellIcon from "@/assets/icons/bell.svg";
import CloseIcon from "@/assets/icons/close.svg";
import { cx } from "../utils";

interface TopBarProps {
  title: string;
  right?: "notification";
  onBack?: () => void;
  onClose?: () => void;
  align?: "left" | "center";
  extraRight?: ReactNode;
}

export function TopBar({
  title,
  right,
  onBack,
  onClose,
  align = "center",
  extraRight,
}: TopBarProps) {
  return (
    <header
      className={cx(
        "relative flex h-16 items-center bg-neutral-0",
        align === "center" ? "justify-center px-5" : "justify-start px-8",
      )}
    >
      {onBack ? (
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="absolute left-5 flex size-8 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
      ) : null}

      <h1 className="text-h4 font-bold text-neutral-900">{title}</h1>

      {right === "notification" ? (
        <button
          type="button"
          aria-label="알림"
          className="absolute right-8 flex size-8 items-center justify-center"
        >
          <img src={BellIcon} alt="" className="size-6" />
        </button>
      ) : null}

      {extraRight ? <div className="absolute right-5">{extraRight}</div> : null}

      {onClose ? (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-5 flex size-8 items-center justify-center"
        >
          <img src={CloseIcon} alt="" className="size-7" />
        </button>
      ) : null}
    </header>
  );
}
