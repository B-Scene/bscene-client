import { useState, type ChangeEvent, type ReactNode } from "react";
import AirplaneIcon from "@/assets/icons/airplane.svg";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import BadgeIcon from "@/assets/icons/Badge.svg";
import BtnSendIcon from "@/assets/icons/Btn_send.svg";
import ChatIcon from "@/assets/icons/chat.svg";
import CloseIcon from "@/assets/icons/close.svg";
import BellIcon from "@/assets/icons/bell.svg";
import CoHostBackgroundIcon from "@/assets/icons/Background.svg";
import FBandProfileIcon from "@/assets/icons/F_band_img.svg";
import IcMicIcon from "@/assets/icons/ic_Mic.svg";
import LiveHeadIcon from "@/assets/icons/live-head.svg";
import LiveMicIcon from "@/assets/icons/live_mic.svg";
import LoveIcon from "@/assets/icons/love.svg";
import UsersIcon from "@/assets/icons/users.svg";
import BandImage from "@/assets/Img_Band.png";
import BandDefaultProfileIcon from "@/assets/icons/band/band-default-profile.svg";
import AddImageIcon from "@/assets/icons/band/add-image.svg";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

type BandLiveScreen =
  | "home"
  | "room"
  | "members"
  | "chat"
  | "endConfirm"
  | "ended"
  | "instantForm"
  | "reserveForm"
  | "editForm"
  | "cancelConfirm";

type LiveCard = {
  id: number;
  title: string;
  subtitle: string;
  listeners?: string;
};

type ChatMessage = {
  id: number;
  sender: string;
  message: string;
  time: string;
  highlighted?: boolean;
};

type Member = {
  id: number;
  name: string;
  role: string;
};

const liveCards: LiveCard[] = [
  {
    id: 1,
    title: "내 라이브 진행 중",
    subtitle: "라이브 제목 영역",
    listeners: "68명 청취 중",
  },
  {
    id: 2,
    title: "다른 밴드명",
    subtitle: "라이브 제목 영역",
    listeners: "68명 청취 중",
  },
];

const roomMessages: ChatMessage[] = [
  { id: 1, sender: "최진우", message: "신곡 발매 언제하나요?", time: "20:32" },
  { id: 2, sender: "한아영", message: "노래 너무 좋아요!", time: "20:33" },
  { id: 3, sender: "유제호", message: "WAVY 화이팅!!", time: "20:31" },
  { id: 4, sender: "유제호", message: "WAVY 화이팅!!", time: "20:31" },
];

const chatMessages: ChatMessage[] = [
  { id: 1, sender: "최준우", message: "라이브 자주 해주세요!!", time: "20:34" },
  {
    id: 2,
    sender: "WAVY",
    message: "여러분 감사합니다!\n신곡은 다음 달 공개 예정이에요!",
    time: "20:33",
    highlighted: true,
  },
  { id: 3, sender: "한아영", message: "노래 너무 좋아요!!", time: "20:32" },
  { id: 4, sender: "최진우", message: "신곡 발매 언제하나요?", time: "20:32" },
];

const members: Member[] = [
  { id: 1, name: "닉네임", role: "밴드 · 파트 · 리더" },
  { id: 2, name: "닉네임", role: "밴드 · 파트" },
  { id: 3, name: "닉네임", role: "밴드 · 파트" },
  { id: 4, name: "닉네임", role: "밴드 · 파트" },
  { id: 5, name: "닉네임", role: "밴드 · 파트" },
];

const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");

function TopBar({
  title,
  right,
  onBack,
  onClose,
}: {
  title: string;
  right?: "notification";
  onBack?: () => void;
  onClose?: () => void;
}) {
  return (
    <header className="relative flex h-16 items-center justify-center px-5">
      {onBack ? (
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="absolute left-5 flex size-8 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
      ) : null}
      <h1 className="text-h4 font-bold text-neutral-900">{title}</h1>
      {right === "notification" ? (
        <button
          type="button"
          aria-label="알림"
          className="absolute right-8 flex size-8 items-center justify-center"
        >
          <img src={BellIcon} alt="" className="size-6" />
        </button>
      ) : null}
      {onClose ? (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-5 flex size-8 items-center justify-center"
        >
          <img src={CloseIcon} alt="" className="size-7" />
        </button>
      ) : null}
    </header>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-label1 leading-6 text-neutral-900">{title}</h2>
      <button
        type="button"
        className="text-body2 mr-8 flex items-center gap-2 text-neutral-400"
      >
        전체보기
        <span className="text-[30px] leading-none text-neutral-300">›</span>
      </button>
    </div>
  );
}

