import { useMemo, useState } from "react";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";

export interface DateRange {
  start: string;
  end: string;
}

interface DatePickerSheetProps {
  open: boolean;
  startDate: string;
  endDate: string;
  onClose: () => void;
  onSelect: (range: DateRange) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarDay = {
  date: Date;
  dateKey: string;
  label: string;
  muted: boolean;
  sunday: boolean;
  today: boolean;
};

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getCalendarDays = (displayedMonth: Date): CalendarDay[] => {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const startOffset = firstDate.getDay();
  const cellCount = Math.ceil((startOffset + lastDate.getDate()) / 7) * 7;
  const todayKey = formatDateKey(new Date());

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - startOffset + 1);
    const dateKey = formatDateKey(date);
    const muted = date.getMonth() !== month;

    return {
      date,
      dateKey,
      label: String(date.getDate()),
      muted,
      sunday: !muted && date.getDay() === 0,
      today: !muted && dateKey === todayKey,
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

export const DatePickerSheet = ({
  open,
  startDate,
  endDate,
  onClose,
  onSelect,
}: DatePickerSheetProps) => {
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    startDate ? parseDateKey(startDate) : new Date(),
  );
  const [rangeStart, setRangeStart] = useState(startDate);
  const [rangeEnd, setRangeEnd] = useState(endDate);

  const { rendered, isVisible, handleTransitionEnd } = useSlideUpSheet(
    open,
    () => {
      setDisplayedMonth(startDate ? parseDateKey(startDate) : new Date());
      setRangeStart(startDate);
      setRangeEnd(endDate);
    },
  );

  const calendarDays = useMemo(
    () => getCalendarDays(displayedMonth),
    [displayedMonth],
  );

  const monthLabel = `${displayedMonth.getFullYear()}년 ${String(
    displayedMonth.getMonth() + 1,
  ).padStart(2, "0")}월`;

  const moveMonth = (amount: number) => {
    setDisplayedMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const goToToday = () => {
    setDisplayedMonth(new Date());
  };

  const handleDayClick = (dateKey: string) => {
    const hasCompleteRange = Boolean(rangeStart) && Boolean(rangeEnd);

    if (!rangeStart || hasCompleteRange) {
      setRangeStart(dateKey);
      setRangeEnd("");
      return;
    }

    if (dateKey < rangeStart) {
      setRangeStart(dateKey);
      setRangeEnd("");
      return;
    }

    setRangeEnd(dateKey);
  };

  const handleDismiss = () => {
    if (rangeStart) {
      onSelect({ start: rangeStart, end: rangeEnd || rangeStart });
      return;
    }
    onClose();
  };

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-neutral-900/50 transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleDismiss}
      />

      <div
        onTransitionEnd={handleTransitionEnd}
        className={`relative z-10 flex w-full flex-col items-center gap-4 rounded-t-3xl bg-neutral-0 px-3.75 pt-2 pb-12 transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="pb-3">
          <div className="h-1 w-11 shrink-0 rounded bg-[#DEDEDE]" />
        </div>

        <div className="flex w-full flex-col gap-4 px-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            <span aria-hidden="true" />

            <div className="flex items-center justify-self-center gap-6">
              <button
                type="button"
                aria-label="이전 달"
                onClick={() => moveMonth(-1)}
                className="flex size-6 items-center justify-center text-neutral-900"
              >
                <ChevronIcon direction="left" />
              </button>

              <h2 className="text-label1 text-neutral-900">{monthLabel}</h2>

              <button
                type="button"
                aria-label="다음 달"
                onClick={() => moveMonth(1)}
                className="flex size-6 items-center justify-center text-neutral-900"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>

            <button
              type="button"
              onClick={goToToday}
              className="justify-self-end text-caption3 text-neutral-500"
            >
              오늘
            </button>
          </div>

          <div className="grid grid-cols-7 gap-x-5 gap-y-2.5 text-center">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="flex h-7.5 items-center justify-center"
              >
                <span
                  className={`text-caption3 ${
                    weekday === "일" ? "text-error" : "text-neutral-900"
                  }`}
                >
                  {weekday}
                </span>
              </div>
            ))}

            {calendarDays.map((day, index) => {
              const isStart = day.dateKey === rangeStart;
              const isEnd = day.dateKey === rangeEnd;
              const inRangeCheck = (candidate?: CalendarDay) =>
                Boolean(
                  candidate &&
                  !candidate.muted &&
                  rangeStart &&
                  rangeEnd &&
                  candidate.dateKey >= rangeStart &&
                  candidate.dateKey <= rangeEnd,
                );
              const inRange = inRangeCheck(day);
              const isFirstColumn = index % 7 === 0;
              const isLastColumn = index % 7 === 6;
              const bridgeLeft =
                inRange &&
                !isFirstColumn &&
                inRangeCheck(calendarDays[index - 1]);
              const bridgeRight =
                inRange &&
                !isLastColumn &&
                inRangeCheck(calendarDays[index + 1]);

              return (
                <div
                  key={day.date.toISOString()}
                  className="relative flex h-7.5 items-center justify-center"
                >
                  {inRange ? (
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-0 my-auto h-7.5 bg-[#FFF6E5] ${
                        bridgeLeft
                          ? "left-[calc(50%-26px)]"
                          : "left-[calc(50%-16px)] rounded-l-full"
                      } ${
                        bridgeRight
                          ? "right-[calc(50%-26px)]"
                          : "right-[calc(50%-16px)] rounded-r-full"
                      }`}
                    />
                  ) : null}

                  <button
                    type="button"
                    disabled={day.muted}
                    onClick={() => handleDayClick(day.dateKey)}
                    className={`relative z-10 flex size-7.5 shrink-0 items-center justify-center rounded-full text-caption3 ${
                      isStart || isEnd
                        ? "bg-secondary-500 text-neutral-0"
                        : day.muted
                          ? "text-neutral-400"
                          : day.sunday
                            ? "text-error"
                            : "text-neutral-900"
                    }`}
                  >
                    {day.label}
                    {day.today && !isStart && !isEnd ? (
                      <span className="absolute bottom-0.5 size-1 rounded-full bg-primary-400" />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
