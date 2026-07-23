import LiveHeadIcon from "@/assets/icons/live-head.svg";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { liveCards } from "./data";
import type { GoLiveScreen, LiveCard } from "./types";
import { LiveIllustration } from "./components/LiveIllustration";
import { ProfileImage } from "./components/ProfileImage";
import { SectionHeader } from "./components/SectionHeader";
import { TopBar } from "./components/TopBar";

function HomeLiveCard({ live, onEnter }: { live: LiveCard; onEnter: () => void }) {
  return (
    <article className="relative flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <div className="relative shrink-0">
        <ProfileImage glow />
        <span className="absolute -bottom-1 left-1/2 flex h-3 w-[27px] -translate-x-1/2 items-center justify-center rounded-full bg-secondary-500 text-label4 text-neutral-0">
          LIVE
        </span>
      </div>
      <div className="ml-4 min-w-0 flex-1 pr-[62px]">
        <strong className="block truncate text-body1 text-neutral-900">{live.title}</strong>
        <span className="mt-0.5 block truncate text-body3 text-neutral-700">{live.subtitle}</span>
        <span className="mt-1 block text-caption2 text-secondary-500">
          <span className="inline-flex items-center gap-1.5">
            <img src={LiveHeadIcon} alt="" className="h-[13px] w-3 object-contain" />
            {live.listeners}
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={onEnter}
        className="absolute right-4 bottom-3 flex h-[22px] w-[51px] items-center justify-center rounded-full border border-secondary-500 bg-neutral-0 text-caption3 text-secondary-500"
      >
        입장
      </button>
    </article>
  );
}

function ScheduledLiveCard({ onEdit }: { onEdit: () => void }) {
  return (
    <article className="flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <ProfileImage />
      <div className="ml-4 min-w-0 flex-1">
        <strong className="block truncate text-body1 text-neutral-900">내 예정 라이브</strong>
        <span className="mt-0.5 block truncate text-body3 text-neutral-700">라이브 제목</span>
        <span className="mt-1 block text-caption2 text-secondary-500">5.28. (화) 오후 8:00</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex h-8 w-[69px] items-center justify-center rounded-lg bg-secondary-0 text-caption3 text-secondary-500"
      >
        편집
      </button>
    </article>
  );
}

export function BandLiveHome({ go }: { go: GoLiveScreen }) {
  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900">
      <TopBar title="라이브" right="notification" align="left" />
      <div className="px-5">
        <section className="mt-6 flex h-[164px] w-full items-center justify-between rounded-xl bg-secondary-0 px-[18px] shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
          <div className="min-w-0">
            <h2 className="text-[17px] leading-5 font-bold text-neutral-900">
              지금, 오디오 라이브를
              <br />
              시작 해보세요!
            </h2>
            <p className="mt-2 text-caption2 text-neutral-700">
              목소리만으로 팬들과 실시간 소통,
              <br />
              팔로워가 없어도 바로 시작할 수 있어요.
            </p>
            <button
              type="button"
              onClick={() => go("instantForm")}
              className="mt-3 flex h-[30px] w-[91px] items-center justify-center rounded-md bg-secondary-500 text-caption3 text-neutral-0"
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
