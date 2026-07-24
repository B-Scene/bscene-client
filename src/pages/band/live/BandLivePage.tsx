import { useCallback, useMemo, useState } from "react";
import { useLiveChatSocket } from "@/hooks/api/live/useLiveChatSocket";
import type {
  LiveChatMessageData,
  LiveChatMessageFrame,
} from "@/types/live/liveChat";
import { initialChatMessages } from "./data";
import { BandLiveHome } from "./BandLiveHome";
import { EndedLive } from "./EndedLive";
import { CancelConfirm, LiveForm } from "./LiveForm";
import { LiveChatRoom, LiveRoom } from "./LiveRoom";
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

export function BandLivePage() {
  const [screen, setScreen] = useState<BandLiveScreen>("home");
  const [activeLive, setActiveLive] = useState<ActiveLive>(null);
  const [endedLiveId, setEndedLiveId] = useState<number | null>(null);
  const [liveMessages, setLiveMessages] =
    useState<ChatMessage[]>(initialChatMessages);

  const isChatEnabled = useMemo(() => {
    return !!activeLive?.liveId && isLiveRoomScreen(screen);
  }, [activeLive?.liveId, screen]);

  const handleReceiveLiveChatMessage = useCallback(
    (message: LiveChatMessageData, frame: LiveChatMessageFrame) => {
      setLiveMessages((prevMessages) => {
        const messageFromServer = mapLiveChatMessageToChatMessage(message, frame);

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
  }, [activeLive?.liveId]);

  const {
    connectionStatus,
    lastErrorMessage: chatErrorMessage,
    sendMessage,
  } = useLiveChatSocket({
    liveId: activeLive?.liveId,
    enabled: isChatEnabled,
    onMessage: handleReceiveLiveChatMessage,
    onLiveEnded: handleLiveEndedFromSocket,
  });

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

  const handleEnterLive = (live: ActiveLive) => {
    setActiveLive(live);
    setEndedLiveId(null);
    setLiveMessages([]);
  };

  const handleGo = (nextScreen: BandLiveScreen) => {
    if (nextScreen === "ended" && activeLive?.liveId) {
      setEndedLiveId(activeLive.liveId);
    }

    setScreen(nextScreen);
  };

  if (screen === "room") {
    return (
      <LiveRoom
        go={handleGo}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
      />
    );
  }

  if (screen === "members") {
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

  if (screen === "chat") {
    return (
      <LiveChatRoom
        go={handleGo}
        live={activeLive}
        messages={liveMessages}
        onSendMessage={handleSendMessage}
      />
    );
  }

  if (screen === "endConfirm") {
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
      <LiveForm
        mode="instant"
        go={handleGo}
        onCreatedLive={handleEnterLive}
      />
    );
  }

  if (screen === "reserveForm") {
    return (
      <LiveForm
        mode="reserve"
        go={handleGo}
        onCreatedLive={handleEnterLive}
      />
    );
  }

  if (screen === "editForm") {
    return <LiveForm mode="edit" go={handleGo} />;
  }

  if (screen === "cancelConfirm") {
    return <CancelConfirm go={handleGo} />;
  }

  return <BandLiveHome go={handleGo} onEnterLive={handleEnterLive} />;
}

export default BandLivePage;