import { useState, type FormEvent } from "react";
import AirplaneIcon from "@/assets/icons/airplane.svg";
import BadgeIcon from "@/assets/icons/Badge.svg";
import BtnSendIcon from "@/assets/icons/Btn_send.svg";
import ChatIcon from "@/assets/icons/chat.svg";
import FBandProfileIcon from "@/assets/icons/F_band_img.svg";
import IcMicIcon from "@/assets/icons/ic_Mic.svg";
import LiveHeadIcon from "@/assets/icons/live-head.svg";
import UsersIcon from "@/assets/icons/users.svg";
import ProfileIcon from "@/assets/icons/profile.svg";
import { members } from "../data";
import type { ActiveLive, ChatMessage, GoLiveScreen } from "../types";
import { ProfileImage } from "./ProfileImage";

export function LiveRoomHeader({
  go,
  viewerCount,
}: {
  go: GoLiveScreen;
  viewerCount: number;
}) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between px-[25px]">
      <div className="flex items-center gap-2 text-body3 text-neutral-900">
        <span className="flex h-[22px] items-center rounded-full bg-secondary-500 px-2.5 text-caption3 text-neutral-0">
          · LIVE
        </span>
        <span>00:24:15</span>
        <span className="flex items-center gap-1">
          <img src={LiveHeadIcon} alt="" className="h-[13px] w-3 object-contain brightness-0" />
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

export function LiveRoomHero({ live }: { live: ActiveLive }) {
  return (
    <section className="relative h-[282px] shrink-0 text-center">
      <Waveform />
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

function Waveform() {
  const bars = [4, 7, 15, 34, 63, 92, 71, 46, 25, 12, 7, 4];

  return (
    <div className="absolute inset-x-0 top-[52px] flex items-center justify-between text-secondary-500">
      <div className="flex w-[96px] items-center justify-between">
        {bars.map((height, index) => (
          <span
            key={"left-" + height + "-" + index}
            className="w-0.5 rounded-full bg-gradient-to-b from-secondary-200 via-secondary-500 to-secondary-500"
            style={{ height }}
          />
        ))}
      </div>
      <div className="flex w-[96px] items-center justify-between">
        {[...bars].reverse().map((height, index) => (
          <span
            key={"right-" + height + "-" + index}
            className="w-0.5 rounded-full bg-gradient-to-b from-secondary-200 via-secondary-500 to-secondary-500"
            style={{ height }}
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
  if (chat.highlighted) {
    return (
      <article className="grid grid-cols-[44px_minmax(0,1fr)_38px] items-start gap-2">
        <div className="relative mt-1 flex size-11 shrink-0 items-start justify-center">
          <img src={FBandProfileIcon} alt="" className="size-11 object-contain" />
        </div>

        <div className="col-span-2 min-w-0">
          <div className="relative flex min-h-[73px] w-[calc(100%+16px)] flex-col items-start gap-1.5 rounded-2xl border border-secondary-300 bg-secondary-100/25 py-[7px] pr-[68px] pl-[11px]">
            <strong className="block text-caption3 text-neutral-900">{chat.sender}</strong>
            <p className="whitespace-pre-line text-body3 font-medium text-neutral-900">
              {chat.message}
            </p>
            <time className="absolute right-[16px] top-1/2 -translate-y-1/2 text-caption4 text-neutral-600">
              {chat.time}
            </time>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="grid grid-cols-[44px_minmax(0,1fr)_38px] items-start gap-2">
      <div className="relative mt-1 flex size-11 shrink-0 items-start justify-center">
        <img
          src={ProfileIcon}
          alt=""
          className="size-10 rounded-full object-cover"
        />
      </div>

      <div className="min-w-0">
        <strong className="block text-caption3 text-neutral-900">{chat.sender}</strong>
        <p className="mt-1 flex h-7 w-[191px] max-w-full items-center whitespace-nowrap rounded-xl bg-neutral-0 py-[5px] pr-[35px] pl-[11px] text-body3 text-neutral-900">
          {chat.message}
        </p>
      </div>

      <time className="mt-9 justify-self-end text-caption4 text-neutral-600">{chat.time}</time>
    </article>
  );
}

export function RoomMessageArea({ messages }: { messages: ChatMessage[] }) {
  return (
    <section className="min-h-0 flex-1 overflow-hidden bg-secondary-0 px-6 pt-3.5 pb-[150px]">
      <div className="grid gap-3.5">
        {messages.map((chat) => (
          <ChatBubble key={chat.id} chat={chat} />
        ))}
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
        onChange={(event) => setMessage(event.target.value)}
        placeholder="메시지 입력하기"
        className="h-9 min-w-0 flex-1 rounded-full border border-neutral-400 bg-neutral-0 px-5 text-caption2 text-neutral-900 outline-none placeholder:text-neutral-400"
      />
      <button
        type="submit"
        aria-label="메시지 보내기"
        disabled={!message.trim()}
        className="relative flex size-9 shrink-0 items-center justify-center disabled:opacity-60"
      >
        <img src={BtnSendIcon} alt="" className="absolute inset-0 size-full" />
        <img src={AirplaneIcon} alt="" className="relative z-10 size-8 translate-x-[2px]" />
      </button>
    </form>
  );
}

export function LiveActionBar({ go }: { go: GoLiveScreen }) {
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
          aria-label="마이크"
          className="absolute left-1/2 -top-4 flex size-[62px] -translate-x-1/2 items-center justify-center rounded-full bg-secondary-0 shadow-[0_0_30px_rgba(251,177,14,0.34)]"
        >
          <img src={IcMicIcon} alt="" className="size-10" />
        </button>
        <button
          type="button"
          onClick={() => go("chat")}
          className="flex w-10 flex-col items-center gap-1 text-label4 text-neutral-900"
        >
          <img src={ChatIcon} alt="" className="size-[23px]" />
          채팅
        </button>
      </div>
    </div>
  );
}

export function MemberSheet({ go }: { go: GoLiveScreen }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70" onClick={() => go("room")} role="presentation">
      <section
        className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-neutral-0 px-8 pt-2.5 pb-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1 w-[42px] rounded-full bg-neutral-300" />
        <h2 className="mt-7 text-center text-h4 font-bold text-neutral-900">멤버</h2>
        <div className="mt-4 grid gap-3">
          {members.map((member) => (
            <article
              key={member.id}
              className="flex h-[48px] items-center rounded-lg bg-neutral-0 px-4 shadow-[0_2px_8px_rgba(20,20,20,0.10)]"
            >
              <ProfileImage size="sm" />
              <div className="ml-3">
                <strong className="block text-caption3 text-neutral-900">{member.name}</strong>
                <span className="text-caption2 text-neutral-600">{member.role}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-5 h-1 w-[132px] rounded-full bg-neutral-300" />
      </section>
    </div>
  );
}
