import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import BandLiveCard from "@/components/common/Card/BandLiveCard";
import LiveNowCard from "@/components/common/Card/LiveNowCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import {
  useEnterLiveMutation,
  useLiveHomeQuery,
  useReplayListQuery,
  useToggleLiveAlarmMutation,
} from "@/hooks/api/live/useLive";
import type { LiveApiResponse } from "@/types/live/live";
import "./FanLivePage.css";
import {
  FanLiveSectionHeader,
  ReplayPreviewCard,
} from "./components/FanLiveHomeParts";

const formatReplayDuration = (totalSeconds?: number) => {
  if (totalSeconds === undefined) return "00:00:00";

  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export function FanLiveHomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useLiveHomeQuery();
  const { data: replayListData } = useReplayListQuery("all", "LATEST");
  const enterLiveMutation = useEnterLiveMutation();
  const toggleAlarmMutation = useToggleLiveAlarmMutation();
  const [notificationOverrides, setNotificationOverrides] = useState<
    Record<number, boolean>
  >({});
  const replayDurations = useMemo(() => {
    return new Map(
      (replayListData?.pages.flatMap((page) => page.items) ?? []).map(
        (replay) => [
          replay.liveId,
          replay.durationSeconds ?? replay.durationSec,
        ],
      ),
    );
  }, [replayListData]);

  const toggleNotification = async (liveId: number) => {
    if (toggleAlarmMutation.isPending) return;

    try {
      const { alarmSet } = await toggleAlarmMutation.mutateAsync(liveId);

      setNotificationOverrides((current) => ({
        ...current,
        [liveId]: alarmSet,
      }));
    } catch (error) {
      const apiMessage = (error as AxiosError<LiveApiResponse<null>>).response
        ?.data?.message;

      alert(apiMessage ?? "라이브 알림을 변경하지 못했어요.");
    }
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
        <h1 className="m-0 font-body text-label2 text-[#1D1A1A]">라이브</h1>
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
                      key={replay.liveId}
                      imageSrc={replay.thumbnailImageUrl || BandImage}
                      title={replay.title}
                      bandName={replay.bandName}
                      viewCount={replay.viewCount.toLocaleString()}
                      duration={formatReplayDuration(
                        replay.durationSeconds ??
                          replay.durationSec ??
                          replayDurations.get(replay.liveId),
                      )}
                      onClick={() =>
                        navigate(`/fan/live/replays/${replay.liveId}`)
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
                        void toggleNotification(live.liveId)
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
