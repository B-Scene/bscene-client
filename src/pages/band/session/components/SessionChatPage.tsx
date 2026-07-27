import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import BandProfileImage from "@/assets/Img_Band.png";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { useChatRoomDetailQuery } from "@/hooks/api/session/useSessionChat";
import type { ChatMessage } from "@/features/session/chat/sessionChat.types";
import { getCurrentChatTime } from "@/features/session/chat/sessionChat.utils";
import {
  SessionChatDateDivider,
  SessionChatHeader,
  SessionChatInput,
  SessionChatMessage,
} from "@/features/session/chat/SessionChatView";

interface ChatRouteState {
  chatRoomId?: number;
  senderName?: string;
  profileImageUrl?: string | null;
  canSend?: boolean;
}

const parseChatRoomId = (
  params: Record<string, string | undefined>,
  state: ChatRouteState | null,
) => {
  const rawValue =
    params.chatRoomId ??
    params.messageId ??
    params.id ??
    String(state?.chatRoomId ?? "");

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

const normalizeDateValue = (value: string) => {
  return value.includes("T") ? value : value.replace(" ", "T");
};

const formatChatTime = (value: string) => {
  if (!value) return "";

  const date = new Date(normalizeDateValue(value));

  if (Number.isNaN(date.getTime())) {
    return value.slice(11, 16) || value;
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

const formatChatDate = (value?: string) => {
  if (!value) {
    return "쪽지";
  }

  const date = new Date(normalizeDateValue(value));

  if (Number.isNaN(date.getTime())) {
    return "쪽지";
  }

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${
    weekDays[date.getDay()]
  })`;
};

export default function SessionChatPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const locationState = location.state as ChatRouteState | null;
  const chatRoomId = parseChatRoomId(params, locationState);

  const chatRoomDetailQuery = useChatRoomDetailQuery(chatRoomId, {
    size: 20,
  });

  const detail = chatRoomDetailQuery.data;

  const senderName =
    detail?.opponentName ?? locationState?.senderName ?? "상대방";

  const profileImageUrl =
    detail?.opponentProfileImageUrl ??
    locationState?.profileImageUrl ??
    BandProfileImage;

  const canSend = detail?.canSend ?? locationState?.canSend ?? true;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const messageListRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const dateDividerText = useMemo(() => {
    return formatChatDate(detail?.messages?.[0]?.createdAt);
  }, [detail?.messages]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    setMessages(
      detail.messages.map((message) => ({
        id: message.chatMessageId,
        direction: message.isMine ? "sent" : "received",
        content: message.content,
        time: formatChatTime(message.createdAt),
      })),
    );
  }, [detail]);

  useEffect(() => {
    const messageList = messageListRef.current;

    if (!messageList) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [messages]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLeaveModalOpen = () => {
    setIsLeaveModalOpen(true);
  };

  const handleLeaveModalClose = () => {
    setIsLeaveModalOpen(false);
  };

  const handleLeaveChat = () => {
    setIsLeaveModalOpen(false);

    navigate("/band/session/messages", {
      replace: true,
    });
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend) {
      window.alert("현재 이 쪽지방에서는 메시지를 보낼 수 없어요.");
      return;
    }

    const trimmedMessage = messageInput.trim();

    if (!trimmedMessage) {
      messageInputRef.current?.focus();
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now(),
      direction: "sent",
      content: trimmedMessage,
      time: getCurrentChatTime(),
    };

    setMessages((previousMessages) => [...previousMessages, newMessage]);
    setMessageInput("");

    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  };

  if (chatRoomId <= 0) {
    return (
      <main className="mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
        <SessionChatHeader
          senderName="쪽지"
          onBack={handleBack}
          onLeave={handleLeaveModalOpen}
        />

        <section className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
          <p className="text-caption1 text-neutral-500">
            쪽지방 정보를 찾을 수 없어요.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
      <SessionChatHeader
        senderName={senderName}
        onBack={handleBack}
        onLeave={handleLeaveModalOpen}
      />

      <div
        ref={messageListRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-[15px] pb-6"
      >
        {chatRoomDetailQuery.isLoading ? (
          <section className="flex min-h-full items-center justify-center px-6 text-center">
            <p className="text-caption1 text-neutral-500">
              쪽지를 불러오고 있어요
            </p>
          </section>
        ) : chatRoomDetailQuery.isError ? (
          <section className="flex min-h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-caption1 text-neutral-500">
              쪽지 내용을 불러오지 못했어요
            </p>

            <button
              type="button"
              onClick={() => chatRoomDetailQuery.refetch()}
              className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
            >
              다시 시도
            </button>
          </section>
        ) : messages.length > 0 ? (
          <>
            <SessionChatDateDivider date={dateDividerText} />

            <section
              aria-label={`${senderName}님과의 쪽지`}
              className="mt-5 flex flex-col gap-[22px]"
            >
              {messages.map((message) => (
                <SessionChatMessage
                  key={message.id}
                  message={message}
                  senderName={senderName}
                  profileImageUrl={profileImageUrl || BandProfileImage}
                />
              ))}
            </section>
          </>
        ) : (
          <section className="flex min-h-full items-center justify-center px-6 text-center">
            <p className="text-caption1 text-neutral-500">
              아직 주고받은 쪽지가 없어요
            </p>
          </section>
        )}
      </div>

      <SessionChatInput
        inputRef={messageInputRef}
        value={messageInput}
        onChange={setMessageInput}
        onSubmit={handleSendMessage}
      />

      <ModalOverlay open={isLeaveModalOpen} onClose={handleLeaveModalClose}>
        <Modal
          tone="orange"
          title="쪽지창을 나갈까요?"
          description={
            <>
              나가기를 하면 대화 내용이 모두
              <br />
              쪽지함 목록에서도 삭제돼요.
            </>
          }
          cancelLabel="취소"
          confirmLabel="나가기"
          onCancel={handleLeaveModalClose}
          onConfirm={handleLeaveChat}
        />
      </ModalOverlay>
    </main>
  );
}