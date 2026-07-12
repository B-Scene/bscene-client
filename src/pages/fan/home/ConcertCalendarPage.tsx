import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarDay = {
  date: Date;
  label: string;
  muted: boolean;
  sunday: boolean;
  selected: boolean;
  hasEvent: boolean;
};

const EVENT_DAYS_BY_MONTH: Record<string, number[]> = {
  "2026-05": [2, 11, 17, 24],
  "2026-06": [3, 14, 19, 26],
  "2026-07": [5, 17, 22, 29],
};

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getCalendarDays = (displayedMonth: Date): CalendarDay[] => {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const startOffset = firstDate.getDay();
  const cellCount = Math.ceil((startOffset + lastDate.getDate()) / 7) * 7;
  const eventDays = EVENT_DAYS_BY_MONTH[getMonthKey(displayedMonth)] ?? [
    3, 14, 19, 26,
  ];

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - startOffset + 1);
    const muted = date.getMonth() !== month;

    return {
      date,
      label: String(date.getDate()),
      muted,
      sunday: !muted && date.getDay() === 0,
      selected: !muted && date.getDate() === 11,
      hasEvent: !muted && eventDays.includes(date.getDate()),
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
  const [selectedEventDate, setSelectedEventDate] = useState<Date | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(2026, 5, 1),
  );
  const calendarDays = useMemo(
    () => getCalendarDays(displayedMonth),
    [displayedMonth],
  );
  const monthLabel = `${displayedMonth.getFullYear()}.${String(
    displayedMonth.getMonth() + 1,
  ).padStart(2, "0")}`;

  const moveMonth = (amount: number) => {
    setDisplayedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
    setSelectedEventDate(null);
  };

  const selectedDateLabel = selectedEventDate
    ? `${selectedEventDate.getMonth() + 1}월 ${selectedEventDate.getDate()}일 (${WEEKDAYS[selectedEventDate.getDay()]})`
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
                onClick={() => setSelectedEventDate(day.date)}
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

      {selectedEventDate ? (
        <section className="fixed inset-x-0 bottom-0 z-30 h-[488px] rounded-t-[24px] bg-neutral-0 px-[22.5px] pt-3 shadow-[0_-5px_10px_0_rgba(0,0,0,0.10)]">
          <div className="mx-auto h-1 w-11 rounded-full bg-neutral-300" />

          <header className="mt-6 flex items-center justify-between">
            <h2 className="mx-0 font-body text-label1 text-neutral-900">
              {selectedDateLabel}
            </h2>
            <span className="font-body text-caption3 text-neutral-600">
              총 4개
            </span>
          </header>

          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <ConcertCard
                key={index}
                title="WAVY 단독 공연"
                location="홍대 롤링홀"
                dateTime="2026.05.17. 18:00"
                status={<span className="text-primary-500">D-7</span>}
                showThumbnail
                onClick={() =>
                  navigate(`/fan/home/concerts/calendar-${index + 1}`)
                }
                ariaLabel="WAVY 단독 공연 상세보기"
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default ConcertCalendarPage;
