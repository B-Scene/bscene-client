import { useEffect, useRef, useState, type FormEvent } from "react";
import AirplaneIcon from "@/assets/icons/airplane.svg";
import BandImage from "@/assets/Img_Band.png";
import BadgeIcon from "@/assets/icons/Badge.svg";
import ChatIcon from "@/assets/icons/chat.svg";
import HeadsetIcon from "@/assets/Headset.svg";
import MicIcon from "@/assets/icons/ic_Mic.svg?react";
import MuteIcon from "@/assets/icons/Mute.svg";
import UsersIcon from "@/assets/icons/users.svg";
import VolumeIcon from "@/assets/icons/Volume.svg";
import UserProfileIcon from "@/assets/icons/band/user-default-profile.svg";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";

export function FanLiveHeader({ onExit }: { onExit: () => void }) {
  return (
    <header className="absolute inset-x-0 top-2.5 z-10 flex h-12 items-center justify-between pr-6 pl-[31px]">
      <div className="flex items-center gap-2.5 text-neutral-900">
        <span className="flex h-[22px] items-center rounded-lg bg-primary-400 px-[9px] py-0.5 text-caption3 text-neutral-0">
          · LIVE
        </span>
        <span className="text-caption2">00:24:15</span>
        <span className="flex items-center gap-1 text-caption2">
          <img src={HeadsetIcon} alt="" className="size-4 object-contain brightness-0" />
          30명 청취 중
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

function Waveform() {
  return (
    <div className="flex h-[100px] w-[103px] shrink-0 items-center gap-[7px]" aria-hidden="true">
      {waveHeights.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-[3px] shrink-0 rounded-full bg-gradient-to-b from-primary-100 via-primary-300 to-primary-400"
          style={{ height }}
        />
      ))}
    </div>
  );
}

export function FanLiveHero({ top = 90 }: { top?: number }) {
  return (
    <section
      className="absolute inset-x-0 h-[272px] text-center"
      style={{ top }}
    >
      <div className="flex h-[160px] items-center justify-center gap-2.5">
        <Waveform />
        <img
          src={BandImage}
          alt="WAVY 밴드"
          className="fan-live-profile-image size-[160px] shrink-0 rounded-full border-2 border-neutral-0 object-cover"
        />
        <Waveform />
      </div>

      <div className="mt-8 flex h-20 flex-col items-center gap-[5px]">
        <div className="flex h-6 items-center justify-center gap-2.5">
          <h1 className="text-label1 text-neutral-900">WAVY</h1>
          <img src={BadgeIcon} alt="인증된 밴드" className="size-6 object-contain" />
        </div>
        <h2 className="text-h4 text-neutral-900">신곡 데모 첫 공개!</h2>
        <p className="text-caption2 text-neutral-600">
          미공개 데모를 라이브로 들려드려요
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
  onOpenMembers,
  onToggleChat,
}: {
  chatOpen: boolean;
  onOpenMembers: () => void;
  onToggleChat: () => void;
}) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <nav
      aria-label="라이브 메뉴"
      className="fan-live-action-bar absolute inset-x-5 bottom-6 z-20 h-[62px] rounded-[24px] bg-neutral-0"
    >
      <div className="relative flex h-full items-center justify-between px-10 py-3">
        <ActionItem icon={UsersIcon} label="멤버" onClick={onOpenMembers} />

        <button
          type="button"
          onClick={() => setIsMuted((current) => !current)}
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

interface FanChatMessage {
  id: number;
  sender: string;
  message: string;
  time: string;
  band?: boolean;
}

const initialFanChatMessages: FanChatMessage[] = [
  {
    id: 1,
    sender: "최준우",
    message: "라이브 자주 해주세요!!",
    time: "20:34",
  },
  {
    id: 2,
    sender: "이름",
    message: "여러분 감사합니다!\n신곡은 다음 달 공개 예정이에요!",
    time: "20:33",
    band: true,
  },
  {
    id: 3,
    sender: "한아영",
    message: "노래 너무 좋아요!!",
    time: "20:32",
  },
];

