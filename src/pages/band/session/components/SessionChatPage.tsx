import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import BandProfileImage from "@/assets/Img_Band.png";
import Modal from "@/components/Modal/Modal";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { INITIAL_SESSION_CHAT_MESSAGES } from "@/features/session/chat/sessionChat.data";
import type {
  ChatLocationState,
  ChatMessage,
} from "@/features/session/chat/sessionChat.types";
import { getCurrentChatTime } from "@/features/session/chat/sessionChat.utils";
import {
  SessionChatDateDivider,
  SessionChatHeader,
  SessionChatInput,
  SessionChatMessage,
} from "@/features/session/chat/SessionChatView";

export default function SessionChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as ChatLocationState | null;

  const senderName =
    locationState?.senderName ?? "정하람";

  const profileImageUrl =
    locationState?.profileImageUrl ??
    BandProfileImage;

  const [messages, setMessages] =
    useState<ChatMessage[]>(INITIAL_SESSION_CHAT_MESSAGES);

  const [messageInput, setMessageInput] =
    useState("");

  const [
    isLeaveModalOpen,
    setIsLeaveModalOpen,
  ] = useState(false);

  const messageListRef =
    useRef<HTMLDivElement>(null);

  const messageInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  useEffect(() => {
    const messageList =
      messageListRef.current;

    if (!messageList) {
      return;
    }

    const animationFrame =
      window.requestAnimationFrame(() => {
        messageList.scrollTo({
          top: messageList.scrollHeight,
          behavior: "smooth",
        });
      });

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
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

  const handleSendMessage = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedMessage =
      messageInput.trim();

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

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setMessageInput("");

    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  };

  return createPortal(
    <main className="fixed inset-0 z-[99999] mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
      <SessionChatHeader
        senderName={senderName}
        onBack={handleBack}
        onLeave={handleLeaveModalOpen}
      />

      <div
        ref={messageListRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-[15px] pb-6"
      >
        <SessionChatDateDivider date="6월 2일 (월)" />

        <section
          aria-label={`${senderName}님과의 쪽지`}
          className="mt-5 flex flex-col gap-[22px]"
        >
          {messages.map((message) => (
            <SessionChatMessage
              key={message.id}
              message={message}
              senderName={senderName}
              profileImageUrl={
                profileImageUrl
              }
            />
          ))}
        </section>
      </div>

      <SessionChatInput
        inputRef={messageInputRef}
        value={messageInput}
        onChange={setMessageInput}
        onSubmit={handleSendMessage}
      />

      <ModalOverlay
        open={isLeaveModalOpen}
        onClose={handleLeaveModalClose}
      >
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
    </main>,
    document.body,
  );
}
