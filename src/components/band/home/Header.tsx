// 임시 헤더
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";

interface HeaderProps {
  title: string;
  align?: "center" | "between";
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
  const isBetween = align === "between";
  const isMain = variant === "main";

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <header
      className={`relative flex bg-neutral-0 ${
        isMain
          ? "h-12 items-center justify-center px-3.75"
          : `h-12 items-center ${
              isBetween ? "justify-between px-6" : "justify-center px-3.75"
            }`
      } ${className}`}
    >
      {showBack ? (
        <button
          type="button"
          onClick={handleBack}
          className={`${
            isBetween ? "" : "absolute left-3.75"
          } flex size-6 items-center justify-center`}
          aria-label="뒤로가기"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
      ) : null}

      <h1
        className={`${
          isMain
            ? "text-label2 text-[#1D1A1A]"
            : `${
                isBetween ? "text-[20px] leading-6 font-bold" : "text-label2"
              } text-neutral-900`
        } ${titleClassName}`}
      >
        {title}
      </h1>

      {rightContent ? (
        <div className="flex size-6 items-center justify-center">{rightContent}</div>
      ) : isBetween ? (
        <span className="size-6" aria-hidden="true" />
      ) : null}
    </header>
  );
};
