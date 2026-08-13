import { useEffect, useRef, useState, type FormEvent } from "react";
import AirplaneIcon from "@/assets/icons/airplane.svg";
import BadgeIcon from "@/assets/icons/Badge.svg";
import BtnSendIcon from "@/assets/icons/Btn_send.svg";
import ChatIcon from "@/assets/icons/chat.svg";
import FBandProfileIcon from "@/assets/icons/band/band-default-profile.svg";
import IcMicIcon from "@/assets/icons/ic_Mic.svg";
import LiveHeadIcon from "@/assets/icons/live-head.svg";
import UsersIcon from "@/assets/icons/users.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";
import type { LiveMemberItem } from "@/types/live/live";
import type { ActiveLive, ChatMessage, GoLiveScreen } from "../types";
import { ProfileImage } from "./ProfileImage";
import "./LiveRoomParts.css";

export type LiveAudioStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "unsupported";

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const PART_LABELS: Record<string, string> = {
  VOCAL: "보컬",
  GUITAR: "기타",
  BASS: "베이스",
  DRUM: "드럼",
  KEYBOARD: "키보드",
};

const formatMemberParts = (parts: string[]) => {
  if (parts.length === 0) return "포지션 미정";
  return parts.map((part) => PART_LABELS[part] ?? part).join(", ");
};

export function LiveRoomHeader({
  canCloseLive,
  onClose,
  viewerCount,
  durationSeconds,
}: {
  canCloseLive: boolean;
  onClose: () => void;
  viewerCount: number;
  durationSeconds: number;
}) {
  return (
    <header className="absolute inset-x-0 top-2.5 z-10 flex h-12 items-center justify-between pr-6 pl-[31px]">
      <div className="flex items-center gap-2.5 text-neutral-900">
        <span className="flex h-[22px] items-center rounded-lg bg-secondary-500 px-[9px] py-0.5 text-caption3 text-neutral-0">
          · LIVE
        </span>

        <span className="text-caption2">{formatDuration(durationSeconds)}</span>

        <span className="flex items-center gap-1 text-caption2">
          <img
            src={LiveHeadIcon}
            alt=""
            className="size-4 object-contain brightness-0"
          />
          {viewerCount.toLocaleString()}명 청취 중
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex items-center justify-center rounded-full bg-neutral-0 px-2 py-1 text-caption3 text-error shadow-[0_2px_8px_rgba(198,40,40,0.18)]"
      >
        {canCloseLive ? "라이브 종료" : "나가기"}
      </button>
    </header>
  );
}

const waveHeights = [5, 5, 15, 35, 65, 100, 65, 35, 15, 5, 5];

