// src/features/session/applicationForm/SessionApplicationForm.tsx

import {
  ACTIVITY_OPTIONS,
  GENRE_OPTIONS,
  INPUT_CLASS_NAME,
  PART_OPTIONS,
  REGION_OPTIONS,
  SKILL_LEVEL_OPTIONS,
} from "@/features/session/applicationForm/applicationForm.constants";
import type { SessionApplicationFormController } from "@/features/session/applicationForm/useSessionApplicationForm";
import {
  MultipleChipGroup,
  SingleChipGroup,
} from "@/features/session/applicationForm/ApplicationChipGroup";
import { ApplicationExperienceSection } from "@/features/session/applicationForm/ApplicationExperienceSection";
import { ApplicationFormField } from "@/features/session/applicationForm/ApplicationFormField";
import { ApplicationPortfolioSection } from "@/features/session/applicationForm/ApplicationPortfolioSection";
import { ApplicationSelectField } from "@/features/session/applicationForm/ApplicationSelectField";

interface SessionApplicationFormProps {
  controller: SessionApplicationFormController;
}

export const SessionApplicationForm = ({
  controller,
}: SessionApplicationFormProps) => {
  const {
    form,
    isFormValid,
    submitButtonLabel,
    updateField,
    handleActivityToggle,
    handleAddExperience,
    handleUpdateExperience,
    handleDeleteExperience,
    handleAddPortfolio,
    handleUpdatePortfolio,
    handleDeletePortfolio,
    handleSubmit,
  } = controller;

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-8 pt-3 pb-6"
    >
      <div className="flex flex-col gap-3">
        <ApplicationFormField label="지원서 유형" required>
          <input
            type="text"
            value={form.applicationType}
            onChange={(event) =>
              updateField("applicationType", event.target.value)
            }
            placeholder="ex) 기본"
            maxLength={20}
            className={INPUT_CLASS_NAME}
          />
        </ApplicationFormField>

        <ApplicationFormField label="지원서 제목" required>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="지원서 제목을 입력해 주세요"
            maxLength={50}
            className={INPUT_CLASS_NAME}
          />
        </ApplicationFormField>

        <ApplicationFormField label="지원서 한줄 소개" required>
          <input
            type="text"
            value={form.shortIntroduction}
            onChange={(event) =>
              updateField("shortIntroduction", event.target.value)
            }
            placeholder="지원서 목록에 표시될 짧은 소개를 입력해 주세요 (최대 50자)"
            maxLength={50}
            className={INPUT_CLASS_NAME}
          />
        </ApplicationFormField>

        <ApplicationFormField label="소개글" required>
          <div className="relative h-[72px] w-full overflow-hidden rounded-[5px] border border-neutral-400 bg-neutral-0 focus-within:border-secondary-500">
            <textarea
              value={form.introduction}
              onChange={(event) =>
                updateField("introduction", event.target.value)
              }
              placeholder="활동 경력과 스타일을 소개해 주세요"
              maxLength={500}
              className="h-full w-full resize-none bg-transparent px-4 pt-[6px] pr-4 pb-5 text-caption2 text-neutral-900 outline-none placeholder:text-neutral-500"
            />

            <span className="pointer-events-none absolute right-3 bottom-[6px] z-10 text-caption4 text-neutral-400">
              {form.introduction.length}/500
            </span>
          </div>
        </ApplicationFormField>

        <ApplicationFormField label="파트" required>
          <SingleChipGroup
            options={PART_OPTIONS}
            selectedValue={form.part}
            onSelect={(part) => updateField("part", part)}
          />
        </ApplicationFormField>

        <ApplicationFormField label="실력대" required>
          <SingleChipGroup
            options={SKILL_LEVEL_OPTIONS}
            selectedValue={form.skillLevel}
            onSelect={(skillLevel) =>
              updateField("skillLevel", skillLevel)
            }
          />
        </ApplicationFormField>

        <ApplicationFormField label="선호 장르" required>
          <ApplicationSelectField
            value={form.genre}
            placeholder="장르 선택"
            options={GENRE_OPTIONS}
            onChange={(genre) => updateField("genre", genre)}
          />
        </ApplicationFormField>

        <ApplicationFormField label="활동 지역" required>
          <ApplicationSelectField
            value={form.region}
            placeholder="지역 선택"
            options={REGION_OPTIONS}
            onChange={(region) => updateField("region", region)}
          />
        </ApplicationFormField>

        <ApplicationFormField
          label="가능한 활동 (복수 선택 가능)"
          required
        >
          <MultipleChipGroup
            options={ACTIVITY_OPTIONS}
            selectedValues={form.activities}
            onToggle={handleActivityToggle}
          />
        </ApplicationFormField>

        <ApplicationFormField label="경력">
          <ApplicationExperienceSection
            experiences={form.experiences}
            onAdd={handleAddExperience}
            onChange={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        </ApplicationFormField>

        <ApplicationFormField label="포트폴리오">
          <ApplicationPortfolioSection
            links={form.portfolioLinks}
            onAdd={handleAddPortfolio}
            onChange={handleUpdatePortfolio}
            onDelete={handleDeletePortfolio}
          />
        </ApplicationFormField>
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className="mt-5 -mx-3 flex h-[52px] w-[calc(100%+24px)] items-center justify-center rounded-[12px] bg-secondary-500 text-body1 text-neutral-0 disabled:cursor-default disabled:bg-neutral-300 disabled:text-neutral-600"
      >
        {submitButtonLabel}
      </button>
    </form>
  );
};