function FanChatAvatar({
  band = false,
  onClick,
}: {
  band?: boolean;
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
        <img src={UserProfileIcon} alt="" className="size-10 object-contain" />
      </button>
    );
  }

  return (
    <div className="relative size-10 shrink-0">
      <img
        src={BandImage}
        alt="WAVY"
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
  onProfileClick: () => void;
}) {
  if (chat.band) {
    return (
      <article className="grid grid-cols-[40px_283px] items-start gap-[15px]">
        <FanChatAvatar band />
        <div className="relative min-h-[73px] w-[283px] max-w-full rounded-2xl border border-primary-300 bg-primary-50 px-[11px] py-[7px] pr-11">
          <strong className="block text-caption3 text-neutral-900">{chat.sender}</strong>
          <p className="mt-1 whitespace-pre-line text-body3 text-neutral-900">{chat.message}</p>
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
        <FanChatAvatar onClick={onProfileClick} />
      </div>
      <strong className="text-caption3 text-neutral-900">{chat.sender}</strong>
      <span />
      <p className="mt-1 flex h-7 max-w-[191px] items-center rounded-xl bg-neutral-0 px-[11px] text-body3 text-neutral-900">
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
  onProfileClick,
}: {
  composerOpen: boolean;
  onProfileClick: () => void;
}) {
  const [messages, setMessages] = useState(initialFanChatMessages);
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

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "나",
        message: trimmedMessage,
        time,
      },
    ]);
    setMessage("");
  };

  return (
    <section className="absolute inset-x-0 top-[386px] bottom-0 overflow-hidden bg-primary-0/70">
      <div
        ref={scrollRef}
        className={`fan-live-chat-scroll mx-auto h-full w-[338px] max-w-[calc(100%-48px)] overflow-x-hidden overflow-y-auto pt-3 ${
          composerOpen ? "pb-[190px]" : "pb-[110px]"
        }`}
      >
        <div className="grid gap-3">
          {messages.map((chat) => (
            <FanChatRow key={chat.id} chat={chat} onProfileClick={onProfileClick} />
          ))}
        </div>
      </div>

      {composerOpen ? (
        <form
          onSubmit={handleSubmit}
          className="absolute inset-x-5 bottom-[132px] z-10 flex items-center gap-[17px]"
        >
          <input
            aria-label="메시지 입력"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="메시지 입력하기"
            className="h-9 min-w-0 flex-1 rounded-full border border-neutral-400 bg-neutral-0 px-5 text-caption2 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-300"
          />
          <button
            type="submit"
            aria-label="메시지 보내기"
            disabled={!message.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-primary-100 to-primary-400 disabled:opacity-60"
          >
            <img src={AirplaneIcon} alt="" className="size-8 translate-x-0.5" />
          </button>
        </form>
      ) : null}
    </section>
  );
}

const fanLiveMembers = [
  { id: 1, name: "이름", role: "파트", host: true },
  { id: 2, name: "이름", role: "파트", host: false },
  { id: 3, name: "이름", role: "파트", host: false },
  { id: 4, name: "이름", role: "파트", host: false },
];

function FanLiveMemberRow({
  name,
  role,
  host,
}: {
  name: string;
  role: string;
  host: boolean;
}) {
  return (
    <article className="fan-live-member-row flex h-[60px] items-center gap-2.5 rounded-lg bg-neutral-0 p-3">
      <img
        src={UserProfileIcon}
        alt=""
        className="size-[38px] shrink-0 object-contain"
      />
      <div className="min-w-0 flex-1 text-left">
        <strong className="block truncate text-caption3 text-neutral-900">{name}</strong>
        <span className="block truncate text-caption2 text-neutral-600">{role}</span>
      </div>
      {host ? <span className="shrink-0 text-caption3 text-neutral-900">진행자</span> : null}
    </article>
  );
}

export function FanLiveMemberSheet({
  open,
  onClose,
}: {
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

        <div className="mx-5 mt-[13px] grid gap-2.5">
          {fanLiveMembers.map((member) => (
            <FanLiveMemberRow key={member.id} {...member} />
          ))}
        </div>

        <div className="mx-auto mt-[13px] h-1 w-[132px] rounded-full bg-neutral-300" />
      </section>
    </div>
  );
}

export function FanLiveProfileActionSheet({
  open,
  onClose,
  onReport,
}: {
  open: boolean;
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
            onClick={onClose}
            className="flex h-14 w-full items-center justify-center px-4 py-[18px] text-label2 text-[#FF3B30]"
          >
            사용자 차단하기
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