function LiveIllustration() {
  return (
    <div
      className="relative flex h-[98px] w-[118px] shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute top-[21px] left-0 text-[18px] text-secondary-500">♪</span>
      <span className="absolute top-[57px] left-4 text-[13px] text-secondary-500">♪</span>
      <span className="absolute top-[25px] right-0 text-[17px] text-secondary-500">♫</span>
      <span className="absolute top-[58px] right-5 text-[14px] text-secondary-500">♪</span>
      <img src={LiveMicIcon} alt="" className="relative z-10 h-[98px] w-[94px] object-contain" />
    </div>
  );
}

function ProfileImage({
  size = "md",
  glow = false,
  src = BandImage,
}: {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  src?: string;
}) {
  const sizeClass = {
    sm: "size-9",
    md: "size-[62px]",
    lg: "size-[160px]",
  }[size];

  return (
    <img
      src={src}
      alt=""
      className={cx(
        sizeClass,
        "rounded-full object-cover",
        glow && "shadow-[0_0_18px_rgba(251,177,14,0.65)]",
        size === "lg" &&
          "border-2 border-neutral-0 shadow-[0_0_32px_rgba(251,177,14,0.65)]",
      )}
    />
  );
}

function HomeLiveCard({ live, onEnter }: { live: LiveCard; onEnter: () => void }) {
  return (
    <article className="relative flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
      <div className="relative shrink-0">
        <ProfileImage glow />
        <span className="text-label4 absolute -bottom-1 left-1/2 flex h-3 w-[27px] -translate-x-1/2 items-center justify-center rounded-full bg-secondary-500 text-neutral-0">
          LIVE
        </span>
      </div>
      <div className="ml-4 min-w-0 flex-1 pr-[62px]">
        <strong className="text-body1 block truncate text-neutral-900">{live.title}</strong>
        <span className="text-body3 mt-0.5 block truncate text-neutral-700">{live.subtitle}</span>
        <span className="text-caption2 mt-1 block text-secondary-500">
          <span className="inline-flex items-center gap-1.5">
            <img src={LiveHeadIcon} alt="" className="h-[13px] w-3 object-contain" />
            {live.listeners}
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={onEnter}
        className="text-caption3 absolute right-4 bottom-3 flex h-[22px] w-[51px] items-center justify-center rounded-full border border-secondary-500 bg-neutral-0 text-secondary-500"
      >
        입장
      </button>
    </article>
  );
}

function ScheduledLiveCard({ onEdit }: { onEdit: () => void }) {
  return (
    <article className="flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
      <ProfileImage />
      <div className="ml-4 min-w-0 flex-1">
        <strong className="text-body1 block truncate text-neutral-900">내 예정 라이브</strong>
        <span className="text-body3 mt-0.5 block truncate text-neutral-700">라이브 제목</span>
        <span className="text-caption2 mt-1 block text-secondary-500">5.28. (화) 오후 8:00</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-caption3 flex h-8 w-[69px] items-center justify-center rounded-lg bg-secondary-0 text-secondary-500"
      >
        편집
      </button>
    </article>
  );
}

