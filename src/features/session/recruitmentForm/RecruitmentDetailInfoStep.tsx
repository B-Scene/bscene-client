import { useState, type ChangeEvent } from "react";

import CalendarIcon from "@/assets/icons/band/data-range.svg";
import ClockIcon from "@/assets/icons/band/clock-band.svg";
import { DatePickerSheet } from "@/components/band/home/DatePickerSheet";
import { TimePickerSheet } from "@/components/band/home/TimePickerSheet";
import { Select } from "@/components/common/Select/Select";

import { RECRUITMENT_REGION_OPTIONS } from "./sessionRecruitmentForm.constants";
import type {
  DetailFormValues,
  FormErrors,
} from "./sessionRecruitmentForm.types";
import {
  formatRecruitmentDeadlineDate,
  getTodayDateKey,
  joinClassNames,
} from "./sessionRecruitmentForm.utils";
import {
  RecruitmentBottomActionButton,
  RecruitmentDeadlinePickerButton,
  RecruitmentErrorMessage,
  RecruitmentFieldLabel,
  RecruitmentTextInput,
} from "./RecruitmentFormFields";

interface RecruitmentDetailInfoStepProps {
  values: DetailFormValues;
  errors: FormErrors;
  isComplete: boolean;
  submitErrorMessage: string;
  isSubmitting: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  onFieldChange: (
    field: keyof Pick<
      DetailFormValues,
      "practiceSchedule" | "practiceLocation" | "qualification"
    >,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRegionChange: (region: string) => void;
  onDeadlineDateChange: (date: string) => void;
  onDeadlineTimeChange: (time: string) => void;
  onSubmit: () => void;
}

export const RecruitmentDetailInfoStep = ({
  values,
  errors,
  isComplete,
  submitErrorMessage,
  isSubmitting,
  submitLabel = "모집 공고 등록",
  submittingLabel = "등록 중",
  onFieldChange,
  onRegionChange,
  onDeadlineDateChange,
  onDeadlineTimeChange,
  onSubmit,
}: RecruitmentDetailInfoStepProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  return (
    <>
      <section className="px-5 pt-0">
        <div className="rounded-[16px] bg-neutral-0 px-[18px] py-4 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
          <RecruitmentFieldLabel required>활동 지역</RecruitmentFieldLabel>
          <Select
            value={values.region}
            onChange={onRegionChange}
            options={RECRUITMENT_REGION_OPTIONS}
            placeholder="지역 선택"
            error={Boolean(errors.region)}
            className="w-full"
          />
          {errors.region ? (
            <RecruitmentErrorMessage>{errors.region}</RecruitmentErrorMessage>
          ) : null}

          <div className="mt-3">
            <RecruitmentFieldLabel htmlFor="session-practice-schedule" required>
              연습 일정
            </RecruitmentFieldLabel>
            <RecruitmentTextInput
              id="session-practice-schedule"
              value={values.practiceSchedule}
              placeholder="연습 일정을 작성해주세요"
              maxLength={50}
              error={Boolean(errors.practiceSchedule)}
              onChange={onFieldChange("practiceSchedule")}
            />
            {errors.practiceSchedule ? (
              <RecruitmentErrorMessage>
                {errors.practiceSchedule}
              </RecruitmentErrorMessage>
            ) : null}
          </div>

          <div className="mt-3">
            <RecruitmentFieldLabel htmlFor="session-practice-location" required>
              연습 장소
            </RecruitmentFieldLabel>
            <RecruitmentTextInput
              id="session-practice-location"
              value={values.practiceLocation}
              placeholder="연습 장소를 작성해주세요"
              maxLength={50}
              error={Boolean(errors.practiceLocation)}
              onChange={onFieldChange("practiceLocation")}
            />
            {errors.practiceLocation ? (
              <RecruitmentErrorMessage>
                {errors.practiceLocation}
              </RecruitmentErrorMessage>
            ) : null}
          </div>

          <div className="mt-3">
            <RecruitmentFieldLabel required>모집 마감일</RecruitmentFieldLabel>
            <div className="flex flex-col gap-1">
              <RecruitmentDeadlinePickerButton
                value={formatRecruitmentDeadlineDate(values.deadlineDate)}
                placeholder="날짜 선택"
                icon={CalendarIcon}
                error={Boolean(errors.deadlineDate)}
                onClick={() => setIsDatePickerOpen(true)}
              />

              <RecruitmentDeadlinePickerButton
                value={values.deadlineTime}
                placeholder="시간 선택"
                icon={ClockIcon}
                error={Boolean(errors.deadlineTime)}
                onClick={() => setIsTimePickerOpen(true)}
              />
            </div>
            {errors.deadlineDate ? (
              <RecruitmentErrorMessage>
                {errors.deadlineDate}
              </RecruitmentErrorMessage>
            ) : null}
            {errors.deadlineTime ? (
              <RecruitmentErrorMessage>
                {errors.deadlineTime}
              </RecruitmentErrorMessage>
            ) : null}
          </div>

          <div className="mt-3">
            <RecruitmentFieldLabel htmlFor="session-qualification" required>
              지원 자격
            </RecruitmentFieldLabel>
            <div className="relative">
              <textarea
                id="session-qualification"
                value={values.qualification}
                maxLength={500}
                placeholder="지원 자격을 입력해주세요"
                onChange={onFieldChange("qualification")}
                className={joinClassNames(
                  "h-[58px] w-full resize-none rounded-[5px] border bg-neutral-0 px-4 py-2 text-caption2 text-neutral-900 outline-none placeholder:text-caption2 placeholder:text-neutral-500",
                  errors.qualification
                    ? "border-error"
                    : "border-neutral-400 focus:border-secondary-500",
                )}
              />
              <span className="absolute right-[13px] bottom-2 text-caption4 text-neutral-500">
                {values.qualification.length}/500
              </span>
            </div>
            {errors.qualification ? (
              <RecruitmentErrorMessage>
                {errors.qualification}
              </RecruitmentErrorMessage>
            ) : null}
          </div>
        </div>
      </section>

      <RecruitmentBottomActionButton
        active={isComplete && !isSubmitting}
        label={isSubmitting ? submittingLabel : submitLabel}
        errorMessage={submitErrorMessage || undefined}
        onClick={onSubmit}
      />

      <DatePickerSheet
        open={isDatePickerOpen}
        startDate={values.deadlineDate}
        endDate={values.deadlineDate}
        minDate={getTodayDateKey()}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={(range) => {
          onDeadlineDateChange(range.start);
          setIsDatePickerOpen(false);
        }}
      />

      <TimePickerSheet
        open={isTimePickerOpen}
        value={values.deadlineTime}
        title="모집 마감 시간"
        onClose={() => setIsTimePickerOpen(false)}
        onConfirm={(time) => {
          onDeadlineTimeChange(time);
          setIsTimePickerOpen(false);
        }}
      />
    </>
  );
};
