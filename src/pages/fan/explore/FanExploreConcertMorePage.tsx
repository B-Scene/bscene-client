import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { Header } from "@/components/common/Header/Header";
import {
  useFanExplorePerformanceSearchQuery,
  useFanExploreSearchQuery,
} from "@/hooks/api/fan/useFanExplore";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import {
  ExploreFilterBar,
  type AppliedExploreFilters,
} from "@/pages/fan/explore/FanExplorePage";
import type { FanExplorePerformance, FanExploreSort } from "@/types/fan/explore";
import {
  BAND_GENRE_BY_LABEL,
  BAND_REGION_BY_LABEL,
} from "@/utils/bandLabels";
import { addRecentSearch } from "./recentSearches";

const SORT_LABELS: Record<FanExploreSort, "정확도순" | "인기순"> = {
  ACCURACY: "정확도순",
  POPULAR: "인기순",
  RECOMMEND: "정확도순",
};

const getSortParam = (value: string | null): FanExploreSort => {
  if (value === "POPULAR") return "POPULAR";
  return "ACCURACY";
};

const getFilterLabelParam = (value: string | null) => value || "전체";

const getGenreFilterParam = (genre: string) => {
  if (genre === "전체") return undefined;
  return BAND_GENRE_BY_LABEL[genre] ?? genre;
};

const getRegionFilterParam = (region: string) => {
  if (region === "전체") return undefined;
  return BAND_REGION_BY_LABEL[region] ?? region;
};

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const toDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPerformanceDate = (performance: FanExplorePerformance) => {
  const dateValue =
    performance.startAt ??
    performance.startedAt ??
    performance.startDateTime ??
    performance.performanceDate ??
    performance.startDate;
  const timeValue =
    performance.performanceTime ?? performance.startTime ?? performance.time;

  if (dateValue && timeValue && !dateValue.includes("T")) {
    return toDate(`${dateValue}T${timeValue}`);
  }

  return toDate(dateValue);
};

const formatDateTime = (date: Date | null) => {
  if (!date) return "일정 미정";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day}. ${hour}:${minute}`;
};

const formatDday = (date: Date | null, status?: string | null) => {
  if (!date) return status ?? "준비중";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.ceil(
    (dateStart.getTime() - todayStart.getTime()) / 86_400_000,
  );

  if (diffDays < 0) return "종료";
  if (diffDays === 0) return "D-DAY";
  return `D-${diffDays}`;
};

const getPerformanceId = (performance: FanExplorePerformance) =>
  performance.performanceId ?? performance.concertId ?? performance.id;

const mergePerformances = (
  primaryPerformances: FanExplorePerformance[],
  fallbackPerformances: FanExplorePerformance[],
) => {
  const seenIds = new Set<string>();

  return [...primaryPerformances, ...fallbackPerformances].filter(
    (performance, index) => {
      const key = String(
        getPerformanceId(performance) ?? `${performance.title ?? ""}-${index}`,
      );

      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    },
  );
};

const ConcertMoreTopBar = ({ initialKeyword }: { initialKeyword: string }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword);
  const hasKeyword = keyword.length > 0;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    navigate(
      `/fan/explore/search/results/concerts?q=${encodeURIComponent(
        trimmedKeyword,
      )}`,
      { replace: true },
    );
  };

  return (
    <>
      <Header title="" />

      <form
        role="search"
        onSubmit={submitSearch}
        className="mx-3.75 mt-2.5 flex h-9 items-center rounded-full border border-neutral-500 bg-neutral-0 px-3.75"
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
    </>
  );
};

const FanExploreConcertMorePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "WAVY";
  const sort = getSortParam(searchParams.get("sort"));
  const shouldHighlightSort =
    sort === "POPULAR" || searchParams.get("sortSelected") === "1";
  const appliedFilters: AppliedExploreFilters = {
    genre: getFilterLabelParam(searchParams.get("genre")),
    region: getFilterLabelParam(searchParams.get("region")),
    content: "공연",
  };
  const performancesQuery = useFanExplorePerformanceSearchQuery({
    keyword,
    sort,
    genre: getGenreFilterParam(appliedFilters.genre),
    region: getRegionFilterParam(appliedFilters.region),
    size: 30,
  });
  const allSearchQuery = useFanExploreSearchQuery({
    keyword,
    type: "ALL",
    sort,
    genre: getGenreFilterParam(appliedFilters.genre),
    region: getRegionFilterParam(appliedFilters.region),
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = performancesQuery;
  const pagedConcerts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const concerts = useMemo(
    () => mergePerformances(pagedConcerts, allSearchQuery.data?.performances ?? []),
    [allSearchQuery.data?.performances, pagedConcerts],
  );
  const totalCount = concerts.length;
  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });
  const isInitialLoading =
    isLoading && allSearchQuery.isLoading && concerts.length === 0;
  const isPerformanceError =
    isError && allSearchQuery.isError && concerts.length === 0;

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <ConcertMoreTopBar initialKeyword={keyword} />
      <ExploreFilterBar
        appliedFilters={appliedFilters}
        appliedSort={SORT_LABELS[sort]}
        highlightSort={shouldHighlightSort}
      />

      <section className="px-[25px] pt-[16px]">
        <h1 className="m-0 flex items-center gap-[8px] font-body text-label1 text-neutral-900">
          공연
          <span className="font-body text-body5 text-neutral-600">
            총 {totalCount}개
          </span>
        </h1>

        <div className="mt-[16px] flex flex-col gap-[12px]">
          {isInitialLoading ? (
            <p className="m-0 font-body text-caption2 text-neutral-600">
              공연을 불러오는 중이에요
            </p>
          ) : isPerformanceError ? (
            <button
              type="button"
              onClick={() => {
                void performancesQuery.refetch();
                void allSearchQuery.refetch();
              }}
              className="font-body text-caption2 text-primary-400"
            >
              공연 다시 불러오기
            </button>
          ) : (
            concerts.map((concert) => {
              const concertId = getPerformanceId(concert);
              const date = getPerformanceDate(concert);
              const title =
                concert.performanceTitle ??
                concert.performanceName ??
                concert.concertTitle ??
                concert.concertName ??
                concert.title ??
                concert.name ??
                `${keyword} 공연`;
              const poster =
                concert.posterImageUrl ??
                concert.posterUrl ??
                concert.posterImage ??
                concert.performancePosterUrl ??
                concert.performanceImageUrl ??
                concert.imageUrl ??
                concert.thumbnailUrl;

              return (
                <ConcertCard
                  key={String(concertId ?? title)}
                  showThumbnail={Boolean(poster)}
                  thumbnailSrc={poster ?? undefined}
                  month={date ? MONTH_LABELS[date.getMonth()] : "TBD"}
                  day={date ? String(date.getDate()).padStart(2, "0") : "--"}
                  title={title}
                  location={
                    concert.location ??
                    concert.venue ??
                    concert.place ??
                    "공연 장소 미정"
                  }
                  dateTime={formatDateTime(date)}
                  status={
                    <span className="text-primary-500">
                      {formatDday(date, concert.status)}
                    </span>
                  }
                  onClick={() => {
                    if (concertId != null) {
                      navigate(`/fan/home/concerts/${concertId}`);
                    }
                  }}
                  ariaLabel={`${title} 상세보기`}
                />
              );
            })
          )}
        </div>
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </section>
    </main>
  );
};

export default FanExploreConcertMorePage;
