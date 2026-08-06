import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useEnterLiveMutation,
  useRespondCoHostInvitationMutation,
} from "@/hooks/api/live/useLive";
import { useLiveChatSocket } from "@/hooks/api/live/useLiveChatSocket";
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

const toChatTime = (value?: string) => {
  if (!value) return "지금";

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "지금";
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

const mapLiveChatMessageToChatMessage = (
  message: LiveChatMessageData,
  frame: LiveChatMessageFrame,
): ChatMessage => {
  return {
    id: Date.now() + Math.random(),
    sender: message.senderName,
    message: message.content,
    time: toChatTime(message.sentAt),
    highlighted: false,
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

export function BandLivePage() {
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

  const handledCoHostInviteLiveIdRef = useRef<number | null>(null);
  const isCoHostInviteProcessingRef = useRef(false);

  const respondCoHostInvitationMutation = useRespondCoHostInvitationMutation();
  const enterLiveMutation = useEnterLiveMutation();

  const coHostInviteLiveId = useMemo(
    () => getCoHostInviteLiveId(searchParams),
    [searchParams],
  );

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

    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleReceiveLiveChatMessage = useCallback(
    (message: LiveChatMessageData, frame: LiveChatMessageFrame) => {
      setLiveMessages((prevMessages) => {
        const messageFromServer = mapLiveChatMessageToChatMessage(
          message,
          frame,
        );

        const optimisticMessageIndex = frame.clientMsgId
          ? prevMessages.findIndex(
              (prevMessage) => prevMessage.clientMsgId === frame.clientMsgId,
            )
          : -1;

        if (optimisticMessageIndex >= 0) {
          const copiedMessages = [...prevMessages];

          copiedMessages[optimisticMessageIndex] = {
            ...copiedMessages[optimisticMessageIndex],
            id: copiedMessages[optimisticMessageIndex].id,
            sender: message.senderName,
            message: message.content,
            time: toChatTime(message.sentAt),
            highlighted: true,
            clientMsgId: frame.clientMsgId,
            serverMessageId: message.messageId,
            senderProfileImageUrl: message.senderProfileImageUrl,
            pending: false,
          };

          return copiedMessages;
        }

        return [...prevMessages, messageFromServer];
      });
    },
    [],
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
        sender: activeLive?.bandName ?? "나",
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
        await respondCoHostInvitationMutation.mutateAsync({
          liveId: coHostInviteLiveId,
          request: {
            isAccepted: true,
          },
        });

        const enteredLive = await enterLiveMutation.mutateAsync(
          coHostInviteLiveId,
        );

        handleEnterLive(enteredLive);
        setScreen("room");
        clearCoHostInviteSearchParams();
      } catch (error) {
        if (isAlreadyProcessedCoHostInvitationError(error)) {
          try {
            const enteredLive = await enterLiveMutation.mutateAsync(
              coHostInviteLiveId,
            );

            handleEnterLive(enteredLive);
            setScreen("room");
            clearCoHostInviteSearchParams();
            return;
          } catch (retryError) {
            alert(
              getErrorMessage(
                retryError,
                "공동 진행 초대 처리 후에도 라이브에 입장하지 못했어요.",
              ),
            );

            clearCoHostInviteSearchParams();
            return;
          }
        }

        alert(
          getErrorMessage(
            error,
            "공동 진행 초대를 수락하거나 라이브에 입장하지 못했어요.",
          ),
        );

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
    respondCoHostInvitationMutation,
  ]);

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
    <BandLiveHome
      go={handleGo}
      onEnterLive={handleEnterLive}
      onEditReservation={handleEditReservation}
    />
  );
}

export default BandLivePage;