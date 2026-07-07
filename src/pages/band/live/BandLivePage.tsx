import { useState } from "react";

type BandLiveView = "home" | "room" | "form";

type LiveRoom = {
  id: number;
  title: string;
  description: string;
  listeners: number;
  isMine: boolean;
};

type ScheduledLive = {
  id: number;
  title: string;
  description: string;
  date: string;
};

type ChatMessage = {
  id: number;
  sender: string;
  message: string;
  time: string;
};

type Member = {
  id: number;
  name: string;
  role: string;
};

const liveRooms: LiveRoom[] = [
  {
    id: 1,
    title: "내 라이브 진행 중",
    description: "라이브 제목 영역",
    listeners: 68,
    isMine: true,
  },
  {
    id: 2,
    title: "다른 밴드명",
    description: "라이브 제목 영역",
    listeners: 68,
    isMine: false,
  },
];

const scheduledLives: ScheduledLive[] = [
  {
    id: 1,
    title: "내 예정 라이브",
    description: "라이브 제목",
    date: "5.28. (화) 오후 8:00",
  },
];

const chatMessages: ChatMessage[] = [
  { id: 1, sender: "최진우", message: "신곡 벌써 언제하나요?", time: "20:32" },
  { id: 2, sender: "한아영", message: "노래 너무 좋아요!", time: "20:33" },
  { id: 3, sender: "유재호", message: "WAVY 화이팅!!", time: "20:31" },
  { id: 4, sender: "유재호", message: "WAVY 화이팅!!", time: "20:31" },
];

const members: Member[] = [
  { id: 1, name: "닉네임", role: "밴드 · 파트 · 리더" },
  { id: 2, name: "닉네임", role: "밴드 · 파트" },
  { id: 3, name: "닉네임", role: "밴드 · 파트" },
  { id: 4, name: "닉네임", role: "밴드 · 파트" },
  { id: 5, name: "닉네임", role: "밴드 · 파트" },
];

const screenClass = "relative mx-auto min-h-[800px] w-[min(100vw,393px)] overflow-hidden bg-neutral-0 pb-[108px] text-neutral-900";
const cardClass = "mx-auto flex h-[68px] w-[316px] items-center gap-3 rounded-xl bg-neutral-0 px-4 py-[9px] shadow-[0_0_8px_rgba(0,0,0,0.08)]";
const bottomDockClass = "absolute bottom-4 left-6 right-6 flex h-[68px] items-center justify-around rounded-[22px] bg-neutral-0 shadow-[0_4px_18px_rgba(20,20,20,0.14)]";

