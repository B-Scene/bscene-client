import { useState } from "react";

import FilterIcon from "@/assets/icons/band/filter.svg";
import LineIcon from "@/assets/icons/band/Line.svg";
import type { SessionRecruitmentSort } from "@/types/session/sessionRecruitment";
import { SESSION_FILTER_GROUPS } from "../data/sessionRecruitmentPosts";
import type { SessionFilterKey, SessionFilterValues } from "../types";

interface SessionFilterBarProps {
  values: SessionFilterValues;
  showSelectedValues?: boolean;
  showBottomBorder?: boolean;
  compactHeight?: boolean;
  showSort?: boolean;
  sort: SessionRecruitmentSort;
  sortOptions?: SessionRecruitmentSort[];
  onSortChange: (sort: SessionRecruitmentSort) => void;
  onOpenFilter: () => void;
  filterKeys?: SessionFilterKey[];
}

const DEFAULT_FILTER_KEYS: SessionFilterKey[] = [
  "part",
  "skill",
  "genre",
  "region",
];

const SORT_OPTIONS: {
  label: string;
  value: SessionRecruitmentSort;
}[] = [
  {
    label: "최신순",
    value: "LATEST",
  },
  {
    label: "마감일순",
    value: "IMMINENT",
  },
];

const getSortLabel = (sort: SessionRecruitmentSort) => {
  return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "최신순";
};

const getSortButtonWidthClass = (sort: SessionRecruitmentSort) => {
  return sort === "IMMINENT" ? "w-[73px]" : "w-[62px]";
};

export const SessionFilterBar = ({
  values,
  showSelectedValues = true,
  showBottomBorder = true,
  compactHeight = false,
  showSort = true,
  sort,
  sortOptions = ["LATEST", "IMMINENT"],
  onSortChange,
  onOpenFilter,
  filterKeys = DEFAULT_FILTER_KEYS,
}: SessionFilterBarProps) => {
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const visibleGroups = SESSION_FILTER_GROUPS.filter((group) =>
    filterKeys.includes(group.id),
  );

  const visibleSortOptions = SORT_OPTIONS.filter((option) =>
    sortOptions.includes(option.value),
  );

  const handleSelectSort = (nextSort: SessionRecruitmentSort) => {
    onSortChange(nextSort);
    setIsSortSheetOpen(false);
  };

  return (
    <>
      <section
        className={[
          "sticky top-0 z-10 flex w-full items-center gap-2 bg-neutral-0 px-[22px]",
          compactHeight ? "h-[53px]" : "h-[48px]",
          showBottomBorder ? "border-b border-neutral-400" : "",
        ].join(" ")}
      >
        <div className="flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {showSort ? (
            <>
              <button
                type="button"
                aria-label={`정렬 기준: ${getSortLabel(sort)}`}
                onClick={() => setIsSortSheetOpen(true)}
                className={[
                  "flex h-[22px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-neutral-400 bg-neutral-0 px-2 py-0.5 text-caption3 text-neutral-600",
                  getSortButtonWidthClass(sort),
                ].join(" ")}
              >
                <span>{getSortLabel(sort)}</span>
                <SortChevronIcon className="size-3.5 shrink-0 text-neutral-600" />
              </button>

              <img
                src={LineIcon}
                alt=""
                className="mx-2 h-[26px] w-0.5 shrink-0"
              />
            </>
          ) : null}

          <div className="flex min-w-0 items-center gap-1">
            {visibleGroups.map((group) => {
              const selectedValue = values[group.id];
              const isSelected = selectedValue !== "전체";
              const label = showSelectedValues ? selectedValue : group.title;

              return (
                <button
                  key={group.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={onOpenFilter}
                  className={[
                    "flex h-[22px] w-[49px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-0 py-0 text-caption2",
                    isSelected
                      ? "border-secondary-400 bg-secondary-0 text-secondary-500"
                      : "border-neutral-400 bg-neutral-0 text-neutral-600",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
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

      {isSortSheetOpen ? (
        <SortBottomSheet
          selectedSort={sort}
          sortOptions={visibleSortOptions}
          onSelect={handleSelectSort}
          onClose={() => setIsSortSheetOpen(false)}
        />
      ) : null}
    </>
  );
};

interface SortBottomSheetProps {
  selectedSort: SessionRecruitmentSort;
  sortOptions: {
    label: string;
    value: SessionRecruitmentSort;
  }[];
  onSelect: (sort: SessionRecruitmentSort) => void;
  onClose: () => void;
}

const SortBottomSheet = ({
  selectedSort,
  sortOptions,
  onSelect,
  onClose,
}: SortBottomSheetProps) => {
  return (
    <div className="fixed inset-0 z-[80] bg-black/45" onClick={onClose}>
      <section
        className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-neutral-0 px-[56px] pt-[38px] pb-[70px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-[30px]">
          {sortOptions.map((option) => {
            const isSelected = selectedSort === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={[
                  "flex h-8 w-full items-center justify-between text-left text-label1",
                  isSelected ? "text-secondary-500" : "text-neutral-900",
                ].join(" ")}
              >
                <span>{option.label}</span>

                {isSelected ? (
                  <CheckIcon className="size-6 shrink-0 text-secondary-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const SortChevronIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5.25L7 9.25L11 5.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L10 17.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SessionFilterBar;