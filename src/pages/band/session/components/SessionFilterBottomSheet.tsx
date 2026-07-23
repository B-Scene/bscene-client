import { useState, type MouseEvent } from "react";
import { SESSION_FILTER_GROUPS } from "../data/sessionRecruitmentPosts";
import type { SessionFilterKey, SessionFilterValues } from "../types";

interface SessionFilterBottomSheetProps {
  values: SessionFilterValues;
  onApply: (values: SessionFilterValues) => void;
  onClose: () => void;
}

export const SessionFilterBottomSheet = ({
  values,
  onApply,
  onClose,
}: SessionFilterBottomSheetProps) => {
  const [draftValues, setDraftValues] = useState(values);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSelect = (filterId: SessionFilterKey, option: string) => {
    setDraftValues((currentValues) => ({
      ...currentValues,
      [filterId]: option,
    }));
  };

  const handleApply = () => {
    onApply(draftValues);
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-40 flex items-end bg-neutral-900/70"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="필터"
        className="h-[610px] w-full rounded-t-[24px] bg-neutral-0"
      >
        <header className="h-[70px] px-6 pt-3">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-neutral-300" />
          <h2 className="mt-5 text-center text-h4 text-neutral-900">필터</h2>
        </header>

        <div className="flex h-[540px] flex-col px-10 pb-5">
          <div className="flex flex-1 flex-col gap-3">
            {SESSION_FILTER_GROUPS.map((group) => (
              <FilterGroup
                key={group.id}
                title={group.title}
                options={group.options}
                selectedValue={draftValues[group.id]}
                onSelect={(option) => handleSelect(group.id, option)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="mt-4 flex h-[52px] w-[353px] shrink-0 self-center items-center justify-center rounded-[12px] bg-secondary-500 text-label2 text-neutral-0"
          >
            선택완료
          </button>
        </div>
      </section>
    </div>
  );
};

interface FilterGroupProps {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (option: string) => void;
}

const FilterGroup = ({ title, options, selectedValue, onSelect }: FilterGroupProps) => {
  return (
    <section>
      <h3 className="text-label1 text-neutral-900">{title}</h3>
      <div className="mt-2 grid grid-cols-5 gap-x-2 gap-y-1.5">
        {options.map((option) => {
          const isSelected = selectedValue === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={[
                "flex h-[26px] items-center justify-center rounded-full text-caption3",
                isSelected ? "bg-secondary-500 text-neutral-0" : "bg-neutral-300 text-neutral-600",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
};
