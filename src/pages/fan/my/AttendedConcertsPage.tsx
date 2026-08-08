import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import LocationIcon from "@/assets/icons/band/ic_location.svg";
import ImagePlaceholderIcon from "@/assets/icons/fan/image-icon.svg";
import TicketPerformIcon from "@/assets/icons/fan/ticket-perform.svg";
import { usePerformanceHistoryQuery } from "@/hooks/api/user/usePerformanceHistory";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type { PerformanceHistoryFilter } from "@/types/user/performanceHistory";

const AttendedConcertsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] =
    useState<PerformanceHistoryFilter>("ALL");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePerformanceHistoryQuery(activeFilter);

  const baseYear = data?.pages[0]?.baseYear ?? new Date().getFullYear();
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const concerts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const filters: { code: PerformanceHistoryFilter; label: string }[] = [
    { code: "ALL", label: "전체" },
    { code: "THIS_YEAR", label: `${baseYear}년` },
    { code: "LAST_YEAR", label: `${baseYear - 1}년` },
    { code: "BEFORE", label: `${baseYear - 2}년 이전` },
  ];

  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="-mx-5 flex h-15 items-center justify-between px-3.75">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">
          공연 참여 기록
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <div className="mt-4 flex flex-col gap-5">
        <div className="rounded-xl border border-primary-300 bg-primary-0 p-3 text-center">
          <p className="m-0 text-caption2 leading-5 text-neutral-600">
            공연 상세페이지에서 알림을 설정하면,
            <br />
            공연 종료 후 &apos;참여 완료&apos;로 설정 가능합니다
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-neutral-0 py-3 px-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <img src={TicketPerformIcon} alt="" className="shrink-0" />

          <div className="flex flex-col">
            <span className="text-caption3 text-neutral-900">총 참여 공연</span>
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
            return (
              <li
                key={concert.performanceId}
                className="flex items-center gap-4 rounded-xl bg-neutral-0 px-4 py-3 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
              >
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
              </li>
            );
          })}
        </ul>

        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </div>
    </main>
  );
};

export default AttendedConcertsPage;
