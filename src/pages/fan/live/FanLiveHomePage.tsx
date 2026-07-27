import { useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import BandLiveCard from "@/components/common/Card/BandLiveCard";
import LiveNowCard from "@/components/common/Card/LiveNowCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
} from "@/hooks/api/live/useLive";
import type { LiveApiResponse } from "@/types/live/live";
import "./FanLivePage.css";
import {
  FanLiveSectionHeader,
  ReplayPreviewCard,
} from "./components/FanLiveHomeParts";

export function FanLiveHomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useLiveHomeQuery();
  const enterLiveMutation = useEnterLiveMutation();
  const [notificationOverrides, setNotificationOverrides] = useState<
    Record<number, boolean>
  >({});

  const toggleNotification = (liveId: number, currentValue: boolean) => {
    setNotificationOverrides((current) => ({
      ...current,
      [liveId]: !currentValue,
    }));
  };

  const handleEnterLive = async (liveId: number) => {
    if (enterLiveMutation.isPending) return;

    try {
      const live = await enterLiveMutation.mutateAsync(liveId);

      navigate(`/fan/live/room/${liveId}`, {
        state: { live },
      });
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "라이브 방에 입장하지 못했어요.");
    }
  };

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <header className="flex h-12 items-center justify-center bg-neutral-0">
        <h1 className="m-0 font-body text-label2 text-neutral-900">라이브</h1>
      </header>

      <div className="fan-live-home-scroll h-[calc(100%_-_48px)] overflow-y-auto px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
        {isLoading ? (
          <p className="py-10 text-center font-body text-caption2 text-neutral-500">
            라이브를 불러오는 중이에요.
          </p>
        ) : null}

        {isError ? (
          <div className="mt-5 rounded-xl bg-primary-50 p-5 text-center">
            <p className="font-body text-caption2 text-neutral-700">
              라이브 정보를 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
            >
              다시 불러오기
            </button>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <>
            <section className="pt-5">
              <FanLiveSectionHeader
                title="진행 중인 라이브"
                onMoreClick={() => navigate("/fan/live/now")}
              />
              <div className="mt-3 flex flex-col items-center gap-3">
                {data?.liveNow.map((live) => (
                  <LiveNowCard
                    key={live.liveId}
                    imageSrc={live.bandProfileImageUrl || BandImage}
                    imageAlt={`${live.bandName} 라이브 이미지`}
                    title={live.title}
                    bandName={live.bandName}
                    listenerCount={`${live.viewerCount.toLocaleString()}명 시청 중`}
                    tone="pink"
                    onClick={() => void handleEnterLive(live.liveId)}
                  />
                ))}
                {data?.liveNow.length === 0 ? (
                  <p className="py-5 font-body text-caption2 text-neutral-500">
                    진행 중인 라이브가 없어요.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="mt-7">
              <FanLiveSectionHeader
                title="다시보기"
                onMoreClick={() => navigate("/fan/live/replays")}
              />
              {data?.replays.length ? (
                <div className="fan-live-home-scroll -mr-5 mt-3 flex gap-3 overflow-x-auto pr-5 pb-1">
                  {data.replays.map((replay) => (
                    <ReplayPreviewCard
                      key={replay.replayId}
                      imageSrc={replay.thumbnailImageUrl || BandImage}
                      title={replay.title}
                      bandName={replay.bandName}
                      viewCount={replay.viewCount.toLocaleString()}
                      onClick={() =>
                        navigate(`/fan/live/replays/${replay.replayId}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="py-5 text-center font-body text-caption2 text-neutral-500">
                  다시보기가 없어요.
                </p>
              )}
            </section>

            <section className="mt-7">
              <FanLiveSectionHeader
                title="예정된 라이브"
                onMoreClick={() => navigate("/fan/live/scheduled")}
              />
              <div className="mt-3 flex flex-col items-center gap-3">
                {data?.scheduled.map((live) => {
                  const isNotified =
                    notificationOverrides[live.liveId] ??
                    live.notificationEnabled ??
                    false;

                  return (
                    <BandLiveCard
                      key={live.liveId}
                      imageSrc={BandImage}
                      imageAlt={`${live.bandName} 예정 라이브 이미지`}
                      title={live.title}
                      bandName={live.bandName}
                      schedule={live.scheduledAt}
                      showNotificationButton
                      notificationLabel={
                        isNotified ? "알림 받는 중" : "알림 받기"
                      }
                      notificationVariant={isNotified ? "soft" : "outline"}
                      notificationContentSize={
                        isNotified ? "compact" : "default"
                      }
                      tone="pink"
                      onNotificationClick={() =>
                        toggleNotification(live.liveId, isNotified)
                      }
                    />
                  );
                })}
                {data?.scheduled.length === 0 ? (
                  <p className="py-5 font-body text-caption2 text-neutral-500">
                    예정된 라이브가 없어요.
                  </p>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </div>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

export default FanLiveHomePage;
