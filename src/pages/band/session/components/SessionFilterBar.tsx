import ArrowDownIcon from "@/assets/icons/band/arrow-down-gray.svg";
import FilterIcon from "@/assets/icons/band/filter.svg";
import LineIcon from "@/assets/icons/band/Line.svg";
import type { SessionRecruitmentSort } from "@/types/session/sessionRecruitment";
import { SESSION_FILTERS } from "../data/sessionRecruitmentPosts";
import type { SessionFilterValues } from "../types";

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
  const selectedFilters = [
    values.part,
    values.skill,
    values.genre,
    values.region,
  ];
  const filterLabels = showSelectedValues ? selectedFilters : SESSION_FILTERS;
  const sortLabel = sort === "LATEST" ? "최신순" : "마감순";

  return (
    <div
      className={[
        "flex w-full items-center gap-2 bg-neutral-0 pl-[22px] pr-[26px]",
        compactHeight ? "h-[53px]" : "h-[48px]",
        showBottomBorder ? "border-b border-neutral-400" : "",
      ].join(" ")}
    >
      <button
        type="button"
        aria-label={`정렬 기준: ${sortLabel}`}
        onClick={() =>
          onSortChange(sort === "LATEST" ? "IMMINENT" : "LATEST")
        }
        className="flex h-[22px] w-[62px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-neutral-400 bg-neutral-0 px-2 py-0.5 text-caption2 text-neutral-600"
      >
        {sortLabel}
        <img src={ArrowDownIcon} alt="" className="h-[7px] w-3 shrink-0" />
      </button>

      <img src={LineIcon} alt="" className="h-[26px] w-0.5 shrink-0" />

      {filterLabels.map((filter, index) => (
        <button
          key={`${SESSION_FILTERS[index]}-${index}`}
          type="button"
          onClick={onOpenFilter}
          className="flex h-[22px] min-w-[49px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-neutral-400 bg-neutral-0 px-2 py-0.5 text-caption2 text-neutral-600"
        >
          {filter}
        </button>
      ))}

      <button
        type="button"
        aria-label="필터 설정"
        onClick={onOpenFilter}
        className="ml-auto flex size-[22px] shrink-0 items-center justify-center"
      >
        <img src={FilterIcon} alt="" className="size-[22px]" />
      </button>
    </section>
  );
};

export default SessionFilterBar;