function BandLiveHome({ go }: { go: (screen: BandLiveScreen) => void }) {
  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900">
      <TopBar title="라이브" right="notification" />
      <div className="px-5">
        <section className="mt-6 flex h-[164px] w-full items-center justify-between rounded-xl bg-secondary-0 px-[18px] shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
          <div className="min-w-0">
            <h2 className="text-[17px] leading-5 font-bold text-neutral-900">
              지금, 오디오 라이브를
              <br />
              시작 해보세요!
            </h2>
            <p className="text-caption2 mt-2 text-neutral-700">
              목소리만으로 팬들과 실시간 소통,
              <br />
              팔로워가 없어도 바로 시작할 수 있어요.
            </p>
            <button
              type="button"
              onClick={() => go("instantForm")}
              className="text-caption3 mt-3 flex h-[30px] w-[91px] items-center justify-center rounded-md bg-secondary-500 text-neutral-0"
            >
              라이브 시작하기
            </button>
          </div>
          <LiveIllustration />
        </section>

        <section className="mt-8">
          <SectionHeader title="지금 라이브 중" />
          <div className="mt-3 grid gap-3">
            {liveCards.map((live) => (
              <HomeLiveCard key={live.id} live={live} onEnter={() => go("room")} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeader title="예정된 라이브" />
          <div className="mt-3">
            <ScheduledLiveCard onEdit={() => go("editForm")} />
          </div>
        </section>
      </div>
      <BottomNavBar modeOverride="fan" activeColorModeOverride="band" />
    </main>
  );
}

function Waveform() {
  const bars = [4, 8, 18, 42, 78, 118, 90, 58, 32, 14, 8, 4];

  return (
    <div className="absolute top-[105px] inset-x-0 flex items-center justify-between px-8 text-secondary-500">
      <div className="flex w-[118px] items-center justify-between">
        {bars.map((height, index) => (
          <span key={`left-${height}-${index}`} className="w-0.5 rounded-full bg-current" style={{ height }} />
        ))}
      </div>
      <div className="flex w-[118px] items-center justify-between">
        {[...bars].reverse().map((height, index) => (
          <span key={`right-${height}-${index}`} className="w-0.5 rounded-full bg-current" style={{ height }} />
        ))}
      </div>
    </div>
  );
}

function VerifiedBadge() {
  return <img src={BadgeIcon} alt="인증됨" className="size-6 object-contain" />;
}

function LiveRoomHeader({ go }: { go: (screen: BandLiveScreen) => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-8">
      <div className="text-body3 flex items-center gap-3 text-neutral-900">
        <span className="text-caption3 flex h-[22px] items-center rounded-full bg-secondary-500 px-2.5 text-neutral-0">
          · LIVE
        </span>
        <span>00:24:15</span>
        <span className="flex items-center gap-1">
          <img src={LiveHeadIcon} alt="" className="h-[13px] w-3 object-contain" />
          30명 청취 중
        </span>
      </div>
      <button
        type="button"
        onClick={() => go("endConfirm")}
        className="text-caption3 flex h-[26px] w-[71px] items-center justify-center rounded-full bg-neutral-0 text-error shadow-[0_2px_8px_rgba(198,40,40,0.18)]"
      >
        라이브 종료
      </button>
    </header>
  );
}

function LiveRoomHero() {
  return (
    <section className="relative h-[388px] shrink-0 text-center">
      <Waveform />
      <div className="relative z-10 flex justify-center pt-[70px]">
        <ProfileImage size="lg" />
      </div>
      <div className="mt-[62px] flex items-center justify-center gap-2">
        <h2 className="text-h4 font-bold text-neutral-900">WAVY</h2>
        <VerifiedBadge />
      </div>
      <h3 className="text-h4 mt-2 text-neutral-900">신곡 데모 첫 공개!</h3>
      <p className="text-caption2 mt-1 text-neutral-600">미공개 데모를 라이브로 들려드려요</p>
    </section>
  );
}

function ChatBubble({ chat }: { chat: ChatMessage }) {
  return (
    <article className="grid grid-cols-[44px_1fr_32px] gap-3">
      <img
        src={chat.highlighted ? FBandProfileIcon : BandDefaultProfileIcon}
        alt=""
        className="mt-1 size-10 rounded-full object-cover"
      />
      <div>
        <strong className="text-caption3 block text-neutral-900">{chat.sender}</strong>
        <p
          className={cx(
            "text-body3 mt-1 whitespace-pre-line",
            chat.highlighted
              ? "rounded-xl border border-secondary-500 bg-transparent px-3.5 py-2.5 font-medium text-neutral-900"
              : "rounded-full bg-neutral-0 px-3.5 py-1.5 text-neutral-900",
          )}
        >
          {chat.message}
        </p>
      </div>
      <time className="text-caption4 mt-9 text-neutral-600">{chat.time}</time>
    </article>
  );
}

function LiveActionBar({ go }: { go: (screen: BandLiveScreen) => void }) {
  return (
    <div className="fixed bottom-[18px] left-1/2 z-30 h-[62px] w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 rounded-[22px] bg-neutral-0 shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
      <div className="relative flex h-full items-center justify-between px-12">
        <button
          type="button"
          onClick={() => go("members")}
          className="text-label4 flex w-11 flex-col items-center gap-1 text-neutral-900"
        >
          <img src={UsersIcon} alt="" className="size-6" />
          멤버
        </button>
        <button
          type="button"
          aria-label="마이크"
          className="absolute left-1/2 -top-6 flex size-[66px] -translate-x-1/2 items-center justify-center rounded-full bg-secondary-0 shadow-[0_0_30px_rgba(251,177,14,0.34)]"
        >
          <img src={IcMicIcon} alt="" className="size-[42px]" />
        </button>
        <button
          type="button"
          onClick={() => go("chat")}
          className="text-label4 flex w-11 flex-col items-center gap-1 text-neutral-900"
        >
          <img src={ChatIcon} alt="" className="size-6" />
          채팅
        </button>
      </div>
    </div>
  );
}

function RoomMessageArea({ variant }: { variant: "list" | "chat" }) {
  const messages = variant === "chat" ? chatMessages : roomMessages;

  return (
    <section
      className={cx(
        "min-h-0 flex-1 overflow-hidden bg-secondary-0 px-7 pt-[15px]",
        variant === "chat" ? "pb-[178px]" : "pb-[94px]",
      )}
    >
      <div className="grid gap-3.5">
        {messages.map((chat) => (
          <ChatBubble key={chat.id} chat={chat} />
        ))}
      </div>
    </section>
  );
}

function ChatComposer() {
  return (
    <div className="fixed bottom-[108px] left-1/2 z-30 flex w-[calc(100%-40px)] max-w-[353px] -translate-x-1/2 items-center gap-4">
      <input
        aria-label="메시지 입력"
        placeholder="메시지 입력하기"
        className="text-caption2 h-9 min-w-0 flex-1 rounded-full border border-neutral-400 bg-neutral-0 px-5 text-neutral-900 outline-none placeholder:text-neutral-400"
      />
      <button type="button" aria-label="메시지 보내기" className="relative flex size-9 shrink-0 items-center justify-center">
        <img src={BtnSendIcon} alt="" className="absolute inset-0 size-full" />
        <img src={AirplaneIcon} alt="" className="relative z-10 size-5" />
      </button>
    </div>
  );
}

function MemberSheet({ go }: { go: (screen: BandLiveScreen) => void }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70" onClick={() => go("room")} role="presentation">
      <section
        className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-neutral-0 px-8 pt-2.5 pb-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1 w-[42px] rounded-full bg-neutral-300" />
        <h2 className="text-h4 mt-7 text-center font-bold text-neutral-900">멤버</h2>
        <div className="mt-4 grid gap-3">
          {members.map((member) => (
            <article key={member.id} className="flex h-[48px] items-center rounded-lg bg-neutral-0 px-4 shadow-[0_2px_8px_rgba(20,20,20,0.10)]">
              <ProfileImage size="sm" />
              <div className="ml-3">
                <strong className="text-caption3 block text-neutral-900">{member.name}</strong>
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

function LiveRoom({
  go,
  overlay,
}: {
  go: (screen: BandLiveScreen) => void;
  overlay?: "members" | "endConfirm";
}) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader go={go} />
      <LiveRoomHero />
      <RoomMessageArea variant="chat" />
      <ChatComposer />
      <LiveActionBar go={go} />
      {overlay === "members" ? <MemberSheet go={go} /> : null}
      {overlay === "endConfirm" ? (
        <ConfirmDialog
          title="라이브를 종료할까요?"
          description="라이브를 종료하면 청취자들이\n자동으로 퇴장해요"
          cancelLabel="취소"
          confirmLabel="종료"
          onCancel={() => go("room")}
          onConfirm={() => go("ended")}
        />
      ) : null}
    </main>
  );
}

function LiveChatRoom({ go }: { go: (screen: BandLiveScreen) => void }) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-neutral-0 text-neutral-900">
      <LiveRoomHeader go={go} />
      <LiveRoomHero />
      <RoomMessageArea variant="chat" />
      <ChatComposer />
      <LiveActionBar go={go} />
    </main>
  );
}

function ChoiceCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex h-[58px] flex-1 items-start gap-3 rounded-lg border px-3 py-3 text-left",
        selected ? "border-secondary-500 bg-secondary-0" : "border-neutral-300 bg-neutral-0",
      )}
    >
      <span
        className={cx(
          "mt-0.5 size-3 rounded-full border",
          selected ? "border-secondary-500 bg-secondary-500 shadow-[inset_0_0_0_3px_#fffaf0]" : "border-neutral-300",
        )}
      />
      <span>
        <strong className="text-caption3 block text-neutral-900">{title}</strong>
        <span className="text-caption4 block whitespace-pre-line leading-[13px] text-neutral-500">{description}</span>
      </span>
    </button>
  );
}

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[14px] bg-neutral-0 px-[18px] py-3 shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
      <h2 className="text-body1 text-neutral-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextField({
  label,
  required,
  textarea,
  placeholder,
}: {
  label: string;
  required?: boolean;
  textarea?: boolean;
  placeholder: string;
}) {
  return (
    <label className="text-caption3 grid grid-cols-[76px_1fr] items-start gap-0 text-neutral-900">
      <span className="pt-1">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          className="text-caption2 h-[56px] resize-none rounded border border-neutral-300 px-4 py-1 outline-none placeholder:text-neutral-400"
        />
      ) : (
        <input
          placeholder={placeholder}
          className="text-caption2 h-7 rounded border border-neutral-300 px-4 outline-none placeholder:text-neutral-400"
        />
      )}
    </label>
  );
}

