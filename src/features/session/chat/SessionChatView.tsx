import type { FormEvent, RefObject } from "react";

import AirplaneIcon from "@/assets/icons/airplane.svg";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ChatLeaveIcon from "@/assets/icons/Logout.svg";
import ChatSendIcon from "@/assets/icons/Btn_send.svg";

import type { ChatMessage } from "./sessionChat.types";

interface SessionChatHeaderProps {
  senderName: string;
  onBack: () => void;
  onLeave: () => void;
}

export const SessionChatHeader = ({
  senderName,
  onBack,
  onLeave,
}: SessionChatHeaderProps) => (
  <header className="relative flex h-[88px] w-full shrink-0 items-end justify-center bg-neutral-0 pb-[23px]">
    <button
      type="button"
      aria-label="쪽지함으로 돌아가기"
      onClick={onBack}
      className="absolute bottom-[18px] left-[15px] flex size-8 items-center justify-center"
    >
      <img src={ArrowLeftIcon} alt="" className="size-6" />
    </button>

    <h1 className="text-[18px] leading-[18px] text-label2 text-neutral-900">
      {senderName}
    </h1>

    <button
      type="button"
      aria-label="쪽지창 나가기"
      onClick={onLeave}
      className="absolute right-[15px] bottom-[18px] flex size-8 items-center justify-center"
    >
      <img src={ChatLeaveIcon} alt="" className="size-6" />
    </button>
  </header>
);

export const SessionChatDateDivider = ({ date }: { date: string }) => (
  <div className="flex justify-center pt-1">
    <time className="text-[12px] leading-[18px] text-caption3 text-neutral-600">
      {date}
    </time>
  </div>
);

interface SessionChatMessageProps {
  message: ChatMessage;
  senderName: string;
  profileImageUrl: string;
}

export const SessionChatMessage = ({
  message,
  senderName,
  profileImageUrl,
}: SessionChatMessageProps) => {
  if (message.direction === "sent") {
    return (
      <article className="flex justify-end">
        <div className="flex items-end gap-[5px]">
          <time className="mb-[1px] shrink-0 text-[8px] leading-[10px] font-medium text-neutral-500">
            {message.time}
          </time>

          <p className="max-w-[208px] break-words whitespace-pre-line rounded-[12px] border border-secondary-500 bg-secondary-100 py-3 pr-4 pl-3 text-[12px] leading-[18px] font-normal text-neutral-900">
            {message.content}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex items-start gap-[10px]">
      <img
        src={profileImageUrl}
        alt=""
        className="size-[35px] shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0">
        <strong className="block text-[12px] leading-[18px] text-caption3 text-neutral-900">
          {senderName}
        </strong>

        <div className="mt-1 flex items-end gap-[5px]">
          <p className="max-w-[208px] break-words whitespace-pre-line rounded-[12px] border border-neutral-500 bg-neutral-0 py-3 pr-4 pl-3 text-[12px] leading-[18px] text-body3 text-neutral-900">
            {message.content}
          </p>

          <time className="mb-[1px] shrink-0 text-[8px] leading-[10px] text-caption4 text-neutral-500">
            {message.time}
          </time>
        </div>
      </div>
    </article>
  );
};

interface SessionChatInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const SessionChatInput = ({
  inputRef,
  value,
  disabled = false,
  placeholder = "메시지 입력하기",
  onChange,
  onSubmit,
}: SessionChatInputProps) => (
  <form
    onSubmit={onSubmit}
    className="relative z-30 flex w-full shrink-0 items-center gap-[10px] bg-neutral-0 px-[17px] pt-3 pb-[calc(env(safe-area-inset-bottom)+17px)]"
  >
    <label htmlFor="chat-message" className="sr-only">
      메시지 입력
    </label>

    <input
      ref={inputRef}
      id="chat-message"
      type="text"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className="h-9 min-w-0 flex-1 rounded-full border border-neutral-400 bg-neutral-0 px-[18px] text-[12px] leading-[18px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-secondary-500 disabled:bg-neutral-200 disabled:text-neutral-500"
    />

    <button
      type="submit"
      aria-label="메시지 보내기"
      disabled={disabled}
      className="relative flex size-9 shrink-0 items-center justify-center disabled:opacity-40"
    >
      <img
        src={ChatSendIcon}
        alt=""
        className="pointer-events-none absolute inset-0 size-9"
      />
      <img
        src={AirplaneIcon}
        alt=""
        className="pointer-events-none relative z-10 size-8"
      />
    </button>
  </form>
);