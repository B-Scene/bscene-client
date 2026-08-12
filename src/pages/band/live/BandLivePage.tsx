import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import Modal from "@/components/Modal/Modal";
import { enterLive, requestCoHostUpgrade } from "@/api/live/live";
import { getBandMembers } from "@/api/band/bandMember";
import {
  useAcceptCoHostUpgradeMutation,
  useEnterLiveMutation,
  useRequestCoHostUpgradeMutation,
  useRespondCoHostInvitationMutation,
} from "@/hooks/api/live/useLive";
import { useLiveChatSocket } from "@/hooks/api/live/useLiveChatSocket";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import type {
  LiveChatMessageData,
  LiveChatMessageFrame,
} from "@/types/live/liveChat";
import { initialChatMessages } from "./data";
import { BandLiveHome } from "./BandLiveHome";
import {
  BandLiveNowListPage,
  BandLiveScheduledListPage,
} from "./BandLiveListPages";
import { EndedLive } from "./EndedLive";
import { CancelConfirm, LiveForm } from "./LiveForm";
import { LiveRoom } from "./LiveRoom";
import type { ActiveLive, BandLiveScreen, ChatMessage } from "./types";
import {
  cacheScheduledCoHostUserIds,
  getCachedScheduledCoHostUserIds,
} from "./scheduledLiveCache";

const toChatTime = (value?: string) => {
  if (!value) return "지금";

  const normalizedValue = value.includes("T")
    ? value
    : value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "지금";
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

const getCoHostUserIds = (live?: ActiveLive) => {
  return new Set(
    [...(live?.coHosts ?? []), ...(live?.coHostList ?? [])]
      .map((coHost) => coHost.userId)
      .filter((userId): userId is number => Number.isFinite(userId)),
  );
};

const isLiveSpeakerChatMessage = (
  message: LiveChatMessageData,
  live?: ActiveLive,
) => {
  const coHostUserIds = getCoHostUserIds(live);

  const isBandProfileMessage =
    Boolean(live?.bandProfileImageUrl) &&
    message.senderProfileImageUrl === live?.bandProfileImageUrl;

  const isCoHostMessage = coHostUserIds.has(message.senderId);

  return isBandProfileMessage || isCoHostMessage;
};

const mapLiveChatMessageToChatMessage = (
  message: LiveChatMessageData,
  frame: LiveChatMessageFrame,
  live?: ActiveLive,
): ChatMessage => {
  return {
    id: Date.now() + Math.random(),
    senderId: message.senderId,
    sender: message.senderName,
    message: message.content,
    time: toChatTime(message.sentAt),
    highlighted: isLiveSpeakerChatMessage(message, live),
    clientMsgId: frame.clientMsgId,
    serverMessageId: message.messageId,
    senderProfileImageUrl: message.senderProfileImageUrl,
    pending: false,
  };
};

const isLiveRoomScreen = (screen: BandLiveScreen) => {
  return (
    screen === "room" ||
    screen === "members" ||
    screen === "chat" ||
    screen === "endConfirm"
  );
};

const getApiErrorCode = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { data?: { code?: string } } }).response?.data
      ?.code;
  }

  return undefined;
};

const getApiErrorStatus = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as { response?: { status?: number; data?: { status?: number } } }
    ).response;

    return response?.status ?? response?.data?.status;
  }

  return undefined;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

const isAlreadyProcessedCoHostInvitationError = (error: unknown) => {
  const status = getApiErrorStatus(error);
  const code = getApiErrorCode(error) ?? "";

  return status === 409 || code.startsWith("LIVE409");
};

const isLiveEnterForbiddenError = (error: unknown) => {
  const status = getApiErrorStatus(error);
  const code = getApiErrorCode(error) ?? "";

  return (
    status === 403 ||
    status === 404 ||
    code.startsWith("LIVE403") ||
    code.startsWith("LIVE404")
  );
};

