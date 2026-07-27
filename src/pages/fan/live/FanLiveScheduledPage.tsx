import { useCallback, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import BandLiveCard from "@/components/common/Card/BandLiveCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useScheduledLiveQuery,
  useToggleLiveAlarmMutation,
} from "@/hooks/api/live/useLive";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type { LiveApiResponse } from "@/types/live/live";
import "./FanLivePage.css";
import {
  FanLiveFilterTabs,
  FanLiveListHeader,
  type FanLiveFilter,
} from "./components/FanLiveHomeParts";

export function FanLiveScheduledPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FanLiveFilter>("followed");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOverrides, setNotificationOverrides] = useState<
    Record<number, boolean>
  >({});
  const following = filter === "followed";
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useScheduledLiveQuery(following);
  const toggleAlarmMutation = useToggleLiveAlarmMutation();

  const scheduledItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleItems = useMemo(() => {
    if (!normalizedQuery) return scheduledItems;

    return scheduledItems.filter((live) =>
      `${live.title} ${live.bandName}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, scheduledItems]);
  const hasNoResults = !isLoading && visibleItems.length === 0;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: loadMore,
  });

  const toggleNotification = async (liveId: number) => {
    if (toggleAlarmMutation.isPending) return;

    try {
      const { alarmSet } = await toggleAlarmMutation.mutateAsync(liveId);

      setNotificationOverrides((current) => ({
        ...current,
        [liveId]: alarmSet,
      }));
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "라이브 알림을 변경하지 못했어요.");
    }
  };

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveListHeader
        title="예정된 라이브"
        onBack={() => navigate(-1)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <FanLiveFilterTabs value={filter} onChange={setFilter} />

      <section className="fan-live-home-scroll relative h-[calc(100%_-_176px)] overflow-y-auto px-5 pb-6">
        {isLoading ? (
          <p className="py-10 text-center font-body text-caption2 text-neutral-500">
            예정된 라이브를 불러오는 중이에요.
          </p>
        ) : null}

        {isError ? (
          <div className="py-10 text-center">
            <p className="font-body text-caption2 text-neutral-600">
              예정된 라이브를 불러오지 못했어요.
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
                  : "예정된 라이브가 없어요"}
              </h2>
              <p className="m-0 font-body text-caption1 text-neutral-600">
                {normalizedQuery ? (
                  "다른 검색어를 입력해 보세요"
                ) : (
                  <>
                    새로운 라이브 일정이 등록되면
                    <br />
                    알림을 보내드릴게요
                  </>
                )}
              </p>
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && !hasNoResults ? (
          <div className="flex flex-col items-center gap-3 pt-6">
            {visibleItems.map((live) => {
              const isNotified =
                notificationOverrides[live.liveId] ??
                live.isAlarmSet ??
                live.alarmSet ??
                live.notificationEnabled ??
                false;

              return (
                <BandLiveCard
                  key={live.liveId}
                  imageSrc={live.bandProfileImageUrl || BandImage}
                  imageAlt={`${live.bandName} 예정 라이브 이미지`}
                  title={live.title}
                  bandName={live.bandName}
                  schedule={live.scheduledAt}
                  showNotificationButton={filter === "all"}
                  notificationLabel={
                    isNotified ? "알림 받는 중" : "알림 받기"
                  }
                  notificationVariant={isNotified ? "soft" : "outline"}
                  notificationContentSize={
                    isNotified ? "compact" : "default"
                  }
                  tone="pink"
                  onNotificationClick={() =>
                    void toggleNotification(live.liveId)
                  }
                />
              );
            })}

            <div ref={loadMoreRef} className="h-1" />

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

export default FanLiveScheduledPage;
