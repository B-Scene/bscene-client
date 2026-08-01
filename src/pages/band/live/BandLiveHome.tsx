import { useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import LiveHeadIcon from "@/assets/icons/live-head.svg";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { subscribeViewerCount } from "@/api/live/live";
import { Header } from "@/components/band/home/Header";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
  useRequestCoHostUpgradeMutation,
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
}: {
  live: ScheduledLiveCardData;
  onEdit: () => void;
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
          className="flex h-8 w-[69px] items-center justify-center rounded-lg bg-secondary-0 text-caption3 text-secondary-500"
        >
          수정
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

// LIVE409_8: 이미 공동 진행자로 확정된 멤버 → 바로 입장 시도
const isAlreadyAcceptedCoHostError = (error: unknown) => {
  return (getApiErrorBody(error)?.code ?? "") === "LIVE409_8";
};

// LIVE409_9: 이미 처리 대기 중인 업그레이드 요청 → 수락 대기로 전환
const isAlreadyRequestedUpgradeError = (error: unknown) => {
  return (getApiErrorBody(error)?.code ?? "") === "LIVE409_9";
};

export function BandLiveHome({
  go,
  onEnterLive,
  onEditReservation,
}: BandLiveHomeProps) {
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
  const requestCoHostUpgradeMutation = useRequestCoHostUpgradeMutation();

  // 공동 송출자 업그레이드 요청 플로우 상태
  const [upgradeTargetLive, setUpgradeTargetLive] = useState<LiveCard | null>(
    null,
  );
  const [upgradeStage, setUpgradeStage] = useState<"confirm" | "waiting">(
    "confirm",
  );
  const upgradeSseAbortRef = useRef<AbortController | null>(null);

  const myUserId = data?.userId;

  const liveNowCards: LiveCard[] =
    data?.liveNow.map((live) => ({
      id: live.liveId,
      title: live.isMine ? "내 라이브 진행 중" : live.bandName,
      subtitle: live.title,
      listeners: `${live.viewerCount}명 청취 중`,
      imageUrl: live.bandProfileImageUrl,
      isMine: live.isMine,
      coHost: live.coHost,
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

  const scheduledCards = Array.from(mergedScheduledMap.values()).map(
    mapScheduledToCard,
  );

  const isLoading = isHomeLoading || isScheduledLoading;
  const isError = isHomeError && isScheduledError;

  const isEnterPending =
    enterLiveMutation.isPending ||
    respondCoHostInvitationMutation.isPending ||
    requestCoHostUpgradeMutation.isPending;

  const handleRetry = () => {
    void refetchHome();
    void refetchScheduled();
  };

  const enterAndMoveRoom = (enteredLive: EnterLiveResponse) => {
    onEnterLive(enteredLive);
    go("room");
  };

  const closeUpgradeFlow = () => {
    upgradeSseAbortRef.current?.abort();
    upgradeSseAbortRef.current = null;
    setUpgradeTargetLive(null);
    setUpgradeStage("confirm");
  };

  // 업그레이드 요청 후 수락 대기: 수락(coHostUpgradeAccepted) SSE 수신 시 enterLive를 재호출해 입장한다.
  // watchOnly=false(유저 등록 구독)여야만 타깃 이벤트를 받을 수 있다
  useEffect(() => {
    if (!upgradeTargetLive || upgradeStage !== "waiting") return;

    const controller = new AbortController();

    upgradeSseAbortRef.current = controller;

    subscribeViewerCount({
      liveId: upgradeTargetLive.id,
      watchOnly: false,
      onViewerCount: () => {},
      onCoHostUpgradeAccepted: () => {
        controller.abort();

        void (async () => {
          try {
            const enteredLive = await enterLiveMutation.mutateAsync(
              upgradeTargetLive.id,
            );

            closeUpgradeFlow();
            enterAndMoveRoom(enteredLive);
          } catch (error) {
            closeUpgradeFlow();
            alert(getApiMessage(error, "라이브 입장에 실패했어요."));
          }
        })();
      },
      signal: controller.signal,
    }).catch(() => {
      // SSE 연결 종료/취소는 조용히 처리
    });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgradeTargetLive, upgradeStage]);

  const handleConfirmUpgradeRequest = async () => {
    if (!upgradeTargetLive || isEnterPending) return;

    try {
      await requestCoHostUpgradeMutation.mutateAsync(upgradeTargetLive.id);
      setUpgradeStage("waiting");
    } catch (error) {
      // 이미 확정된 공동 진행자면 바로 입장
      if (isAlreadyAcceptedCoHostError(error)) {
        const targetLiveId = upgradeTargetLive.id;

        closeUpgradeFlow();

        try {
          const enteredLive = await enterLiveMutation.mutateAsync(targetLiveId);

          enterAndMoveRoom(enteredLive);
        } catch (enterError) {
          alert(getApiMessage(enterError, "라이브 입장에 실패했어요."));
        }
        return;
      }

      // 이미 대기 중인 요청이 있으면 수락 대기로 전환
      if (isAlreadyRequestedUpgradeError(error)) {
        setUpgradeStage("waiting");
        return;
      }

      closeUpgradeFlow();
      alert(
        getApiMessage(error, "공동 송출자 업그레이드 요청에 실패했어요."),
      );
    }
  };

  const handleEnterLive = async (live: LiveCard) => {
    if (isEnterPending) return;

    const liveId = live.id;

    // 진행자(coHost) 목록에 없는 밴드 멤버는 입장 대신 공동 송출자 업그레이드 요청 모달을 노출한다
    if (
      !live.isMine &&
      typeof myUserId === "number" &&
      Array.isArray(live.coHost) &&
      !live.coHost.includes(myUserId)
    ) {
      setUpgradeTargetLive(live);
      setUpgradeStage("confirm");
      return;
    }

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

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900">
      <Header title="라이브" showBack={false} variant="main" />

      <div className="px-5">
        <section className="mt-5 flex h-[164px] w-full items-center justify-between rounded-xl bg-secondary-0 px-[18px] shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
          <div className="min-w-0">
            <h2 className="text-[17px] leading-5 font-bold text-neutral-900">
              지금, 오디오 라이브를
              <br />
              시작 해보세요!
            </h2>
            <p className="mt-2 text-caption2 text-neutral-700">
              목소리만으로 팬들과 실시간 소통,
              <br />
              팔로워가 없어도 바로
              <br />
              시작할 수 있어요.
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
                  onEnter={() => void handleEnterLive(live)}
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
            {scheduledCards.length > 0 ? (
              scheduledCards.map((live) => (
                <ScheduledLiveCard
                  key={live.id}
                  live={live}
                  onEdit={() => onEditReservation(live.id)}
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

      {/* 공동 송출자 업그레이드 요청 모달: 확인 → 요청 전송, 이후 수락 대기 */}
      {upgradeTargetLive ? (
        <ModalOverlay
          open
          onClose={upgradeStage === "confirm" ? closeUpgradeFlow : undefined}
        >
          {upgradeStage === "confirm" ? (
            <Modal
              tone="orange"
              title="공동 송출자로 참여할까요?"
              description={
                <>
                  송출자가 수락하면
                  <br />
                  함께 라이브를 진행할 수 있어요
                </>
              }
              cancelLabel="취소"
              confirmLabel={
                requestCoHostUpgradeMutation.isPending ? "요청 중" : "요청"
              }
              onCancel={closeUpgradeFlow}
              onConfirm={() => void handleConfirmUpgradeRequest()}
            />
          ) : (
            <Modal
              tone="orange"
              title="송출자의 수락을 기다리고 있어요"
              description={
                <>
                  수락되면 자동으로
                  <br />
                  라이브에 입장해요
                </>
              }
              cancelLabel="취소"
              confirmLabel="대기 중"
              confirmDisabled
              onCancel={closeUpgradeFlow}
              onConfirm={() => {}}
            />
          )}
        </ModalOverlay>
      ) : null}

      <BottomNavBar modeOverride="band" />
    </main>
  );
}