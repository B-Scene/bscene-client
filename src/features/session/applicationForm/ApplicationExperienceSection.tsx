// src/features/session/applicationForm/ApplicationExperienceSection.tsx

import DeleteIcon from "@/assets/icons/band/delete.svg";

import { ApplicationFormField } from "@/features/session/applicationForm/ApplicationFormField";
import { INPUT_CLASS_NAME } from "@/features/session/applicationForm/applicationForm.constants";
import type { SessionApplicationExperience } from "@/features/session/applicationForm/applicationForm.types";

interface ApplicationExperienceSectionProps {
  experiences: SessionApplicationExperience[];
  onAdd: () => void;
  onChange: (
    experienceId: number,
    key: keyof Omit<
      SessionApplicationExperience,
      "id"
    >,
    value: string,
  ) => void;
  onDelete: (experienceId: number) => void;
}

export const ApplicationExperienceSection = ({
  experiences,
  onAdd,
  onChange,
  onDelete,
}: ApplicationExperienceSectionProps) => {
  return (
    <div className="flex flex-col gap-3">
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          onChange={onChange}
          onDelete={() =>
            onDelete(experience.id)
          }
        />
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex h-[30px] w-full items-center justify-center rounded-[5px] border border-secondary-500 bg-neutral-0 text-caption2 text-secondary-500"
      >
        + 경력 추가
      </button>
    </div>
  );
};

interface ExperienceCardProps {
  experience: SessionApplicationExperience;
  onChange: (
    experienceId: number,
    key: keyof Omit<
      SessionApplicationExperience,
      "id"
    >,
    value: string,
  ) => void;
  onDelete: () => void;
}

const ExperienceCard = ({
  experience,
  onChange,
  onDelete,
}: ExperienceCardProps) => {
  return (
    <article className="relative flex flex-col gap-3 rounded-[12px] bg-neutral-0 p-4 shadow-[0_0_8px_rgba(0,0,0,0.10)]">
      <button
        type="button"
        aria-label="경력 삭제"
        onClick={onDelete}
        className="absolute top-3 right-3 flex size-6 items-center justify-center"
      >
        <img
          src={DeleteIcon}
          alt=""
          className="size-5"
        />
      </button>

      <ApplicationFormField
        label="경력명"
        required
      >
        <input
          type="text"
          value={experience.title}
          onChange={(event) =>
            onChange(
              experience.id,
              "title",
              event.target.value,
            )
          }
          placeholder="밴드 드러머 활동"
          className={`${INPUT_CLASS_NAME} pr-10`}
        />
      </ApplicationFormField>

      <ApplicationFormField
        label="기간"
        required
      >
        <input
          type="text"
          value={experience.period}
          onChange={(event) =>
            onChange(
              experience.id,
              "period",
              event.target.value,
            )
          }
          placeholder="2026.01 - 현재"
          className={INPUT_CLASS_NAME}
        />
      </ApplicationFormField>

      <ApplicationFormField label="상세 내용">
        <textarea
          value={experience.description}
          onChange={(event) =>
            onChange(
              experience.id,
              "description",
              event.target.value,
            )
          }
          placeholder="활동 내용을 입력해 주세요"
          className="h-20 w-full resize-none rounded-[5px] border border-neutral-400 bg-neutral-0 px-4 py-[6px] text-caption2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-secondary-500"
        />
      </ApplicationFormField>
    </article>
  );
};