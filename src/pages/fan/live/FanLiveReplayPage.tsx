import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import PlayIcon from "@/assets/icons/play.svg";
import VideoCard from "@/components/common/Card/VideoCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { useReplayListQuery } from "@/hooks/api/live/useLive";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type {
  ReplayListFilter,
  ReplaySort,
} from "@/types/live/live";
import "./FanLivePage.css";
import {
  FanLiveFilterTabs,
  FanLiveListHeader,
  type FanLiveFilter,
} from "./components/FanLiveHomeParts";

const toApiFilter = (filter: FanLiveFilter): ReplayListFilter => {
  return filter === "followed" ? "following" : "all";
};

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export function FanLiveReplayPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FanLiveFilter>("followed");
  const [sort, setSort] = useState<ReplaySort>("LATEST");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useReplayListQuery(toApiFilter(filter), sort);

  const replayItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleItems = useMemo(() => {
    if (!normalizedQuery) return replayItems;

    return replayItems.filter((replay) =>
      `${replay.title} ${replay.bandName}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, replayItems]);
  const hasNoResults = !isLoading && visibleItems.length === 0;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: loadMore,
  });

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveListHeader
        title="다시보기"
        onBack={() => navigate(-1)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <FanLiveFilterTabs value={filter} onChange={setFilter} />

      <div className="flex h-[calc(100%_-_176px)] flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between px-5">
          <p className="m-0 font-body text-caption2 text-neutral-700">
            라이브는 최대 72시간까지 보관됩니다
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSort("LATEST")}
              className={`rounded-full px-[15px] py-1 font-body text-caption3 ${
                sort === "LATEST"
                  ? "bg-primary-50 text-primary-400"
                  : "bg-neutral-300 text-neutral-600"
              }`}
            >
              최신순
            </button>
            <button
              type="button"
              onClick={() => setSort("POPULAR")}
              className={`rounded-full px-[15px] py-1 font-body text-caption2 ${
                sort === "POPULAR"
                  ? "bg-primary-50 text-primary-400"
                  : "bg-neutral-300 text-neutral-600"
              }`}
            >
              인기순
            </button>
          </div>
        </div>

        <section className="fan-live-home-scroll relative flex flex-1 flex-col overflow-y-auto px-5 pb-6">
          {isLoading ? (
            <p className="py-10 text-center font-body text-caption2 text-neutral-500">
              다시보기를 불러오는 중이에요.
            </p>
          ) : null}

          {isError ? (
            <div className="py-10 text-center">
              <p className="font-body text-caption2 text-neutral-600">
                다시보기를 불러오지 못했어요.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-lg bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
              >
                다시 불러오기
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && hasNoResults ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex w-[219px] flex-col items-center gap-3 text-center">
                <h2 className="m-0 font-body text-label1 text-neutral-900">
                  {normalizedQuery
                    ? "검색 결과가 없어요"
                    : "저장된 다시보기가 없어요"}
                </h2>
                <p className="m-0 font-body text-caption1 text-neutral-600">
                  {normalizedQuery ? (
                    "다른 검색어를 입력해 보세요"
                  ) : (
                    <>
                      라이브가 종료되면 밴드가
                      <br />
                      녹음본 저장 여부를 선택해요
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : null}

          {!isLoading && !isError && !hasNoResults ? (
            <div className="flex flex-col items-center gap-3">
              {visibleItems.map((replay) => (
                <VideoCard
                  key={replay.liveId}
                  imageSrc={replay.thumbnailImageUrl || BandImage}
                  imageAlt={`${replay.bandName} 다시보기 이미지`}
                  title={replay.title}
                  bandName={replay.bandName}
                  duration={formatDuration(
                    replay.durationSeconds ?? replay.durationSec ?? 0,
                  )}
                  onClick={() =>
                    navigate(`/fan/live/replays/${replay.liveId}`)
                  }
                  ariaLabel={`${replay.title} 다시보기 열기`}
                  timeAgo={
                    <span className="flex items-center gap-1">
                      <img
                        src={PlayIcon}
                        alt=""
                        className="size-[9px] brightness-0 opacity-30"
                      />
                      {replay.viewCount.toLocaleString()}
                    </span>
                  }
                />
              ))}

              <div ref={loadMoreRef} className="h-1" />

              {isFetchingNextPage ? (
                <p className="py-3 font-body text-caption2 text-neutral-500">
                  다시보기를 더 불러오는 중이에요.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

export default FanLiveReplayPage;
