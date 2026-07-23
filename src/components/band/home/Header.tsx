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
}

export const Header = ({
  title,
  align = "center",
  showBack = true,
  rightContent,
  className = "",
  titleClassName = "",
  onBack,
}: HeaderProps) => {
  const navigate = useNavigate();
  const isBetween = align === "between";

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <header
      className={`relative flex h-12 items-center bg-neutral-0 ${
        isBetween ? "justify-between px-6" : "justify-center px-3.75"
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
          isBetween ? "text-[20px] leading-6 font-bold" : "text-label2"
        } text-neutral-900 ${titleClassName}`}
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