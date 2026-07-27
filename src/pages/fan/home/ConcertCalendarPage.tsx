import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";
import ConcertLikeButton from "@/components/fan/home/ConcertLikeButton";
import {
  usePerformanceCalendarQuery,
  usePerformancesByDateInfiniteQuery,
} from "@/hooks/api/fan/useFanHome";
import type {
  FanHomeConcert,
  PerformanceCalendarDateItem,
  PerformanceCalendarParams,
} from "@/types/fan/home";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
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

type CalendarDay = {
  date: Date;
  dateKey: string;
  label: string;
  muted: boolean;
  sunday: boolean;
  selected: boolean;
  hasEvent: boolean;
};

type CalendarPerformance = {
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

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const normalizeDateKey = (value?: string | null) => {
  if (!value) return null;

  const datePart = value.split(/[T ]/)[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : formatDateKey(date);
};

const getCalendarDateKey = (item: PerformanceCalendarDateItem) => {
  if (typeof item === "string") {
    return normalizeDateKey(item);
  }

  const dateValue =
    item.dateKey ??
    item.date ??
    item.performanceDate ??
    item.startDate ??
    item.startAt ??
    item.startDateTime;

  if (dateValue) {
    return normalizeDateKey(dateValue);
  }

  if (
    typeof item.year === "number" &&
    typeof item.month === "number" &&
    typeof item.day === "number"
  ) {
    return `${item.year}-${String(item.month).padStart(2, "0")}-${String(
      item.day,
    ).padStart(2, "0")}`;
  }

  return null;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const toDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

const getPerformanceThumbnailUrl = (performance: FanHomeConcert) => {
  return (
    firstImageUrl(
      performance.posterImageUrl,
      performance.posterUrl,
      performance.posterImage,
      performance.performancePosterUrl,
      performance.performanceImageUrl,
      performance.imageUrl,
      performance.mainImageUrl,
      performance.thumbnailUrl,
      performance.thumbnailImageUrl,
    ) ?? firstMediaUrl(performance.imageUrls)
  );
};

const getPerformanceDate = (performance: FanHomeConcert) => {
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

const getPerformanceTitle = (performance: FanHomeConcert) => {
  return (
    performance.performanceTitle ??
    performance.performanceName ??
    performance.concertTitle ??
    performance.concertName ??
    performance.showTitle ??
    performance.showName ??
    performance.name ??
    performance.title ??
    "공연명"
  );
};

const mapPerformanceToCalendarItem = (
  performance: FanHomeConcert,
  index: number,
): CalendarPerformance => {
  const date = getPerformanceDate(performance);
  const thumbnailSrc = getPerformanceThumbnailUrl(performance);

  return {
    id: String(
      performance.performanceId ??
        performance.concertId ??
        performance.id ??
        `calendar-performance-${index}`,
    ),
    month: date ? MONTH_LABELS[date.getMonth()] : "TBD",
    day: date ? String(date.getDate()).padStart(2, "0") : "--",
    title: getPerformanceTitle(performance),
    location:
      performance.location ?? performance.venue ?? performance.place ?? "공연 장소 미정",
    dateTime: formatDateTime(date),
    status: performance.status ?? getDday(date, performance.status),
    thumbnailSrc,
    showThumbnail: Boolean(thumbnailSrc),
    isInterested: performance.isInterested ?? false,
  };
};

const getCalendarDays = (
  displayedMonth: Date,
  selectedDateKey: string | null,
  eventDateKeys: Set<string>,
): CalendarDay[] => {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const startOffset = firstDate.getDay();
  const cellCount = Math.ceil((startOffset + lastDate.getDate()) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - startOffset + 1);
    const dateKey = formatDateKey(date);
    const muted = date.getMonth() !== month;
    const hasEvent = eventDateKeys.has(dateKey);

    return {
      date,
      dateKey,
      label: String(date.getDate()),
      muted,
      sunday: !muted && date.getDay() === 0,
      selected: !muted && dateKey === selectedDateKey,
      hasEvent: !muted && hasEvent,
    };
  });
};

const ChevronIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={direction === "left" ? "M15 6L9 12L15 18" : "M9 6L15 12L9 18"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ConcertCalendarPage = () => {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState(
    () => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), 1);
    },
  );
  const [hasMovedMonth, setHasMovedMonth] = useState(false);
  const calendarParams = useMemo<PerformanceCalendarParams>(
    () =>
      hasMovedMonth
        ? {
            year: displayedMonth.getFullYear(),
            month: displayedMonth.getMonth() + 1,
          }
        : {},
    [displayedMonth, hasMovedMonth],
  );
  const calendarQuery = usePerformanceCalendarQuery(calendarParams);
  const performancesByDateQuery = usePerformancesByDateInfiniteQuery(
    selectedDateKey
      ? {
          date: selectedDateKey,
        }
      : {},
    10,
  );
  const {
    data: performancesByDate,
    fetchNextPage,
    hasNextPage,
    isError: isPerformancesByDateError,
    isFetchingNextPage,
    isLoading: isPerformancesByDateLoading,
    refetch: refetchPerformancesByDate,
  } = performancesByDateQuery;
  const eventDateKeys = useMemo(
    () =>
      new Set(
        (calendarQuery.data?.items ?? [])
          .map(getCalendarDateKey)
          .filter((dateKey): dateKey is string => Boolean(dateKey)),
      ),
    [calendarQuery.data],
  );
  const calendarDays = useMemo(
    () => getCalendarDays(displayedMonth, selectedDateKey, eventDateKeys),
    [displayedMonth, eventDateKeys, selectedDateKey],
  );
  const monthLabel = `${displayedMonth.getFullYear()}년 ${String(
    displayedMonth.getMonth() + 1,
  ).padStart(2, "0")}월`;
  const selectedEvents = useMemo(() => {
    return (
      performancesByDate?.pages
        .flatMap((page) => page.items ?? [])
        .map(mapPerformanceToCalendarItem) ?? []
    );
  }, [performancesByDate]);
  const selectedEventsTotal =
    performancesByDate?.pages[0]?.totalCount ??
    performancesByDate?.pages[0]?.totalElements ??
    performancesByDate?.pages[0]?.total ??
    selectedEvents.length;

  useEffect(() => {
    if (!selectedDateKey) return;

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, selectedDateKey]);

  const moveMonth = (amount: number) => {
    setHasMovedMonth(true);
    setDisplayedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
    setSelectedDateKey(null);
  };

  const handleDateClick = (dateKey: string) => {
    setSelectedDateKey((currentDateKey) =>
      currentDateKey === dateKey ? null : dateKey,
    );
  };

  const selectedDate = selectedDateKey ? parseDateKey(selectedDateKey) : null;
  const selectedDateLabel = selectedDate
    ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${WEEKDAYS[selectedDate.getDay()]})`
    : "";

  return (
    <main className="min-h-dvh bg-neutral-0 px-[15px] pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="-mx-[15px] flex h-[60px] items-center justify-between px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">
          공연 일정
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <section className="mt-6 mx-[16px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => moveMonth(-1)}
            className="flex size-6 items-center justify-center text-neutral-900"
          >
            <ChevronIcon direction="left" />
          </button>

          <h2 className="m-0 font-body text-label1 text-neutral-900">
            {monthLabel}
          </h2>

          <button
            type="button"
            aria-label="다음 달"
            onClick={() => moveMonth(1)}
            className="flex size-6 items-center justify-center text-neutral-900"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-[repeat(7,28px)] justify-between gap-x-5 text-center">
          {WEEKDAYS.map((weekday) => (
            <span
              key={weekday}
              className="font-body text-caption3 text-neutral-900"
            >
              {weekday}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-[repeat(7,28px)] justify-between gap-x-5 gap-y-7 text-center">
          {calendarDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="flex justify-center"
            >
              <button
                type="button"
                disabled={day.muted || !day.hasEvent}
                onClick={() => handleDateClick(day.dateKey)}
                className={`relative flex size-7 items-center justify-center rounded-full font-body text-caption3 ${
                  day.selected
                    ? "bg-primary-50 text-primary-400"
                    : day.muted
                    ? "text-neutral-500"
                    : day.sunday
                      ? "text-error"
                      : "text-neutral-900"
                } ${day.hasEvent ? "cursor-pointer" : "cursor-default"}`}
              >
                {day.label}
                {day.hasEvent ? (
                  <span className="absolute bottom-[-1.5px] size-1 rounded-full bg-primary-400" />
                ) : null}
              </button>
            </div>
          ))}
        </div>

        {calendarQuery.isLoading ? (
          <p className="m-0 mt-8 text-center font-body text-body3 text-neutral-600">
            공연 일정을 불러오는 중이에요
          </p>
        ) : null}

        {calendarQuery.isError ? (
          <div className="mt-8 rounded-[12px] bg-neutral-50 px-4 py-6 text-center">
            <p className="m-0 font-body text-body3 text-neutral-700">
              공연 일정을 불러오지 못했어요
            </p>
            <button
              type="button"
              onClick={() => void calendarQuery.refetch()}
              className="mt-3 rounded-[8px] bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
            >
              다시 시도
            </button>
          </div>
        ) : null}
      </section>

      {selectedDateKey ? (
        <>
          <button
            type="button"
            aria-label="일정 목록 닫기"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setSelectedDateKey(null)}
          />

          <section className="fixed inset-x-0 bottom-0 z-50 h-[488px] overflow-y-auto rounded-t-[24px] bg-neutral-0 px-[22.5px] pt-3 pb-8 shadow-[0_-5px_10px_0_rgba(0,0,0,0.10)]">
            <div className="mx-auto h-1 w-11 rounded-full bg-neutral-300" />

            <header className="mt-6 flex items-center justify-between">
              <h2 className="mx-0 font-body text-label1 text-neutral-900">
                {selectedDateLabel}
              </h2>
              <span className="font-body text-caption3 text-neutral-600">
                총 {selectedEventsTotal}개
              </span>
            </header>

            <div className="mt-4 flex flex-col gap-3">
              {isPerformancesByDateLoading ? (
                <p className="m-0 py-6 text-center font-body text-body3 text-neutral-600">
                  공연을 불러오는 중이에요
                </p>
              ) : null}

              {isPerformancesByDateError ? (
                <div className="rounded-[12px] bg-neutral-50 px-4 py-6">
                  <p className="m-0 font-body text-body3 text-neutral-700">
                    공연을 불러오지 못했어요
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetchPerformancesByDate()}
                    className="mt-3 rounded-[8px] bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
                  >
                    다시 시도
                  </button>
                </div>
              ) : null}

              {!isPerformancesByDateLoading &&
              !isPerformancesByDateError &&
              selectedEvents.length === 0 ? (
                <p className="m-0 py-6 text-center font-body text-body3 text-neutral-600">
                  선택한 날짜의 공연이 없어요
                </p>
              ) : null}

              {selectedEvents.map((event) => (
                <ConcertCard
                  key={event.id}
                  month={event.month}
                  day={event.day}
                  title={event.title}
                  location={event.location}
                  dateTime={event.dateTime}
                  status={
                    <span className="text-primary-500">{event.status}</span>
                  }
                  dateBadgeClassName="bg-primary-300"
                  isPending={event.status === "준비중"}
                  thumbnailSrc={event.thumbnailSrc}
                  showThumbnail={event.showThumbnail}
                  actions={
                    <ConcertLikeButton
                      concertId={event.id}
                      concertTitle={event.title}
                      isInterested={event.isInterested}
                    />
                  }
                  onClick={() => navigate(`/fan/home/concerts/${event.id}`)}
                  ariaLabel={`${event.title} 상세보기`}
                />
              ))}

              <div ref={loadMoreRef} className="h-4 w-full" />

              {isFetchingNextPage ? (
                <p className="m-0 text-center font-body text-caption2 text-neutral-600">
                  더 불러오는 중이에요
                </p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
};

export default ConcertCalendarPage;
