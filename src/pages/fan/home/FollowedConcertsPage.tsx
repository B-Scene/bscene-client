import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { Header } from "@/components/common/Header/Header";
import ConcertLikeButton from "@/components/fan/home/ConcertLikeButton";
import {
  useFanHomeQuery,
  useRecommendedPerformancesInfiniteQuery,
  useUpcomingPerformancesInfiniteQuery,
} from "@/hooks/api/fan/useFanHome";
import type {
  FanHomeConcert,
  RecommendedPerformanceSort,
  UpcomingPerformanceSort,
} from "@/types/fan/home";

const UPCOMING_SORT_OPTIONS = ["공연임박순", "최신순", "인기순"] as const;
const RECOMMENDED_SORT_OPTIONS = ["인기순", "공연임박순"] as const;
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

type UpcomingSortOption = (typeof UPCOMING_SORT_OPTIONS)[number];
type RecommendedSortOption = (typeof RECOMMENDED_SORT_OPTIONS)[number];
type SortOption = UpcomingSortOption | RecommendedSortOption;
type ConcertListItem = {
  id: string;
  date: Date | null;
  month: string;
  day: string;
  title: string;
  location: string;
  dateTime: string;
  status: string;
  thumbnailSrc?: string;
  showThumbnail: boolean;
  isInterested: boolean;
};

const UPCOMING_SORT_TO_API: Record<UpcomingSortOption, UpcomingPerformanceSort> = {
  공연임박순: "IMMINENT",
  최신순: "LATEST",
  인기순: "POPULAR",
};

const RECOMMENDED_SORT_TO_API: Record<RecommendedSortOption, RecommendedPerformanceSort> = {
  인기순: "POPULAR",
  공연임박순: "IMMINENT",
};

const firstImageUrl = (...values: Array<string | null | undefined>) => {
  return values.find((value): value is string => Boolean(value));
};

const firstMediaUrl = (
  ...values: Array<string[] | string | null | undefined>
) => {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value[0];
    if (typeof value === "string" && value) return value;
  }

  return undefined;
};

const getConcertThumbnailUrl = (concert: FanHomeConcert) => {
  return (
    firstImageUrl(
      concert.posterImageUrl,
      concert.posterUrl,
      concert.posterImage,
      concert.performancePosterUrl,
      concert.performanceImageUrl,
      concert.imageUrl,
      concert.mainImageUrl,
      concert.thumbnailUrl,
      concert.thumbnailImageUrl,
    ) ?? firstMediaUrl(concert.imageUrls)
  );
};

const toDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getConcertDate = (concert: FanHomeConcert) => {
  const dateValue =
    concert.startAt ??
    concert.startedAt ??
    concert.startDateTime ??
    concert.performanceDate ??
    concert.startDate;
  const timeValue = concert.performanceTime ?? concert.startTime ?? concert.time;

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

const getDday = (date: Date | null, status?: string | null) => {
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

const getConcertTitle = (concert: FanHomeConcert) => {
  return (
    concert.performanceTitle ??
    concert.performanceName ??
    concert.concertTitle ??
    concert.concertName ??
    concert.showTitle ??
    concert.showName ??
    concert.name ??
    concert.title ??
    "공연명"
  );
};

const getPerformanceKey = (concert: FanHomeConcert) => {
  const id = concert.performanceId ?? concert.concertId ?? concert.id;

  return id == null ? null : String(id);
};

const dedupePerformancesById = (performances: FanHomeConcert[]) => {
  const seenIds = new Set<string>();

  return performances.filter((performance) => {
    const id = getPerformanceKey(performance);

    if (id == null) return true;
    if (seenIds.has(id)) return false;

    seenIds.add(id);
    return true;
  });
};

const mapPerformanceToConcert = (
  concert: FanHomeConcert,
  index: number,
): ConcertListItem => {
  const date = getConcertDate(concert);
  const thumbnailSrc = getConcertThumbnailUrl(concert);

  return {
    id: String(
      concert.performanceId ?? concert.concertId ?? concert.id ?? `concert-${index}`,
    ),
    date,
    month: date ? MONTH_LABELS[date.getMonth()] : "TBD",
    day: date ? String(date.getDate()).padStart(2, "0") : "--",
    title: getConcertTitle(concert),
    location: concert.location ?? concert.venue ?? concert.place ?? "공연 장소 미정",
    dateTime: formatDateTime(date),
    status: concert.status ?? getDday(date, concert.status),
    thumbnailSrc,
    showThumbnail: Boolean(thumbnailSrc),
    isInterested: concert.isInterested ?? false,
  };
};

const isUpcomingConcert = (concert: ConcertListItem) => {
  if (["종료", "COMPLETED", "ENDED", "FINISHED"].includes(concert.status)) {
    return false;
  }

  if (!concert.date) return true;

  return concert.date.getTime() >= Date.now();
};

const SortArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="7"
    viewBox="0 0 12 7"
    fill="none"
    aria-hidden="true"
    className="h-[7px] w-[12px]"
  >
    <path
      d="M1 1L6 6L11 1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12.5L9.5 17L19 7"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FollowedConcertsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>("공연임박순");
  const [hasSelectedSort, setHasSelectedSort] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const fanHomeQuery = useFanHomeQuery();
  const isRecommendedRequested = searchParams.get("type") === "recommended";
  const shouldUseRecommendedApi =
    isRecommendedRequested ||
    fanHomeQuery.data?.performanceType === "RECOMMENDED" ||
    fanHomeQuery.data?.hasFollowingBands === false;
  const canResolvePerformanceSource =
    isRecommendedRequested || fanHomeQuery.isSuccess || fanHomeQuery.isError;
  const availableSortOptions = shouldUseRecommendedApi
    ? RECOMMENDED_SORT_OPTIONS
    : UPCOMING_SORT_OPTIONS;
  const defaultSort = shouldUseRecommendedApi ? "인기순" : "공연임박순";
  const requestedSort = hasSelectedSort ? selectedSort : defaultSort;
  const effectiveSort = availableSortOptions.some((option) => option === requestedSort)
    ? requestedSort
    : defaultSort;
  const upcomingSort =
    UPCOMING_SORT_TO_API[effectiveSort as UpcomingSortOption] ?? "IMMINENT";
  const recommendedSort =
    RECOMMENDED_SORT_TO_API[effectiveSort as RecommendedSortOption] ?? "POPULAR";
  const upcomingPerformancesQuery = useUpcomingPerformancesInfiniteQuery(
    upcomingSort,
    10,
    canResolvePerformanceSource && !shouldUseRecommendedApi,
  );
  const recommendedPerformancesQuery = useRecommendedPerformancesInfiniteQuery(
    recommendedSort,
    10,
    canResolvePerformanceSource && shouldUseRecommendedApi,
  );
  const activePerformancesQuery = shouldUseRecommendedApi
    ? recommendedPerformancesQuery
    : upcomingPerformancesQuery;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = activePerformancesQuery;
  const sortButtonClassName = `flex shrink-0 flex-col items-center gap-2.5 rounded-full border px-[10px] py-1 font-body text-caption3 ${
    hasSelectedSort
      ? "border-primary-400 bg-primary-0 text-primary-400"
      : "border-neutral-400 bg-neutral-0 text-neutral-600"
  }`;
  const handleSortSelect = (option: SortOption) => {
    setSelectedSort(option);
    setHasSelectedSort(true);
  };
  const concerts = useMemo(() => {
    const performances = data?.pages.flatMap((page) => page.items ?? []) ?? [];
    const normalizedPerformances = shouldUseRecommendedApi
      ? dedupePerformancesById(performances)
      : performances;

    return normalizedPerformances
      .map(mapPerformanceToConcert)
      .filter(isUpcomingConcert);
  }, [data, shouldUseRecommendedApi]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (
        entry?.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        void fetchNextPage();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  const isPageLoading = !canResolvePerformanceSource || isLoading;
  const isPageError = isError;

  return (
    <main className="min-h-dvh bg-neutral-0 px-[15px] pb-[calc(var(--bottom-nav-height)+24px)]">
      <Header
        title={shouldUseRecommendedApi ? "추천 공연" : "공연 일정"}
        align="betweenCompact"
        className="-mx-3.75"
      />

      <div className="mt-[11px] flex h-10 items-center justify-between pl-0.5 pr-[3px]">
        <button
          type="button"
          onClick={() => setIsSortSheetOpen(true)}
          className={sortButtonClassName}
        >
          <span className="flex items-center gap-1">
            {effectiveSort}
            <SortArrowIcon />
          </span>
        </button>
      </div>

      <section className="mt-2 flex flex-col items-center gap-3">
        {isPageLoading ? (
          <p className="m-0 w-full py-6 text-center font-body text-body3 text-neutral-600">
            공연을 불러오는 중이에요
          </p>
        ) : null}

        {isPageError ? (
          <div className="w-full rounded-[12px] bg-neutral-50 px-4 py-6">
            <p className="m-0 font-body text-body3 text-neutral-700">
              공연을 불러오지 못했어요
            </p>
            <button
              type="button"
              onClick={() => {
                void refetch();
                void fanHomeQuery.refetch();
              }}
              className="mt-3 rounded-[8px] bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {concerts.map((concert) => (
          <ConcertCard
            key={concert.id}
            month={concert.month}
            day={concert.day}
            title={concert.title}
            location={concert.location}
            dateTime={concert.dateTime}
            status={<span className="text-primary-500">{concert.status}</span>}
            dateBadgeClassName="bg-primary-300"
            isPending={concert.status === "준비중"}
            thumbnailSrc={concert.thumbnailSrc}
            showThumbnail={concert.showThumbnail}
            actions={
              <ConcertLikeButton
                concertId={concert.id}
                concertTitle={concert.title}
                isInterested={concert.isInterested}
              />
            }
            onClick={() => navigate(`/fan/home/concerts/${concert.id}`)}
            ariaLabel={`${concert.title} 상세보기`}
          />
        ))}

        <div ref={loadMoreRef} className="h-4 w-full" />

        {isFetchingNextPage ? (
          <p className="m-0 text-center font-body text-caption2 text-neutral-600">
            더 불러오는 중이에요
          </p>
        ) : null}
      </section>

      {isSortSheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/50">
          <button
            type="button"
            aria-label="정렬 옵션 닫기"
            className="absolute inset-0"
            onClick={() => setIsSortSheetOpen(false)}
          />

          <section
            aria-label="공연 정렬 옵션"
            className="relative z-10 flex w-full max-w-[393px] flex-col items-start gap-2.5 rounded-t-[24px] bg-neutral-0 px-[15px] pb-12 pt-8"
          >
            <div className="flex w-full flex-col items-start gap-6 px-[15px]">
              {availableSortOptions.map((option) => {
                const isSelected = option === effectiveSort;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      handleSortSelect(option);
                      setIsSortSheetOpen(false);
                    }}
                    className={`flex w-full items-center justify-between text-left font-body text-label2 ${
                      isSelected ? "text-primary-400" : "text-neutral-900"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center text-primary-400">
                        <CheckIcon />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
};

export default FollowedConcertsPage;
