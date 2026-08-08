import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseIcon from "@/assets/icons/close-header.svg";

import type { FormStep } from "./sessionRecruitmentForm.types";
import { joinClassNames } from "./sessionRecruitmentForm.utils";

export const RecruitmentFormTopBar = ({
  title = "세션 모집 공고 등록",
  onBack,
  onClose,
}: {
  title?: string;
  onBack: () => void;
  onClose: () => void;
}) => (
  <header className="relative flex h-12 w-full items-center justify-center bg-neutral-0 px-[15px] py-[5px]">
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={onBack}
      className="absolute top-[5px] left-[15px] flex size-[38px] items-center justify-center"
    >
      <img src={ArrowLeftIcon} alt="" className="size-6" />
    </button>

    <h1 className="text-[18px] leading-5 font-bold text-neutral-900">
      {title}
    </h1>

    <button
      type="button"
      aria-label="닫기"
      onClick={onClose}
      className="absolute top-[5px] right-[15px] flex size-[38px] items-center justify-center"
    >
      <img src={CloseIcon} alt="" className="size-6" />
    </button>
  </header>
);

export const RecruitmentStepIndicator = ({
  currentStep,
}: {
  currentStep: FormStep;
}) => (
  <section className="flex h-[77px] items-start justify-center bg-secondary-0 pt-4">
    <div className="flex items-start">
      <StepNode
        complete={currentStep === 2}
        active={currentStep === 1}
        label="기본 정보"
        number={1}
      />

      <div
        className={joinClassNames(
          "mt-[9px] h-0.5 w-32",
          currentStep === 2 ? "bg-secondary-500" : "bg-neutral-400",
        )}
      />

      <StepNode active={currentStep === 2} label="상세 정보" number={2} />
    </div>
  </section>
);

const StepNode = ({
  active = false,
  complete = false,
  label,
  number,
}: {
  active?: boolean;
  complete?: boolean;
  label: string;
  number: number;
}) => (
  <div className="flex w-[58px] flex-col items-center gap-[3px]">
    <span
      className={joinClassNames(
        "flex size-5 items-center justify-center rounded-full text-[10px] leading-3 font-bold text-neutral-0",
        active || complete ? "bg-secondary-500" : "bg-neutral-500",
      )}
    >
      {complete ? "✓" : number}
    </span>

    <span
      className={joinClassNames(
        "text-[10px] leading-3 font-bold",
        active || complete ? "text-secondary-500" : "text-neutral-500",
      )}
    >
      {label}
    </span>
  </div>
);