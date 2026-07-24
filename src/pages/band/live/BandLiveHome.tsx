import type { AxiosError } from "axios";
import LiveHeadIcon from "@/assets/icons/live-head.svg";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { useEnterLiveMutation, useLiveHomeQuery } from "@/hooks/api/live/useLive";
import type { LiveApiResponse } from "@/types/live/live";
import type { ActiveLive, GoLiveScreen, LiveCard, ScheduledLiveCardData } from "./types";
import { LiveIllustration } from "./components/LiveIllustration";
import { ProfileImage } from "./components/ProfileImage";
import { SectionHeader } from "./components/SectionHeader";
import { TopBar } from "./components/TopBar";

function HomeLiveCard({
  live,
  onEnter,
  disabled,
}: {
  live: LiveCard;
  onEnter: () => void;
  disabled?: boolean;
}) {
  return (
    <article className="relative flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <div className="relative shrink-0">
        <ProfileImage glow src={live.imageUrl ?? undefined} />
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
        disabled={disabled}
        className="absolute right-4 bottom-3 flex h-[22px] w-[51px] items-center justify-center rounded-full border border-secondary-500 bg-neutral-0 text-caption3 text-secondary-500 disabled:opacity-50"
      >
        입장
      </button>
    </article>
  );
}

function ScheduledLiveCard({
  live,
  onEdit,
}: {
  live: ScheduledLiveCardData;
  onEdit: () => void;
}) {
  return (
    <article className="flex h-[88px] items-center rounded-[10px] bg-neutral-0 px-4 shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
      <ProfileImage />

      <div className="ml-4 min-w-0 flex-1">
        <strong className="block truncate text-body1 text-neutral-900">
          {live.isMine ? "내 예정 라이브" : live.bandName}
        </strong>
        <span className="mt-0.5 block truncate text-body3 text-neutral-700">{live.title}</span>
        <span className="mt-1 block text-caption2 text-secondary-500">
          {live.scheduledAt}
        </span>
      </div>

      {live.isMine ? (
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-[69px] items-center justify-center rounded-lg bg-secondary-0 text-caption3 text-secondary-500"
        >
          수정
        </button>
      ) : null}
    </article>
  );
}

interface BandLiveHomeProps {
  go: GoLiveScreen;
  onEnterLive: (live: ActiveLive) => void;
}

export function BandLiveHome({ go, onEnterLive }: BandLiveHomeProps) {
  const { data, isLoading, isError, refetch } = useLiveHomeQuery();
  const enterLiveMutation = useEnterLiveMutation();

  const liveNowCards: LiveCard[] =
    data?.liveNow.map((live) => ({
      id: live.liveId,
      title: live.isMine ? "내 라이브 진행 중" : live.bandName,
      subtitle: live.title,
      listeners: `${live.viewerCount}명 청취 중`,
      imageUrl: live.bandProfileImageUrl,
      isMine: live.isMine,
    })) ?? [];

  const scheduledCards: ScheduledLiveCardData[] =
    data?.scheduled.map((live) => ({
      id: live.liveId,
      bandName: live.bandName,
      title: live.title,
      scheduledAt: live.scheduledAt,
      isMine: live.isMine,
    })) ?? [];

  const handleEnterLive = async (liveId: number) => {
    try {
      const enteredLive = await enterLiveMutation.mutateAsync(liveId);
      onEnterLive(enteredLive);
      go("room");
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response?.data
        ?.message;

      alert(apiMessage ?? "라이브 입장에 실패했어요.");
    }
  };

  return (
    <main className="relative min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)] text-neutral-900">
      <TopBar title="라이브" />

      <div className="px-5">
        <section className="mt-5 flex h-[164px] w-full items-center justify-between rounded-xl bg-secondary-0 px-[18px] shadow-[0_4px_15px_rgba(20,20,20,0.08)]">
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

        {isLoading ? (
          <p className="mt-8 text-center text-caption2 text-neutral-500">
            라이브를 불러오는 중이에요.
          </p>
        ) : null}

        {isError ? (
          <div className="mt-8 rounded-xl bg-secondary-0 p-5 text-center">
            <p className="text-caption2 text-neutral-700">
              라이브 정보를 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-secondary-500 px-4 py-2 text-caption3 text-neutral-0"
            >
              다시 불러오기
            </button>
          </div>
        ) : null}

        <section className="mt-8">
          <SectionHeader title="진행 중인 라이브" />
          <div className="mt-3 grid gap-3">
            {liveNowCards.length > 0 ? (
              liveNowCards.map((live) => (
                <HomeLiveCard
                  key={live.id}
                  live={live}
                  disabled={enterLiveMutation.isPending}
                  onEnter={() => handleEnterLive(live.id)}
                />
              ))
            ) : (
              <p className="rounded-xl bg-secondary-0 py-6 text-center text-caption2 text-neutral-500">
                진행 중인 라이브가 없어요.
              </p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeader title="예정된 라이브" />
          <div className="mt-3 grid gap-3">
            {scheduledCards.length > 0 ? (
              scheduledCards.map((live) => (
                <ScheduledLiveCard
                  key={live.id}
                  live={live}
                  onEdit={() => go("editForm")}
                />
              ))
            ) : (
              <p className="rounded-xl bg-secondary-0 py-6 text-center text-caption2 text-neutral-500">
                예정된 라이브가 없어요.
              </p>
            )}
          </div>
        </section>
      </div>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="band" />
    </main>
  );
}