function ThumbnailField() {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailPreview(URL.createObjectURL(file));
  };

  return (
    <div className="text-body3 grid grid-cols-[76px_56px_1fr] items-center gap-0">
      <strong className="font-semibold text-neutral-900">썸네일 이미지</strong>
      <label
        aria-label="썸네일 이미지 추가"
        className="flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded border border-neutral-300 bg-neutral-0"
      >
        {thumbnailPreview ? (
          <img src={thumbnailPreview} alt="" className="size-full object-cover" />
        ) : (
          <img src={AddImageIcon} alt="" className="size-6" />
        )}
        <input type="file" accept="image/*" className="sr-only" onChange={handleThumbnailChange} />
      </label>
      <p className="text-caption2 ml-3 text-neutral-500">
        라이브를 대표할 이미지에요.
        <br />
        <span className="text-caption4 leading-[13px]">권장 사이즈 16:9 (1280*720)</span>
      </p>
    </div>
  );
}

function LiveInfoFields() {
  return (
    <div className="grid gap-4">
      <TextField label="라이브 제목" required placeholder="라이브 제목을 입력해주세요" />
      <TextField label="라이브 소개" textarea placeholder="라이브에 대해 소개해주세요 (선택)" />
      <ThumbnailField />
    </div>
  );
}

