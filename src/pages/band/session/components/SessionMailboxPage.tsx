import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import UserDefaultProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import {
  useSessionChatRoomListSocket,
  useSessionChatRoomsQuery,
} from "@/hooks/api/session/useSessionChat";
import type {
  SessionChatRoomFilter,
  SessionChatRoomListItem,
} from "@/types/session/sessionChat";

type MailboxTab = "all" | "unread";
type MessageStatus = "accepted" | "declined";

interface MessageItem {
  id: number;
  senderName: string;
  profileImageUrl: string;
  preview: string;
  time: string;
  unreadCount?: number;
  showUnreadDot?: boolean;
  status?: MessageStatus;
  canSend: boolean;
}

const formatChatTime = (value: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(11, 16);
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

const toMessageStatus = (value: string | null): MessageStatus | undefined => {
  if (!value) return undefined;

  if (value.includes("수락") || value.toUpperCase() === "ACCEPTED") {
    return "accepted";
  }

  if (value.includes("거절") || value.toUpperCase() === "REJECTED") {
    return "declined";
  }

  return undefined;
};

const mapChatRoomToMessageItem = (
  room: SessionChatRoomListItem,
): MessageItem => {
  return {
    id: room.chatRoomId,
    senderName: room.counterpartName,
    profileImageUrl: room.counterpartProfileImageUrl || UserDefaultProfileIcon,
    preview: room.lastMessage || "아직 주고받은 쪽지가 없어요.",
    time: formatChatTime(room.lastMessageAt),
    unreadCount: room.unreadCount > 0 ? room.unreadCount : undefined,
    showUnreadDot: room.unreadCount > 0,
    status: toMessageStatus(room.applicationStatus),
    canSend: room.canSend,
  };
};

export default function SessionMailboxPage() {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<MailboxTab>("all");

  const filter: SessionChatRoomFilter =
    selectedTab === "unread" ? "UNREAD" : "ALL";

  const chatRoomsQuery = useSessionChatRoomsQuery({
    filter,
    size: 20,
  });

  useSessionChatRoomListSocket();

  const messages = useMemo(
    () =>
      chatRoomsQuery.data?.content
        .filter(
          (room) =>
            Boolean(room.lastMessage?.trim()) && Boolean(room.lastMessageAt),
        )
        .map(mapChatRoomToMessageItem) ?? [],
    [chatRoomsQuery.data],
  );

  const handleMessageClick = (message: MessageItem) => {
    navigate(`/band/session/messages/${message.id}`, {
      state: {
        senderName: message.senderName,
        profileImageUrl: message.profileImageUrl,
        chatRoomId: message.id,
        canSend: message.canSend,
      },
    });
  };

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-neutral-0">
      <MailboxHeader onBack={() => navigate(-1)} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <MailboxTabBar selectedTab={selectedTab} onChange={setSelectedTab} />

        <section
          aria-label={
            selectedTab === "all" ? "전체 쪽지 목록" : "읽지 않은 쪽지 목록"
          }
          className="mt-6 flex flex-col gap-3 px-[15px] pb-8"
        >
          {chatRoomsQuery.isLoading ? (
            <MailboxLoading />
          ) : chatRoomsQuery.isError ? (
            <MailboxError onRetry={() => chatRoomsQuery.refetch()} />
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onClick={() => handleMessageClick(message)}
              />
            ))
          ) : (
            <EmptyMailbox selectedTab={selectedTab} />
          )}
        </section>
      </div>
    </main>
  );
}

interface MailboxHeaderProps {
  onBack: () => void;
}

const MailboxHeader = ({ onBack }: MailboxHeaderProps) => {
  return (
    <header className="relative flex h-[88px] w-full shrink-0 items-end justify-center bg-neutral-0 pb-[23px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={onBack}
        className="absolute bottom-[18px] left-[15px] flex size-8 items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <h1 className="text-[18px] leading-5 font-bold text-neutral-900">
        쪽지함
      </h1>
    </header>
  );
};

interface MailboxTabBarProps {
  selectedTab: MailboxTab;
  onChange: (tab: MailboxTab) => void;
}

