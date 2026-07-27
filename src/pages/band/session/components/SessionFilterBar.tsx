import type { Dispatch, SetStateAction } from "react";
import CloseCircleIcon from "@/assets/icons/band/close-circle.svg";
import type { SessionRecruitmentSort } from "@/types/session/sessionRecruitment";
import type { SessionFilterValues } from "../types";

type FilterKey = "part" | "skill" | "skillLevel" | "genre" | "region";

interface SessionFilterValuesLike {
  part?: string;
  skill?: string;
  skillLevel?: string;
  genre?: string;
  region?: string;
}

interface SessionFilterBarProps {
  values?: SessionFilterValues | SessionFilterValuesLike;
  filters?: SessionFilterValuesLike;
  selectedFilters?: SessionFilterValuesLike;

  sort?: SessionRecruitmentSort;
  onSortChange?: Dispatch<SetStateAction<SessionRecruitmentSort>>;

  showBottomBorder?: boolean;
  compactHeight?: boolean;
  showSelectedValues?: boolean;

  onOpenFilter?: (key?: FilterKey) => void;
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

const SORT_LABEL_MAP: Record<string, string> = {
  LATEST: "최신순",
  POPULAR: "인기순",
  DEADLINE: "마감임박순",
  DEADLINE_ASC: "마감임박순",
  VIEW: "조회순",
};

export const SessionFilterBar = ({
  values,
  filters,
  selectedFilters,
  sort,
  onSortChange,
  showBottomBorder = true,
  compactHeight = false,
  showSelectedValues = true,
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
      const value = currentValues[key as keyof typeof currentValues];

      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    return "";
  };

  const isDefaultValue = (value: string) => {
    return value === "" || value === "전체";
  };

  const hasSelectedFilter = FILTER_ITEMS.some((item) => {
    const selectedValue = getSelectedValue(item.valueKeys);

    return !isDefaultValue(selectedValue);
  });

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

  const handleSortClick = () => {
    if (!onSortChange || !sort) {
      return;
    }

    onSortChange((currentSort) => {
      if (currentSort === "LATEST") {
        return "DEADLINE" as SessionRecruitmentSort;
      }

      return "LATEST" as SessionRecruitmentSort;
    });
  };

  return (
    <div
      className={[
        "w-full bg-neutral-0",
        showBottomBorder ? "border-b border-neutral-200" : "",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "flex w-full items-center gap-2 overflow-x-auto px-5 scrollbar-hide",
          compactHeight ? "py-2" : "py-3",
        ].join(" ")}
      >
        {FILTER_ITEMS.map((item) => {
          const selectedValue = getSelectedValue(item.valueKeys);
          const shouldShowSelectedValue =
            showSelectedValues && !isDefaultValue(selectedValue);

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleOpenFilter(item.key)}
              className={[
                "flex h-[30px] shrink-0 items-center justify-center rounded-full px-4 text-caption2",
                shouldShowSelectedValue
                  ? "bg-secondary-500 text-neutral-0"
                  : "bg-neutral-300 text-neutral-600",
              ].join(" ")}
            >
              {shouldShowSelectedValue ? selectedValue : item.label}
            </button>
          );
        })}

        {sort ? (
          <button
            type="button"
            onClick={handleSortClick}
            className="flex h-[30px] shrink-0 items-center justify-center rounded-full bg-neutral-300 px-4 text-caption2 text-neutral-600"
          >
            {SORT_LABEL_MAP[sort] ?? "최신순"}
          </button>
        ) : null}

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
    </div>
  );
};

export default SessionFilterBar;