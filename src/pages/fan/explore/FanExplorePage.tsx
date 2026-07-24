import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@/assets/icons/band/search.svg";
import ArrowDownIcon from "@/assets/icons/band/arrow-down-gray.svg";
import CheckActiveIcon from "@/assets/icons/check-active.svg";
import BandImage from "@/assets/Img_Band.png";
import Modal from "@/components/Modal/Modal";
import BandCard from "@/components/common/Card/BandCard";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";

type ExploreFilter = {
  id: string;
  label: string;
};

type AppliedExploreFilters = {
  genre: string;
  region: string;
  content: string;
};

const SORT_FILTER: ExploreFilter = { id: "recommend", label: "추천순" };
const SORT_OPTIONS = ["정확도순", "인기순"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const DEFAULT_APPLIED_FILTERS: AppliedExploreFilters = {
  genre: "전체",
  region: "전체",
  content: "전체",
};

const FILTER_OPTIONS = {
  genre: ["전체", "록", "인디팝", "펑크", "메탈", "재즈", "블루스", "R&B", "어쿠스틱", "포크"],
  region: [
    "전체",
    "서울",
    "경기",
    "인천",
    "부산",
    "대구",
    "광주",
    "대전",
    "울산",
    "세종",
    "충남",
    "충북",
    "전남",
    "전북",
    "경남",
    "경북",
    "강원",
    "제주",
  ],
  content: ["전체", "밴드", "공연", "영상"],
};

const RECOMMENDED_BANDS = Array.from({ length: 8 }, (_, index) => ({
  id: `wavy-${index + 1}`,
  name: "WAVY",
  meta: "인디 · 서울",
  followers: 560,
  description: "몽환적인 사운드와 감각적인 스타일로 주목받는 3인조 밴드",
}));

const ExploreTopBar = () => {
  const navigate = useNavigate();

  return (
    <header className="relative flex h-[48px] w-full max-w-[393px] items-center justify-center bg-neutral-0 px-[24px]">
      <h1 className="m-0 font-body text-label2 text-neutral-900">탐색</h1>

      <button
        type="button"
        aria-label="검색"
        onClick={() => navigate("/fan/explore/search")}
        className="absolute right-[24px] top-1/2 flex size-6 -translate-y-1/2 items-center justify-center"
      >
        <img
          src={SearchIcon}
          alt=""
          className="h-[19.997px] w-[20.012px] brightness-0"
        />
      </button>
    </header>
  );
};

export const FilterControlIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      aria-hidden="true"
      className="h-[18.333px] w-[18.29px] shrink-0"
    >
      <path
        d="M12.6683 16.4784H17.4166C17.6597 16.4784 17.8929 16.3819 18.0648 16.21C18.2367 16.038 18.3333 15.8049 18.3333 15.5618C18.3333 15.3187 18.2367 15.0855 18.0648 14.9136C17.8929 14.7417 17.6597 14.6451 17.4166 14.6451H12.6683C12.4756 14.1142 12.1241 13.6555 11.6616 13.3314C11.1991 13.0072 10.648 12.8333 10.0833 12.8333C9.51848 12.8333 8.96739 13.0072 8.5049 13.3314C8.04241 13.6555 7.69094 14.1142 7.49825 14.6451H0.916584C0.67347 14.6451 0.440311 14.7417 0.268402 14.9136C0.0964947 15.0855 -8.2016e-05 15.3187 -8.2016e-05 15.5618C-8.2016e-05 15.8049 0.0964947 16.038 0.268402 16.21C0.440311 16.3819 0.67347 16.4784 0.916584 16.4784H7.49825C7.69094 17.0093 8.04241 17.468 8.5049 17.7922C8.96739 18.1163 9.51848 18.2902 10.0833 18.2902C10.648 18.2902 11.1991 18.1163 11.6616 17.7922C12.1241 17.468 12.4756 17.0093 12.6683 16.4784ZM9.16658 15.5618C9.16658 15.3805 9.22035 15.2032 9.32107 15.0525C9.4218 14.9018 9.56496 14.7843 9.73246 14.7149C9.89996 14.6455 10.0843 14.6273 10.2621 14.6627C10.4399 14.6981 10.6032 14.7854 10.7314 14.9136C10.8596 15.0418 10.9469 15.2051 10.9823 15.3829C11.0177 15.5608 10.9995 15.7451 10.9301 15.9126C10.8608 16.0801 10.7433 16.2232 10.5925 16.324C10.4418 16.4247 10.2646 16.4784 10.0833 16.4784C9.84014 16.4784 9.60698 16.3819 9.43507 16.21C9.26316 16.038 9.16658 15.8049 9.16658 15.5618ZM7.16825 10.0618H17.4166C17.6597 10.0618 17.8929 9.96519 18.0648 9.79328C18.2367 9.62138 18.3333 9.38822 18.3333 9.1451C18.3333 8.90199 18.2367 8.66883 18.0648 8.49692C17.8929 8.32501 17.6597 8.22844 17.4166 8.22844H7.16825C6.97556 7.69755 6.62409 7.23886 6.1616 6.91471C5.69911 6.59056 5.14803 6.41667 4.58325 6.41667C4.01848 6.41667 3.4674 6.59056 3.0049 6.91471C2.54241 7.23886 2.19094 7.69755 1.99825 8.22844H0.916584C0.67347 8.22844 0.440311 8.32501 0.268402 8.49692C0.0964947 8.66883 -8.2016e-05 8.90199 -8.2016e-05 9.1451C-8.2016e-05 9.38822 0.0964947 9.62138 0.268402 9.79328C0.440311 9.96519 0.67347 10.0618 0.916584 10.0618H1.99825C2.19094 10.5927 2.54241 11.0513 3.0049 11.3755C3.4674 11.6996 4.01848 11.8735 4.58325 11.8735C5.14803 11.8735 5.69911 11.6996 6.1616 11.3755C6.62409 11.0513 6.97556 10.5927 7.16825 10.0618ZM3.66658 9.1451C3.66658 8.9638 3.72035 8.78658 3.82107 8.63583C3.92179 8.48509 4.06496 8.36759 4.23246 8.29821C4.39996 8.22883 4.58427 8.21068 4.76208 8.24605C4.9399 8.28142 5.10324 8.36872 5.23143 8.49692C5.35963 8.62512 5.44693 8.78846 5.4823 8.96627C5.51767 9.14409 5.49952 9.3284 5.43014 9.4959C5.36076 9.6634 5.24327 9.80656 5.09252 9.90728C4.94178 10.008 4.76455 10.0618 4.58325 10.0618C4.34014 10.0618 4.10698 9.96519 3.93507 9.79328C3.76316 9.62138 3.66658 9.38822 3.66658 9.1451ZM14.5016 3.6451H17.4166C17.6597 3.6451 17.8929 3.54853 18.0648 3.37662C18.2367 3.20471 18.3333 2.97155 18.3333 2.72844C18.3333 2.48532 18.2367 2.25216 18.0648 2.08026C17.8929 1.90835 17.6597 1.81177 17.4166 1.81177H14.5016C14.3089 1.28088 13.9574 0.822192 13.4949 0.498042C13.0324 0.173891 12.4814 0 11.9166 0C11.3518 0 10.8007 0.173891 10.3382 0.498042C9.87574 0.822192 9.52427 1.28088 9.33158 1.81177H0.916584C0.67347 1.81177 0.440311 1.90835 0.268402 2.08026C0.0964947 2.25216 -8.2016e-05 2.48532 -8.2016e-05 2.72844C-8.2016e-05 2.97155 0.0964947 3.20471 0.268402 3.37662C0.440311 3.54853 0.67347 3.6451 0.916584 3.6451L9.33158 3.6451C9.52427 4.17599 9.87574 4.63468 10.3382 4.95883C10.8007 5.28298 11.3518 5.45687 11.9166 5.45687C12.4814 5.45687 13.0324 5.28298 13.4949 4.95883C13.9574 4.63468 14.3089 4.17599 14.5016 3.6451ZM10.9999 2.72844C10.9999 2.54714 11.0537 2.36991 11.1544 2.21916C11.2551 2.06842 11.3983 1.95093 11.5658 1.88155C11.7333 1.81217 11.9176 1.79401 12.0954 1.82938C12.2732 1.86475 12.4366 1.95206 12.5648 2.08026C12.693 2.20845 12.7803 2.37179 12.8156 2.5496C12.851 2.72742 12.8329 2.91173 12.7635 3.07923C12.6941 3.24673 12.5766 3.38989 12.4259 3.49062C12.2751 3.59134 12.0979 3.6451 11.9166 3.6451C11.6735 3.6451 11.4403 3.54853 11.2684 3.37662C11.0965 3.20471 10.9999 2.97155 10.9999 2.72844Z"
        fill="#141414"
      />
    </svg>
  );
};

