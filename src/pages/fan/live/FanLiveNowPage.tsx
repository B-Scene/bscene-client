import { useCallback, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import LiveNowCard from "@/components/common/Card/LiveNowCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useEnterLiveMutation,
  useLiveNowQuery,
} from "@/hooks/api/live/useLive";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type {
  LiveApiResponse,
  LiveNowListFilter,
} from "@/types/live/live";
import "./FanLivePage.css";
import {
  FanLiveFilterTabs,
  FanLiveListHeader,
  type FanLiveFilter,
} from "./components/FanLiveHomeParts";

const toApiFilter = (filter: FanLiveFilter): LiveNowListFilter => {
  return filter === "followed" ? "following" : "all";
};

export function FanLiveNowPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FanLiveFilter>("followed");
  const [searchQuery, setSearchQuery] = useState("");
  const apiFilter = toApiFilter(filter);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useLiveNowQuery(apiFilter);
  const enterLiveMutation = useEnterLiveMutation();

  const liveItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleItems = useMemo(() => {
    if (!normalizedQuery) return liveItems;

    return liveItems.filter((live) =>
      `${live.title} ${live.bandName}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [liveItems, normalizedQuery]);
  const hasNoResults = !isLoading && visibleItems.length === 0;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: loadMore,
  });

  const handleEnterLive = async (liveId: number) => {
    if (enterLiveMutation.isPending) return;

    try {
      const live = await enterLiveMutation.mutateAsync(liveId);

      navigate(`/fan/live/room/${liveId}`, {
        state: { live },
      });
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "라이브 방에 입장하지 못했어요.");
    }
  };

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveListHeader
        title="진행 중인 라이브"
        onBack={() => navigate(-1)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <FanLiveFilterTabs value={filter} onChange={setFilter} />

      <section className="fan-live-home-scroll relative h-[calc(100%_-_176px)] overflow-y-auto px-5 pb-6">
        {isLoading ? (
          <p className="py-10 text-center font-body text-caption2 text-neutral-500">
            라이브 목록을 불러오는 중이에요.
          </p>
        ) : null}

        {isError ? (
          <div className="py-10 text-center">
            <p className="font-body text-caption2 text-neutral-600">
              라이브 목록을 불러오지 못했어요.
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
                  : "지금 진행 중인 라이브가 없어요"}
              </h2>
              <p className="m-0 font-body text-caption1 text-neutral-600">
                {normalizedQuery ? (
                  "다른 검색어를 입력해 보세요"
                ) : filter === "followed" ? (
                  <>
                    팔로우한 밴드가 라이브를 시작하면
                    <br />
                    알림을 보내드릴게요
                  </>
                ) : (
                  "새로운 라이브가 시작되면 여기에서 확인할 수 있어요"
                )}
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && !hasNoResults ? (
          <div className="flex flex-col items-center gap-3 pt-6">
            {visibleItems.map((live) => (
              <LiveNowCard
                key={live.liveId}
                imageSrc={live.bandProfileImageUrl || BandImage}
                imageAlt={`${live.bandName} 라이브 이미지`}
                title={live.title}
                bandName={live.bandName}
                listenerCount={`${live.viewCount.toLocaleString()}명 청취 중`}
                tone="pink"
                onClick={() => void handleEnterLive(live.liveId)}
              />
            ))}

            {!normalizedQuery ? <div ref={loadMoreRef} className="h-1" /> : null}

            {isFetchingNextPage ? (
              <p className="py-3 font-body text-caption2 text-neutral-500">
                라이브를 더 불러오는 중이에요.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

export default FanLiveNowPage;
