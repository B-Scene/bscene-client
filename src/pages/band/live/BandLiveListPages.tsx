import { useCallback, useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Header } from "@/components/common/Header/Header";
import { getLiveMembers, getLiveReservation } from "@/api/live/live";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
  useLiveNowQuery,
  useRespondCoHostInvitationMutation,
  useScheduledLiveQuery,
} from "@/hooks/api/live/useLive";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
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
  cacheScheduledCoHostUserIds,
  removeCachedOwnedScheduledLive,
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

type LiveWithImageFields = {
  bandProfileImageUrl?: string | null;
};

type LiveBandRelationFields = {
  bandId?: number | null;
  myBandId?: number | null;
  bandProfileId?: number | null;
  bandMemberProfileId?: number | null;
  bandCode?: string | null;
  isMine?: boolean;
  isMyBand?: boolean;
  isBandMember?: boolean;
  isRelatedBand?: boolean;
};

type LiveListItemWithFields = LiveWithImageFields &
  LiveBandRelationFields & {
    liveId: number;
    bandName: string;
    title: string;
    viewerCount?: number;
    viewCount?: number;
    scheduledAt?: string;
    coHosts?: { userId?: number | null }[];
    coHostList?: { userId?: number | null }[];
  };

type RelationState = "same" | "different" | "unknown";

type LiveNowCandidateCard = LiveCard & {
  relationState: RelationState;
};

type ScheduledCandidateCard = ScheduledLiveCardData & {
  relationState: RelationState;
};

function HeaderBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로가기"
      className="absolute top-0 left-5 z-20 flex h-[52px] w-10 items-center justify-center"
    >
      <span className="block h-[18px] w-[18px] rotate-45 border-b-[2.5px] border-l-[2.5px] border-neutral-900" />
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

const getFirstImageUrl = (...urls: Array<string | null | undefined>) => {
  for (const url of urls) {
    if (typeof url !== "string") continue;

    const trimmedUrl = url.trim();

    if (trimmedUrl.length > 0) {
      return trimmedUrl;
    }
  }

  return null;
};

const getBandProfileImageUrl = (
  ...lives: Array<LiveWithImageFields | null | undefined>
) => {
  return getFirstImageUrl(...lives.map((live) => live?.bandProfileImageUrl));
};

const hasBandRelationField = (live: LiveBandRelationFields) => {
  return (
    live.isMine !== undefined ||
    live.isMyBand !== undefined ||
    live.isBandMember !== undefined ||
    live.isRelatedBand !== undefined ||
    live.bandId !== undefined ||
    live.myBandId !== undefined ||
    live.bandProfileId !== undefined ||
    live.bandMemberProfileId !== undefined ||
    live.bandCode !== undefined
  );
};

