import { useCallback, useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import LiveHeadIcon from "@/assets/icons/live-head.svg";
import { Header } from "@/components/common/Header/Header";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { getLiveMembers, getLiveReservation } from "@/api/live/live";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
  useRespondCoHostInvitationMutation,
  useScheduledLiveQuery,
} from "@/hooks/api/live/useLive";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import type {
  EnterLiveResponse,
  LiveApiResponse,
  ScheduledLiveItem,
  ScheduledLiveListItem,
} from "@/types/live/live";
import type {
  ActiveLive,
  GoLiveScreen,
  LiveCard,
  ScheduledLiveCardData,
} from "./types";
import { LiveIllustration } from "./components/LiveIllustration";
import { ProfileImage } from "./components/ProfileImage";
import { SectionHeader } from "./components/SectionHeader";
import {
  cacheScheduledCoHostUserIds,
  removeCachedOwnedScheduledLive,
} from "./scheduledLiveCache";
import {
  isScheduledLiveStartable,
  useScheduledLiveNow,
} from "./scheduledLiveTime";

type ScheduledLiveWithFields = (
  | ScheduledLiveItem
  | ScheduledLiveListItem
) & {
  bandId?: number | null;
  myBandId?: number | null;
  bandProfileId?: number | null;
  bandMemberProfileId?: number | null;
  bandCode?: string | null;
  isMyBand?: boolean;
  isBandMember?: boolean;
  isRelatedBand?: boolean;

  thumbnailUrl?: string | null;
  thumbnailImage?: string | null;
  thumbnailImageUrl?: string | null;
  liveThumbnailUrl?: string | null;
  liveThumbnailImageUrl?: string | null;
  imageUrl?: string | null;
  bandProfileImageUrl?: string | null;
};

type LiveNowWithFields = {
  liveId: number;
  bandId?: number | null;
  myBandId?: number | null;
  bandProfileId?: number | null;
  bandMemberProfileId?: number | null;
  bandCode?: string | null;
  isMine?: boolean;
  isMyBand?: boolean;
  isBandMember?: boolean;
  isRelatedBand?: boolean;

  bandName: string;
  title: string;
  viewerCount?: number;
  viewCount?: number;

  thumbnailImageUrl?: string | null;
  thumbnailUrl?: string | null;
  liveThumbnailImageUrl?: string | null;
  liveThumbnailUrl?: string | null;
  imageUrl?: string | null;
  bandProfileImageUrl?: string | null;
};

type ReservationThumbnailResponse = {
  thumbnailImageUrl?: string | null;
  thumbnailUrl?: string | null;
  liveThumbnailImageUrl?: string | null;
  liveThumbnailUrl?: string | null;
  imageUrl?: string | null;
};

type RelationState = "same" | "different" | "unknown";

type LiveNowCandidateCard = LiveCard & {
  relationState: RelationState;
};

type ScheduledCandidateCard = ScheduledLiveCardData & {
  relationState: RelationState;
};

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
}: {
  pullDistance: number;
  isRefreshing: boolean;
}) {
  const shouldShow = pullDistance >= 24 || isRefreshing;

  if (!shouldShow) {
    return null;
  }

  const visibleDistance = Math.min(pullDistance, 52);
  const opacity = Math.min(1, Math.max(0.35, pullDistance / 80));

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-[70] flex size-9 items-center justify-center rounded-full bg-neutral-0 shadow-[0_4px_18px_rgba(0,0,0,0.18)]"
      style={{
        top: "calc(env(safe-area-inset-top) + 72px)",
        opacity,
        transform: `translate(-50%, ${visibleDistance}px)`,
      }}
    >
      <div className="size-5 animate-spin rounded-full border-2 border-neutral-300 border-t-secondary-500" />
    </div>
  );
}

