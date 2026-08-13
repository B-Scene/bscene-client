import { useCallback, useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { getLiveMembers, getLiveReservation } from "@/api/live/live";
import { Header } from "@/components/common/Header/Header";
import {
  useEnterLiveMutation,
  useLiveNowQuery,
  useScheduledLiveQuery,
} from "@/hooks/api/live/useLive";
import { useActiveBandProfile } from "@/hooks/api/user/useMyProfiles";
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
  onRequestCoHostUpgrade: (liveId: number) => void;
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
  isMine?: boolean;
  isMyBand?: boolean;
  isBandMember?: boolean;
  isRelatedBand?: boolean;
  bandName?: string | null;
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

const ACCESS_STALE_TIME = 5 * 60 * 1000;
const ACCESS_GC_TIME = 10 * 60 * 1000;

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

const normalizeBandName = (value?: string | null) => {
  return value?.trim().toLocaleLowerCase("ko-KR") ?? "";
};

const getBandRelationState = (
  live: LiveBandRelationFields,
  activeBandId: number | null | undefined,
  activeBandName: string | null | undefined,
): RelationState => {
  if (live.isMine) {
    return "same";
  }

  if (live.isMyBand || live.isBandMember || live.isRelatedBand) {
    return "same";
  }

  if (
    live.isMyBand === false ||
    live.isBandMember === false ||
    live.isRelatedBand === false
  ) {
    return "different";
  }

  if (activeBandId) {
    const candidateBandIds = [live.bandId, live.myBandId]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (candidateBandIds.length > 0) {
      return candidateBandIds.some(
        (candidateBandId) => candidateBandId === Number(activeBandId),
      )
        ? "same"
        : "different";
    }
  }

  const normalizedLiveBandName = normalizeBandName(live.bandName);
  const normalizedActiveBandName = normalizeBandName(activeBandName);

  if (
    normalizedLiveBandName &&
    normalizedActiveBandName &&
    normalizedLiveBandName !== normalizedActiveBandName
  ) {
    return "different";
  }

  return "unknown";
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

  return (
    status === 403 ||
    status === 404 ||
    code.startsWith("LIVE403") ||
    code.startsWith("LIVE404")
  );
};

export function BandLiveNowListPage({
  go,
  onEnterLive,
  onRequestCoHostUpgrade,
}: BandLiveNowListPageProps) {
  const activeBandProfile = useActiveBandProfile();
  const activeBandId = activeBandProfile?.bandId ?? null;
  const activeBandName = activeBandProfile?.bandName ?? null;

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

  const liveNowCandidates = useMemo<LiveNowCandidateCard[]>(
    () =>
      data?.pages.flatMap((page) =>
        page.items.map((live) => {
          const typedLive = live as LiveListItemWithFields;

          return {
            id: typedLive.liveId,
            title: typedLive.isMine
              ? "내 라이브 진행 중"
              : typedLive.bandName,
            subtitle: typedLive.title,
            listeners: `${
              typedLive.viewerCount ?? typedLive.viewCount ?? 0
            }명 청취 중`,
            imageUrl: getBandProfileImageUrl(typedLive),
            isMine: typedLive.isMine,
            relationState: getBandRelationState(
              typedLive,
              activeBandId,
              activeBandName,
            ),
          };
        }),
      ) ?? [],
    [activeBandId, activeBandName, data],
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
        live.relationState === "unknown",
      staleTime: ACCESS_STALE_TIME,
      gcTime: ACCESS_GC_TIME,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    })),
  });

  const liveCards = useMemo<LiveCard[]>(() => {
    return liveNowCandidates.flatMap((live, index) => {
      if (live.relationState === "same") {
        return [live];
      }

      if (live.relationState === "different") {
        return [];
      }

      const accessQuery = liveNowAccessQueries[index];

      if (accessQuery?.isLoading || accessQuery?.isFetching) {
        return [];
      }

      return accessQuery?.data ? [live] : [];
    });
  }, [liveNowAccessQueries, liveNowCandidates]);

  const isCheckingLiveNowAccess =
    !isLoading &&
    !isError &&
    liveNowCandidates.some((live) => live.relationState === "unknown") &&
    liveCards.length === 0 &&
    liveNowAccessQueries.some((query) => query.isLoading || query.isFetching);

  const isEnterPending = enterLiveMutation.isPending;

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
    containerRef: liveNowRefreshRef,
    pullDistance: liveNowPullDistance,
    isRefreshing: isLiveNowRefreshing,
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
      if (isLiveEnterForbiddenError(error)) {
        onRequestCoHostUpgrade(liveId);
        return;
      }

      alert(getApiMessage(error, "라이브방에 입장하지 못했어요."));
    }
  };

  return (
    <main className="relative h-dvh overflow-hidden bg-neutral-0 text-neutral-900">
      <Header title="진행 중인 라이브" showBack={false} variant="main" />
      <HeaderBackButton onClick={() => go("home")} />

      <PullToRefreshIndicator
        pullDistance={liveNowPullDistance}
        isRefreshing={isLiveNowRefreshing}
      />

      <section
        ref={liveNowRefreshRef}
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
          <ListMessage>
            현재 밴드의 진행 중인 라이브를 확인하는 중이에요.
          </ListMessage>
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
  const activeBandProfile = useActiveBandProfile();
  const activeBandId = activeBandProfile?.bandId ?? null;
  const activeBandName = activeBandProfile?.bandName ?? null;
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

  const enterLiveMutation = useEnterLiveMutation();

  const scheduledCandidates = useMemo<ScheduledCandidateCard[]>(() => {
    return (
      data?.pages.flatMap((page) =>
        page.items.map((live) => {
          const typedLive = live as LiveListItemWithFields;

          return {
            id: typedLive.liveId,
            bandName: typedLive.bandName,
            title: typedLive.title,
            scheduledAt: typedLive.scheduledAt ?? "",
            isMine: Boolean(typedLive.isMine),
            imageUrl: getBandProfileImageUrl(typedLive),
            coHostUserIds: (typedLive.coHosts ?? typedLive.coHostList ?? [])
              .map((coHost) => coHost.userId)
              .filter((userId): userId is number => Number.isFinite(userId)),
            relationState: getBandRelationState(
              typedLive,
              activeBandId,
              activeBandName,
            ),
          };
        }),
      ) ?? []
    );
  }, [activeBandId, activeBandName, data]);

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
      enabled:
        Boolean(activeBandId) &&
        Boolean(live.id) &&
        live.relationState === "unknown",
      staleTime: ACCESS_STALE_TIME,
      gcTime: ACCESS_GC_TIME,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    })),
  });

  const displayScheduledCards = useMemo<ScheduledLiveCardData[]>(() => {
    return scheduledCandidates.flatMap((live, index) => {
      if (live.relationState === "same") {
        return [live];
      }

      if (live.relationState === "different") {
        return [];
      }

      const reservationQuery = scheduledReservationQueries[index];

      if (reservationQuery?.isLoading || reservationQuery?.isFetching) {
        return [];
      }

      return reservationQuery?.data ? [live] : [];
    });
  }, [scheduledCandidates, scheduledReservationQueries]);

  const isCheckingScheduledAccess =
    !isLoading &&
    !isError &&
    scheduledCandidates.some((live) => live.relationState === "unknown") &&
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
    await refetch();
  }, [refetch]);

  const {
    containerRef: scheduledRefreshRef,
    pullDistance: scheduledPullDistance,
    isRefreshing: isScheduledRefreshing,
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
        isRefreshing={isScheduledRefreshing}
      />

      <section
        ref={scheduledRefreshRef}
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
          <ListMessage>
            현재 밴드의 예정된 라이브를 확인하는 중이에요.
          </ListMessage>
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