const getBandRelationState = (
  live: LiveBandRelationFields,
  activeBandId: number | null | undefined,
): RelationState => {
  if (live.isMine) {
    return "same";
  }

  if (live.isMyBand || live.isBandMember || live.isRelatedBand) {
    return "same";
  }

  if (!hasBandRelationField(live)) {
    return "unknown";
  }

  if (!activeBandId) {
    return "unknown";
  }

  const candidateBandIds = [
    live.bandId,
    live.myBandId,
    live.bandProfileId,
    live.bandMemberProfileId,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (candidateBandIds.length === 0) {
    return "unknown";
  }

  return candidateBandIds.some(
    (candidateBandId) => candidateBandId === Number(activeBandId),
  )
    ? "same"
    : "different";
};

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
  const activeBandId = useActiveBandId();

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

  const liveNowCandidates = useMemo<LiveNowCandidateCard[]>(
    () =>
      data?.pages.flatMap((page) =>
        page.items.map((live) => {
          const typedLive = live as LiveListItemWithFields;

          return {
            id: typedLive.liveId,
            title: typedLive.isMine ? "내 라이브 진행 중" : typedLive.bandName,
            subtitle: typedLive.title,
            listeners: `${
              typedLive.viewerCount ?? typedLive.viewCount ?? 0
            }명 청취 중`,
            imageUrl: getBandProfileImageUrl(typedLive),
            isMine: typedLive.isMine,
            relationState: getBandRelationState(typedLive, activeBandId),
          };
        }),
      ) ?? [],
    [activeBandId, data],
  );

  const liveNowAccessQueries = useQueries({
    queries: liveNowCandidates.map((live) => ({
      queryKey: ["live", "members-access", activeBandId, live.id],
      queryFn: async () => {
        try {
          return await getLiveMembers(live.id);
        } catch {
          return null;
        }
      },
      enabled:
        Boolean(activeBandId) &&
        Boolean(live.id) &&
        live.relationState !== "same",
      staleTime: 0,
      refetchOnMount: "always" as const,
      refetchOnWindowFocus: true,
      retry: false,
    })),
  });

  const liveCards = useMemo<LiveCard[]>(() => {
    return liveNowCandidates.flatMap((live, index) => {
      const accessQuery = liveNowAccessQueries[index];
      const isAccessChecking = accessQuery?.isLoading || accessQuery?.isFetching;

      if (live.relationState === "same") {
        return [live];
      }

      if (isAccessChecking) {
        return [];
      }

      if (accessQuery?.data) {
        return [live];
      }

      return [];
    });
  }, [liveNowAccessQueries, liveNowCandidates]);

  const isCheckingLiveNowAccess =
    !isLoading &&
    !isError &&
    liveNowCandidates.length > 0 &&
    liveCards.length === 0 &&
    liveNowAccessQueries.some((query) => query.isLoading || query.isFetching);

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

  const {
<<<<<<< HEAD
    containerRef: liveNowContainerRef,
    pullDistance: liveNowPullDistance,
    isRefreshing: liveNowIsRefreshing,
=======
    containerRef: liveNowRefreshRef,
    pullDistance: liveNowPullDistance,
    isRefreshing: isLiveNowRefreshing,
>>>>>>> develop
  } = usePullToRefresh<HTMLElement>({
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
        pullDistance={liveNowPullDistance}
<<<<<<< HEAD
        isRefreshing={liveNowIsRefreshing}
      />

      <section
        ref={liveNowContainerRef}
=======
        isRefreshing={isLiveNowRefreshing}
      />

      <section
        ref={liveNowRefreshRef}
>>>>>>> develop
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

        {isCheckingLiveNowAccess ? (
          <ListMessage>현재 밴드의 진행 중인 라이브를 확인하는 중이에요.</ListMessage>
        ) : null}

        {!isLoading &&
        !isError &&
        !isCheckingLiveNowAccess &&
        liveCards.length === 0 ? (
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
  const activeBandId = useActiveBandId();
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

  const previewScheduledByLiveId = useMemo(
    () =>
      new Map((liveHome?.scheduled ?? []).map((live) => [live.liveId, live])),
    [liveHome?.scheduled],
  );

  const scheduledCandidates = useMemo<ScheduledCandidateCard[]>(() => {
    return (
      data?.pages.flatMap((page) =>
        page.items.map((live) => {
          const typedLive = live as LiveListItemWithFields;
          const previewLive = previewScheduledByLiveId.get(
            typedLive.liveId,
          ) as LiveListItemWithFields | undefined;

          const mergedLive = {
            ...previewLive,
            ...typedLive,
          };

          return {
            id: typedLive.liveId,
            bandName: typedLive.bandName,
            title: typedLive.title,
            scheduledAt: previewLive?.scheduledAt ?? typedLive.scheduledAt ?? "",
            isMine: Boolean(typedLive.isMine ?? previewLive?.isMine),
            imageUrl: getBandProfileImageUrl(typedLive, previewLive),
            coHostUserIds: (
              typedLive.coHosts ??
              typedLive.coHostList ??
              previewLive?.coHosts ??
              previewLive?.coHostList ??
              []
            )
              .map((coHost) => coHost.userId)
              .filter((userId): userId is number => Number.isFinite(userId)),
            relationState: getBandRelationState(mergedLive, activeBandId),
          };
        }),
      ) ?? []
    );
  }, [activeBandId, data, previewScheduledByLiveId]);

  const scheduledReservationQueries = useQueries({
    queries: scheduledCandidates.map((live) => ({
      queryKey: ["live", "reservation-access", activeBandId, live.id],
      queryFn: async () => {
        try {
          return await getLiveReservation(live.id);
        } catch {
          return null;
        }
      },
      enabled: Boolean(activeBandId) && Boolean(live.id),
      staleTime: 0,
      refetchOnMount: "always" as const,
      refetchOnWindowFocus: true,
      retry: false,
    })),
  });

  const displayScheduledCards = useMemo<ScheduledLiveCardData[]>(() => {
    return scheduledCandidates.flatMap((live, index) => {
      const reservationQuery = scheduledReservationQueries[index];
      const isReservationChecking =
        reservationQuery?.isLoading || reservationQuery?.isFetching;

      if (live.relationState === "same") {
        return [live];
      }

      if (isReservationChecking) {
        return [];
      }

      if (reservationQuery?.data) {
        return [live];
      }

      return [];
    });
  }, [scheduledCandidates, scheduledReservationQueries]);

  const isCheckingScheduledAccess =
    !isLoading &&
    !isError &&
    scheduledCandidates.length > 0 &&
    displayScheduledCards.length === 0 &&
    scheduledReservationQueries.some(
      (query) => query.isLoading || query.isFetching,
    );

  useEffect(() => {
    displayScheduledCards.forEach((live) => {
      cacheScheduledCoHostUserIds(live.id, live.coHostUserIds ?? []);
    });
  }, [displayScheduledCards]);

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

  const {
<<<<<<< HEAD
    containerRef: scheduledContainerRef,
    pullDistance: scheduledPullDistance,
    isRefreshing: scheduledIsRefreshing,
=======
    containerRef: scheduledRefreshRef,
    pullDistance: scheduledPullDistance,
    isRefreshing: isScheduledRefreshing,
>>>>>>> develop
  } = usePullToRefresh<HTMLElement>({
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
        pullDistance={scheduledPullDistance}
<<<<<<< HEAD
        isRefreshing={scheduledIsRefreshing}
      />

      <section
        ref={scheduledContainerRef}
=======
        isRefreshing={isScheduledRefreshing}
      />

      <section
        ref={scheduledRefreshRef}
>>>>>>> develop
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

        {isCheckingScheduledAccess ? (
          <ListMessage>현재 밴드의 예정된 라이브를 확인하는 중이에요.</ListMessage>
        ) : null}

        {!isLoading &&
        !isError &&
        !isCheckingScheduledAccess &&
        displayScheduledCards.length === 0 ? (
          <ListMessage>예정된 라이브가 없어요.</ListMessage>
        ) : null}

        {!isLoading && !isError && displayScheduledCards.length > 0 ? (
          <div className="grid gap-3 pt-5">
            {displayScheduledCards.map((live) => (
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