import FilterIcon from "@/assets/icons/band/filter.svg";
import LineIcon from "@/assets/icons/band/Line.svg";
import { SESSION_FILTERS } from "../data/sessionRecruitmentPosts";
import type { SessionFilterValues } from "../types";
import { ChevronDownIcon } from "./SessionIcons";

interface SessionFilterBarProps {
  values: SessionFilterValues;
  showSelectedValues?: boolean;
  showBottomBorder?: boolean;
  compactHeight?: boolean;
  onOpenFilter: () => void;
}

export const SessionFilterBar = ({
  values,
  showSelectedValues = true,
  showBottomBorder = true,
  compactHeight = false,
  onOpenFilter,
}: SessionFilterBarProps) => {
  const selectedFilters = [values.part, values.skill, values.genre, values.region];
  const filterLabels = showSelectedValues ? selectedFilters : SESSION_FILTERS;

  return (
    <section
      className={[
        "flex w-full items-center gap-2 bg-neutral-0 px-6",
        compactHeight ? "h-[53px]" : "h-[62px]",
        showBottomBorder ? "border-b border-neutral-300" : "",
      ].join(" ")}
    >
      <button
        type="button"
        className="flex h-[22px] w-[62px] shrink-0 items-center justify-center gap-0.5 rounded-full border border-[#FBB10E] text-caption2 text-[#FBB10E]"
      >
        최신순
        <ChevronDownIcon className="size-3" />
      </button>

      <img src={LineIcon} alt="" className="h-[26px] w-0.5 shrink-0" />

      {filterLabels.map((filter, index) => (
        <button
          key={filter + "-" + index}
          type="button"
          onClick={onOpenFilter}
          className="flex h-[22px] min-w-[49px] shrink-0 items-center justify-center rounded-full border border-neutral-400 px-3 text-caption2 text-neutral-700"
        >
          {filter}
        </button>
      ))}

      <button
        type="button"
        aria-label="필터 설정"
        onClick={onOpenFilter}
        className="ml-auto flex size-8 items-center justify-center"
      >
        <img src={FilterIcon} alt="" className="size-[22px]" />
      </button>
    </section>
  );
};
