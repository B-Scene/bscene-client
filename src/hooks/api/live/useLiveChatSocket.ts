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

const HEARTBEAT_INTERVAL_MS = 15_000;
const HEARTBEAT_TIMEOUT_MS = 35_000;
const MAX_RECONNECT_DELAY_MS = 10_000;

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
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastPongAtRef = useRef(0);
  const callbacksRef = useRef({
    onMessage,
    onConnected,
    onLiveEnded,
    onErrorFrame,
  });

  const [connectionStatus, setConnectionStatus] =
    useState<LiveChatConnectionStatus>("idle");
  const [lastErrorMessage, setLastErrorMessage] = useState("");

  useEffect(() => {
    callbacksRef.current = {
      onMessage,
      onConnected,
      onLiveEnded,
      onErrorFrame,
    };
  }, [onConnected, onErrorFrame, onLiveEnded, onMessage]);

  const clearTimers = useCallback(() => {
    if (pingTimerRef.current !== null) {
      window.clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }

    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
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
        data: { content: trimmedContent },
        clientMsgId,
      });

      if (!isSent) {
        setLastErrorMessage("채팅 서버에 연결 중이에요.");
        return null;
      }

      setLastErrorMessage("");
      return clientMsgId;
    },
    [sendFrame],
  );

  useEffect(() => {
    if (!enabled || !liveId) {
      clearTimers();
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    let active = true;
    let liveEnded = false;

    const scheduleReconnect = () => {
      if (!active || liveEnded || reconnectTimerRef.current !== null) return;

      const delay = Math.min(
        1_000 * 2 ** reconnectAttemptsRef.current,
        MAX_RECONNECT_DELAY_MS,
      );
      reconnectAttemptsRef.current += 1;
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        void connect();
      }, delay);
    };

    const connect = async () => {
      if (!active || liveEnded) return;

      try {
        setConnectionStatus("connecting");
        const ticketResult = await getLiveChatTicket(liveId);

        if (!active || liveEnded) return;

        const socket = new WebSocket(
          createLiveChatWebSocketUrl({
            liveId,
            ticket: ticketResult.ticket,
          }),
          ticketResult.subprotocol,
        );

        socketRef.current = socket;

        socket.onopen = () => {
          if (!active) return;

          reconnectAttemptsRef.current = 0;
          lastPongAtRef.current = Date.now();
          setConnectionStatus("open");
          setLastErrorMessage("");

          if (pingTimerRef.current !== null) {
            window.clearInterval(pingTimerRef.current);
          }

          pingTimerRef.current = window.setInterval(() => {
            if (Date.now() - lastPongAtRef.current > HEARTBEAT_TIMEOUT_MS) {
              socket.close();
              return;
            }

            sendFrame({
              type: "ping",
              data: {},
              clientMsgId: null,
            });
          }, HEARTBEAT_INTERVAL_MS);
        };

        socket.onmessage = (event) => {
          try {
            const frame = JSON.parse(String(event.data)) as LiveChatServerFrame;

            if (frame.type === "live-chat.message") {
              callbacksRef.current.onMessage(frame.data, frame);
              return;
            }

            if (frame.type === "pong") {
              lastPongAtRef.current = Date.now();
              return;
            }

            if (frame.type === "system.event") {
              if (frame.data.event === "connected") {
                callbacksRef.current.onConnected?.();
                return;
              }

              if (frame.data.event === "live-ended") {
                liveEnded = true;
                callbacksRef.current.onLiveEnded?.();
                socket.close(1000);
                return;
              }
            }

            if (frame.type === "system.error") {
              setLastErrorMessage(frame.data.message);
              callbacksRef.current.onErrorFrame?.(frame.data.message);
            }
          } catch {
            setLastErrorMessage("채팅 메시지 처리 중 오류가 발생했어요.");
          }
        };

        socket.onerror = () => {
          if (!active) return;
          setConnectionStatus("error");
          setLastErrorMessage("채팅 서버 연결 중 오류가 발생했어요.");
        };

        socket.onclose = () => {
          if (pingTimerRef.current !== null) {
            window.clearInterval(pingTimerRef.current);
            pingTimerRef.current = null;
          }

          if (socketRef.current === socket) {
            socketRef.current = null;
          }

          if (!active) return;

          setConnectionStatus("closed");
          scheduleReconnect();
        };
      } catch (error) {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : "라이브 채팅 연결에 실패했어요.";

        setConnectionStatus("error");
        setLastErrorMessage(message);
        callbacksRef.current.onErrorFrame?.(message);
        scheduleReconnect();
      }
    };

    void connect();

    return () => {
      active = false;
      clearTimers();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [clearTimers, enabled, liveId, sendFrame]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "open",
    lastErrorMessage,
    sendMessage,
  };
}