const MailboxTabBar = ({ selectedTab, onChange }: MailboxTabBarProps) => {
  return (
    <div
      role="tablist"
      aria-label="쪽지함 필터"
      className="grid h-10 w-full grid-cols-2 border-b border-neutral-300 bg-neutral-0"
    >
      <MailboxTabButton
        label="전체"
        selected={selectedTab === "all"}
        onClick={() => onChange("all")}
      />

      <MailboxTabButton
        label="안읽음"
        selected={selectedTab === "unread"}
        onClick={() => onChange("unread")}
      />
    </div>
  );
};

interface MailboxTabButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const MailboxTabButton = ({
  label,
  selected,
  onClick,
}: MailboxTabButtonProps) => {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`relative flex min-w-0 items-center justify-center text-[14px] leading-5 font-medium transition ${
        selected ? "text-secondary-500" : "text-neutral-400"
      }`}
    >
      {label}

      <span
        className={`absolute right-0 bottom-[-1px] left-0 h-0.5 transition ${
          selected ? "bg-secondary-500" : "bg-transparent"
        }`}
      />
    </button>
  );
};

interface MessageCardProps {
  message: MessageItem;
  onClick: () => void;
}

const MessageCard = ({ message, onClick }: MessageCardProps) => {
  const isDeclined = message.status === "declined";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[84px] w-full items-start gap-[10px] rounded-[12px] bg-neutral-0 px-4 py-3 text-left shadow-[0_0_8px_rgba(0,0,0,0.10)]"
    >
      <img
        src={message.profileImageUrl}
        alt=""
        className="size-[35px] shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-h-5 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-[10px]">
            <strong
              className={`truncate text-[18px] leading-5 font-bold ${
                isDeclined ? "text-neutral-400" : "text-neutral-900"
              }`}
            >
              {message.senderName}
            </strong>

            {message.unreadCount ? (
              <UnreadCountBadge count={message.unreadCount} />
            ) : null}

            {message.status ? (
              <MessageStatusBadge status={message.status} />
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-[10px]">
            <time
              className={`text-[10px] leading-3 font-medium ${
                isDeclined ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {message.time}
            </time>

            {message.showUnreadDot ? (
              <span
                aria-label="읽지 않은 쪽지"
                className="size-1.5 rounded-full bg-secondary-500"
              />
            ) : null}
          </div>
        </div>

        <p
          className={`mt-2 line-clamp-2 whitespace-pre-line text-[12px] leading-[18px] font-medium ${
            isDeclined ? "text-neutral-400" : "text-neutral-800"
          }`}
        >
          {message.preview}
        </p>
      </div>
    </button>
  );
};

interface UnreadCountBadgeProps {
  count: number;
}

const UnreadCountBadge = ({ count }: UnreadCountBadgeProps) => {
  return (
    <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-secondary-500 px-[5px] text-[10px] leading-none font-medium text-neutral-0">
      {count}
    </span>
  );
};

interface MessageStatusBadgeProps {
  status: MessageStatus;
}

const MessageStatusBadge = ({ status }: MessageStatusBadgeProps) => {
  const isAccepted = status === "accepted";

  return (
    <span
      className={`flex h-[22px] shrink-0 items-center justify-center rounded-full px-3 text-[12px] leading-[18px] font-medium ${
        isAccepted
          ? "bg-secondary-100 text-secondary-500"
          : "bg-neutral-300 text-neutral-600"
      }`}
    >
      {isAccepted ? "수락" : "거절"}
    </span>
  );
};

interface EmptyMailboxProps {
  selectedTab: MailboxTab;
}

const EmptyMailbox = ({ selectedTab }: EmptyMailboxProps) => {
  return (
    <div className="flex min-h-[320px] items-center justify-center text-center">
      <p className="text-caption1 text-neutral-500">
        {selectedTab === "all"
          ? "받은 쪽지가 없어요."
          : "읽지 않은 쪽지가 없어요."}
      </p>
    </div>
  );
};

const MailboxLoading = () => {
  return (
    <div className="flex min-h-[320px] items-center justify-center text-caption1 text-neutral-500">
      쪽지함을 불러오고 있어요
    </div>
  );
};

const MailboxError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <p className="text-caption1 text-neutral-500">
        쪽지함을 불러오지 못했어요
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
      >
        다시 시도
      </button>
    </div>
  );
};