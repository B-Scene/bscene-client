// src/features/session/applicationForm/ApplicationChipGroup.tsx

interface SingleChipGroupProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const SingleChipGroup = ({
  options,
  selectedValue,
  onSelect,
}: SingleChipGroupProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selectedValue === option;

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option)}
            className={`flex h-[26px] items-center justify-center rounded-[8px] px-[15px] text-caption2 transition-colors ${
              isSelected
                ? "bg-secondary-500 text-neutral-0"
                : "bg-neutral-300 text-neutral-600"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

interface MultipleChipGroupProps {
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export const MultipleChipGroup = ({
  options,
  selectedValues,
  onToggle,
}: MultipleChipGroupProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected =
          selectedValues.includes(option);

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option)}
            className={`flex h-[26px] items-center justify-center rounded-[8px] px-[15px] text-caption2 transition-colors ${
              isSelected
                ? "bg-secondary-500 text-neutral-0"
                : "bg-neutral-300 text-neutral-600"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};