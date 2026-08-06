import { useEffect, useMemo } from "react";
import type { AxiosError } from "axios";
import LiveHeadIcon from "@/assets/icons/live-head.svg";
import { Header } from "@/components/common/Header/Header";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
  useRespondCoHostInvitationMutation,
  useScheduledLiveQuery,
} from "@/hooks/api/live/useLive";
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

const getScheduledImageUrl = (
  live: ScheduledLiveItem | ScheduledLiveListItem,
) => {
  return live.bandProfileImageUrl ?? live.thumbnailImageUrl ?? null;
};

const mapScheduledToCard = (
  live: ScheduledLiveItem | ScheduledLiveListItem,
): ScheduledLiveCardData => {
  return {
    id: live.liveId,
    bandName: live.bandName,
    title: live.title,
    scheduledAt: live.scheduledAt,
    isMine: Boolean(live.isMine),
    imageUrl: getScheduledImageUrl(live),
    coHostUserIds: (live.coHosts ?? live.coHostList ?? [])
      .map((coHost) => coHost.userId)
      .filter((userId): userId is number => Number.isFinite(userId)),
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

  const { liveNowCards, scheduledCards } = useMemo(() => {
    const liveNowCards: LiveCard[] =
      data?.liveNow.map((live) => ({
        id: live.liveId,
        title: live.isMine ? "내 라이브 진행 중" : live.bandName,
        subtitle: live.title,
        listeners: `${live.viewerCount}명 청취 중`,
        imageUrl: live.bandProfileImageUrl,
        isMine: live.isMine,
      })) ?? [];

    const scheduledFromHome = data?.scheduled ?? [];
    const scheduledFromList =
      scheduledListData?.pages.flatMap((page) => page.items ?? []) ?? [];

    const mergedScheduledMap = new Map<
      number,
      ScheduledLiveItem | ScheduledLiveListItem
    >();

    scheduledFromList.forEach((live) => {
      mergedScheduledMap.set(live.liveId, live);
    });

    scheduledFromHome.forEach((live) => {
      mergedScheduledMap.set(live.liveId, live);
    });

    const fetchedScheduledCards = Array.from(mergedScheduledMap.values()).map(
      mapScheduledToCard,
    );
    const retainedScheduledMap = new Map(
      getCachedOwnedScheduledLives().map((live) => [live.id, live]),
    );

    fetchedScheduledCards.forEach((live) => {
      retainedScheduledMap.set(live.id, live);
    });

    liveNowCards.forEach((live) => {
      retainedScheduledMap.delete(live.id);
    });

    const scheduledCards = Array.from(retainedScheduledMap.values());

    return { liveNowCards, scheduledCards };
  }, [data, scheduledListData]);
  const retainedScheduledCards = useRetainedScheduledLiveCards(scheduledCards);

  useEffect(() => {
    cacheOwnedScheduledLives(retainedScheduledCards);
    retainedScheduledCards.forEach((live) => {
      cacheScheduledCoHostUserIds(live.id, live.coHostUserIds ?? []);
    });
  }, [retainedScheduledCards]);

  const isLoading = isHomeLoading || isScheduledLoading;
  const isError = isHomeError && isScheduledError;

  const isEnterPending =
    enterLiveMutation.isPending || respondCoHostInvitationMutation.isPending;

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
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900">
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
            {liveNowCards.length > 0 ? (
              liveNowCards.map((live) => (
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
            {retainedScheduledCards.length > 0 ? (
              retainedScheduledCards.map((live) => (
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
