import { useCallback, useEffect, useRef, useState } from "react";
import {
  createLiveChatWebSocketUrl,
  getLiveChatTicket,
} from "@/api/live/liveChat";
import type {
  LiveChatClientFrame,
  LiveChatConnectionStatus,
  LiveChatMessageData,
  LiveChatMessageFrame,
  LiveChatServerFrame,
} from "@/types/live/liveChat";

interface UseLiveChatSocketOptions {
  liveId?: number | null;
  enabled: boolean;
  onMessage: (message: LiveChatMessageData, frame: LiveChatMessageFrame) => void;
  onConnected?: () => void;
  onLiveEnded?: () => void;
  onErrorFrame?: (message: string) => void;
}

const createClientMsgId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function useLiveChatSocket({
  liveId,
  enabled,
  onMessage,
  onConnected,
  onLiveEnded,
  onErrorFrame,
}: UseLiveChatSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<number | null>(null);

  const [connectionStatus, setConnectionStatus] =
    useState<LiveChatConnectionStatus>("idle");
  const [lastErrorMessage, setLastErrorMessage] = useState("");

  const clearPingTimer = useCallback(() => {
    if (pingTimerRef.current !== null) {
      window.clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  const sendFrame = useCallback((frame: LiveChatClientFrame) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(frame));
    return true;
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        setLastErrorMessage("채팅 내용을 입력해주세요.");
        return null;
      }

      if (trimmedContent.length > 500) {
        setLastErrorMessage("채팅은 최대 500자까지 입력할 수 있어요.");
        return null;
      }

      const clientMsgId = createClientMsgId();

      const isSent = sendFrame({
        type: "live-chat.send",
        data: {
          content: trimmedContent,
        },
        clientMsgId,
      });

      if (!isSent) {
        setLastErrorMessage("채팅 서버에 연결 중이에요. 잠시 후 다시 시도해주세요.");
        return null;
      }

      return clientMsgId;
    },
    [sendFrame],
  );

  useEffect(() => {
    if (!enabled || !liveId) {
      setConnectionStatus("idle");
      clearPingTimer();

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      return;
    }

    let isAlive = true;

    const connect = async () => {
      try {
        setConnectionStatus("connecting");
        setLastErrorMessage("");

        const ticketResult = await getLiveChatTicket(liveId);

        if (!isAlive) return;

        const socket = new WebSocket(
          createLiveChatWebSocketUrl({
            liveId,
            ticket: ticketResult.ticket,
          }),
          ticketResult.subprotocol,
        );

        socketRef.current = socket;

        socket.onopen = () => {
          if (!isAlive) return;

          setConnectionStatus("open");
          onConnected?.();

          clearPingTimer();
          pingTimerRef.current = window.setInterval(() => {
            sendFrame({
              type: "ping",
              data: {},
              clientMsgId: null,
            });
          }, 15000);
        };

        socket.onmessage = (event) => {
          try {
            const frame = JSON.parse(event.data) as LiveChatServerFrame;

            if (frame.type === "live-chat.message") {
              onMessage(frame.data, frame);
              return;
            }

            if (frame.type === "system.event") {
              if (frame.data.event === "connected") {
                onConnected?.();
                return;
              }

              if (frame.data.event === "live-ended") {
                onLiveEnded?.();
                return;
              }
            }

            if (frame.type === "system.error") {
              const message = frame.data.message;
              setLastErrorMessage(message);
              onErrorFrame?.(message);
            }
          } catch {
            setLastErrorMessage("채팅 메시지 처리 중 오류가 발생했어요.");
          }
        };

        socket.onerror = () => {
          setConnectionStatus("error");
          setLastErrorMessage("채팅 서버 연결 중 오류가 발생했어요.");
        };

        socket.onclose = () => {
          clearPingTimer();

          if (!isAlive) return;

          setConnectionStatus("closed");
        };
      } catch (error) {
        if (!isAlive) return;

        setConnectionStatus("error");

        const message =
          error instanceof Error
            ? error.message
            : "라이브 채팅 연결에 실패했어요.";

        setLastErrorMessage(message);
        onErrorFrame?.(message);
      }
    };

    connect();

    return () => {
      isAlive = false;
      clearPingTimer();

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [
    clearPingTimer,
    enabled,
    liveId,
    onConnected,
    onErrorFrame,
    onLiveEnded,
    onMessage,
    sendFrame,
  ]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "open",
    lastErrorMessage,
    sendMessage,
  };
}