export function HomeLiveCard({
  live,
  onEnter,
  disabled,
}: {
  live: LiveCard;
  onEnter: () => void;
  disabled?: boolean;
}) {
  return (
    <article className="relative flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <div className="relative shrink-0">
        <ProfileImage glow src={live.imageUrl ?? undefined} />

        <span className="absolute -bottom-1 left-1/2 flex h-3 w-[27px] -translate-x-1/2 items-center justify-center rounded-full bg-secondary-500 text-label4 text-neutral-0">
          LIVE
        </span>
      </div>

      <div className="ml-4 min-w-0 flex-1 pr-[62px]">
        <strong className="block truncate text-body1 text-neutral-900">
          {live.title}
        </strong>

        <span className="mt-0.5 block truncate text-body3 text-neutral-700">
          {live.subtitle}
        </span>

        <span className="mt-1 block text-caption2 text-secondary-500">
          <span className="inline-flex items-center gap-1.5">
            <img
              src={LiveHeadIcon}
              alt=""
              className="h-[13px] w-3 object-contain"
            />
            {live.listeners}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={onEnter}
        disabled={disabled}
        className="absolute right-4 bottom-3 flex h-[22px] w-[51px] items-center justify-center rounded-full border border-secondary-500 bg-neutral-0 text-caption3 text-secondary-500 disabled:opacity-50"
      >
        입장
      </button>
    </article>
  );
}