function DateTimeSelector() {
  return (
    <div className="rounded-lg border border-neutral-300 px-4 py-3">
      <button type="button" className="flex h-9 w-full items-center gap-4 text-left">
        <span className="text-[22px]" aria-hidden="true">▣</span>
        <span className="flex-1">
          <span className="text-caption2 block text-neutral-500">날짜 선택</span>
          <strong className="text-body2 block text-neutral-900">2026.05.24. (금)</strong>
        </span>
        <span className="text-2xl text-neutral-600">⌄</span>
      </button>
      <div className="my-2 h-px bg-neutral-300" />
      <button type="button" className="flex h-9 w-full items-center gap-4 text-left">
        <span className="text-[22px]" aria-hidden="true">◴</span>
        <span className="flex-1">
          <span className="text-caption2 block text-neutral-500">시작 시간</span>
          <strong className="text-body2 block text-neutral-900">20:00</strong>
        </span>
        <span className="text-2xl text-neutral-600">⌄</span>
      </button>
    </div>
  );
}

function CoHostCard() {
  return (
    <button
      type="button"
      className="flex h-16 w-full items-center rounded-[14px] bg-neutral-0 px-[18px] text-left shadow-[0_4px_15px_rgba(20,20,20,0.10)]"
    >
      <img src={CoHostBackgroundIcon} alt="" className="size-9 shrink-0" />
      <span className="ml-3 flex-1">
        <strong className="text-caption3 block text-neutral-900">공동 진행 (선택)</strong>
        <span className="text-caption2 block text-neutral-600">멤버와 함께 라이브를 진행할 수 있어요.</span>
      </span>
      <span className="text-[32px] leading-none text-neutral-300">›</span>
    </button>
  );
}

