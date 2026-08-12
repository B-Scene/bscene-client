import { useEffect, useState } from "react";

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseIcon from "@/assets/icons/close-header.svg";

import type { FormStep } from "./sessionRecruitmentForm.types";
import { joinClassNames } from "./sessionRecruitmentForm.utils";

const normalizeRecruitmentOptionValue = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue.toLowerCase() === "etc.") {
    return "etc";
  }

  return trimmedValue;
};

export const RecruitmentSelectBottomSheet = ({
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) => {
  const [draftValue, setDraftValue] = useState(() =>
    normalizeRecruitmentOptionValue(selectedValue),
  );

  useEffect(() => {
    setDraftValue(normalizeRecruitmentOptionValue(selectedValue));
  }, [selectedValue]);

  const canApply = draftValue.length > 0;

  const handleApply = () => {
    if (!canApply) return;

    onSelect(normalizeRecruitmentOptionValue(draftValue));
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-end bg-neutral-900/70"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-[610px] w-full flex-col rounded-t-[24px] bg-neutral-0"
      >
        <header className="h-[70px] shrink-0 px-6 pt-3">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-neutral-300" />

          <h2 className="mt-5 text-center text-h4 text-neutral-900">필터</h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
          <div className="min-h-0 flex-1 overflow-y-auto px-3">
            <section>
              <h3 className="text-body1 text-neutral-900">{title}</h3>

              <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1.5">
                {options.map((option) => {
                  const normalizedOption =
                    normalizeRecruitmentOptionValue(option);
                  const isSelected = draftValue === normalizedOption;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDraftValue(normalizedOption)}
                      className={joinClassNames(
                        "flex h-[26px] items-center justify-center rounded-full px-3 text-caption3",
                        isSelected
                          ? "bg-secondary-500 text-neutral-0"
                          : "bg-neutral-300 text-neutral-600",
                      )}
                    >
                      {normalizedOption}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className={joinClassNames(
              "mt-4 flex h-[52px] w-[353px] max-w-full shrink-0 self-center items-center justify-center rounded-[12px] text-label2",
              canApply
                ? "bg-secondary-500 text-neutral-0"
                : "bg-neutral-300 text-neutral-600",
            )}
          >
            선택완료
          </button>
        </div>
      </section>
    </div>
  );
};

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