const isNotFoundError = (error: unknown) => {
  const status = getApiErrorStatus(error);
  const code = getApiErrorCode(error) ?? "";

  return status === 404 || code.startsWith("LIVE404");
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const isCoHostInviteType = (value: string | null) => {
  const type = value?.toUpperCase() ?? "";

  return (
    (type.includes("CO_HOST") || type.includes("COHOST")) &&
    (type.includes("INVITE") || type.includes("INVITATION"))
  );
};

const isLiveReferenceType = (value: string | null) => {
  return value?.toUpperCase() === "LIVE";
};

const isAcceptAction = (value: string | null) => {
  return value?.toLowerCase() === "accept";
};

const getValidLiveId = (value: string | null) => {
  if (!value) return null;

  const liveId = Number(value);

  return Number.isFinite(liveId) && liveId > 0 ? liveId : null;
};

const getCoHostInviteLiveId = (searchParams: URLSearchParams) => {
  const explicitLiveId =
    getValidLiveId(searchParams.get("coHostInviteLiveId")) ??
    getValidLiveId(searchParams.get("coHostInvitationLiveId"));

  if (explicitLiveId) return explicitLiveId;

  const type = searchParams.get("type");
  const action = searchParams.get("action");

  if (!isCoHostInviteType(type) && !isLiveReferenceType(type)) {
    return null;
  }

  if (isLiveReferenceType(type) && !isAcceptAction(action)) {
    return null;
  }

  return (
    getValidLiveId(searchParams.get("liveId")) ??
    getValidLiveId(searchParams.get("referenceId"))
  );
};

const getCoHostUpgradeApprovalLiveId = (searchParams: URLSearchParams) => {
  const type = searchParams.get("type")?.toUpperCase() ?? "";
  const action = searchParams.get("action")?.toLowerCase() ?? "";
  const isUpgradeRequest =
    (type.includes("CO_HOST") || type.includes("COHOST")) &&
    (type.includes("UPGRADE") || type.includes("REQUEST"));

  if (!isUpgradeRequest || (action && action !== "approve")) return null;

  return (
    getValidLiveId(searchParams.get("liveId")) ??
    getValidLiveId(searchParams.get("referenceId"))
  );
};

const isCoHostBroadcastReady = (live: NonNullable<ActiveLive>) =>
  live.playback.role === "CO_HOST" &&
  live.playback.protocol === "WHIP" &&
  Boolean(live.playback.playbackUrl);

export function BandLivePage() {
  const activeBandId = useActiveBandId();
  const [searchParams, setSearchParams] = useSearchParams();

  const [screen, setScreen] = useState<BandLiveScreen>("home");
  const [activeLive, setActiveLive] = useState<ActiveLive>(null);
  const [endedLiveId, setEndedLiveId] = useState<number | null>(null);
  const [selectedReservationLiveId, setSelectedReservationLiveId] = useState<
    number | null
  >(null);
  const [liveMessages, setLiveMessages] =
    useState<ChatMessage[]>(initialChatMessages);
  const [isHandlingCoHostInvite, setIsHandlingCoHostInvite] = useState(false);
  const [isLiveEndedModalOpen, setIsLiveEndedModalOpen] = useState(false);
  const [pendingCoHostUpgradeLiveId, setPendingCoHostUpgradeLiveId] = useState<
    number | null
  >(null);

  const handledCoHostInviteLiveIdRef = useRef<number | null>(null);
  const isCoHostInviteProcessingRef = useRef(false);
  const handledCoHostUpgradeApprovalLiveIdRef = useRef<number | null>(null);
  const pendingCoHostMonitorPlaybackRef = useRef<
    NonNullable<ActiveLive>["playback"] | null
  >(null);

  const respondCoHostInvitationMutation = useRespondCoHostInvitationMutation();
  const requestCoHostUpgradeMutation = useRequestCoHostUpgradeMutation();
  const acceptCoHostUpgradeMutation = useAcceptCoHostUpgradeMutation();
  const enterLiveMutation = useEnterLiveMutation();

  const coHostInviteLiveId = useMemo(
    () => getCoHostInviteLiveId(searchParams),
    [searchParams],
  );

  const coHostUpgradeApprovalLiveId = useMemo(
    () => getCoHostUpgradeApprovalLiveId(searchParams),
    [searchParams],
  );

  const coHostRequesterUserId = getValidLiveId(
    searchParams.get("coHostRequesterUserId"),
  );
  const coHostRequesterNickname = searchParams.get("coHostRequesterNickname");

  const isChatEnabled = useMemo(() => {
    return !!activeLive?.liveId && isLiveRoomScreen(screen);
  }, [activeLive?.liveId, screen]);

  const clearCoHostInviteSearchParams = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("coHostInviteLiveId");
    nextParams.delete("coHostInvitationLiveId");
    nextParams.delete("liveId");
    nextParams.delete("referenceId");
    nextParams.delete("type");
    nextParams.delete("action");
    nextParams.delete("coHostRequesterUserId");
    nextParams.delete("coHostRequesterNickname");

    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleReceiveLiveChatMessage = useCallback(
    (message: LiveChatMessageData, frame: LiveChatMessageFrame) => {
      setLiveMessages((prevMessages) => {
        const messageFromServer = mapLiveChatMessageToChatMessage(
          message,
          frame,
          activeLive,
        );

        const optimisticMessageIndex = frame.clientMsgId
          ? prevMessages.findIndex(
              (prevMessage) => prevMessage.clientMsgId === frame.clientMsgId,
            )
          : -1;

        if (optimisticMessageIndex >= 0) {
          const copiedMessages = [...prevMessages];

          copiedMessages[optimisticMessageIndex] = {
            ...messageFromServer,
            id: copiedMessages[optimisticMessageIndex].id,
            highlighted:
              copiedMessages[optimisticMessageIndex].highlighted ||
              messageFromServer.highlighted,
          };

          return copiedMessages;
        }

        return [...prevMessages, messageFromServer];
      });
    },
    [activeLive],
  );

  const handleLiveEndedFromSocket = useCallback(() => {
    if (activeLive?.liveId) {
      setEndedLiveId(activeLive.liveId);
    }

    setScreen("ended");
  }, [activeLive]);

  const { lastErrorMessage: chatErrorMessage, sendMessage } = useLiveChatSocket(
    {
      liveId: activeLive?.liveId,
      enabled: isChatEnabled,
      onMessage: handleReceiveLiveChatMessage,
      onLiveEnded: handleLiveEndedFromSocket,
    },
  );

  const handleSendMessage = (message: string) => {
    const clientMsgId = sendMessage(message);

    if (!clientMsgId) {
      if (chatErrorMessage) {
        alert(chatErrorMessage);
      } else {
        alert("채팅 서버에 연결 중이에요. 잠시 후 다시 시도해주세요.");
      }

      return;
    }

    setLiveMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        sender: "나",
        message,
        time: "지금",
        highlighted: true,
        clientMsgId,
        pending: true,
      },
    ]);
  };

  const handleEnterLive = useCallback((live: ActiveLive) => {
    if (!live) return;

    setActiveLive(live);
    setEndedLiveId(null);
    setLiveMessages([]);
  }, []);

  const handleEditReservation = (liveId: number) => {
    setSelectedReservationLiveId(liveId);
    setScreen("editForm");
  };

  const handleGo = (nextScreen: BandLiveScreen) => {
    if (nextScreen === "ended" && activeLive?.liveId) {
      setEndedLiveId(activeLive.liveId);
    }

    if (nextScreen === "home") {
      setSelectedReservationLiveId(null);
    }

    setScreen(nextScreen);
  };

  useEffect(() => {
    if (!coHostInviteLiveId) return;
    if (handledCoHostInviteLiveIdRef.current === coHostInviteLiveId) return;
    if (isCoHostInviteProcessingRef.current) return;

    const handleCoHostInvite = async () => {
      isCoHostInviteProcessingRef.current = true;
      handledCoHostInviteLiveIdRef.current = coHostInviteLiveId;
      setIsHandlingCoHostInvite(true);

      try {
        try {
          await respondCoHostInvitationMutation.mutateAsync({
            liveId: coHostInviteLiveId,
            request: { isAccepted: true },
          });
        } catch (invitationError) {
          if (!isAlreadyProcessedCoHostInvitationError(invitationError)) {
            throw invitationError;
          }
        }

        try {
          const enteredLive = await enterLiveMutation.mutateAsync(
            coHostInviteLiveId,
          );

          if (isCoHostBroadcastReady(enteredLive)) {
            handleEnterLive(enteredLive);
            setScreen("room");
            clearCoHostInviteSearchParams();
            return;
          }

          if (enteredLive.playback.role === "LISTENER") {
            pendingCoHostMonitorPlaybackRef.current = enteredLive.playback;
          }
        } catch (enterError) {
          if (!isLiveEnterForbiddenError(enterError)) throw enterError;
        }

        try {
          await requestCoHostUpgradeMutation.mutateAsync(coHostInviteLiveId);
        } catch (upgradeError) {
          if (
            !isAlreadyProcessedCoHostInvitationError(upgradeError) &&
            !isLiveEnterForbiddenError(upgradeError)
          ) {
            throw upgradeError;
          }
        }

        setPendingCoHostUpgradeLiveId(coHostInviteLiveId);
      } catch (error) {
        if (isNotFoundError(error)) {
          setIsLiveEndedModalOpen(true);
        } else {
          alert(
            getErrorMessage(
              error,
              "공동 진행 초대를 처리하지 못했어요. 오너가 예약 라이브를 시작했는지 확인해주세요.",
            ),
          );
        }
        clearCoHostInviteSearchParams();
      } finally {
        setIsHandlingCoHostInvite(false);
        isCoHostInviteProcessingRef.current = false;
      }
    };

    void handleCoHostInvite();
  }, [
    clearCoHostInviteSearchParams,
    coHostInviteLiveId,
    enterLiveMutation,
    handleEnterLive,
    requestCoHostUpgradeMutation,
    respondCoHostInvitationMutation,
  ]);

  useEffect(() => {
    if (!coHostUpgradeApprovalLiveId) return;

    if (
      handledCoHostUpgradeApprovalLiveIdRef.current ===
      coHostUpgradeApprovalLiveId
    ) {
      return;
    }

    handledCoHostUpgradeApprovalLiveIdRef.current =
      coHostUpgradeApprovalLiveId;

    const approveAndEnterLive = async () => {
      setIsHandlingCoHostInvite(true);

      try {
        let requesterUserIds = coHostRequesterUserId
          ? [coHostRequesterUserId]
          : getCachedScheduledCoHostUserIds(coHostUpgradeApprovalLiveId);

        if (
          requesterUserIds.length === 0 &&
          activeBandId &&
          coHostRequesterNickname
        ) {
          const members = await getBandMembers(activeBandId);
          const matchedMember = members.find(
            (member) =>
              member.profileNickname?.trim() === coHostRequesterNickname.trim(),
          );

          if (matchedMember) requesterUserIds = [matchedMember.userId];
        }

        if (requesterUserIds.length === 0) {
          throw new Error("승인할 공동 진행자 정보를 찾을 수 없어요.");
        }

        cacheScheduledCoHostUserIds(
          coHostUpgradeApprovalLiveId,
          requesterUserIds,
        );

        const enteredLive = await enterLiveMutation.mutateAsync(
          coHostUpgradeApprovalLiveId,
        );

        let isApproved = false;

        for (let attempt = 0; attempt < 10 && !isApproved; attempt += 1) {
          try {
            await Promise.all(
              requesterUserIds.map((userId) =>
                acceptCoHostUpgradeMutation.mutateAsync({
                  liveId: coHostUpgradeApprovalLiveId,
                  userId,
                }),
              ),
            );
            isApproved = true;
          } catch (approvalError) {
            if (isAlreadyProcessedCoHostInvitationError(approvalError)) {
              isApproved = true;
              break;
            }

            if (!isNotFoundError(approvalError) || attempt === 9) {
              throw approvalError;
            }

            await wait(1000);
          }
        }

        handleEnterLive(enteredLive);
        setScreen("room");
      } catch (error) {
        alert(
          getErrorMessage(
            error,
            "공동 송출자 요청을 수락하거나 라이브에 입장하지 못했어요.",
          ),
        );
      } finally {
        clearCoHostInviteSearchParams();
        setIsHandlingCoHostInvite(false);
      }
    };

    void approveAndEnterLive();
  }, [
    acceptCoHostUpgradeMutation,
    activeBandId,
    clearCoHostInviteSearchParams,
    coHostRequesterNickname,
    coHostRequesterUserId,
    coHostUpgradeApprovalLiveId,
    enterLiveMutation,
    handleEnterLive,
  ]);

  useEffect(() => {
    if (!pendingCoHostUpgradeLiveId) return;

    let isCancelled = false;
    let timeoutId: number | undefined;
    let hasRequestedUpgrade = false;

    const retryEnterLive = async () => {
      if (!hasRequestedUpgrade) {
        try {
          await requestCoHostUpgrade(pendingCoHostUpgradeLiveId);
          hasRequestedUpgrade = true;
        } catch (upgradeError) {
          if (isAlreadyProcessedCoHostInvitationError(upgradeError)) {
            hasRequestedUpgrade = true;
          } else if (!isLiveEnterForbiddenError(upgradeError)) {
            return;
          }
        }
      }

      try {
        const enteredLive = await enterLive(pendingCoHostUpgradeLiveId);

        if (isCancelled) return;

        if (isCoHostBroadcastReady(enteredLive)) {
          const monitorPlayback = pendingCoHostMonitorPlaybackRef.current;

          setPendingCoHostUpgradeLiveId(null);
          handleEnterLive({
            ...enteredLive,
            monitorPlaybackUrl: monitorPlayback?.playbackUrl ?? null,
            monitorPlaybackProtocol: monitorPlayback?.protocol ?? null,
          });
          pendingCoHostMonitorPlaybackRef.current = null;
          setScreen("room");
          clearCoHostInviteSearchParams();
          return;
        }
      } catch {
        // 오너가 승인하기 전에는 입장 API가 403/409를 반환할 수 있습니다.
      }

      if (!isCancelled) {
        timeoutId = window.setTimeout(retryEnterLive, 3000);
      }
    };

    timeoutId = window.setTimeout(retryEnterLive, 1500);

    return () => {
      isCancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [
    clearCoHostInviteSearchParams,
    handleEnterLive,
    pendingCoHostUpgradeLiveId,
  ]);

  if (pendingCoHostUpgradeLiveId) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-neutral-0 px-6 text-center text-neutral-900">
        <div>
          <p className="text-body1 font-semibold">
            오너의 공동 송출 승인을 기다리고 있어요
          </p>
          <p className="mt-2 text-body3 text-neutral-500">
            승인되면 자동으로 라이브방에 입장합니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setPendingCoHostUpgradeLiveId(null);
              clearCoHostInviteSearchParams();
              setScreen("home");
            }}
            className="mt-5 rounded-lg border border-secondary-500 px-4 py-2 text-caption3 text-secondary-500"
          >
            라이브 홈으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  if (isHandlingCoHostInvite) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-neutral-0 px-6 text-center text-neutral-900">
        <div>
          <p className="text-body1 font-semibold">
            공동 진행 초대를 수락하는 중이에요
          </p>
          <p className="mt-2 text-body3 text-neutral-500">
            잠시만 기다려주세요.
          </p>
        </div>
      </main>
    );
  }

  if (screen === "liveNowList") {
    return <BandLiveNowListPage go={handleGo} onEnterLive={handleEnterLive} />;
  }

  if (screen === "scheduledList") {
    return (
      <BandLiveScheduledListPage
        go={handleGo}
        onEnterLive={handleEnterLive}
        onEditReservation={handleEditReservation}
      />
    );
  }

  if (screen === "room" || screen === "chat") {
    if (!activeLive) {
      return (
        <BandLiveHome
          go={handleGo}
          onEnterLive={handleEnterLive}
          onEditReservation={handleEditReservation}
        />
      );
    }

    return (
      <LiveRoom
        go={handleGo}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
        chatOpen={screen === "chat"}
      />
    );
  }

  if (screen === "members") {
    if (!activeLive) {
      return (
        <BandLiveHome
          go={handleGo}
          onEnterLive={handleEnterLive}
          onEditReservation={handleEditReservation}
        />
      );
    }

    return (
      <LiveRoom
        go={handleGo}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
        overlay="members"
      />
    );
  }

  if (screen === "endConfirm") {
    if (!activeLive) {
      return (
        <BandLiveHome
          go={handleGo}
          onEnterLive={handleEnterLive}
          onEditReservation={handleEditReservation}
        />
      );
    }

    return (
      <LiveRoom
        go={handleGo}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
        overlay="endConfirm"
      />
    );
  }

  if (screen === "ended") {
    return <EndedLive go={handleGo} liveId={endedLiveId} />;
  }

  if (screen === "instantForm") {
    return (
      <LiveForm mode="instant" go={handleGo} onCreatedLive={handleEnterLive} />
    );
  }

  if (screen === "reserveForm") {
    return (
      <LiveForm mode="reserve" go={handleGo} onCreatedLive={handleEnterLive} />
    );
  }

  if (screen === "editForm") {
    return (
      <LiveForm
        mode="edit"
        go={handleGo}
        reservationLiveId={selectedReservationLiveId}
      />
    );
  }

  if (screen === "cancelConfirm") {
    return <CancelConfirm go={handleGo} />;
  }

  return (
    <>
      <BandLiveHome
        go={handleGo}
        onEnterLive={handleEnterLive}
        onEditReservation={handleEditReservation}
      />

      <ModalOverlay
        open={isLiveEndedModalOpen}
        onClose={() => setIsLiveEndedModalOpen(false)}
      >
        <Modal
          tone="orange"
          title="라이브가 이미 종료되었어요"
          description="종료된 라이브에는 참여할 수 없어요"
          showCancel={false}
          confirmLabel="확인"
          onConfirm={() => setIsLiveEndedModalOpen(false)}
        />
      </ModalOverlay>
    </>
  );
}

export default BandLivePage;