function ProfileArt({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const sizeClass = {
    small: "h-[50px] w-[50px]",
    medium: "h-[72px] w-[72px]",
    large: "h-[132px] w-[132px] border-2 border-neutral-0 shadow-[0_0_28px_rgba(251,177,14,0.48)]",
  }[size];

  return (
    <div
      className={`${sizeClass} shrink-0 rounded-full bg-[radial-gradient(circle_at_28%_30%,#7dd7e8_0_18%,transparent_19%),radial-gradient(circle_at_62%_25%,#f24d91_0_20%,transparent_21%),radial-gradient(circle_at_60%_72%,#823088_0_22%,transparent_23%),linear-gradient(135deg,#62c7e4_0%,#fa7aa5_52%,#6b2478_100%)]`}
      aria-hidden="true"
    />
  );
}

function BellIcon() {
  return <span aria-hidden="true" className="text-[24px] leading-none">♧</span>;
}

function BottomNav() {
  const tabs = [
    { icon: "⌂", label: "홈" },
    { icon: "⌕", label: "탐색" },
    { icon: "◉", label: "라이브", active: true },
    { icon: "☻", label: "마이" },
  ];

  return (
    <nav className={bottomDockClass} aria-label="밴드모드 하단 네비게이션">
      {tabs.map((tab) => (
        <button key={tab.label} type="button" className={`grid justify-items-center gap-1 bg-transparent text-lg ${tab.active ? "text-secondary-500" : "text-neutral-900"}`}>
          <span>{tab.icon}</span>
          <em className="text-[9px] not-italic font-bold">{tab.label}</em>
        </button>
      ))}
    </nav>
  );
}

function LiveBadge() {
  return <span className="inline-flex h-[18px] min-w-10 items-center justify-center rounded-full bg-secondary-500 px-2 text-[8px] font-extrabold text-neutral-0">LIVE</span>;
}

function LiveCard({ room, onEnter }: { room: LiveRoom; onEnter: () => void }) {
  return (
    <article className={cardClass}>
      <div className="relative shrink-0">
        <ProfileArt size="small" />
        <span className="absolute bottom-0 right-0 inline-flex h-3 min-w-6 items-center justify-center rounded-full bg-secondary-500 px-1 text-[5px] font-extrabold text-neutral-0">LIVE</span>
      </div>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <strong className="text-[12px] font-extrabold leading-[16px]">{room.title}</strong>
        <span className="text-[10px] leading-3 text-neutral-700">{room.description}</span>
        <p className="m-0 text-[10px] leading-3 text-secondary-500">헤드폰 {room.listeners}명 청취 중</p>
      </div>
      <button type="button" className="h-[26px] rounded-full border border-secondary-500 bg-neutral-0 px-[13px] text-[11px] font-bold text-secondary-500" onClick={onEnter}>
        입장
      </button>
    </article>
  );
}

function ScheduleCard({ onEdit }: { onEdit: () => void }) {
  const live = scheduledLives[0];

  return (
    <article className={cardClass}>
      <ProfileArt size="small" />
      <div className="grid min-w-0 flex-1 gap-0.5">
        <strong className="text-[12px] font-extrabold leading-[16px]">{live.title}</strong>
        <span className="text-[10px] leading-3 text-neutral-700">{live.description}</span>
        <p className="m-0 text-[10px] leading-3 text-secondary-500">{live.date}</p>
      </div>
      <button type="button" className="h-[30px] rounded-[8px] bg-secondary-100 px-4 text-[11px] font-bold text-secondary-500" onClick={onEdit}>
        편집
      </button>
    </article>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
     <div className="mx-auto flex h-6 w-[316px] items-center justify-between">
      <h2 className="m-0 text-[18px] font-extrabold leading-6">{title}</h2>
      {action ? <button type="button" className="flex items-center bg-transparent text-[13px] text-neutral-400">{action} <span className="ml-1 text-2xl leading-none">›</span></button> : null}
    </div>
  );
}

function BandLiveHome({ onStart, onEnter, onEdit }: { onStart: () => void; onEnter: () => void; onEdit: () => void }) {
  return (
    <main className={screenClass}>
      <header className="flex h-12 w-full items-center justify-between bg-neutral-0 px-6 py-3">
        <h1 className="m-0 text-[20px] font-bold leading-6">라이브</h1>
        <button type="button" aria-label="알림" className="flex h-6 w-6 items-center justify-center bg-transparent text-neutral-900">
          <BellIcon />
        </button>
      </header>

      <section className="mx-auto mt-[51px] flex h-[126px] w-[316px] items-center justify-center gap-5 rounded-xl bg-secondary-0 p-[19px] shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 mb-1 text-[17px] font-extrabold leading-[20px]">지금, 오디오 라이브를<br />시작 해보세요!</h2>
          <p className="m-0 mb-2 text-[9px] leading-[13px] text-neutral-700">목소리만으로 팬들과 실시간 소통,<br />팔로워가 없어도 바로 시작할 수 있어요.</p>
          <button type="button" className="h-[30px] rounded-[6px] bg-secondary-500 px-3 text-[10px] font-bold text-neutral-0" onClick={onStart}>라이브 시작하기</button>
        </div>
        <div className="relative h-[76px] w-[76px] shrink-0 text-secondary-500" aria-hidden="true">
          <span className="absolute left-0 top-[27px] text-base font-extrabold">♪</span>
          <span className="absolute left-[29px] top-1 h-11 w-6 rounded-[18px] bg-[linear-gradient(90deg,var(--color-secondary-200),var(--color-secondary-500))] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.45)]" />
          <span className="absolute left-[24px] top-[38px] h-5 w-9 rounded-b-[20px] border-[3px] border-t-0 border-secondary-500" />
          <span className="absolute left-[40px] top-[58px] h-4 w-1 rounded bg-secondary-500" />
          <span className="absolute right-0 top-[21px] text-base font-extrabold">♫</span>
        </div>
      </section>

      <div className="mt-5"><SectionTitle title="지금 라이브 중" action="전체보기" /></div>
      <div className="mt-3 flex flex-col gap-3">
        {liveRooms.map((room) => (
          <LiveCard key={room.id} room={room} onEnter={onEnter} />
        ))}
      </div>

      <div className="mt-7"><SectionTitle title="예정된 라이브" action="전체보기" /></div>
      <div className="mt-3"><ScheduleCard onEdit={onEdit} /></div>

      <BottomNav />
    </main>
  );
}

function Waveform() {
  return (
    <div className="absolute left-1.5 right-1.5 top-[100px] flex items-center justify-between text-secondary-500" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <span className="w-0.5 rounded bg-current opacity-65" key={index} style={{ height: `${12 + Math.abs(14 - index) * 2}px` }} />
      ))}
    </div>
  );
}

