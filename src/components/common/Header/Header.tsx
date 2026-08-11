import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import { consumePushNotificationBackTarget } from "@/utils/pushNotificationBackNavigation";

interface HeaderProps {
  title: string;
  align?: "center" | "between" | "betweenCompact" | "mainWithAction";
  showBack?: boolean;
  rightContent?: ReactNode;
  className?: string;
  titleClassName?: string;
  onBack?: () => void;
  variant?: "default" | "main";
}

export const Header = ({
  title,
  align = "center",
  showBack = true,
  rightContent,
  className = "",
  titleClassName = "",
  onBack,
  variant = "default",
}: HeaderProps) => {
  const navigate = useNavigate();
  const isBetween = align === "between" || align === "betweenCompact";
  const isCompact = align === "betweenCompact";
  const isMainWithAction = align === "mainWithAction";
  const isMain = variant === "main" || isMainWithAction;

  const handleBack = () => {
    const pushBackTarget = consumePushNotificationBackTarget();

    if (pushBackTarget) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(pushBackTarget, { replace: true });
      }
      return;
    }

    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  const titleClass = isMain
    ? "text-label2 text-[#1D1A1A]"
    : isBetween && !isCompact
      ? "text-[20px] leading-6 font-bold text-neutral-900"
      : "text-label2 text-neutral-900";

  const betweenPaddingLeft = isCompact ? "pl-3.75" : "pl-6";
  const betweenPaddingRight = rightContent ? "pr-6" : isCompact ? "pr-3.75" : "pr-6";

  return (
    <header
      className={`relative flex bg-neutral-0 ${
        isMain
          ? `h-12 items-center justify-center ${
              isMainWithAction ? "px-6" : "px-3.75"
            }`
          : `h-12 items-center ${
              isBetween
                ? `justify-between ${betweenPaddingLeft} ${betweenPaddingRight}`
                : "justify-center px-3.75"
            }`
      } ${className}`}
    >
      {showBack ? (
        <button
          type="button"
          onClick={handleBack}
          className={`${
            isBetween
              ? ""
              : isMainWithAction
                ? "absolute left-6"
                : "absolute left-3.75"
          } flex size-6 items-center justify-center`}
          aria-label="뒤로가기"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
      ) : null}

      <h1 className={`${titleClass} ${titleClassName}`}>{title}</h1>

      {rightContent ? (
        <div
          className={`flex items-center justify-center ${
            isMain ? (isMainWithAction ? "absolute right-6" : "absolute right-3.75") : ""
          }`}
        >
          {rightContent}
        </div>
      ) : isBetween ? (
        <span className="size-6" aria-hidden="true" />
      ) : null}
    </header>
  );
};
