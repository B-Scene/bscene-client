import { useState } from "react";
import { Header } from "@/components/band/home/Header";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import {
  NotificationToggleList,
  type NotificationToggleItem,
} from "@/components/band/my/NotificationToggleList";

const LIVE_ALERT_ITEMS: NotificationToggleItem[] = [
  {
    id: "upcoming-live-reminder",
    title: "예정 라이브 리마인드",
    description: "등록한 라이브 시작 30분 전에 알려드려요",
  },
  {
    id: "live-start-status",
    title: "라이브 시작 상태 알림",
    description: "라이브 송출이 정상 시작되면 운영자에게 알려드려요",
  },
];

const LiveAlertSettingsPage = () => {
  const profile = useBandProfileStore((state) => state.profile);
  const bandName = profile.name.trim() || "WAVY";

  const [values, setValues] = useState<Record<string, boolean>>({
    "upcoming-live-reminder": true,
    "live-start-status": true,
  });

  const toggle = (id: string) =>
    setValues((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="min-h-dvh bg-neutral-0 pb-24">
      <Header title="라이브 알림 설정" />

      <div className="px-6 pt-4">
        <NotificationBandBanner
          bandName={bandName}
          description="현재 선택된 밴드의 라이브 운영 알림"
        />

        <div className="mt-6">
          <NotificationToggleList
            items={LIVE_ALERT_ITEMS}
            values={values}
            onToggle={toggle}
          />
        </div>
      </div>
    </main>
  );
};

export default LiveAlertSettingsPage;