export function ScheduledLiveCard({
  live,
  onEdit,
  actionLabel = "수정",
}: {
  live: ScheduledLiveCardData;
  onEdit: () => void;
  actionLabel?: string;
}) {
  return (
    <article className="flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <ProfileImage src={live.imageUrl ?? undefined} />

      <div className="ml-4 min-w-0 flex-1">
        <strong className="block truncate text-body1 text-neutral-900">
          {live.isMine ? "내 예정 라이브" : live.bandName}
        </strong>

        <span className="mt-0.5 block truncate text-body3 text-neutral-700">
          {live.title}
        </span>

        <span className="mt-1 block truncate text-caption2 text-secondary-500">
          {live.scheduledAt}
        </span>
      </div>

      {live.isMine ? (
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 min-w-[69px] items-center justify-center rounded-lg bg-secondary-0 px-2 text-caption3 text-secondary-500"
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

interface BandLiveHomeProps {
  go: GoLiveScreen;
  onEnterLive: (live: ActiveLive) => void;
  onEditReservation: (liveId: number) => void;
}

const getFirstImageUrl = (...urls: Array<string | null | undefined>) => {
  return (
    urls.find((url) => typeof url === "string" && url.trim().length > 0) ??
    null
  );
};

const getScheduledThumbnailUrl = (
  live: ScheduledLiveItem | ScheduledLiveListItem,
) => {
  const liveWithFields = live as ScheduledLiveWithFields;

  return getFirstImageUrl(
    liveWithFields.thumbnailImageUrl,
    liveWithFields.thumbnailUrl,
    liveWithFields.liveThumbnailImageUrl,
    liveWithFields.liveThumbnailUrl,
    liveWithFields.thumbnailImage,
    liveWithFields.imageUrl,
  );
};

const getLiveNowImageUrl = (live: LiveNowWithFields) => {
  return getFirstImageUrl(
    live.thumbnailImageUrl,
    live.thumbnailUrl,
    live.liveThumbnailImageUrl,
    live.liveThumbnailUrl,
    live.imageUrl,
    live.bandProfileImageUrl,
  );
};

const getReservationThumbnailUrl = (
  reservation: ReservationThumbnailResponse | null | undefined,
) => {
  if (!reservation) {
    return null;
  }

  return getFirstImageUrl(
    reservation.thumbnailImageUrl,
    reservation.thumbnailUrl,
    reservation.liveThumbnailImageUrl,
    reservation.liveThumbnailUrl,
    reservation.imageUrl,
  );
};

const hasBandRelationField = (
  live:
    | ScheduledLiveItem
    | ScheduledLiveListItem
    | LiveNowWithFields,
) => {
  const liveWithFields = live as ScheduledLiveWithFields & LiveNowWithFields;

  return (
    liveWithFields.isMine !== undefined ||
    liveWithFields.isMyBand !== undefined ||
    liveWithFields.isBandMember !== undefined ||
    liveWithFields.isRelatedBand !== undefined ||
    liveWithFields.bandId !== undefined ||
    liveWithFields.myBandId !== undefined ||
    liveWithFields.bandProfileId !== undefined ||
    liveWithFields.bandMemberProfileId !== undefined ||
    liveWithFields.bandCode !== undefined
  );
};

const getBandRelationState = (
  live:
    | ScheduledLiveItem
    | ScheduledLiveListItem
    | LiveNowWithFields,
  activeBandId: number | null | undefined,
): RelationState => {
  const liveWithFields = live as ScheduledLiveWithFields & LiveNowWithFields;

  if (liveWithFields.isMine) {
    return "same";
  }

  if (
    liveWithFields.isMyBand ||
    liveWithFields.isBandMember ||
    liveWithFields.isRelatedBand
  ) {
    return "same";
  }

  if (!hasBandRelationField(live)) {
    return "unknown";
  }

  if (!activeBandId) {
    return "unknown";
  }

  const candidateBandIds = [
    liveWithFields.bandId,
    liveWithFields.myBandId,
    liveWithFields.bandProfileId,
    liveWithFields.bandMemberProfileId,
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

const mergeScheduledLive = (
  prevLive: ScheduledLiveItem | ScheduledLiveListItem | undefined,
  nextLive: ScheduledLiveItem | ScheduledLiveListItem,
): ScheduledLiveItem | ScheduledLiveListItem => {
  if (!prevLive) {
    return nextLive;
  }

  const prevImageFields = prevLive as ScheduledLiveWithFields;
  const nextImageFields = nextLive as ScheduledLiveWithFields;

  return {
    ...prevLive,
    ...nextLive,
    thumbnailImageUrl:
      getFirstImageUrl(
        nextImageFields.thumbnailImageUrl,
        prevImageFields.thumbnailImageUrl,
      ) ?? undefined,
    thumbnailUrl:
      getFirstImageUrl(
        nextImageFields.thumbnailUrl,
        prevImageFields.thumbnailUrl,
      ) ?? undefined,
    liveThumbnailImageUrl:
      getFirstImageUrl(
        nextImageFields.liveThumbnailImageUrl,
        prevImageFields.liveThumbnailImageUrl,
      ) ?? undefined,
    liveThumbnailUrl:
      getFirstImageUrl(
        nextImageFields.liveThumbnailUrl,
        prevImageFields.liveThumbnailUrl,
      ) ?? undefined,
    imageUrl:
      getFirstImageUrl(nextImageFields.imageUrl, prevImageFields.imageUrl) ??
      undefined,
    bandProfileImageUrl:
      getFirstImageUrl(
        nextImageFields.bandProfileImageUrl,
        prevImageFields.bandProfileImageUrl,
      ) ?? undefined,
  };
};

const mapLiveNowToCandidateCard = (
  live: LiveNowWithFields,
  activeBandId: number | null | undefined,
): LiveNowCandidateCard => {
  return {
    id: live.liveId,
    title: live.isMine ? "내 라이브 진행 중" : live.bandName,
    subtitle: live.title,
    listeners: `${live.viewerCount ?? live.viewCount ?? 0}명 청취 중`,
    imageUrl: getLiveNowImageUrl(live),
    isMine: live.isMine,
    relationState: getBandRelationState(live, activeBandId),
  };
};

const mapScheduledToCandidateCard = (
  live: ScheduledLiveItem | ScheduledLiveListItem,
  activeBandId: number | null | undefined,
): ScheduledCandidateCard => {
  return {
    id: live.liveId,
    bandName: live.bandName,
    title: live.title,
    scheduledAt: live.scheduledAt,
    isMine: Boolean(live.isMine),
    imageUrl: getScheduledThumbnailUrl(live),
    coHostUserIds: (live.coHosts ?? live.coHostList ?? [])
      .map((coHost) => coHost.userId)
      .filter((userId): userId is number => Number.isFinite(userId)),
    relationState: getBandRelationState(live, activeBandId),
  };
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

export function BandLiveHome({
  go,
  onEnterLive,
  onEditReservation,
}: BandLiveHomeProps) {
  const activeBandId = useActiveBandId();
  const now = useScheduledLiveNow();

  const {
    data,
    isLoading: isHomeLoading,
    isError: isHomeError,
    refetch: refetchHome,
  } = useLiveHomeQuery();

  const {
    data: scheduledListData,
    isLoading: isScheduledLoading,
    isError: isScheduledError,
    refetch: refetchScheduled,
  } = useScheduledLiveQuery(false);

  const enterLiveMutation = useEnterLiveMutation();
  const respondCoHostInvitationMutation = useRespondCoHostInvitationMutation();

  const { liveNowCandidates, scheduledCandidates } = useMemo(() => {
    const liveNowCandidates: LiveNowCandidateCard[] =
      data?.liveNow
        .map((live) => live as LiveNowWithFields)
        .map((live) => mapLiveNowToCandidateCard(live, activeBandId)) ?? [];

    const scheduledFromHome = data?.scheduled ?? [];
    const scheduledFromList =
      scheduledListData?.pages.flatMap((page) => page.items ?? []) ?? [];

    const mergedScheduledMap = new Map<
      number,
      ScheduledLiveItem | ScheduledLiveListItem
    >();

    scheduledFromList.forEach((live) => {
      mergedScheduledMap.set(
        live.liveId,
        mergeScheduledLive(mergedScheduledMap.get(live.liveId), live),
      );
    });

    scheduledFromHome.forEach((live) => {
      mergedScheduledMap.set(
        live.liveId,
        mergeScheduledLive(mergedScheduledMap.get(live.liveId), live),
      );
    });

    const scheduledCandidates = Array.from(mergedScheduledMap.values()).map(
      (live) => mapScheduledToCandidateCard(live, activeBandId),
    );

    return { liveNowCandidates, scheduledCandidates };
  }, [activeBandId, data, scheduledListData]);

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

  const displayLiveNowCards = useMemo<LiveCard[]>(() => {
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

  const displayScheduledCards = useMemo<ScheduledLiveCardData[]>(() => {
    return scheduledCandidates.flatMap((live, index) => {
      const reservationQuery = scheduledReservationQueries[index];
      const reservationData = reservationQuery?.data;
      const isReservationChecking =
        reservationQuery?.isLoading || reservationQuery?.isFetching;
      const reservationThumbnailUrl = getReservationThumbnailUrl(
        reservationData,
      );

      if (live.relationState === "same") {
        return [
          {
            ...live,
            imageUrl: reservationThumbnailUrl ?? live.imageUrl,
          },
        ];
      }

      if (isReservationChecking) {
        return [];
      }

      if (reservationData) {
        return [
          {
            ...live,
            imageUrl: reservationThumbnailUrl ?? live.imageUrl,
          },
        ];
      }

      return [];
    });
  }, [scheduledCandidates, scheduledReservationQueries]);

  const isCheckingLiveNowAccess =
    !isHomeLoading &&
    !isHomeError &&
    liveNowCandidates.length > 0 &&
    displayLiveNowCards.length === 0 &&
    liveNowAccessQueries.some((query) => query.isLoading || query.isFetching);

  const isCheckingScheduledAccess =
    !isHomeLoading &&
    !isScheduledLoading &&
    !isHomeError &&
    !isScheduledError &&
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

  const isLoading = isHomeLoading || isScheduledLoading;
  const isError = isHomeError && isScheduledError;

  const isEnterPending =
    enterLiveMutation.isPending || respondCoHostInvitationMutation.isPending;

  const handleRefreshLiveHome = useCallback(async () => {
    await Promise.all([refetchHome(), refetchScheduled()]);
  }, [refetchHome, refetchScheduled]);

  const liveHomePullToRefresh = usePullToRefresh<HTMLElement>({
    enabled: !isLoading && !isEnterPending,
    onRefresh: handleRefreshLiveHome,
  });

  const handleRetry = () => {
    void refetchHome();
    void refetchScheduled();
  };

  const enterAndMoveRoom = (enteredLive: EnterLiveResponse) => {
    removeCachedOwnedScheduledLive(Number(enteredLive.liveId));
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
        alert(getApiMessage(error, "라이브 입장에 실패했어요."));
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

  const handleScheduledLiveAction = (live: ScheduledLiveCardData) => {
    if (isScheduledLiveStartable(live.scheduledAt, now)) {
      void handleEnterLive(live.id);
      return;
    }

    onEditReservation(live.id);
  };

  return (
    <main
      ref={liveHomePullToRefresh.containerRef}
      className="relative min-h-dvh overscroll-y-contain bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900"
    >
      <PullToRefreshIndicator
        pullDistance={liveHomePullToRefresh.pullDistance}
        isRefreshing={liveHomePullToRefresh.isRefreshing}
      />

      <Header title="라이브" showBack={false} variant="main" />

      <div className="px-5">
        <section className="mt-5 flex min-h-[164px] w-full items-center justify-between rounded-xl bg-[#FFF6E5] p-[19px] shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
          <div className="min-w-0">
            <h2 className="text-label1 text-neutral-900">
              지금, 오디오 라이브를
              <br />
              시작 해보세요!
            </h2>

            <p className="mt-2 text-caption2 text-neutral-700">
              목소리만으로 팬들과 실시간 소통,
              <br />
              팔로워가 없어도 바로 시작할 수 있어요.
            </p>

            <button
              type="button"
              onClick={() => go("instantForm")}
              className="mt-3 flex h-[30px] w-[91px] items-center justify-center rounded-md bg-secondary-500 text-caption3 text-neutral-0"
            >
              라이브 시작하기
            </button>
          </div>

          <LiveIllustration />
        </section>

        {isLoading ? (
          <p className="mt-8 text-center text-caption2 text-neutral-500">
            라이브를 불러오는 중이에요.
          </p>
        ) : null}

        {isError ? (
          <div className="mt-8 rounded-xl bg-secondary-0 p-5 text-center">
            <p className="text-caption2 text-neutral-700">
              라이브 정보를 불러오지 못했어요.
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 rounded-lg bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
            >
              다시 불러오기
            </button>
          </div>
        ) : null}

        <section className="mt-8">
          <SectionHeader
            title="진행 중인 라이브"
            onClick={() => go("liveNowList")}
          />

          <div className="mt-3 grid gap-3">
            {isCheckingLiveNowAccess ? (
              <p className="rounded-xl bg-secondary-0 py-6 text-center text-caption2 text-neutral-500">
                현재 밴드의 진행 중인 라이브를 확인하는 중이에요.
              </p>
            ) : displayLiveNowCards.length > 0 ? (
              displayLiveNowCards.map((live) => (
                <HomeLiveCard
                  key={live.id}
                  live={live}
                  disabled={isEnterPending}
                  onEnter={() => void handleEnterLive(live.id)}
                />
              ))
            ) : (
              <p className="rounded-xl bg-secondary-0 py-6 text-center text-caption2 text-neutral-500">
                진행 중인 라이브가 없어요.
              </p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeader
            title="예정된 라이브"
            onClick={() => go("scheduledList")}
          />

          <div className="mt-3 grid gap-3">
            {isCheckingScheduledAccess ? (
              <p className="rounded-xl bg-secondary-0 py-6 text-center text-caption2 text-neutral-500">
                현재 밴드의 예정된 라이브를 확인하는 중이에요.
              </p>
            ) : displayScheduledCards.length > 0 ? (
              displayScheduledCards.map((live) => (
                <ScheduledLiveCard
                  key={live.id}
                  live={live}
                  actionLabel={
                    isScheduledLiveStartable(live.scheduledAt, now)
                      ? "라이브 시작"
                      : "수정"
                  }
                  onEdit={() => handleScheduledLiveAction(live)}
                />
              ))
            ) : (
              <p className="rounded-xl bg-secondary-0 py-6 text-center text-caption2 text-neutral-500">
                예정된 라이브가 없어요.
              </p>
            )}
          </div>
        </section>
      </div>

      <BottomNavBar modeOverride="band" />
    </main>
  );
}