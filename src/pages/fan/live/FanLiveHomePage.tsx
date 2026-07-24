import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import ConcertImage from "@/assets/Img_bandupload.png";
import SunsetImage from "@/assets/Img_upload.png";
import BandLiveCard from "@/components/common/Card/BandLiveCard";
import LiveNowCard from "@/components/common/Card/LiveNowCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import "./FanLivePage.css";
import {
  FanLiveSectionHeader,
  ReplayPreviewCard,
} from "./components/FanLiveHomeParts";

const LIVE_ITEMS = ["live-1", "live-2", "live-3"];

const REPLAY_ITEMS = [
  { id: "replay-1", imageSrc: ConcertImage, duration: "03:12:10", viewCount: "458" },
  { id: "replay-2", imageSrc: SunsetImage, duration: "01:24:18", viewCount: "4,056" },
  { id: "replay-3", imageSrc: BandImage, duration: "02:31:10", viewCount: "4,556" },
  { id: "replay-4", imageSrc: ConcertImage, duration: "01:18:24", viewCount: "436" },
];

const SCHEDULED_ITEMS = ["scheduled-1", "scheduled-2"];

export function FanLiveHomePage() {
  const navigate = useNavigate();
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(() => new Set());

  const toggleNotification = (id: string) => {
    setNotifiedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <header className="flex h-12 items-center justify-center bg-neutral-0">
        <h1 className="m-0 font-body text-label2 text-neutral-900">라이브</h1>
      </header>

      <div className="fan-live-home-scroll h-[calc(100%_-_48px)] overflow-y-auto px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
        <section className="pt-5">
          <FanLiveSectionHeader
            title="진행 중인 라이브"
            onMoreClick={() => navigate("/fan/live/now")}
          />
          <div className="mt-3 flex flex-col items-center gap-3">
            {LIVE_ITEMS.map((id) => (
              <LiveNowCard
                key={id}
                imageSrc={BandImage}
                imageAlt="밴드 라이브 이미지"
                title="라이브 제목"
                bandName="밴드명"
                listenerCount="68명 청취 중"
                tone="pink"
                onClick={() => navigate("/fan/live/room")}
              />
            ))}
          </div>
        </section>

        <section className="mt-7">
          <FanLiveSectionHeader
            title="다시보기"
            onMoreClick={() => navigate("/fan/live/replays")}
          />
          <div className="fan-live-home-scroll -mr-5 mt-3 flex gap-3 overflow-x-auto pr-5 pb-1">
            {REPLAY_ITEMS.map((item) => (
              <ReplayPreviewCard
                key={item.id}
                imageSrc={item.imageSrc}
                title="라이브 제목"
                bandName="밴드명"
                viewCount={item.viewCount}
                duration={item.duration}
              />
            ))}
          </div>
        </section>

        <section className="mt-7">
          <FanLiveSectionHeader
            title="예정된 라이브"
            onMoreClick={() => navigate("/fan/live/scheduled")}
          />
          <div className="mt-3 flex flex-col items-center gap-3">
            {SCHEDULED_ITEMS.map((id) => {
              const isNotified = notifiedIds.has(id);

              return (
                <BandLiveCard
                  key={id}
                  imageSrc={BandImage}
                  imageAlt="예정된 밴드 라이브 이미지"
                  title="라이브 제목"
                  bandName="밴드명"
                  schedule="5.28. (화) 오후 8:00"
                  showNotificationButton
                  notificationLabel={isNotified ? "알림 받는 중" : "알림 받기"}
                  notificationVariant={isNotified ? "soft" : "outline"}
                  notificationContentSize={isNotified ? "compact" : "default"}
                  tone="pink"
                  onNotificationClick={() => toggleNotification(id)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

export default FanLiveHomePage;
