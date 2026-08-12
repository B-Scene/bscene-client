import type { ChangeEvent } from "react";

import ArrowDownGrayIcon from "@/assets/icons/band/arrow-down-gray.svg";

import {
  RECRUITMENT_PART_OPTIONS,
  RECRUITMENT_SKILL_OPTIONS,
} from "./sessionRecruitmentForm.constants";
import type {
  BasicFormValues,
  FormErrors,
} from "./sessionRecruitmentForm.types";
import { joinClassNames } from "./sessionRecruitmentForm.utils";
import {
  RecruitmentBottomActionButton,
  RecruitmentErrorMessage,
  RecruitmentFieldLabel,
  RecruitmentOptionChip,
  RecruitmentTextInput,
} from "./RecruitmentFormFields";

interface RecruitmentBasicInfoStepProps {
  values: BasicFormValues;
  errors: FormErrors;
  isComplete: boolean;
  onFieldChange: (
    field: keyof Pick<BasicFormValues, "title" | "summary" | "detail">,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPartClick: (part: string) => void;
  onSkillClick: (skill: string) => void;
  onOpenGenreSelect: () => void;
  onNext: () => void;
}

const GenreSelectButton = ({
  value,
  placeholder,
  error = false,
  onClick,
}: {
  value: string;
  placeholder: string;
  error?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={joinClassNames(
        "flex h-[30px] w-full items-center justify-between rounded-[5px] border bg-neutral-0 px-4 text-caption2",
        error ? "border-error" : "border-neutral-400",
        value ? "text-neutral-900" : "text-neutral-500",
      )}
    >
      <span>{value || placeholder}</span>
      <img src={ArrowDownGrayIcon} alt="" className="h-[7px] w-3" />
    </button>
  );
};

export const RecruitmentBasicInfoStep = ({
  values,
  errors,
  isComplete,
  onFieldChange,
  onPartClick,
  onSkillClick,
  onOpenGenreSelect,
  onNext,
}: RecruitmentBasicInfoStepProps) => (
  <>
    <section className="px-5 pt-0">
      <div className="rounded-[16px] bg-neutral-0 px-[18px] py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
        <RecruitmentFieldLabel htmlFor="session-recruitment-title" required>
          공고 제목
        </RecruitmentFieldLabel>

        <RecruitmentTextInput
          id="session-recruitment-title"
          value={values.title}
          placeholder="공고 제목을 입력해주세요"
          maxLength={50}
          error={Boolean(errors.title)}
          onChange={onFieldChange("title")}
        />

        {errors.title ? (
          <RecruitmentErrorMessage>{errors.title}</RecruitmentErrorMessage>
        ) : null}

        <div className="mt-3">
          <RecruitmentFieldLabel htmlFor="session-recruitment-summary" required>
            공고 한줄 소개
          </RecruitmentFieldLabel>

          <RecruitmentTextInput
            id="session-recruitment-summary"
            value={values.summary}
            placeholder="공고 목록에 표시될 짧은 소개를 입력해주세요. (최대 50자)"
            maxLength={50}
            error={Boolean(errors.summary)}
            onChange={onFieldChange("summary")}
          />

          {errors.summary ? (
            <RecruitmentErrorMessage>{errors.summary}</RecruitmentErrorMessage>
          ) : null}
        </div>

        <div className="mt-3">
          <RecruitmentFieldLabel htmlFor="session-recruitment-detail" required>
            공고 상세 소개
          </RecruitmentFieldLabel>

          <div className="relative">
            <textarea
              id="session-recruitment-detail"
              value={values.detail}
              maxLength={500}
              placeholder="모집 공고의 상세 내용을 입력해주세요"
              onChange={onFieldChange("detail")}
              className={joinClassNames(
                "h-[58px] w-full resize-none rounded-[5px] border bg-neutral-0 px-4 py-2 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500",
                errors.detail
                  ? "border-error"
                  : "border-neutral-400 focus:border-secondary-500",
              )}
            />

            <span className="absolute right-[13px] bottom-2 text-caption4 text-neutral-500">
              {values.detail.length}/500
            </span>
          </div>

          {errors.detail ? (
            <RecruitmentErrorMessage>{errors.detail}</RecruitmentErrorMessage>
          ) : null}
        </div>

        <div className="mt-3">
          <RecruitmentFieldLabel required>모집 파트</RecruitmentFieldLabel>

          <div className="mt-2 flex flex-wrap gap-2">
            {RECRUITMENT_PART_OPTIONS.map((part) => (
              <RecruitmentOptionChip
                key={part}
                selected={values.part === part}
                onClick={() => onPartClick(part)}
              >
                {part}
              </RecruitmentOptionChip>
            ))}
          </div>

          {errors.part ? (
            <RecruitmentErrorMessage>{errors.part}</RecruitmentErrorMessage>
          ) : null}
        </div>

        <div className="mt-3">
          <RecruitmentFieldLabel required>실력대</RecruitmentFieldLabel>

          <div className="mt-2 flex gap-2">
            {RECRUITMENT_SKILL_OPTIONS.map((skill) => (
              <RecruitmentOptionChip
                key={skill}
                selected={values.skill === skill}
                onClick={() => onSkillClick(skill)}
              >
                {skill}
              </RecruitmentOptionChip>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <RecruitmentFieldLabel required>장르</RecruitmentFieldLabel>

          <GenreSelectButton
            value={values.genre}
            placeholder="장르 선택"
            error={Boolean(errors.genre)}
            onClick={onOpenGenreSelect}
          />

          {errors.genre ? (
            <RecruitmentErrorMessage>{errors.genre}</RecruitmentErrorMessage>
          ) : null}
        </div>
      </div>
    </section>

    <RecruitmentBottomActionButton
      active={isComplete}
      label="다음"
      onClick={onNext}
    />
  </>
);