export const ExploreFilterBar = ({
  appliedFilters,
  appliedSort,
  onSortClick,
  onFilterClick,
}: {
  appliedFilters: AppliedExploreFilters;
  appliedSort?: SortOption | null;
  onSortClick?: () => void;
  onFilterClick?: () => void;
}) => {
  const filterChips = [
    { id: "genre", defaultLabel: "장르", value: appliedFilters.genre },
    { id: "region", defaultLabel: "지역", value: appliedFilters.region },
    { id: "content", defaultLabel: "콘텐츠", value: appliedFilters.content },
  ];
  const hasAppliedFilter = filterChips.some((filter) => filter.value !== "전체");
  const visibleFilterChips = hasAppliedFilter
    ? filterChips.filter((filter) => filter.value !== "전체")
    : filterChips;
  const isSortApplied = Boolean(appliedSort);

  return (
    <div className="flex h-[48px] w-full max-w-[393px] items-center justify-between border-b border-neutral-400 bg-neutral-0 py-[11px] pl-[22px] pr-[26px]">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={onSortClick}
          className={[
            "flex h-[22px] w-[62px] shrink-0 items-center justify-center gap-[4px] whitespace-nowrap rounded-full border px-[15px] py-[7px] font-body text-caption3 text-center",
            isSortApplied
              ? "border-primary-400 bg-primary-50 text-primary-400"
              : "border-neutral-400 bg-neutral-0 text-neutral-600",
          ].join(" ")}
        >
          {appliedSort ?? SORT_FILTER.label}
          <img
            src={ArrowDownIcon}
            alt=""
            className={[
              "h-[7px] w-[12px]",
              isSortApplied
                ? "[filter:brightness(0)_saturate(100%)_invert(39%)_sepia(80%)_saturate(2432%)_hue-rotate(319deg)_brightness(96%)_contrast(96%)]"
                : "[filter:brightness(0)_saturate(100%)_invert(44%)_sepia(0%)_saturate(0%)_hue-rotate(173deg)_brightness(95%)_contrast(92%)]",
            ].join(" ")}
          />
        </button>

        {visibleFilterChips.map((filter) => {
          const isApplied = filter.value !== "전체";

          return (
          <button
            key={filter.id}
            type="button"
            className={[
              "flex h-[22px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border bg-neutral-0 py-[7px] font-body text-caption3",
              isApplied ? "px-[15px]" : "w-[48px] px-[15px]",
              isApplied
                ? "border-primary-400 bg-primary-50 text-primary-400"
                : "border-neutral-400 text-neutral-600",
            ].join(" ")}
          >
            {isApplied ? filter.value : filter.defaultLabel}
          </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="필터"
        onClick={onFilterClick}
        className="flex h-[18.333px] w-[18.29px] shrink-0 items-center justify-center"
      >
        <FilterControlIcon />
      </button>
    </div>
  );
};

const ExploreSortSheet = ({
  open,
  onClose,
  selectedSort,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedSort: SortOption | null;
  onSelect: (sort: SortOption) => void;
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
        aria-label="추천순"
        onTransitionEnd={handleTransitionEnd}
        className={[
          "relative z-10 flex w-[393px] max-w-full flex-col items-start gap-[10px] rounded-t-[20px] bg-neutral-0 px-[15px] pt-[32px] pb-[48px] transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        {SORT_OPTIONS.map((option) => {
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

const FilterOptionButton = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        "box-border flex h-[26px] min-w-[51px] items-center justify-center rounded-full px-[15px] py-[4px] font-body text-caption3",
        selected
          ? "bg-primary-400 text-neutral-0"
          : "bg-neutral-300 text-neutral-600",
      ].join(" ")}
    >
      {label}
    </button>
  );
};

const FilterOptionGroup = ({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) => {
  return (
    <section>
      <h3 className="m-0 font-body text-body1 text-neutral-900">{title}</h3>
      <div className="mt-[8px] flex flex-wrap gap-x-[8px] gap-y-[8px]">
        {options.map((option) => (
          <FilterOptionButton
            key={option}
            label={option}
            selected={selected === option}
            onClick={() => onSelect(option)}
          />
        ))}
      </div>
    </section>
  );
};

const ExploreFilterSheet = ({
  open,
  onClose,
  appliedFilters,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  appliedFilters: AppliedExploreFilters;
  onApply: (filters: AppliedExploreFilters) => void;
}) => {
  const [selectedGenre, setSelectedGenre] = useState(appliedFilters.genre);
  const [selectedRegion, setSelectedRegion] = useState(appliedFilters.region);
  const [selectedContent, setSelectedContent] = useState(appliedFilters.content);
  const { rendered, isVisible, handleTransitionEnd } = useSlideUpSheet(
    open,
    () => {
      setSelectedGenre(appliedFilters.genre);
      setSelectedRegion(appliedFilters.region);
      setSelectedContent(appliedFilters.content);
    },
  );

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="필터 닫기"
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-900/75 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="필터"
        onTransitionEnd={handleTransitionEnd}
        className={[
          "relative z-10 flex h-[506px] w-[393px] max-w-full flex-col overflow-hidden rounded-t-[24px] bg-neutral-0 pt-[8px] pb-[8px] transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto h-[4px] w-[42px] rounded-full bg-neutral-400" />
        <h2 className="m-0 mt-[20px] text-center font-body text-label1 text-neutral-900">
          필터
        </h2>

        <div className="mt-[16px] ml-[41px] mr-[11px] flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto pb-[8px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterOptionGroup
            title="장르"
            options={FILTER_OPTIONS.genre}
            selected={selectedGenre}
            onSelect={setSelectedGenre}
          />
          <FilterOptionGroup
            title="지역"
            options={FILTER_OPTIONS.region}
            selected={selectedRegion}
            onSelect={setSelectedRegion}
          />
          <FilterOptionGroup
            title="콘텐츠"
            options={FILTER_OPTIONS.content}
            selected={selectedContent}
            onSelect={setSelectedContent}
          />
        </div>

        <div className="mt-[24px] px-[34px] shrink-0">
          <button
            type="button"
            onClick={() => {
              onApply({
                genre: selectedGenre,
                region: selectedRegion,
                content: selectedContent,
              });
              onClose();
            }}
            className="flex h-[52px] w-full items-center justify-center rounded-[12px] bg-primary-400 font-body text-label1 text-neutral-0"
          >
            선택완료
          </button>
        </div>
        <div className="mx-auto mt-[19px] h-[5px] w-[134px] shrink-0 rounded-full bg-neutral-400" />
      </section>
    </div>
  );
};

const RecommendationSection = () => {
  const navigate = useNavigate();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followerCounts, setFollowerCounts] = useState(() =>
    Object.fromEntries(
      RECOMMENDED_BANDS.map((band) => [band.id, band.followers]),
    ),
  );
  const [unfollowTargetId, setUnfollowTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2000);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  const followBand = (bandId: string, bandName: string) => {
    if (followingIds.has(bandId)) return;

    setFollowingIds((current) => {
      const next = new Set(current);
      next.add(bandId);
      return next;
    });
    setFollowerCounts((current) => ({
      ...current,
      [bandId]: current[bandId] + 1,
    }));
    setToastMessage(`${bandName}를 팔로우했어요`);
  };

  const confirmUnfollow = () => {
    if (!unfollowTargetId) return;

    setFollowingIds((current) => {
      const next = new Set(current);
      next.delete(unfollowTargetId);
      return next;
    });
    setFollowerCounts((current) => ({
      ...current,
      [unfollowTargetId]: Math.max(0, current[unfollowTargetId] - 1),
    }));

    setUnfollowTargetId(null);
  };

  return (
    <section className="px-[22px] pt-[24px]">
      <h2 className="m-0 font-body text-label1 text-neutral-900">
        회원님을 위한 추천 밴드
      </h2>
      <p className="m-0 mt-[4px] font-body text-caption2 text-neutral-600">
        회원님의 취향과 활동을 기반으로 추천해요
      </p>

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {RECOMMENDED_BANDS.map((band) => (
          <BandCard
            key={band.id}
            imageSrc={BandImage}
            imageAlt={`${band.name} 프로필`}
            title={band.name}
            subtitle={`${band.meta} · 팔로워 ${followerCounts[band.id]}명`}
            description={band.description}
            following={followingIds.has(band.id)}
            onClick={() => navigate(`/fan/bands/${band.id}`)}
            onToggleFollow={() => {
              if (followingIds.has(band.id)) {
                setUnfollowTargetId(band.id);
                return;
              }

              followBand(band.id, band.name);
            }}
            className="!h-[86px] !w-[348px] !gap-[16px]"
            contentClassName="!h-auto flex-1 shrink !w-auto"
            descriptionClassName="line-clamp-2 text-primary-300"
            descriptionMultiline
          />
        ))}
      </div>

      <ModalOverlay
        open={unfollowTargetId !== null}
        onClose={() => setUnfollowTargetId(null)}
      >
        <Modal
          title="팔로우를 취소할까요?"
          description={
            <>
              이 밴드의 소식이
              <br />
              홈피드에서 사라져요
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setUnfollowTargetId(null)}
          onConfirm={confirmUnfollow}
        />
      </ModalOverlay>

      <Toast
        open={toastMessage !== null}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </section>
  );
};

const FanExplorePage = () => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [appliedSort, setAppliedSort] = useState<SortOption | null>(null);
  const [appliedFilters, setAppliedFilters] = useState(
    DEFAULT_APPLIED_FILTERS,
  );

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <ExploreTopBar />
      <ExploreFilterBar
        appliedFilters={appliedFilters}
        appliedSort={appliedSort}
        onSortClick={() => setIsSortSheetOpen(true)}
        onFilterClick={() => setIsFilterSheetOpen(true)}
      />
      <RecommendationSection />
      <ExploreSortSheet
        open={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        selectedSort={appliedSort}
        onSelect={setAppliedSort}
      />
      <ExploreFilterSheet
        open={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        appliedFilters={appliedFilters}
        onApply={(nextFilters) => {
          setAppliedFilters(nextFilters);
        }}
      />
    </main>
  );
};

export default FanExplorePage;
