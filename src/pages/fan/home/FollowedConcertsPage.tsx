import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { Header } from "@/components/common/Header/Header";
import ConcertLikeButton from "@/components/fan/home/ConcertLikeButton";
import {
  useFanHomeQuery,
  useUpcomingPerformancesInfiniteQuery,
} from "@/hooks/api/fan/useFanHome";
import type {
  FanHomeConcert,
  FanHomeResponse,
  UpcomingPerformanceSort,
} from "@/types/fan/home";

const SORT_OPTIONS = ["공연임박순", "최신순", "인기순"] as const;
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

type SortOption = (typeof SORT_OPTIONS)[number];
type ConcertListItem = {
  id: string;
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

const SORT_TO_API: Record<SortOption, UpcomingPerformanceSort> = {
  공연임박순: "IMMINENT",
  최신순: "LATEST",
  인기순: "POPULAR",
};

const firstList = <T,>(...lists: Array<T[] | undefined>) => {
  return lists.find((list) => Array.isArray(list) && list.length > 0) ?? [];
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

const getHomeRecommendedPerformances = (data?: FanHomeResponse) => {
  return firstList(
    data?.performances,
    data?.recommendedConcerts,
    data?.recommendConcerts,
    data?.popularConcerts,
  );
};

const sortPerformances = (
  performances: FanHomeConcert[],
  selectedSort: SortOption,
) => {
  return [...performances].sort((a, b) => {
    if (selectedSort === "최신순") {
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    }

    if (selectedSort === "인기순") {
      return (b.popularity ?? 0) - (a.popularity ?? 0);
    }

    const aDate = getConcertDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDate = getConcertDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;

    return aDate - bDate;
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

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M19 4H17V3C17 2.73478 16.8946 2.48043 16.7071 2.29289C16.5196 2.10536 16.2652 2 16 2C15.7348 2 15.4804 2.10536 15.2929 2.29289C15.1054 2.48043 15 2.73478 15 3V4H9V3C9 2.73478 8.89464 2.48043 8.70711 2.29289C8.51957 2.10536 8.26522 2 8 2C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V4H5C4.20435 4 3.44129 4.31607 2.87868 4.87868C2.31607 5.44129 2 6.20435 2 7V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V7C22 6.20435 21.6839 5.44129 21.1213 4.87868C20.5587 4.31607 19.7956 4 19 4ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V12H20V19ZM20 10H4V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H7V7C7 7.26522 7.10536 7.51957 7.29289 7.70711C7.48043 7.89464 7.73478 8 8 8C8.26522 8 8.51957 7.89464 8.70711 7.70711C8.89464 7.51957 9 7.26522 9 7V6H15V7C15 7.26522 15.1054 7.51957 15.2929 7.70711C15.4804 7.89464 15.7348 8 16 8C16.2652 8 16.5196 7.89464 16.7071 7.70711C16.8946 7.51957 17 7.26522 17 7V6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7V10Z"
      fill="currentColor"
    />
  </svg>
);

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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>("공연임박순");
  const [hasSelectedSort, setHasSelectedSort] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const fanHomeQuery = useFanHomeQuery();
  const upcomingPerformancesQuery = useUpcomingPerformancesInfiniteQuery(
    SORT_TO_API[selectedSort],
    10,
  );
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = upcomingPerformancesQuery;
  const isRecommendedFallback = fanHomeQuery.data?.hasFollowingBands !== true;
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
    if (isRecommendedFallback) {
      return sortPerformances(
        getHomeRecommendedPerformances(fanHomeQuery.data),
        selectedSort,
      ).map(mapPerformanceToConcert);
    }

    return (
      data?.pages.flatMap((page) => page.items ?? []).map(mapPerformanceToConcert) ??
      []
    );
  }, [data, fanHomeQuery.data, isRecommendedFallback, selectedSort]);

  useEffect(() => {
    if (isRecommendedFallback) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRecommendedFallback]);

  const isPageLoading =
    isRecommendedFallback
      ? fanHomeQuery.isLoading
      : isLoading || (fanHomeQuery.isLoading && concerts.length === 0);
  const isPageError = isRecommendedFallback ? fanHomeQuery.isError : isError;

  return (
    <main className="min-h-dvh bg-neutral-0 px-[15px] pb-[calc(var(--bottom-nav-height)+24px)]">
      <Header
        title="공연 일정"
        align="betweenCompact"
        className="-mx-3.75"
        rightContent={
          <button
            type="button"
            aria-label="공연 일정"
            onClick={() => navigate("/fan/home/concerts/calendar")}
            className="flex size-6 items-center justify-center text-neutral-900"
          >
            <CalendarIcon />
          </button>
        }
      />

      <div className="mt-[11px] flex h-10 items-center justify-between pl-0.5 pr-[3px]">
        <button
          type="button"
          onClick={() => setIsSortSheetOpen(true)}
          className={sortButtonClassName}
        >
          <span className="flex items-center gap-1">
            {selectedSort}
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

        {!isRecommendedFallback ? (
          <div ref={loadMoreRef} className="h-4 w-full" />
        ) : null}

        {isFetchingNextPage && !isRecommendedFallback ? (
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
              {SORT_OPTIONS.map((option) => {
                const isSelected = option === selectedSort;

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