function ChatRow({ chat }: { chat: ChatMessage }) {
  return (
    <div className="mb-3.5 grid grid-cols-[36px_1fr_auto] items-center gap-2.5">
      <div className="h-9 w-9 rounded-full bg-neutral-400" />
      <div>
        <strong className="mb-1 block text-[11px] font-extrabold">{chat.sender}</strong>
        <p className="m-0 w-fit max-w-48 rounded-full bg-neutral-0 px-4 py-2 text-[11px]">{chat.message}</p>
      </div>
      <time className="self-end text-[8px] text-neutral-500">{chat.time}</time>
    </div>
  );
}

function MemberSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/60" onClick={onClose} role="presentation">
      <section className="min-h-[330px] w-full rounded-t-3xl bg-neutral-0 px-6 pb-6 pt-3" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-[18px] h-1 w-[58px] rounded-full bg-neutral-400" />
        <h2 className="m-0 mb-5 text-center text-lg font-black">멤버</h2>
        <div className="grid gap-3">
          {members.map((member) => (
            <article className="flex h-[58px] items-center gap-3 rounded-[10px] border border-neutral-300 px-3.5 py-2 shadow-[0_3px_10px_rgba(20,20,20,0.06)]" key={member.id}>
              <ProfileArt size="small" />
              <div>
                <strong className="text-xs font-extrabold">{member.name}</strong>
                <p className="m-0 mt-1 text-[10px] text-neutral-600">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BandLiveRoom({ onBack }: { onBack: () => void }) {
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);

  return (
    <main className="relative mx-auto min-h-[800px] w-[min(100vw,393px)] overflow-hidden bg-neutral-0 pb-[104px] text-neutral-900">
      <header className="flex h-12 items-center justify-between px-6">
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-neutral-900">
          <LiveBadge />
          <span>00:24:15</span>
          <span>헤드폰 30명 청취 중</span>
        </div>
        <button type="button" className="rounded-full border border-primary-50 bg-neutral-0 px-3 py-2 text-[11px] font-bold text-error" onClick={onBack}>라이브 종료</button>
      </header>

      <section className="relative grid h-[310px] content-center justify-items-center text-center">
        <Waveform />
        <div className="z-10 mb-7"><ProfileArt size="large" /></div>
        <h1 className="m-0 mb-1.5 text-xl font-black">WAVY <span className="text-primary-300">✿</span></h1>
        <strong className="text-xl font-black">신곡 데모 첫 공개!</strong>
        <p className="m-0 mt-2 text-xs text-neutral-600">미공개 데모를 라이브로 들려드려요</p>
      </section>

      <section className="min-h-[322px] bg-secondary-0 px-6 pb-[104px] pt-6">
        {chatMessages.map((chat) => <ChatRow chat={chat} key={chat.id} />)}
      </section>

      <div className="absolute bottom-5 left-6 right-6 flex h-[68px] items-center justify-around rounded-[22px] bg-neutral-0 shadow-[0_4px_18px_rgba(20,20,20,0.14)]">
        <button type="button" className="grid justify-items-center gap-1 bg-transparent text-lg text-neutral-900" onClick={() => setIsMemberSheetOpen(true)}><span>♟</span><em className="text-[9px] not-italic font-bold">멤버</em></button>
        <button type="button" className="mt-[-28px] h-16 w-16 rounded-full bg-neutral-0 text-[44px] leading-none text-secondary-500 shadow-[0_3px_16px_rgba(251,177,14,0.35)]" aria-label="마이크">●</button>
        <button type="button" className="grid justify-items-center gap-1 bg-transparent text-lg text-neutral-900"><span>☷</span><em className="text-[9px] not-italic font-bold">채팅</em></button>
      </div>

      {isMemberSheetOpen ? <MemberSheet onClose={() => setIsMemberSheetOpen(false)} /> : null}
    </main>
  );
}

function LiveForm({ onBack }: { onBack: () => void }) {
  return (
    <main className={`${screenClass} bg-secondary-0 px-6 pb-8`}>
      <header className="flex h-12 items-center justify-between">
        <button type="button" className="h-9 w-9 bg-transparent text-2xl text-neutral-900" onClick={onBack} aria-label="뒤로가기">‹</button>
        <h1 className="m-0 text-xl font-bold">라이브 예약 편집</h1>
        <span />
      </header>

      <form className="mt-4 grid gap-5">
        <section className="rounded-[14px] bg-neutral-0 p-5 shadow-[0_4px_12px_rgba(20,20,20,0.06)]">
          <h2 className="m-0 mb-[18px] text-[15px] font-black">라이브 정보</h2>
          <label className="mb-4 grid gap-2 text-xs font-extrabold text-neutral-900">
            라이브 제목 <span className="text-primary-500">*</span>
            <input className="w-full rounded-lg border border-neutral-300 p-3 text-xs" placeholder="라이브 제목을 입력해주세요" defaultValue="신곡 데모 첫 공개!" />
          </label>
          <label className="grid gap-2 text-xs font-extrabold text-neutral-900">
            소개 문구
            <textarea className="min-h-[92px] w-full resize-none rounded-lg border border-neutral-300 p-3 text-xs" placeholder="라이브 소개를 입력해주세요" defaultValue="미공개 데모를 라이브로 들려드려요" />
          </label>
        </section>

        <section className="rounded-[14px] bg-neutral-0 p-5 shadow-[0_4px_12px_rgba(20,20,20,0.06)]">
          <h2 className="m-0 mb-[18px] text-[15px] font-black">라이브 시간 설정</h2>
          <div className="rounded-[10px] border border-secondary-500 bg-secondary-100 p-3.5 text-xs font-extrabold text-secondary-500">지금 바로 시작</div>
          <div className="mt-2.5 rounded-[10px] border border-neutral-300 p-3.5 text-xs font-extrabold">예약 설정</div>
        </section>

        <button type="button" className="h-[52px] w-full rounded-[7px] bg-secondary-500 px-3.5 py-2 text-[15px] font-bold text-neutral-0" onClick={onBack}>저장하기</button>
      </form>
    </main>
  );
}

export function BandLivePage() {
  const [view, setView] = useState<BandLiveView>("home");

  if (view === "room") {
    return <BandLiveRoom onBack={() => setView("home")} />;
  }

  if (view === "form") {
    return <LiveForm onBack={() => setView("home")} />;
  }

  return (
    <BandLiveHome
      onStart={() => setView("room")}
      onEnter={() => setView("room")}
      onEdit={() => setView("form")}
    />
  );
}