function TestBroadcastCard() {
  return (
    <section className="flex h-[88px] items-center justify-between rounded-[14px] bg-neutral-0 px-[18px] shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
      <div>
        <h2 className="text-body1 text-neutral-900">테스트 방송</h2>
        <p className="text-caption2 mt-2 text-neutral-600">
          방송 전에 음질과 마이크를
          <br />
          테스트해보세요
        </p>
      </div>
      <button
        type="button"
        className="text-caption3 flex h-8 w-[82px] items-center justify-center rounded-lg bg-secondary-0 text-secondary-500"
      >
        테스트 시작
      </button>
    </section>
  );
}

function LiveForm({
  mode,
  go,
  showCancelDialog = false,
}: {
  mode: "instant" | "reserve" | "edit";
  go: (screen: BandLiveScreen) => void;
  showCancelDialog?: boolean;
}) {
  const isReserve = mode === "reserve";
  const isEdit = mode === "edit";
  const isReservationMode = isReserve || isEdit;

  return (
    <main className="relative min-h-dvh bg-secondary-0 pb-[calc(var(--bottom-nav-height)+32px)] text-neutral-900">
      <div className="bg-neutral-0">
        <TopBar
          title={isReservationMode ? "라이브 예약 편집" : "라이브 시작"}
          onBack={() => (isReservationMode ? go("cancelConfirm") : go("home"))}
          onClose={isReservationMode ? undefined : () => go("home")}
        />
      </div>

      <div className="grid gap-3 px-5 pt-3">
        {!isEdit ? (
          <FormCard title="라이브 시간 설정">
            <div className="flex gap-5">
              <ChoiceCard
                selected={!isReserve}
                title="지금 바로 시작"
                description="즉시 라이브를 시작합니다"
                onClick={() => go("instantForm")}
              />
              <ChoiceCard
                selected={isReserve}
                title="예약 설정"
                description={"원하는 시간에\n라이브를 시작합니다"}
                onClick={() => go("reserveForm")}
              />
            </div>
          </FormCard>
        ) : null}

        <FormCard title="라이브 정보">
          <LiveInfoFields />
        </FormCard>

        {isReserve || isEdit ? (
          <FormCard title="예약 일시 설정">
            <DateTimeSelector />
          </FormCard>
        ) : null}

        <CoHostCard />
        {!isReserve && !isEdit ? <TestBroadcastCard /> : null}
      </div>

      {isEdit ? (
        <div className="fixed bottom-[140px] left-1/2 z-20 flex w-[353px] -translate-x-1/2 gap-5">
          <button
            type="button"
            onClick={() => go("home")}
            className="text-label2 flex h-12 flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-neutral-0"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => go("cancelConfirm")}
            className="text-label2 flex h-12 flex-1 items-center justify-center rounded-[10px] border border-secondary-500 bg-neutral-0 text-secondary-500"
          >
            예약 취소
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => (isReserve ? go("home") : go("room"))}
          className="text-label1 fixed bottom-[103px] left-1/2 z-20 flex h-[52px] w-[353px] -translate-x-1/2 items-center justify-center rounded-[10px] bg-secondary-500 text-neutral-0"
        >
          {isReserve ? "라이브 예약하기" : "라이브 시작하기"}
        </button>
      )}

      <BottomNavBar modeOverride="band" />

      {showCancelDialog ? (
        <ConfirmDialog
          title="예약을 취소할까요?"
          description="취소된 라이브 예약은 복구할 수 없어요"
          cancelLabel="돌아가기"
          confirmLabel="예약 취소"
          onCancel={() => go("editForm")}
          onConfirm={() => go("home")}
        />
      ) : null}
    </main>
  );
}

