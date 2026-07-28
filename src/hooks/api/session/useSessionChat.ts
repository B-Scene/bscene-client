import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createChatRoom,
  getChatRoomDetail,
  getChatRooms,
  getChatWebSocketUrl,
  issueChatWebSocketTicket,
} from "@/api/session/sessionChat";
import type {
  ChatRoomDetailParams,
  ChatRoomsParams,
  CreateChatRoomRequest,
  DirectMessageClientFrame,
  DirectMessageData,
  DirectMessageErrorFrame,
  DirectMessageReadData,
  DirectMessageServerFrame,
} from "@/types/session/sessionChat";

export const sessionChatKeys = {
  all: ["sessionChat"] as const,

  rooms: () => [...sessionChatKeys.all, "rooms"] as const,

  roomList: (params: ChatRoomsParams) =>
    [...sessionChatKeys.rooms(), params] as const,

  detail: (chatRoomId: number, params: ChatRoomDetailParams) =>
    [...sessionChatKeys.all, "detail", chatRoomId, params] as const,

  wsTicket: () => [...sessionChatKeys.all, "wsTicket"] as const,
};

const PING_INTERVAL_MS = 20_000;
const PONG_TIMEOUT_MS = 10_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

const createClientMsgId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getReconnectDelay = (attempt: number) => {
  return Math.min(1000 * 2 ** attempt, MAX_RECONNECT_DELAY_MS);
};

interface UseSessionDirectMessageSocketParams {
  chatRoomId: number;
  enabled?: boolean;
  onMessage?: (
    message: DirectMessageData,
    frame: Extract<DirectMessageServerFrame, { type: "dm.message" }>,
  ) => void;
  onRead?: (
    readData: DirectMessageReadData,
    frame: Extract<DirectMessageServerFrame, { type: "dm.read" }>,
  ) => void;
  onError?: (frame: DirectMessageErrorFrame) => void;
  onConnected?: () => void;
}

export const useCreateChatRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateChatRoomRequest) => createChatRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionChatKeys.rooms(),
      });
    },
  });
};

export const useCreateSessionChatRoomMutation = useCreateChatRoomMutation;

export const useChatRoomsQuery = (params: ChatRoomsParams = {}) => {
  return useQuery({
    queryKey: sessionChatKeys.roomList(params),
    queryFn: () => getChatRooms(params),
    staleTime: 1000 * 30,
  });
};

export const useSessionChatRoomsQuery = useChatRoomsQuery;

export const useChatRoomDetailQuery = (
  chatRoomId: number,
  params: ChatRoomDetailParams = {},
) => {
  return useQuery({
    queryKey: sessionChatKeys.detail(chatRoomId, params),
    queryFn: () => getChatRoomDetail(chatRoomId, params),
    enabled: chatRoomId > 0,
    staleTime: 1000 * 10,
  });
};

export const useSessionChatRoomDetailQuery = useChatRoomDetailQuery;

export const useIssueChatWebSocketTicketMutation = () => {
  return useMutation({
    mutationFn: issueChatWebSocketTicket,
  });
};

