// src/features/session/applicationForm/ApplicationPortfolioSection.tsx

import DeleteIcon from "@/assets/icons/band/delete.svg";

import { INPUT_CLASS_NAME } from "@/features/session/applicationForm/applicationForm.constants";

interface ApplicationPortfolioSectionProps {
  links: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
}

export const ApplicationPortfolioSection = ({
  links,
  onAdd,
  onChange,
  onDelete,
}: ApplicationPortfolioSectionProps) => {
  return (
    <div className="flex flex-col gap-2">
      {links.map((link, index) => (
        <div
          key={`portfolio-${index}`}
          className="relative"
        >
          <input
            type="url"
            value={link}
            onChange={(event) =>
              onChange(index, event.target.value)
            }
            placeholder="YouTube 또는 영상 링크를 첨부해 주세요"
            className={`${INPUT_CLASS_NAME} pr-10`}
          />

          {links.length > 1 ? (
            <button
              type="button"
              aria-label={`${index + 1}번째 포트폴리오 삭제`}
              onClick={() => onDelete(index)}
              className="absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center"
            >
              <img
                src={DeleteIcon}
                alt=""
                className="size-4"
              />
            </button>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex h-[30px] w-full items-center justify-center rounded-[5px] border border-secondary-500 bg-neutral-0 text-caption2 text-secondary-500"
      >
        + 포트폴리오 추가
      </button>
    </div>
  );
};