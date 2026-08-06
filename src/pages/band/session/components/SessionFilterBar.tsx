import FilterIcon from "@/assets/icons/band/filter.svg";
import LineIcon from "@/assets/icons/band/Line.svg";
import type { SessionRecruitmentSort } from "@/types/session/sessionRecruitment";
import { SESSION_FILTERS } from "../data/sessionRecruitmentPosts";
import type { SessionFilterValues } from "../types";

interface SessionFilterBarProps {
  values: SessionFilterValues;
  showSelectedValues?: boolean;
  showBottomBorder?: boolean;
  compactHeight?: boolean;
  sort: SessionRecruitmentSort;
  onSortChange: (sort: SessionRecruitmentSort) => void;
  onOpenFilter: () => void;
}

export const SessionFilterBar = ({
  values,
  showSelectedValues = true,
  showBottomBorder = true,
  compactHeight = false,
  onOpenFilter,
}: SessionFilterBarProps) => {
  const selectedFilters = [
    values.part,
    values.skill,
    values.genre,
    values.region,
  ];

  const filterLabels = showSelectedValues ? selectedFilters : SESSION_FILTERS;

  return (
    <section
      className={[
        "sticky top-0 z-10 flex w-full items-center gap-2 bg-neutral-0 px-[22px]",
        compactHeight ? "h-[53px]" : "h-[48px]",
        showBottomBorder ? "border-b border-neutral-400" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          aria-label="정렬 기준: 최신순"
          aria-pressed={false}
          className="flex h-[22px] w-[62px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-neutral-400 bg-neutral-0 px-2 py-0.5 text-caption3 text-neutral-600"
        >
          최신순
        </button>

        <img src={LineIcon} alt="" className="h-[26px] w-0.5 shrink-0" />

        {filterLabels.map((filter, index) => {
          const isSelected = selectedFilters[index] !== "전체";

          return (
            <button
              key={`${SESSION_FILTERS[index]}-${index}`}
              type="button"
              aria-pressed={isSelected}
              onClick={onOpenFilter}
              className={[
                "flex h-[22px] min-w-[49px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-[15px] py-0.5 text-caption2",
                isSelected
                  ? "border-secondary-400 bg-secondary-0 text-secondary-500"
                  : "border-neutral-400 bg-neutral-0 text-neutral-600",
              ].join(" ")}
            >
              {filter}
            </button>
          );
        })}
      </div>

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