import { useCallback, useEffect, useMemo } from "react";
import type { AxiosError } from "axios";
import { Header } from "@/components/common/Header/Header";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
  useLiveNowQuery,
  useRespondCoHostInvitationMutation,
  useScheduledLiveQuery,
} from "@/hooks/api/live/useLive";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import type { EnterLiveResponse, LiveApiResponse } from "@/types/live/live";
import type {
  ActiveLive,
  GoLiveScreen,
  LiveCard,
  ScheduledLiveCardData,
} from "./types";
import {
  HomeLiveCard,
  PullToRefreshIndicator,
  ScheduledLiveCard,
} from "./BandLiveHome";
import {
  cacheOwnedScheduledLives,
  cacheScheduledCoHostUserIds,
  getCachedOwnedScheduledLives,
  removeCachedOwnedScheduledLive,
  useRetainedScheduledLiveCards,
} from "./scheduledLiveCache";
import {
  isScheduledLiveStartable,
  useScheduledLiveNow,
} from "./scheduledLiveTime";

interface BandLiveListPageProps {
  go: GoLiveScreen;
}

interface BandLiveNowListPageProps extends BandLiveListPageProps {
  onEnterLive: (live: ActiveLive) => void;
}

interface BandLiveScheduledListPageProps extends BandLiveListPageProps {
  onEnterLive: (live: ActiveLive) => void;
  onEditReservation: (liveId: number) => void;
}

function HeaderBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로가기"
      className="absolute top-0 left-5 z-20 flex h-[52px] w-10 items-center justify-center"
    >
      <span className="block h-[18px] w-[18px] rotate-45 border-b-[2.5px] border-l-[2.5px] border-[#1D1A1A]" />
    </button>
  );
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

const getApiErrorBody = (error: unknown) => {
  return (error as AxiosError<LiveApiResponse<null>>).response?.data;
};

const getApiStatus = (error: unknown) => {
  const axiosError = error as AxiosError<LiveApiResponse<null>>;

  return axiosError.response?.status ?? axiosError.response?.data?.status;
};

const getApiMessage = (error: unknown, fallbackMessage: string) => {
  return getApiErrorBody(error)?.message ?? fallbackMessage;
};

const isLiveEnterForbiddenError = (error: unknown) => {
  const status = getApiStatus(error);
  const code = getApiErrorBody(error)?.code ?? "";

  return status === 403 || code.startsWith("LIVE403");
};

