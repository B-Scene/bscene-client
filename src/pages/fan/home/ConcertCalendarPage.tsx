import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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
  title: string;
  location: string;
  dateTime: string;
  status: string;
};

const PERFORMANCES_BY_DATE: Record<string, CalendarPerformance[]> = {
  "2026-05-02": [
    {
      id: "calendar-20260502-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.05.02. 18:00",
      status: "D-22",
    },
  ],
  "2026-05-11": [
    {
      id: "calendar-20260511-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.05.11. 18:00",
      status: "D-13",
    },
  ],
  "2026-05-17": Array.from({ length: 4 }, (_, index) => ({
    id: `calendar-20260517-${index + 1}`,
    title: "WAVY 단독 공연",
    location: "홍대 롤링홀",
    dateTime: "2026.05.17. 18:00",
    status: "D-7",
  })),
  "2026-05-24": [
    {
      id: "calendar-20260524-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.05.24. 18:00",
      status: "D-DAY",
    },
  ],
  "2026-06-03": [
    {
      id: "calendar-20260603-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.06.03. 18:00",
      status: "D-7",
    },
  ],
  "2026-06-14": [
    {
      id: "calendar-20260614-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.06.14. 18:00",
      status: "D-7",
    },
  ],
  "2026-06-19": [
    {
      id: "calendar-20260619-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.06.19. 18:00",
      status: "D-7",
    },
  ],
  "2026-06-26": [
    {
      id: "calendar-20260626-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.06.26. 18:00",
      status: "D-7",
    },
  ],
  "2026-07-05": [
    {
      id: "calendar-20260705-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.07.05. 18:00",
      status: "D-7",
    },
  ],
  "2026-07-17": [
    {
      id: "calendar-20260717-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.07.17. 18:00",
      status: "D-7",
    },
  ],
  "2026-07-22": [
    {
      id: "calendar-20260722-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.07.22. 18:00",
      status: "D-7",
    },
  ],
  "2026-07-29": [
    {
      id: "calendar-20260729-1",
      title: "WAVY 단독 공연",
      location: "홍대 롤링홀",
      dateTime: "2026.07.29. 18:00",
      status: "D-7",
    },
  ],
};

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const getCalendarDays = (
  displayedMonth: Date,
  selectedDateKey: string | null,
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
    const hasEvent = (PERFORMANCES_BY_DATE[dateKey]?.length ?? 0) > 0;

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
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(2026, 5, 1),
  );
  const calendarDays = useMemo(
    () => getCalendarDays(displayedMonth, selectedDateKey),
    [displayedMonth, selectedDateKey],
  );
  const selectedEvents = selectedDateKey
    ? (PERFORMANCES_BY_DATE[selectedDateKey] ?? [])
    : [];
  const monthLabel = `${displayedMonth.getFullYear()}.${String(
    displayedMonth.getMonth() + 1,
  ).padStart(2, "0")}`;

  const moveMonth = (amount: number) => {
    setDisplayedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
    setSelectedDateKey(null);
  };

  const selectedDate = selectedDateKey ? parseDateKey(selectedDateKey) : null;
  const selectedDateLabel = selectedDate
    ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 (${WEEKDAYS[selectedDate.getDay()]})`
    : "";

  return (
    <main className="min-h-dvh bg-neutral-0 px-[15px] pb-[calc(var(--bottom-nav-height)+24px)] pt-7">
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
          관심 공연
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <section className="mt-6">
        <div className="flex items-center justify-between px-6">
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
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`relative flex size-7 items-center justify-center rounded-full font-body text-caption3 ${
                  day.selected ? "bg-neutral-300" : ""
                } ${
                  day.muted
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
      </section>

      {selectedDateKey ? (
        <section className="fixed inset-x-0 bottom-0 z-30 h-[488px] rounded-t-[24px] bg-neutral-0 px-[22.5px] pt-3 shadow-[0_-5px_10px_0_rgba(0,0,0,0.10)]">
          <div className="mx-auto h-1 w-11 rounded-full bg-neutral-300" />

          <header className="mt-6 flex items-center justify-between">
            <h2 className="mx-0 font-body text-label1 text-neutral-900">
              {selectedDateLabel}
            </h2>
            <span className="font-body text-caption3 text-neutral-600">
              총 {selectedEvents.length}개
            </span>
          </header>

          <div className="mt-4 flex flex-col gap-3">
            {selectedEvents.map((event) => (
              <ConcertCard
                key={event.id}
                title={event.title}
                location={event.location}
                dateTime={event.dateTime}
                status={<span className="text-primary-500">{event.status}</span>}
                showThumbnail
                onClick={() => navigate(`/fan/home/concerts/${event.id}`)}
                ariaLabel={`${event.title} 상세보기`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default ConcertCalendarPage;
