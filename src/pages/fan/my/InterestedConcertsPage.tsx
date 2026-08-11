import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationIcon from "@/assets/icons/band/ic_location.svg";
import BellActiveIcon from "@/assets/icons/fan/bell-active-icon.svg";
import BellIcon from "@/assets/icons/fan/bell-icon.svg";
import ImagePlaceholderIcon from "@/assets/icons/fan/image-icon.svg";
import LikedPerformIcon from "@/assets/icons/fan/liked-perform.svg";
import { Header } from "@/components/common/Header/Header";
import { Toast } from "@/components/common/Toast/Toast";
import {
  useDeletePerformanceAlarm,
  useSetPerformanceAlarm,
} from "@/hooks/api/fan/useFanHome";
import { useInterestedPerformancesQuery } from "@/hooks/api/user/useInterestedPerformances";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import { useTodayTick } from "@/hooks/useTodayTick";
import { formatDDayLabel, getDDay } from "@/utils/getDDay";
import type { InterestedPerformanceFilter } from "@/types/user/interestedPerformance";

const hasPerformanceStarted = (
  performanceDate: string,
  startTime: string,
  now: Date,
) => {
  const start = new Date(`${performanceDate}T${startTime}`);

  return !Number.isNaN(start.getTime()) && start.getTime() <= now.getTime();
};

const InterestedConcertsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] =
    useState<InterestedPerformanceFilter>("ALL");
  const [pendingAlarmId, setPendingAlarmId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const today = useTodayTick();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInterestedPerformancesQuery(activeFilter);
  const setPerformanceAlarmMutation = useSetPerformanceAlarm();
  const deletePerformanceAlarmMutation = useDeletePerformanceAlarm();

  const baseYear = data?.pages[0]?.baseYear ?? new Date().getFullYear();
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const concerts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const filters: { code: InterestedPerformanceFilter; label: string }[] = [
    { code: "ALL", label: "전체" },
    { code: "THIS_YEAR", label: `${baseYear}년` },
    { code: "LAST_YEAR", label: `${baseYear - 1}년` },
    { code: "BEFORE", label: `${baseYear - 2}년 이전` },
  ];

  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  const handleToggleAlarm = async (performanceId: number, isOn: boolean) => {
    if (pendingAlarmId !== null) return;

    setPendingAlarmId(performanceId);
    try {
      if (isOn) {
        await deletePerformanceAlarmMutation.mutateAsync(performanceId);
        setToastMessage("공연 알림을 해제했어요");
      } else {
        await setPerformanceAlarmMutation.mutateAsync(performanceId);
        setToastMessage("공연 알림을 설정했어요");
      }
    } catch {
      setToastMessage(
        isOn ? "공연 알림 해제에 실패했어요" : "공연 알림 설정에 실패했어요",
      );
    } finally {
      setPendingAlarmId(null);
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <Header title="관심 공연 목록" />

      <div className="mt-4 flex flex-col gap-5 px-5">
        <div className="rounded-xl border border-primary-300 bg-primary-0 p-3 text-center">
          <p className="m-0 text-caption2 leading-5 text-neutral-600">
            공연 상세페이지에서 하트를 눌러 찜한 공연이 모여요
            <br />
            알림 설정 여부와는 별도로 관리됩니다
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-neutral-0 py-3 px-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <img src={LikedPerformIcon} alt="" className="shrink-0" />

          <div className="flex flex-col">
            <span className="text-caption3 text-neutral-900">관심 공연</span>
            <span className="flex items-baseline gap-1">
              <strong className="text-h4 text-primary-500">
                {totalCount}
              </strong>
              <span className="text-caption2 text-neutral-600">회</span>
            </span>
          </div>
        </div>

        <div className="flex rounded-md bg-primary-0 p-1">
          {filters.map((filter) => {
            const isActive = filter.code === activeFilter;

            return (
              <button
                key={filter.code}
                type="button"
                onClick={() => setActiveFilter(filter.code)}
                className={`flex flex-1 items-center justify-center gap-2.5 rounded-md border border-transparent px-2 py-1.25 text-center text-caption3 text-neutral-900 ${
                  isActive
                    ? "border-black/4 bg-neutral-0 shadow-[0_3px_8px_0_rgba(0,0,0,0.12),0_3px_1px_0_rgba(0,0,0,0.04)]"
                    : ""
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-col gap-3">
          {concerts.map((concert) => {
            const isCompleted = concert.participationStatus === "COMPLETED";
            const isNotifyOn = concert.participationStatus === "SCHEDULED";
            const dDay = getDDay(concert.performanceDate, today);
            const isPast = hasPerformanceStarted(
              concert.performanceDate,
              concert.startTime,
              today,
            );
            const statusLabel = isCompleted
              ? "참여 완료"
              : formatDDayLabel(dDay);

            return (
              <li
                key={concert.performanceId}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(`/fan/home/concerts/${concert.performanceId}`)
                }
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  navigate(`/fan/home/concerts/${concert.performanceId}`);
                }}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-neutral-0 px-4 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex w-12.5 h-15.5 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-400">
                    {concert.posterImageUrl ? (
                      <img
                        src={concert.posterImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img src={ImagePlaceholderIcon} alt="" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-1.25">
                    <div className="flex min-w-0 flex-col">
                      <h3 className="m-0 truncate text-body1 text-neutral-900">
                        {concert.title}
                      </h3>
                      <p className="m-0 flex items-center gap-1 text-caption2 text-neutral-700">
                        <img src={LocationIcon} alt="" className="size-3.5 shrink-0" />
                        <span className="truncate">{concert.venue}</span>
                      </p>
                    </div>

                    <p className="m-0 text-body5 text-neutral-500">
                      {`${concert.performanceDate.replaceAll("-", ".")}. ${concert.startTime.slice(0, 5)}`}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-2">
                  {!isCompleted && !isPast ? (
                    <button
                      type="button"
                      aria-label={`알림 ${isNotifyOn ? "켜짐" : "꺼짐"}`}
                      aria-pressed={isNotifyOn}
                      disabled={pendingAlarmId === concert.performanceId}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleAlarm(concert.performanceId, isNotifyOn);
                      }}
                      className="flex size-6 items-center justify-center disabled:opacity-50"
                    >
                      <img src={isNotifyOn ? BellActiveIcon : BellIcon} alt="" />
                    </button>
                  ) : null}

                  <span className="flex h-6.5 min-w-16 items-center justify-center rounded-full bg-primary-50 px-3.75 text-caption3 text-primary-400">
                    {statusLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </main>
  );
};

export default InterestedConcertsPage;