export const useSessionDirectMessageSocket = ({
  chatRoomId,
  enabled = true,
  onMessage,
  onRead,
  onError,
  onConnected,
}: UseSessionDirectMessageSocketParams) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pingTimerRef = useRef<number | null>(null);
  const pongTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);
  const reconnectAttemptRef = useRef(0);

  const onMessageRef = useRef(onMessage);
  const onReadRef = useRef(onRead);
  const onErrorRef = useRef(onError);
  const onConnectedRef = useRef(onConnected);

  const [isConnected, setIsConnected] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState("");

  useEffect(() => {
    onMessageRef.current = onMessage;
    onReadRef.current = onRead;
    onErrorRef.current = onError;
    onConnectedRef.current = onConnected;
  }, [
    onConnected,
    onError,
    onMessage,
    onRead,
  ]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const clearHeartbeat = useCallback(() => {
    if (pingTimerRef.current) {
      window.clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }

    if (pongTimeoutRef.current) {
      window.clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
  }, []);

  const sendRawFrame = useCallback((frame: DirectMessageClientFrame) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setLastErrorMessage("쪽지 서버에 연결 중이에요. 잠시 후 다시 시도해주세요.");
      return false;
    }

    socket.send(JSON.stringify(frame));
    return true;
  }, []);

  const sendPing = useCallback(() => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "ping",
        data: {},
        clientMsgId: null,
      }),
    );

    if (pongTimeoutRef.current) {
      window.clearTimeout(pongTimeoutRef.current);
    }

    pongTimeoutRef.current = window.setTimeout(() => {
      setLastErrorMessage("쪽지 서버 응답이 없어 재연결합니다.");

      const currentSocket = socketRef.current;

      if (
        currentSocket &&
        (currentSocket.readyState === WebSocket.OPEN ||
          currentSocket.readyState === WebSocket.CONNECTING)
      ) {
        currentSocket.close();
      }
    }, PONG_TIMEOUT_MS);
  }, []);

  const startHeartbeat = useCallback(() => {
    clearHeartbeat();

    pingTimerRef.current = window.setInterval(() => {
      sendPing();
    }, PING_INTERVAL_MS);
  }, [
    clearHeartbeat,
    sendPing,
  ]);

  const closeSocket = useCallback(() => {
    shouldReconnectRef.current = false;

    clearReconnectTimer();
    clearHeartbeat();

    const socket = socketRef.current;

    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    }

    socketRef.current = null;
    setIsConnected(false);
  }, [
    clearHeartbeat,
    clearReconnectTimer,
  ]);

  const connectSocket = useCallback(async () => {
    if (!enabled || chatRoomId <= 0) {
      return;
    }

    const currentSocket = socketRef.current;

    if (
      currentSocket &&
      (currentSocket.readyState === WebSocket.OPEN ||
        currentSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    shouldReconnectRef.current = true;
    setLastErrorMessage("");

    try {
      const ticketResult = await issueChatWebSocketTicket();

      if (!shouldReconnectRef.current) {
        return;
      }

      const socketUrl = getChatWebSocketUrl(ticketResult.ticket);
      const subprotocol = ticketResult.subprotocol || "dm.v1";
      const socket = new WebSocket(socketUrl, subprotocol);

      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setIsConnected(true);
        setLastErrorMessage("");
        startHeartbeat();
      };

      socket.onmessage = (event) => {
        try {
          if (typeof event.data !== "string") {
            return;
          }

          const frame = JSON.parse(event.data) as DirectMessageServerFrame;

          if (frame.type === "system.event") {
            if (frame.data.event === "connected") {
              onConnectedRef.current?.();
            }

            return;
          }

          if (frame.type === "pong") {
            if (pongTimeoutRef.current) {
              window.clearTimeout(pongTimeoutRef.current);
              pongTimeoutRef.current = null;
            }

            return;
          }

          if (frame.type === "dm.message") {
            if (frame.data.chatRoomId !== chatRoomId) {
              return;
            }

            onMessageRef.current?.(frame.data, frame);
            return;
          }

          if (frame.type === "dm.read") {
            if (frame.data.chatRoomId !== chatRoomId) {
              return;
            }

            onReadRef.current?.(frame.data, frame);
            return;
          }

          if (frame.type === "system.error") {
            const message =
              frame.data.message || "쪽지 처리 중 오류가 발생했어요.";

            setLastErrorMessage(message);
            onErrorRef.current?.(frame);
          }
        } catch {
          setLastErrorMessage("쪽지 응답을 처리하지 못했어요.");
        }
      };

      socket.onerror = () => {
        setLastErrorMessage("쪽지 WebSocket 연결 중 오류가 발생했어요.");
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        clearHeartbeat();
        setIsConnected(false);

        if (!shouldReconnectRef.current) {
          return;
        }

        const delay = getReconnectDelay(reconnectAttemptRef.current);
        reconnectAttemptRef.current += 1;

        clearReconnectTimer();

        reconnectTimerRef.current = window.setTimeout(() => {
          void connectSocket();
        }, delay);
      };
    } catch {
      setIsConnected(false);
      setLastErrorMessage("쪽지 WebSocket 연결 티켓 발급에 실패했어요.");

      if (shouldReconnectRef.current) {
        const delay = getReconnectDelay(reconnectAttemptRef.current);
        reconnectAttemptRef.current += 1;

        clearReconnectTimer();

        reconnectTimerRef.current = window.setTimeout(() => {
          void connectSocket();
        }, delay);
      }
    }
  }, [
    chatRoomId,
    clearHeartbeat,
    clearReconnectTimer,
    enabled,
    startHeartbeat,
  ]);

  useEffect(() => {
    if (!enabled || chatRoomId <= 0) {
      closeSocket();
      return;
    }

    shouldReconnectRef.current = true;
    reconnectAttemptRef.current = 0;

    void connectSocket();

    return () => {
      closeSocket();
    };
  }, [
    chatRoomId,
    closeSocket,
    connectSocket,
    enabled,
  ]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        setLastErrorMessage("쪽지 내용을 입력해주세요.");
        return null;
      }

      if (trimmedContent.length > 2000) {
        setLastErrorMessage("쪽지는 최대 2,000자까지 입력할 수 있어요.");
        return null;
      }

      const clientMsgId = createClientMsgId();

      const sent = sendRawFrame({
        type: "dm.send",
        data: {
          chatRoomId,
          content: trimmedContent,
        },
        clientMsgId,
      });

      return sent ? clientMsgId : null;
    },
    [
      chatRoomId,
      sendRawFrame,
    ],
  );

  const sendRead = useCallback(
    (lastReadMessageId: number) => {
      if (lastReadMessageId <= 0) {
        return false;
      }

      return sendRawFrame({
        type: "dm.read",
        data: {
          chatRoomId,
          lastReadMessageId,
        },
        clientMsgId: null,
      });
    },
    [
      chatRoomId,
      sendRawFrame,
    ],
  );

  return {
    isConnected,
    lastErrorMessage,
    sendMessage,
    sendRead,
    reconnect: connectSocket,
    close: closeSocket,
  };
};