function ConfirmDialog({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-[52px]">
      <section className="w-full max-w-[290px] rounded-[20px] bg-neutral-0 px-6 py-8 text-center">
        <h2 className="text-[20px] leading-7 font-bold text-neutral-900">{title}</h2>
        <p className="text-body2 mt-4 whitespace-pre-line text-neutral-600">{description}</p>
        <div className="mt-7 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-label2 flex h-[56px] flex-1 items-center justify-center rounded-[10px] border border-secondary-500 bg-neutral-0 text-secondary-500"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-label2 flex h-[56px] flex-1 items-center justify-center rounded-[10px] bg-secondary-500 text-neutral-0"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function CancelConfirm({ go }: { go: (screen: BandLiveScreen) => void }) {
  return <LiveForm mode="edit" go={go} showCancelDialog />;
}

function EndedLive({ go }: { go: (screen: BandLiveScreen) => void }) {
  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900">
      <section className="px-8 pt-[190px] text-center">
        <img src={LoveIcon} alt="" className="mx-auto size-[150px] object-contain" />
        <h1 className="text-h1 mt-[62px] text-neutral-900">라이브가 종료되었어요!</h1>
        <p className="text-body2 mt-3 text-neutral-900">오늘도 팬들과 함께해줘서 고마워요</p>

        <dl className="text-body3 mt-12 rounded-lg bg-neutral-0 px-7 py-2 shadow-[0_4px_15px_rgba(20,20,20,0.10)]">
          <div className="flex h-[34px] items-center justify-between border-b border-neutral-300">
            <dt className="font-medium text-neutral-600">라이브 제목</dt>
            <dd className="font-semibold text-neutral-900">신곡 데모 첫 공개!</dd>
          </div>
          <div className="flex h-[34px] items-center justify-between border-b border-neutral-300">
            <dt className="font-medium text-neutral-600">진행 시간</dt>
            <dd className="font-semibold text-neutral-900">01 : 23 : 54</dd>
          </div>
          <div className="flex h-[34px] items-center justify-between">
            <dt className="font-medium text-neutral-600">총 청취자</dt>
            <dd className="font-semibold text-neutral-900">254명</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => go("home")}
          className="text-label1 mt-8 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-secondary-500 text-neutral-0"
        >
          라이브 탭으로 돌아가기
        </button>
      </section>
      <BottomNavBar modeOverride="band" />
    </main>
  );
}

export function BandLivePage() {
  const [screen, setScreen] = useState<BandLiveScreen>("home");

  if (screen === "room") return <LiveRoom go={setScreen} />;
  if (screen === "members") return <LiveRoom go={setScreen} overlay="members" />;
  if (screen === "chat") return <LiveChatRoom go={setScreen} />;
  if (screen === "endConfirm") return <LiveRoom go={setScreen} overlay="endConfirm" />;
  if (screen === "ended") return <EndedLive go={setScreen} />;
  if (screen === "instantForm") return <LiveForm mode="instant" go={setScreen} />;
  if (screen === "reserveForm") return <LiveForm mode="reserve" go={setScreen} />;
  if (screen === "editForm") return <LiveForm mode="edit" go={setScreen} />;
  if (screen === "cancelConfirm") return <CancelConfirm go={setScreen} />;

  return <BandLiveHome go={setScreen} />;
}

export default BandLivePage;
