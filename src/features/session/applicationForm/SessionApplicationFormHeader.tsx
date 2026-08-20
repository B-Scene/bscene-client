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
    <header className="relative flex h-12 w-full shrink-0 items-center justify-center bg-neutral-0 px-[15px] py-[5px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute top-[5px] left-[15px] flex size-[38px] items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <h1 className="text-label2 text-neutral-900">{title}</h1>

      <button
        type="button"
        aria-label={`${title} 닫기`}
        onClick={onClose}
        className="absolute top-[5px] right-[15px] flex size-[38px] items-center justify-center"
      >
        <img src={CloseIcon} alt="" className="size-6" />
      </button>
    </header>
  );
};
