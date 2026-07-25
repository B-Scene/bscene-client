import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowIcon from "@/assets/Arrow.svg";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CheckActiveIcon from "@/assets/icons/check-active.svg";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import BandImage from "@/assets/Img_Band.png";
import BandCard from "@/components/common/Card/BandCard";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { FollowedNewsCard } from "@/components/fan/home/FollowedNewsCard";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";
import { ExploreFilterBar } from "@/pages/fan/explore/FanExplorePage";
import { addRecentSearch } from "./recentSearches";

const SEARCH_RESULT_SORT_OPTIONS = ["정확도순", "추천순"] as const;
type SearchResultSortOption = (typeof SEARCH_RESULT_SORT_OPTIONS)[number];

const BAND_RESULTS = [
  {
    id: "band-wavy",
    imageSrc: BandImage,
    imageAlt: "WAVY 프로필",
    title: "WAVY",
    subtitle: "인디 · 서울",
    description: "몽환적인 사운드와 감각적인 스타일로 주목받는 3인조 밴드",
  },
];

const CONCERT_RESULTS = [
  { id: "concert-1", showThumbnail: true },
  { id: "concert-2", month: "MAY", day: "17", dateBadgeClassName: "bg-primary-300" },
  { id: "concert-3", showThumbnail: true },
  { id: "concert-4", showThumbnail: true },
];

const CONTENT_RESULTS = [
  {
    id: "content-1",
    variant: "video" as const,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "content-2",
    variant: "image" as const,
    tags: [],
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: "content-3",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "content-4",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

const SectionTitle = ({
  title,
  count,
  showMore = false,
  onMoreClick,
}: {
  title: string;
  count: number;
  showMore?: boolean;
  onMoreClick?: () => void;
}) => {
  return (
    <div className="mb-[16px] flex items-center justify-between">
      <h2 className="m-0 flex items-center gap-[8px] font-body text-label1 text-neutral-900">
        {title}
        <span className="font-body text-body5 text-neutral-600">총 {count}개</span>
      </h2>

      {showMore ? (
        <button
          type="button"
          onClick={onMoreClick}
          className="flex translate-x-[8px] items-center gap-[2px] font-body text-body1 text-neutral-400"
        >
          더보기
          <img src={ArrowIcon} alt="" className="size-5 opacity-28" />
        </button>
      ) : null}
    </div>
  );
};

const SearchResultTopBar = ({ initialKeyword }: { initialKeyword: string }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword);
  const hasKeyword = keyword.length > 0;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    navigate(`/fan/explore/search/results?q=${encodeURIComponent(trimmedKeyword)}`, {
      replace: true,
    });
  };

  return (
    <header className="flex h-[48px] w-full max-w-[393px] items-center gap-[16px] bg-neutral-0 px-[15px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
        className="flex size-6 shrink-0 items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <form
        role="search"
        onSubmit={submitSearch}
        className="flex h-[36px] min-w-0 flex-1 items-center rounded-full border border-neutral-500 bg-neutral-0 px-[15px]"
      >
        <input
          type="text"
          aria-label="검색어"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent font-body text-caption3 text-neutral-900 outline-none"
        />
        {hasKeyword ? (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setKeyword("")}
            className="ml-[8px] flex size-4 shrink-0 items-center justify-center"
          >
            <img src={TimesCircleIcon} alt="" className="size-4" />
          </button>
        ) : null}
      </form>
    </header>
  );
};

const SearchResultSortSheet = ({
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

const FanExploreSearchResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "WAVY";
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [appliedSort, setAppliedSort] =
    useState<SearchResultSortOption>("정확도순");
  const resultCounts = {
    bands: BAND_RESULTS.length,
    concerts: 7,
    contents: 7,
  };

  const toggleFollow = (bandId: string) => {
    setFollowingIds((current) => {
      const next = new Set(current);

      if (next.has(bandId)) {
        next.delete(bandId);
      } else {
        next.add(bandId);
      }

      return next;
    });
  };

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <SearchResultTopBar initialKeyword={keyword} />
      <ExploreFilterBar
        appliedFilters={{ genre: "전체", region: "전체", content: "전체" }}
        appliedSort={appliedSort}
        onSortClick={() => setIsSortSheetOpen(true)}
      />

      <section className="px-[23px] pt-[16px]">
        <SectionTitle title="밴드" count={resultCounts.bands} />
        {BAND_RESULTS.map((band) => (
          <BandCard
            key={band.id}
            imageSrc={band.imageSrc}
            imageAlt={band.imageAlt}
            title={band.title}
            subtitle={band.subtitle}
            description={band.description}
            following={followingIds.has(band.id)}
            onClick={() => navigate(`/fan/bands/${band.id}`)}
            onToggleFollow={() => toggleFollow(band.id)}
            className="!h-[86px] !w-[348px] !gap-[16px]"
            contentClassName="!h-auto flex-1 shrink !w-auto"
            descriptionClassName="line-clamp-2 text-primary-300"
            descriptionMultiline
          />
        ))}
      </section>

      <div aria-hidden="true" className="mt-[16px] h-[16px] w-full max-w-[393px] bg-primary-0" />

      <section className="bg-neutral-0 px-[23px] py-[16px]">
        <SectionTitle
          title="공연"
          count={resultCounts.concerts}
          showMore
          onMoreClick={() =>
            navigate(
              `/fan/explore/search/results/concerts?q=${encodeURIComponent(
                keyword,
              )}`,
            )
          }
        />
        <div className="flex flex-col gap-[12px]">
          {CONCERT_RESULTS.map((concert) => (
            <ConcertCard
              key={concert.id}
              showThumbnail={concert.showThumbnail}
              month={concert.month}
              day={concert.day}
              title="WAVY 단독 공연"
              location="홍대 롤링홀"
              dateTime="2026.05.17. 18:00"
              status={<span className="text-primary-500">D-7</span>}
              dateBadgeClassName={concert.dateBadgeClassName}
              onClick={() => navigate(`/fan/home/concerts/${concert.id}`)}
              ariaLabel="WAVY 단독 공연 상세보기"
            />
          ))}
        </div>
      </section>

      <div aria-hidden="true" className="h-[16px] w-full max-w-[393px] bg-primary-0" />

      <section className="px-[23px] py-[16px]">
        <SectionTitle
          title="콘텐츠"
          count={resultCounts.contents}
          showMore
          onMoreClick={() =>
            navigate(
              `/fan/explore/contents/content-1?q=${encodeURIComponent(
                keyword,
              )}&createdAt=${encodeURIComponent(
                CONTENT_RESULTS[0].createdAt,
              )}`,
            )
          }
        />
        <div className="flex flex-col gap-[12px]">
          {CONTENT_RESULTS.map((content) => (
            <FollowedNewsCard
              key={content.id}
              variant={content.variant}
              tags={content.tags}
            />
          ))}
        </div>
      </section>

      <SearchResultSortSheet
        open={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        selectedSort={appliedSort}
        onSelect={setAppliedSort}
      />
    </main>
  );
};

export default FanExploreSearchResultPage;