function Waveform({
  isActive,
  side,
}: {
  isActive: boolean;
  side: "left" | "right";
}) {
  return (
    <div
      className="flex h-[100px] w-[103px] shrink-0 items-center gap-[7px]"
      aria-hidden="true"
    >
      {waveHeights.map((height, index) => (
        <span
          key={`${side}-${height}-${index}`}
          className={`live-audio-wave-bar w-[3px] shrink-0 rounded-full bg-gradient-to-b from-secondary-100 via-secondary-300 to-secondary-500 ${
            isActive ? "is-active" : ""
          }`}
          style={{
            height,
            animationDelay: `-${(index * 113 + (side === "right" ? 170 : 0)) % 760}ms`,
            animationDuration: `${620 + ((index * 137 + (side === "right" ? 90 : 0)) % 480)}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function LiveRoomHero({
  isAudioActive,
  live,
}: {
  isAudioActive: boolean;
  live: ActiveLive;
}) {
  return (
    <section className="absolute inset-x-0 top-[90px] h-[272px] text-center">
      <div className="flex h-[160px] items-center justify-center gap-2.5">
        <Waveform isActive={isAudioActive} side="left" />

        <ProfileImage
          size="lg"
          src={live?.bandProfileImageUrl ?? undefined}
        />

        <Waveform isActive={isAudioActive} side="right" />
      </div>

      <div className="mt-8 flex h-20 flex-col items-center gap-[5px]">
        <div className="flex h-6 items-center justify-center gap-2.5">
          <h1 className="text-label1 text-neutral-900">
            {live?.bandName ?? "WAVY"}
          </h1>
          <img src={BadgeIcon} alt="인증된 밴드" className="size-6 object-contain" />
        </div>

        <h2 className="text-h4 text-neutral-900">
          {live?.title ?? "라이브"}
        </h2>

        <p className="text-caption2 text-neutral-600">
          {live?.description ?? ""}
        </p>
      </div>
    </section>
  );
}

function ChatProfileImage({
  chat,
  onClick,
}: {
  chat: ChatMessage;
  onClick?: () => void;
}) {
  const fallbackSrc = chat.highlighted ? FBandProfileIcon : ProfileIcon;
  const imageSrc = chat.senderProfileImageUrl ?? fallbackSrc;

  const imageElement = (
    <div className="relative flex size-10 shrink-0">
      <img
        src={imageSrc}
        alt=""
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = fallbackSrc;
        }}
        className={`size-10 rounded-full object-cover ${
          chat.highlighted ? "border border-secondary-300" : ""
        }`}
      />

      {chat.highlighted ? (
        <span className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-neutral-0 shadow-[0_1px_4px_rgba(20,20,20,0.12)]">
          <img src={IcMicIcon} alt="" className="size-2.5 object-contain" />
        </span>
      ) : null}
    </div>
  );

  if (!onClick || chat.pending || chat.highlighted) {
    return imageElement;
  }

  return (
    <button
      type="button"
      aria-label="채팅 사용자 메뉴 열기"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex size-10 shrink-0 items-center justify-center rounded-full"
    >
      {imageElement}
    </button>
  );
}

function ChatBubble({
  chat,
  onProfileClick,
}: {
  chat: ChatMessage;
  onProfileClick?: (chat: ChatMessage) => void;
}) {
  const canOpenProfileAction = !chat.pending;

  const handleOpenProfileAction = () => {
    if (!canOpenProfileAction) return;
    onProfileClick?.(chat);
  };

  if (chat.highlighted) {
    return (
      <article className="grid grid-cols-[40px_283px] items-start gap-[15px]">
        <ChatProfileImage chat={chat} onClick={handleOpenProfileAction} />

        <div
          role={canOpenProfileAction ? "button" : undefined}
          tabIndex={canOpenProfileAction ? 0 : undefined}
          onClick={handleOpenProfileAction}
          onKeyDown={(event) => {
            if (!canOpenProfileAction) return;

            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleOpenProfileAction();
            }
          }}
          className={`relative min-h-[73px] w-[283px] max-w-full rounded-2xl border border-secondary-300 bg-secondary-100 px-[11px] py-[7px] pr-11 ${
            canOpenProfileAction ? "cursor-pointer" : ""
          }`}
        >
          <strong className="block text-caption3 text-neutral-900">
            {chat.sender}
          </strong>

          <p
            className={`mt-1 break-words whitespace-pre-wrap text-body3 text-neutral-900 ${
              chat.pending ? "opacity-60" : ""
            }`}
          >
            {chat.message}
          </p>

          <time className="absolute right-[11px] top-1/2 -translate-y-1/2 text-caption4 text-neutral-600">
            {chat.time}
          </time>
        </div>
      </article>
    );
  }

  return (
    <article className="grid grid-cols-[40px_minmax(0,1fr)_28px] items-start gap-x-[15px]">
      <div className="row-span-2">
        <ChatProfileImage chat={chat} onClick={handleOpenProfileAction} />
      </div>

      <button
        type="button"
        onClick={handleOpenProfileAction}
        className="max-w-full truncate text-left text-caption3 text-neutral-900"
      >
        {chat.sender}
      </button>

      <span />

      <p
        className={`mt-1 min-h-7 max-w-[191px] break-words whitespace-pre-wrap rounded-xl bg-neutral-0 px-[11px] py-1 text-body3 text-neutral-900 ${
          chat.pending ? "opacity-60" : ""
        }`}
      >
        {chat.message}
      </p>

      <time className="mt-[13px] mr-[11px] justify-self-end text-caption4 text-neutral-600">
        {chat.time}
      </time>
    </article>
  );
}

export function RoomMessageArea({
  composerOpen,
  messages,
  onProfileClick,
}: {
  composerOpen: boolean;
  messages: ChatMessage[];
  onProfileClick?: (chat: ChatMessage) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [messages]);

  return (
    <section className="absolute inset-x-0 top-[386px] bottom-0 overflow-hidden bg-secondary-0/70">
      <div
        ref={scrollRef}
        className={`live-room-chat-scroll mx-auto h-full w-[338px] max-w-[calc(100%-48px)] overflow-x-hidden overflow-y-auto pt-3 ${
          composerOpen ? "pb-[190px]" : "pb-[110px]"
        }`}
      >
        <div className="grid gap-3">
          {messages.map((chat) => (
            <ChatBubble
              key={chat.id}
              chat={chat}
              onProfileClick={onProfileClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ChatComposer({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSendMessage(trimmedMessage);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
<<<<<<< HEAD
      className="absolute inset-x-5 bottom-[112px] z-30 flex items-center gap-[17px]"
=======
      className="fixed inset-x-5 bottom-[98px] z-30 flex items-center gap-[17px]"
>>>>>>> 4c197181737599649894ec6168925d5d0bf7c591
    >
      <input
        aria-label="메시지 입력"
        value={message}
        maxLength={500}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="메시지 입력하기"
        className="h-9 min-w-0 flex-1 rounded-full border border-neutral-400 bg-neutral-0 px-5 text-caption2 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-secondary-400"
      />

      <button
        type="submit"
        aria-label="메시지 보내기"
        disabled={!message.trim()}
        className="relative flex size-9 shrink-0 items-center justify-center disabled:opacity-60"
      >
        <img src={BtnSendIcon} alt="" className="absolute inset-0 size-full" />
        <img
          src={AirplaneIcon}
          alt=""
          className="relative z-10 size-8 translate-x-[2px]"
        />
      </button>
    </form>
  );
}

export function LiveActionBar({
  go,
  chatOpen,
  audioStatus,
  isMicMuted,
  micVolume,
  onMicVolumeChange,
  onToggleBroadcast,
}: {
  go: GoLiveScreen;
  chatOpen: boolean;
  audioStatus: LiveAudioStatus;
  isMicMuted: boolean;
  micVolume: number;
  onMicVolumeChange: (volume: number) => void;
  onToggleBroadcast: () => void;
}) {
  const isBroadcasting = audioStatus === "connected";
  const isAudioConnecting = audioStatus === "connecting";
  const displayVolume = Math.round(micVolume);

  const micButtonLabel = isAudioConnecting
    ? "마이크 연결 중"
    : isBroadcasting
      ? isMicMuted
        ? "마이크 켜기"
        : "마이크 끄기"
      : "마이크 연결";

  return (
<<<<<<< HEAD
    <nav className="absolute inset-x-5 bottom-6 z-30 h-[62px] rounded-[24px] bg-neutral-0 shadow-[0_0_8px_rgba(20,20,20,0.10)]">
=======
    <div className="fixed inset-x-5 bottom-3 z-30 h-[62px] rounded-[24px] bg-neutral-0 shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
>>>>>>> 4c197181737599649894ec6168925d5d0bf7c591
      <div className="relative flex h-full items-center justify-between px-10 py-3">
        <button
          type="button"
          onClick={() => go("members")}
          className="flex w-10 flex-col items-center gap-1 text-label4 text-neutral-900"
        >
          <img src={UsersIcon} alt="" className="size-[23px]" />
          멤버
        </button>

        <button
          type="button"
          aria-label={micButtonLabel}
          aria-pressed={isBroadcasting && !isMicMuted}
          onClick={onToggleBroadcast}
          disabled={isAudioConnecting || audioStatus === "unsupported"}
          className={[
            "absolute left-1/2 -top-[18px] flex size-[66px] -translate-x-1/2 items-center justify-center rounded-full bg-secondary-0 shadow-[0_0_20px_rgba(251,177,14,0.50)]",
            isAudioConnecting ? "cursor-wait animate-pulse opacity-70" : "",
            audioStatus === "unsupported" ? "opacity-40" : "",
          ].join(" ")}
        >
          <img
            src={IcMicIcon}
            alt=""
            className={[
              "size-[42px]",
              isBroadcasting && !isMicMuted ? "opacity-100" : "opacity-45",
              isMicMuted ? "grayscale" : "",
            ].join(" ")}
          />
        </button>

        {isBroadcasting ? (
          <div className="absolute bottom-1 left-1/2 flex w-[122px] -translate-x-1/2 items-center gap-1">
            <input
              type="range"
              min={0}
              max={150}
              step={5}
              value={displayVolume}
              onChange={(event) =>
                onMicVolumeChange(Number(event.target.value))
              }
              aria-label="마이크 볼륨"
              className="h-1 min-w-0 flex-1 cursor-pointer accent-secondary-500"
            />

            <span className="w-8 text-right text-[9px] leading-none font-medium text-neutral-600">
              {displayVolume}%
            </span>
          </div>
        ) : null}

        <button
          type="button"
          aria-pressed={chatOpen}
          onClick={() => go(chatOpen ? "room" : "chat")}
          className="flex w-10 flex-col items-center gap-1 text-label4 text-neutral-900"
        >
          <img src={ChatIcon} alt="" className="size-[23px]" />
          채팅
        </button>
      </div>
    </nav>
  );
}

export function MemberSheet({
  go,
  members,
  isLoading,
}: {
  go: GoLiveScreen;
  members: LiveMemberItem[];
  isLoading?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70"
      onClick={() => go("room")}
      role="presentation"
    >
      <section
        className="flex max-h-[min(72dvh,560px)] min-h-[236px] w-full max-w-[393px] flex-col rounded-t-[22px] bg-neutral-0 px-8 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+24px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1 w-[42px] shrink-0 rounded-full bg-neutral-300" />

        <h2 className="mt-7 shrink-0 text-center text-h4 font-bold text-neutral-900">
          멤버
        </h2>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-3">
            {isLoading ? (
              <p className="py-6 text-center text-caption2 text-neutral-500">
                멤버를 불러오는 중이에요.
              </p>
            ) : null}

            {!isLoading && members.length === 0 ? (
              <p className="py-6 text-center text-caption2 text-neutral-500">
                표시할 멤버가 없어요.
              </p>
            ) : null}

            {!isLoading
              ? members.map((member, index) => (
                  <article
                    key={`${member.nickname}-${member.bandName}-${index}`}
                    className="flex h-[52px] items-center rounded-lg bg-neutral-0 px-4 shadow-[0_2px_8px_rgba(20,20,20,0.10)]"
                  >
                    <ProfileImage
                      size="sm"
                      src={
                        member.profileImageUrl ??
                        member.bandProfileImageUrl ??
                        undefined
                      }
                    />

                    <div className="ml-3 min-w-0">
                      <div className="flex items-center gap-1">
                        <strong className="block truncate text-caption3 text-neutral-900">
                          {member.nickname}
                        </strong>

                        {member.isLeader ? (
                          <span className="shrink-0 rounded-full bg-secondary-100 px-1.5 py-0.5 text-caption4 text-secondary-600">
                            리더
                          </span>
                        ) : null}
                      </div>

                      <span className="block truncate text-caption2 text-neutral-600">
                        {formatMemberParts(member.part)}
                      </span>
                    </div>
                  </article>
                ))
              : null}
          </div>
        </div>

        <div className="mx-auto mt-5 h-1 w-[132px] shrink-0 rounded-full bg-neutral-300" />
      </section>
    </div>
  );
}

export function LiveChatProfileActionSheet({
  isBlocked,
  isBlockPending,
  open,
  onBlockToggle,
  onClose,
  onReport,
}: {
  isBlocked: boolean;
  isBlockPending: boolean;
  open: boolean;
  onBlockToggle: () => void;
  onClose: () => void;
  onReport: () => void;
}) {
  const { rendered, isVisible, handleTransitionEnd } = useSlideUpSheet(open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center">
      <button
        type="button"
        aria-label="사용자 메뉴 닫기"
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-900/70 transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="사용자 관리"
        onTransitionEnd={handleTransitionEnd}
        className={`relative z-10 h-[268px] w-full rounded-t-[24px] bg-neutral-0 px-5 pt-12 pb-12 shadow-[0_-8px_24px_rgba(20,20,20,0.16)] transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="absolute top-[7px] left-1/2 h-1 w-[42px] -translate-x-1/2 rounded-full bg-neutral-300" />

        <div className="w-full overflow-hidden rounded-xl bg-neutral-200/70">
          <button
            type="button"
            onClick={onReport}
            className="flex h-14 w-full items-center justify-center border-b border-neutral-300 px-4 py-[18px] text-label2 text-[#007AFF]"
          >
            댓글 신고하기
          </button>

          <button
            type="button"
            onClick={onBlockToggle}
            disabled={isBlockPending}
            className="flex h-14 w-full items-center justify-center px-4 py-[18px] text-label2 text-[#FF3B30]"
          >
            {isBlockPending
              ? "처리 중"
              : isBlocked
                ? "차단 해제하기"
                : "사용자 차단하기"}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 flex h-[52px] w-full items-center justify-center rounded-xl bg-neutral-400 py-[14px] text-label2 text-neutral-700"
        >
          취소
        </button>

        <div className="absolute bottom-[8px] left-1/2 h-1 w-[132px] -translate-x-1/2 rounded-full bg-neutral-300" />
      </section>
    </div>
  );
}