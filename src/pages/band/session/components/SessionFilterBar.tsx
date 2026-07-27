import CloseCircleIcon from "@/assets/icons/band/close-circle.svg";

type FilterKey = "part" | "skill" | "skillLevel" | "genre" | "region";

interface SessionFilterValuesLike {
  part?: string;
  skill?: string;
  skillLevel?: string;
  genre?: string;
  region?: string;
}

interface SessionFilterBarProps {
  values?: SessionFilterValuesLike;
  filters?: SessionFilterValuesLike;
  selectedFilters?: SessionFilterValuesLike;
  onOpenFilter?: (key: FilterKey) => void;
  onFilterClick?: (key: FilterKey) => void;
  onOpenBottomSheet?: (key: FilterKey) => void;
  onReset?: () => void;
  onClear?: () => void;
  onClearFilters?: () => void;
  className?: string;
}

const FILTER_ITEMS: Array<{
  key: FilterKey;
  valueKeys: FilterKey[];
  label: string;
}> = [
  {
    key: "part",
    valueKeys: ["part"],
    label: "파트",
  },
  {
    key: "skillLevel",
    valueKeys: ["skillLevel", "skill"],
    label: "실력대",
  },
  {
    key: "genre",
    valueKeys: ["genre"],
    label: "장르",
  },
  {
    key: "region",
    valueKeys: ["region"],
    label: "지역",
  },
];

export const SessionFilterBar = ({
  values,
  filters,
  selectedFilters,
  onOpenFilter,
  onFilterClick,
  onOpenBottomSheet,
  onReset,
  onClear,
  onClearFilters,
  className = "",
}: SessionFilterBarProps) => {
  const currentValues = values ?? filters ?? selectedFilters ?? {};

  const getSelectedValue = (keys: FilterKey[]) => {
    for (const key of keys) {
      const value = currentValues[key];

      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    return "";
  };

  const hasSelectedFilter = FILTER_ITEMS.some((item) =>
    Boolean(getSelectedValue(item.valueKeys)),
  );

  const handleOpenFilter = (key: FilterKey) => {
    if (onOpenFilter) {
      onOpenFilter(key);
      return;
    }

    if (onFilterClick) {
      onFilterClick(key);
      return;
    }

    if (onOpenBottomSheet) {
      onOpenBottomSheet(key);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }

    if (onClear) {
      onClear();
      return;
    }

    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div
      className={`flex w-full items-center gap-2 overflow-x-auto px-5 py-3 scrollbar-hide ${className}`}
    >
      {FILTER_ITEMS.map((item) => {
        const selectedValue = getSelectedValue(item.valueKeys);
        const isSelected = Boolean(selectedValue);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleOpenFilter(item.key)}
            className={`flex h-[30px] shrink-0 items-center justify-center rounded-full px-4 text-caption2 ${
              isSelected
                ? "bg-secondary-500 text-neutral-0"
                : "bg-neutral-300 text-neutral-600"
            }`}
          >
            {selectedValue || item.label}
          </button>
        );
      })}

      {hasSelectedFilter ? (
        <button
          type="button"
          aria-label="필터 초기화"
          onClick={handleReset}
          className="flex size-[30px] shrink-0 items-center justify-center"
        >
          <img src={CloseCircleIcon} alt="" className="size-5" />
        </button>
      ) : null}
    </div>
  );
};

export default SessionFilterBar;