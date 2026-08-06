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
import type { LiveMemberItem } from "@/types/live/live";
import type { ActiveLive, ChatMessage, GoLiveScreen } from "../types";
import { ProfileImage } from "./ProfileImage";

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
  go,
  viewerCount,
  durationSeconds,
}: {
  go: GoLiveScreen;
  viewerCount: number;
  durationSeconds: number;
}) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between px-[25px]">
      <div className="flex items-center gap-2 text-body3 text-neutral-900">
        <span className="flex h-[22px] items-center rounded-full bg-secondary-500 px-2.5 text-caption3 text-neutral-0">
          · LIVE
        </span>

        <span>{formatDuration(durationSeconds)}</span>

        <span className="flex items-center gap-1">
          <img
            src={LiveHeadIcon}
            alt=""
            className="h-[13px] w-3 object-contain brightness-0"
          />
          {viewerCount}명 청취 중
        </span>
      </div>

      <button
        type="button"
        onClick={() => go("endConfirm")}
        className="flex h-[28px] w-[74px] items-center justify-center rounded-full bg-neutral-0 text-caption3 text-error shadow-[0_2px_8px_rgba(198,40,40,0.18)]"
      >
        라이브 종료
      </button>
    </header>
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
    <section className="relative h-[282px] shrink-0 text-center">
      <Waveform isActive={isAudioActive} />

      <div className="relative z-10 flex justify-center pt-[18px]">
        <ProfileImage size="lg" src={live?.bandProfileImageUrl ?? undefined} />
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        <h2 className="text-h4 font-bold text-neutral-900">
          {live?.bandName ?? "WAVY"}
        </h2>
        <VerifiedBadge />
      </div>

      <h3 className="mt-1 text-h4 text-neutral-900">
        {live?.title ?? "신곡 데모 첫 공개!"}
      </h3>

      <p className="mt-1 text-caption2 text-neutral-600">
        {live?.description ?? "미공개 데모를 라이브로 들려드려요"}
      </p>
    </section>
  );
}

function Waveform({ isActive }: { isActive: boolean }) {
  const bars = [4, 7, 15, 34, 63, 92, 71, 46, 25, 12, 7, 4];

  return (
    <div className="absolute inset-x-0 top-[52px] flex items-center justify-between text-secondary-500">
      <div className="flex w-[96px] items-center justify-between">
        {bars.map((height, index) => (
          <span
            key={`left-${height}-${index}`}
            className={`live-audio-wave-bar w-0.5 rounded-full bg-gradient-to-b from-secondary-200 via-secondary-500 to-secondary-500 ${
              isActive ? "is-active" : ""
            }`}
            style={{
              height,
              animationDelay: `-${(index * 127) % 780}ms`,
              animationDuration: `${640 + ((index * 149) % 460)}ms`,
            }}
          />
        ))}
      </div>

      <div className="flex w-[96px] items-center justify-between">
        {[...bars].reverse().map((height, index) => (
          <span
            key={`right-${height}-${index}`}
            className={`live-audio-wave-bar w-0.5 rounded-full bg-gradient-to-b from-secondary-200 via-secondary-500 to-secondary-500 ${
              isActive ? "is-active" : ""
            }`}
            style={{
              height,
              animationDelay: `-${(index * 109 + 190) % 780}ms`,
              animationDuration: `${660 + ((index * 131 + 80) % 440)}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function VerifiedBadge() {
  return <img src={BadgeIcon} alt="인증됨" className="size-6 object-contain" />;
}

function ChatBubble({ chat }: { chat: ChatMessage }) {
  return (
    <article className="grid grid-cols-[44px_minmax(0,1fr)_38px] items-start gap-2">
      <div className="relative row-span-2 mt-1 flex size-11 shrink-0 items-start justify-center">
        <img
          src={
            chat.highlighted
              ? FBandProfileIcon
              : (chat.senderProfileImageUrl ?? ProfileIcon)
          }
          alt=""
          className={
            chat.highlighted
              ? "size-11 object-contain"
              : "size-10 rounded-full object-cover"
          }
        />
      </div>

      <strong className="min-w-0 truncate text-caption3 text-neutral-900">
        {chat.sender}
      </strong>
      <span />

      <p
        className={`mt-1 min-h-7 max-w-[191px] break-words whitespace-pre-wrap rounded-xl px-[11px] py-1 text-body3 text-neutral-900 ${
          chat.highlighted
            ? "border border-secondary-300 bg-secondary-100/25"
            : "bg-neutral-0"
        } ${chat.pending ? "opacity-60" : ""}`}
      >
        {chat.message}
      </p>

      <time className="mt-[13px] justify-self-end text-caption4 text-neutral-600">
        {chat.time}
      </time>
    </article>
  );
}

export function RoomMessageArea({
  composerOpen,
  messages,
}: {
  composerOpen: boolean;
  messages: ChatMessage[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [messages]);

  return (
    <section className="min-h-0 flex-1 basis-0 overflow-hidden bg-secondary-0">
      <div
        ref={scrollRef}
        className={`h-full overflow-x-hidden overflow-y-auto px-6 pt-3.5 ${
          composerOpen ? "pb-[150px]" : "pb-[90px]"
        }`}
      >
        <div className="grid gap-3.5">
          {messages.map((chat) => (
            <ChatBubble key={chat.id} chat={chat} />
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
      className="fixed bottom-[98px] left-1/2 z-30 flex w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 items-center gap-[17px]"
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
        ? "마이크 음소거 해제"
        : "마이크 음소거"
      : "마이크 송출 시작";

  return (
    <div className="fixed bottom-3 left-1/2 z-30 h-[62px] w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 rounded-[24px] bg-neutral-0 shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
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
            "absolute left-1/2 -top-4 flex size-[62px] -translate-x-1/2 items-center justify-center rounded-full bg-secondary-0 shadow-[0_0_30px_rgba(251,177,14,0.34)]",
            isAudioConnecting ? "cursor-wait animate-pulse opacity-70" : "",
            audioStatus === "unsupported" ? "opacity-40" : "",
          ].join(" ")}
        >
          <img
            src={IcMicIcon}
            alt=""
            className={[
              "size-10",
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
              onChange={(event) => onMicVolumeChange(Number(event.target.value))}
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
    </div>
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
      className="absolute inset-0 z-40 bg-black/70"
      onClick={() => go("room")}
      role="presentation"
    >
      <section
        className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-neutral-0 px-8 pt-2.5 pb-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1 w-[42px] rounded-full bg-neutral-300" />

        <h2 className="mt-7 text-center text-h4 font-bold text-neutral-900">
          멤버
        </h2>

        <div className="mt-4 grid gap-3">
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
                    src={member.bandProfileImageUrl ?? undefined}
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

        <div className="mx-auto mt-5 h-1 w-[132px] rounded-full bg-neutral-300" />
      </section>
    </div>
  );
}
