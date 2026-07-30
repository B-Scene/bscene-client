import { useCallback, useMemo } from "react";
import type { AxiosError } from "axios";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
  useLiveNowQuery,
  useScheduledLiveQuery,
} from "@/hooks/api/live/useLive";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type { LiveApiResponse } from "@/types/live/live";
import type {
  ActiveLive,
  GoLiveScreen,
  LiveCard,
  ScheduledLiveCardData,
} from "./types";
import { HomeLiveCard, ScheduledLiveCard } from "./BandLiveHome";
import { TopBar } from "./components/TopBar";

interface BandLiveListPageProps {
  go: GoLiveScreen;
}

interface BandLiveNowListPageProps extends BandLiveListPageProps {
  onEnterLive: (live: ActiveLive) => void;
}

interface BandLiveScheduledListPageProps extends BandLiveListPageProps {
  onEditReservation: (liveId: number) => void;
}

function ListMessage({
  children,
  onRetry,
}: {
  children: string;
  onRetry?: () => void;
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-caption2 text-neutral-500">{children}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
        >
          다시 불러오기
        </button>
      ) : null}
    </div>
  );
}

export function BandLiveNowListPage({
  go,
  onEnterLive,
}: BandLiveNowListPageProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useLiveNowQuery("all");
  const enterLiveMutation = useEnterLiveMutation();

  const liveCards = useMemo<LiveCard[]>(
    () =>
      data?.pages.flatMap((page) =>
        page.items.map((live) => ({
          id: live.liveId,
          title: live.isMine ? "내 라이브 진행 중" : live.bandName,
          subtitle: live.title,
          listeners: `${(
            live.viewerCount ??
            live.viewCount ??
            0
          ).toLocaleString()}명 청취 중`,
          imageUrl:
            live.bandProfileImageUrl ?? live.thumbnailImageUrl ?? null,
          isMine: live.isMine,
        })),
      ) ?? [],
    [data],
  );

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
      const enteredLive = await enterLiveMutation.mutateAsync(liveId);

      onEnterLive(enteredLive);
      go("room");
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "라이브방에 입장하지 못했어요.");
    }
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-0 text-neutral-900">
      <TopBar title="진행 중인 라이브" onBack={() => go("home")} />

      <section className="h-[calc(100%_-_64px)] overflow-y-auto px-5 pb-8">
        {isLoading ? <ListMessage>라이브 목록을 불러오는 중이에요.</ListMessage> : null}

        {isError ? (
          <ListMessage onRetry={() => void refetch()}>
            라이브 목록을 불러오지 못했어요.
          </ListMessage>
        ) : null}

        {!isLoading && !isError && liveCards.length === 0 ? (
          <ListMessage>현재 진행 중인 라이브가 없어요.</ListMessage>
        ) : null}

        {!isLoading && !isError && liveCards.length > 0 ? (
          <div className="grid gap-3 pt-5">
            {liveCards.map((live) => (
              <HomeLiveCard
                key={live.id}
                disabled={enterLiveMutation.isPending}
                live={live}
                onEnter={() => void handleEnterLive(live.id)}
              />
            ))}

            <div ref={loadMoreRef} className="h-1" />

            {isFetchingNextPage ? (
              <p className="py-3 text-center text-caption2 text-neutral-500">
                라이브를 더 불러오는 중이에요.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export function BandLiveScheduledListPage({
  go,
  onEditReservation,
}: BandLiveScheduledListPageProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useScheduledLiveQuery(false);
  const { data: liveHome } = useLiveHomeQuery();

  const previewScheduleByLiveId = useMemo(
    () =>
      new Map(
        (liveHome?.scheduled ?? []).map((live) => [
          live.liveId,
          live.scheduledAt,
        ]),
      ),
    [liveHome?.scheduled],
  );

  const scheduledCards = useMemo<ScheduledLiveCardData[]>(
    () =>
      data?.pages.flatMap((page) =>
        page.items.map((live) => ({
          id: live.liveId,
          bandName: live.bandName,
          title: live.title,
          scheduledAt:
            previewScheduleByLiveId.get(live.liveId) ?? live.scheduledAt,
          isMine: Boolean(live.isMine),
          imageUrl:
            live.bandProfileImageUrl ?? live.thumbnailImageUrl ?? null,
        })),
      ) ?? [],
    [data, previewScheduleByLiveId],
  );

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: loadMore,
  });

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-0 text-neutral-900">
      <TopBar title="예정된 라이브" onBack={() => go("home")} />

      <section className="h-[calc(100%_-_64px)] overflow-y-auto px-5 pb-8">
        {isLoading ? (
          <ListMessage>예정된 라이브를 불러오는 중이에요.</ListMessage>
        ) : null}

        {isError ? (
          <ListMessage onRetry={() => void refetch()}>
            예정된 라이브를 불러오지 못했어요.
          </ListMessage>
        ) : null}

        {!isLoading && !isError && scheduledCards.length === 0 ? (
          <ListMessage>예정된 라이브가 없어요.</ListMessage>
        ) : null}

        {!isLoading && !isError && scheduledCards.length > 0 ? (
          <div className="grid gap-3 pt-5">
            {scheduledCards.map((live) => (
              <ScheduledLiveCard
                key={live.id}
                live={live}
                onEdit={() => onEditReservation(live.id)}
              />
            ))}

            <div ref={loadMoreRef} className="h-1" />

            {isFetchingNextPage ? (
              <p className="py-3 text-center text-caption2 text-neutral-500">
                라이브를 더 불러오는 중이에요.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
