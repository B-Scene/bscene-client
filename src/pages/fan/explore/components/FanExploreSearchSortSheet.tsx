import CheckActiveIcon from "@/assets/icons/check-active.svg";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";
import {
  SEARCH_RESULT_SORT_OPTIONS,
  type SearchResultSortOption,
} from "@/pages/fan/explore/components/fanExploreSearchSort";

export const SearchResultSortSheet = ({
  open,
  onClose,
  selectedSort,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedSort: SearchResultSortOption;
  onSelect: (sort: SearchResultSortOption) => void;
}) => {
  const { rendered, isVisible, handleTransitionEnd } = useSlideUpSheet(open);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="정렬 닫기"
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-900/75 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="정렬"
        onTransitionEnd={handleTransitionEnd}
        className={[
          "relative z-10 flex w-[393px] max-w-full flex-col items-start gap-[10px] rounded-t-[20px] bg-neutral-0 px-[15px] pb-[48px] pt-[32px] transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        {SEARCH_RESULT_SORT_OPTIONS.map((option) => {
          const isSelected = selectedSort === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className={[
                "box-border flex h-6 w-full items-center justify-between px-3 font-body text-label2",
                isSelected ? "text-primary-400" : "text-neutral-900",
              ].join(" ")}
            >
              {option}
              <span className="flex h-5 w-5 items-center justify-center">
                {isSelected ? (
                  <img src={CheckActiveIcon} alt="" className="h-5 w-5" />
                ) : null}
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
};
