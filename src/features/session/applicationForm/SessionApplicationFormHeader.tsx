// src/features/session/applicationForm/SessionApplicationFormHeader.tsx

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseIcon from "@/assets/icons/close-header.svg";

interface SessionApplicationFormHeaderProps {
  title: string;
  onBack: () => void;
  onClose: () => void;
}

export const SessionApplicationFormHeader = ({
  title,
  onBack,
  onClose,
}: SessionApplicationFormHeaderProps) => {
  return (
    <header className="relative flex h-[88px] w-full shrink-0 items-end justify-center bg-neutral-0 pb-[23px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute bottom-[18px] left-[15px] flex size-8 items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <h1 className="text-label2 text-neutral-900">{title}</h1>

      <button
        type="button"
        aria-label={`${title} 닫기`}
        onClick={onClose}
        className="absolute right-[15px] bottom-[18px] flex size-8 items-center justify-center"
      >
        <img src={CloseIcon} alt="" className="size-6" />
      </button>
    </header>
  );
};
