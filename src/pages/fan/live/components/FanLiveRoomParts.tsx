import { useEffect, useRef, useState, type FormEvent } from "react";
import AirplaneIcon from "@/assets/icons/airplane.svg";
import BandImage from "@/assets/icons/band/band-default-profile.svg";
import BadgeIcon from "@/assets/icons/Badge.svg";
import ChatIcon from "@/assets/icons/chat.svg";
import HeadsetIcon from "@/assets/Headset.svg";
import MicIcon from "@/assets/icons/ic_Mic.svg?react";
import MuteIcon from "@/assets/icons/Mute.svg";
import UsersIcon from "@/assets/icons/users.svg";
import VolumeIcon from "@/assets/icons/Volume.svg";
import UserProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";
import type { EnterLiveResponse, LiveMemberItem } from "@/types/live/live";

type FanLiveHeroData = Pick<
  EnterLiveResponse,
  "bandProfileImageUrl" | "bandName" | "title"
> & {
  description?: string | null;
};

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export function FanLiveHeader({
  onExit,
  durationSeconds,
  viewerCount,
}: {
  onExit: () => void;
  durationSeconds: number;
  viewerCount: number;
}) {
  return (
    <header className="absolute inset-x-0 top-2.5 z-10 flex h-12 items-center justify-between pr-6 pl-[31px]">
      <div className="flex items-center gap-2.5 text-neutral-900">
        <span className="flex h-[22px] items-center rounded-lg bg-primary-400 px-[9px] py-0.5 text-caption3 text-neutral-0">
          · LIVE
        </span>
        <span className="text-caption2">{formatDuration(durationSeconds)}</span>
        <span className="flex items-center gap-1 text-caption2">
          <img src={HeadsetIcon} alt="" className="size-4 object-contain brightness-0" />
          {viewerCount.toLocaleString()}명 청취 중
        </span>
      </div>
      <button
        type="button"
        onClick={onExit}
        className="fan-live-exit-button flex items-center justify-center rounded-full bg-neutral-0 px-2 py-1 text-caption3 text-error"
      >
        나가기
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
    <div className="flex h-[100px] w-[103px] shrink-0 items-center gap-[7px]" aria-hidden="true">
      {waveHeights.map((height, index) => (
        <span
          key={`${side}-${height}-${index}`}
          className={`live-audio-wave-bar w-[3px] shrink-0 rounded-full bg-gradient-to-b from-primary-100 via-primary-300 to-primary-400 ${
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

export function FanLiveHero({
  isAudioActive = false,
  live,
  top = 90,
}: {
  isAudioActive?: boolean;
  live?: FanLiveHeroData;
  top?: number;
}) {
  return (
    <section
      className="absolute inset-x-0 h-[272px] text-center"
      style={{ top }}
    >
      <div className="flex h-[160px] items-center justify-center gap-2.5">
        <Waveform isActive={isAudioActive} side="left" />
        <img
          src={live?.bandProfileImageUrl || BandImage}
          alt={`${live?.bandName ?? "밴드"} 프로필`}
          className="fan-live-profile-image size-[160px] shrink-0 rounded-full border-2 border-neutral-0 object-cover"
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

export function EmptyChatArea() {
  return (
    <section className="absolute inset-x-0 top-[386px] bottom-0 flex flex-col items-center bg-primary-0/70 px-[87px] pt-[81px] text-center">
      <div className="flex w-[219px] flex-col items-center justify-center gap-6">
        <img src={ChatIcon} alt="" className="size-[52px] opacity-[0.15]" />
        <div>
          <h2 className="text-label1 text-neutral-900">아직 채팅이 없어요</h2>
          <p className="mt-2.5 text-caption1 text-neutral-600">
            첫 번째로 응원 메시지를 보내보세요!
          </p>
        </div>
      </div>
    </section>
  );
}

function ActionItem({
  icon,
  label,
  onClick,
  pressed,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className="flex w-8 flex-col items-center gap-0.5 text-label4 text-neutral-900"
    >
      <img src={icon} alt="" className="size-6 object-contain" />
      {label}
    </button>
  );
}

export function FanLiveActionBar({
  chatOpen,
  isMuted,
  onOpenMembers,
  onToggleMute,
  onToggleChat,
}: {
  chatOpen: boolean;
  isMuted: boolean;
  onOpenMembers: () => void;
  onToggleMute: () => void;
  onToggleChat: () => void;
}) {
  return (
    <nav
      aria-label="라이브 메뉴"
      className="fan-live-action-bar absolute bottom-6 left-1/2 z-20 h-[62px] w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 rounded-[24px] bg-neutral-0"
    >
      <div className="relative flex h-full items-center justify-between px-10 py-3">
        <ActionItem icon={UsersIcon} label="멤버" onClick={onOpenMembers} />

        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={isMuted}
          aria-label="소리 켜기/끄기"
          className="fan-live-mic-button absolute left-1/2 -top-[18px] flex size-[66px] -translate-x-1/2 items-center justify-center rounded-full bg-primary-0"
        >
          <img
            src={isMuted ? MuteIcon : VolumeIcon}
            alt=""
            className="size-[42px] object-contain"
          />
        </button>

        <ActionItem
          icon={ChatIcon}
          label="채팅"
          onClick={onToggleChat}
          pressed={chatOpen}
        />
      </div>
    </nav>
  );
}

export interface FanChatMessage {
  id: string;
  senderId?: number;
  sender: string;
  message: string;
  time: string;
  profileImageUrl?: string | null;
  band?: boolean;
  pending?: boolean;
}

function FanChatAvatar({
  band = false,
  profileImageUrl,
  onClick,
}: {
  band?: boolean;
  profileImageUrl?: string | null;
  onClick?: () => void;
}) {
  if (!band) {
    return (
      <button
        type="button"
        aria-label="사용자 메뉴 열기"
        onClick={onClick}
        className="size-10 rounded-full"
      >
        <img
          src={profileImageUrl || UserProfileIcon}
          alt=""
          className="size-10 rounded-full object-cover"
        />
      </button>
    );
  }

  return (
    <div className="relative size-10 shrink-0">
      <img
        src={profileImageUrl || BandImage}
        alt=""
        className="size-10 rounded-full border border-primary-300 object-cover"
      />
      <span className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-neutral-0">
        <MicIcon
          aria-hidden="true"
          className="fan-live-chat-mic-icon size-2.5"
        />
      </span>
    </div>
  );
}

function FanChatRow({
  chat,
  onProfileClick,
}: {
  chat: FanChatMessage;
  onProfileClick: (chat: FanChatMessage) => void;
}) {
  if (chat.band) {
    return (
      <article className="grid grid-cols-[40px_283px] items-start gap-[15px]">
        <FanChatAvatar band profileImageUrl={chat.profileImageUrl} />
        <div className="relative min-h-[73px] w-[283px] max-w-full rounded-2xl border border-primary-300 bg-primary-50 px-[11px] py-[7px] pr-11">
          <strong className="block text-caption3 text-neutral-900">{chat.sender}</strong>
          <p className="mt-1 break-words whitespace-pre-wrap text-body3 text-neutral-900">
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
        <FanChatAvatar
          profileImageUrl={chat.profileImageUrl}
          onClick={() => onProfileClick(chat)}
        />
      </div>
      <strong className="text-caption3 text-neutral-900">{chat.sender}</strong>
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

export function FanLiveChatArea({
  composerOpen,
  connectionMessage,
  isConnected,
  messages,
  onProfileClick,
  onSendMessage,
}: {
  composerOpen: boolean;
  connectionMessage?: string;
  isConnected: boolean;
  messages: FanChatMessage[];
  onProfileClick: (chat: FanChatMessage) => void;
  onSendMessage: (content: string) => boolean;
}) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (onSendMessage(trimmedMessage)) {
      setMessage("");
    }
  };

  return (
    <section className="absolute inset-x-0 top-[386px] bottom-0 overflow-hidden bg-primary-0/70">
      <div
        ref={scrollRef}
        className={`fan-live-chat-scroll mx-auto h-full w-[338px] max-w-[calc(100%-48px)] overflow-x-hidden overflow-y-auto pt-3 ${
          composerOpen ? "pb-[190px]" : "pb-[110px]"
        }`}
      >
        {messages.length > 0 ? (
          <div className="grid gap-3">
            {messages.map((chat) => (
              <FanChatRow
                key={chat.id}
                chat={chat}
                onProfileClick={onProfileClick}
              />
            ))}
          </div>
        ) : (
          <p className="pt-12 text-center text-caption2 text-neutral-600">
            {isConnected ? "첫 번째 채팅을 보내보세요!" : "채팅 연결 중이에요."}
          </p>
        )}
      </div>

      {composerOpen ? (
        <div className="absolute bottom-[112px] left-1/2 z-10 w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2">
          {connectionMessage ? (
            <p className="mb-2 text-center text-caption4 text-error">
              {connectionMessage}
            </p>
          ) : null}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-[17px]"
          >
            <input
              aria-label="메시지 입력"
              value={message}
              maxLength={500}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={isConnected ? "메시지 입력하기" : "채팅 연결 중"}
              disabled={!isConnected}
              className="h-9 min-w-0 flex-1 rounded-full border border-neutral-400 bg-neutral-0 px-5 text-caption2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-300 disabled:bg-neutral-100"
            />
            <button
              type="submit"
              aria-label="메시지 보내기"
              disabled={!isConnected || !message.trim()}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-primary-100 to-primary-400 disabled:opacity-60"
            >
              <img
                src={AirplaneIcon}
                alt=""
                className="size-8 translate-x-0.5"
              />
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

const MEMBER_PART_LABELS: Record<string, string> = {
  VOCAL: "보컬",
  GUITAR: "기타",
  BASS: "베이스",
  DRUM: "드럼",
  KEYBOARD: "키보드",
};

const formatMemberParts = (parts: string[]) => {
  if (parts.length === 0) return "파트 미정";

  return parts.map((part) => MEMBER_PART_LABELS[part] ?? part).join(", ");
};

function FanLiveMemberRow({ member }: { member: LiveMemberItem }) {
  return (
    <article className="fan-live-member-row flex h-[60px] items-center gap-2.5 rounded-lg bg-neutral-0 p-3">
      <img
        src={member.bandProfileImageUrl || UserProfileIcon}
        alt={`${member.nickname} 프로필`}
        className="size-[38px] shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1 text-left">
        <strong className="block truncate text-caption3 text-neutral-900">
          {member.nickname}
        </strong>
        <span className="block truncate text-caption2 text-neutral-600">
          {formatMemberParts(member.part)}
        </span>
      </div>
      {member.isLeader ? (
        <span className="shrink-0 text-caption3 text-neutral-900">리더</span>
      ) : null}
    </article>
  );
}

export function FanLiveMemberSheet({
  hasError,
  isLoading,
  members,
  open,
  onClose,
}: {
  hasError: boolean;
  isLoading: boolean;
  members: LiveMemberItem[];
  open: boolean;
  onClose: () => void;
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
    <div className="absolute inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="멤버 목록 닫기"
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-900/50 transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fan-live-member-sheet-title"
        onTransitionEnd={handleTransitionEnd}
        className={`relative z-10 h-[364px] w-full rounded-t-[24px] bg-neutral-0 px-[9px] transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-[7px] h-1 w-[42px] rounded-full bg-neutral-300" />
        <h2
          id="fan-live-member-sheet-title"
          className="mt-[13px] text-center text-label1 text-neutral-900"
        >
          멤버
        </h2>

        <div className="mx-5 mt-[13px] grid max-h-[250px] gap-2.5 overflow-y-auto">
          {isLoading ? (
            <p className="py-6 text-center text-caption2 text-neutral-500">
              멤버를 불러오는 중이에요.
            </p>
          ) : null}

          {!isLoading && hasError ? (
            <p className="py-6 text-center text-caption2 text-neutral-500">
              멤버를 불러오지 못했어요.
            </p>
          ) : null}

          {!isLoading && !hasError && members.length === 0 ? (
            <p className="py-6 text-center text-caption2 text-neutral-500">
              표시할 멤버가 없어요.
            </p>
          ) : null}

          {!isLoading && !hasError
            ? members.map((member, index) => (
                <FanLiveMemberRow
                  key={`${member.nickname}-${member.bandName}-${index}`}
                  member={member}
                />
              ))
            : null}
        </div>

        <div className="mx-auto mt-[13px] h-1 w-[132px] rounded-full bg-neutral-300" />
      </section>
    </div>
  );
}

export function FanLiveProfileActionSheet({
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
    <div className="absolute inset-0 z-50 flex items-end justify-center">
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
        className={`relative z-10 h-[268px] w-full rounded-t-[24px] bg-neutral-0 px-5 pt-12 pb-12 transition-transform duration-300 ease-out ${
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
          className="mt-2 flex h-[52px] w-full items-center justify-center rounded-xl bg-neutral-400 px-[159px] py-[14px] text-label2 text-neutral-700"
        >
          취소
        </button>

        <div className="absolute bottom-[8px] left-1/2 h-1 w-[132px] -translate-x-1/2 rounded-full bg-neutral-300" />
      </section>
    </div>
  );
}