const isAlreadyProcessedInvitationError = (error: unknown) => {
  const status = getApiStatus(error);
  const code = getApiErrorBody(error)?.code ?? "";

  return status === 409 || code.startsWith("LIVE409");
};

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
  const respondCoHostInvitationMutation = useRespondCoHostInvitationMutation();

  const liveCards = useMemo<LiveCard[]>(
    () =>
      data?.pages.flatMap((page) =>
        page.items.map((live) => ({
          id: live.liveId,
          title: live.isMine ? "내 라이브 진행 중" : live.bandName,
          subtitle: live.title,
          listeners: `${
            live.viewerCount ?? live.viewCount ?? 0
          }명 청취 중`,
          imageUrl: live.bandProfileImageUrl ?? live.thumbnailImageUrl ?? null,
          isMine: live.isMine,
        })),
      ) ?? [],
    [data],
  );

  const isEnterPending =
    enterLiveMutation.isPending || respondCoHostInvitationMutation.isPending;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: loadMore,
  });

  const handleRefreshLiveNowList = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const liveNowPullToRefresh = usePullToRefresh<HTMLElement>({
    enabled: !isLoading && !isFetchingNextPage && !isEnterPending,
    onRefresh: handleRefreshLiveNowList,
  });

  const enterAndMoveRoom = (enteredLive: EnterLiveResponse) => {
    onEnterLive(enteredLive);
    go("room");
  };

  const handleEnterLive = async (liveId: number) => {
    if (isEnterPending) return;

    try {
      const enteredLive = await enterLiveMutation.mutateAsync(liveId);

      enterAndMoveRoom(enteredLive);
    } catch (error) {
      if (!isLiveEnterForbiddenError(error)) {
        alert(getApiMessage(error, "라이브방에 입장하지 못했어요."));
        return;
      }

      try {
        await respondCoHostInvitationMutation.mutateAsync({
          liveId,
          request: {
            isAccepted: true,
          },
        });

        const enteredLive = await enterLiveMutation.mutateAsync(liveId);

        enterAndMoveRoom(enteredLive);
      } catch (coHostError) {
        if (isAlreadyProcessedInvitationError(coHostError)) {
          try {
            const enteredLive = await enterLiveMutation.mutateAsync(liveId);

            enterAndMoveRoom(enteredLive);
            return;
          } catch (retryError) {
            alert(
              getApiMessage(
                retryError,
                "공동 진행자 수락 후에도 라이브방에 입장하지 못했어요.",
              ),
            );
            return;
          }
        }

        alert(
          getApiMessage(
            coHostError,
            "공동 진행자 초대 수락에 실패했어요. 알림 또는 초대 상태를 확인해주세요.",
          ),
        );
      }
    }
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-0 text-neutral-900">
      <Header title="진행 중인 라이브" showBack={false} variant="main" />
      <HeaderBackButton onClick={() => go("home")} />

      <PullToRefreshIndicator
        pullDistance={liveNowPullToRefresh.pullDistance}
        isRefreshing={liveNowPullToRefresh.isRefreshing}
      />

      <section
        ref={liveNowPullToRefresh.containerRef}
        className="h-[calc(100%_-_52px)] overflow-y-auto overscroll-y-contain px-5 pb-8"
      >
        {isLoading ? (
          <ListMessage>라이브 목록을 불러오는 중이에요.</ListMessage>
        ) : null}

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
                disabled={isEnterPending}
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
  onEnterLive,
  onEditReservation,
}: BandLiveScheduledListPageProps) {
  const now = useScheduledLiveNow();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useScheduledLiveQuery(false);

  const { data: liveHome, refetch: refetchLiveHome } = useLiveHomeQuery();
  const enterLiveMutation = useEnterLiveMutation();

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

  const scheduledCards = useMemo<ScheduledLiveCardData[]>(() => {
    const fetchedCards =
      data?.pages.flatMap((page) =>
        page.items.map((live) => ({
          id: live.liveId,
          bandName: live.bandName,
          title: live.title,
          scheduledAt:
            previewScheduleByLiveId.get(live.liveId) ?? live.scheduledAt,
          isMine: Boolean(live.isMine),
          imageUrl: live.bandProfileImageUrl ?? live.thumbnailImageUrl ?? null,
          coHostUserIds: (live.coHosts ?? live.coHostList ?? [])
            .map((coHost) => coHost.userId)
            .filter((userId): userId is number => Number.isFinite(userId)),
        })),
      ) ?? [];
    const mergedCards = new Map(
      getCachedOwnedScheduledLives().map((live) => [live.id, live]),
    );

    fetchedCards.forEach((live) => mergedCards.set(live.id, live));

    return Array.from(mergedCards.values());
  }, [data, previewScheduleByLiveId]);
  const retainedScheduledCards = useRetainedScheduledLiveCards(scheduledCards);

  useEffect(() => {
    cacheOwnedScheduledLives(retainedScheduledCards);
    retainedScheduledCards.forEach((live) => {
      cacheScheduledCoHostUserIds(live.id, live.coHostUserIds ?? []);
    });
  }, [retainedScheduledCards]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: loadMore,
  });

  const handleRefreshScheduledList = useCallback(async () => {
    await Promise.all([refetch(), refetchLiveHome()]);
  }, [refetch, refetchLiveHome]);

  const scheduledPullToRefresh = usePullToRefresh<HTMLElement>({
    enabled: !isLoading && !isFetchingNextPage && !enterLiveMutation.isPending,
    onRefresh: handleRefreshScheduledList,
  });

  const enterAndMoveRoom = (enteredLive: EnterLiveResponse) => {
    removeCachedOwnedScheduledLive(Number(enteredLive.liveId));
    onEnterLive(enteredLive);
    go("room");
  };

  const handleScheduledLiveAction = async (live: ScheduledLiveCardData) => {
    if (enterLiveMutation.isPending) return;

    const canStartLive = isScheduledLiveStartable(live.scheduledAt, now);

    if (!canStartLive) {
      if (live.isMine) {
        onEditReservation(live.id);
        return;
      }

      alert("아직 예약 시간이 되지 않은 라이브예요.");
      return;
    }

    try {
      const enteredLive = await enterLiveMutation.mutateAsync(live.id);

      enterAndMoveRoom(enteredLive);
    } catch (error) {
      alert(
        getApiMessage(
          error,
          "예약 라이브를 시작하거나 입장하지 못했어요. 예약 시간과 권한을 확인해주세요.",
        ),
      );
    }
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-0 text-neutral-900">
      <Header title="예정된 라이브" showBack={false} variant="main" />
      <HeaderBackButton onClick={() => go("home")} />

      <PullToRefreshIndicator
        pullDistance={scheduledPullToRefresh.pullDistance}
        isRefreshing={scheduledPullToRefresh.isRefreshing}
      />

      <section
        ref={scheduledPullToRefresh.containerRef}
        className="h-[calc(100%_-_52px)] overflow-y-auto overscroll-y-contain px-5 pb-8"
      >
        {isLoading ? (
          <ListMessage>예정된 라이브를 불러오는 중이에요.</ListMessage>
        ) : null}

        {isError ? (
          <ListMessage onRetry={() => void refetch()}>
            예정된 라이브를 불러오지 못했어요.
          </ListMessage>
        ) : null}

        {!isLoading && !isError && retainedScheduledCards.length === 0 ? (
          <ListMessage>예정된 라이브가 없어요.</ListMessage>
        ) : null}

        {!isLoading && !isError && retainedScheduledCards.length > 0 ? (
          <div className="grid gap-3 pt-5">
            {retainedScheduledCards.map((live) => (
              <ScheduledLiveCard
                key={live.id}
                live={live}
                actionLabel={
                  isScheduledLiveStartable(live.scheduledAt, now)
                    ? "라이브 시작"
                    : "수정"
                }
                onEdit={() => void handleScheduledLiveAction(live)}
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