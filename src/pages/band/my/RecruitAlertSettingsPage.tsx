import { useState } from "react";
import { Header } from "@/components/band/home/Header";
import { useBandProfileStore } from "@/stores/useBandProfileStore";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import {
  NotificationToggleList,
  type NotificationToggleItem,
} from "@/components/band/my/NotificationToggleList";

const RECRUIT_ALERT_ITEMS: NotificationToggleItem[] = [
  {
    id: "new-applicant",
    title: "새 지원자 알림",
    description: "모집 공고에 새로운 지원자가 생기면 알려드려요",
  },
  {
    id: "application-status",
    title: "지원서 상태 변경 알림",
    description: "다른 운영자가 지원자를 수락 · 거절하면 알려드려요",
  },
  {
    id: "recruit-deadline",
    title: "모집 마감 임박 알림",
    description: "모집 마감 24시간 전에 알려드려요",
  },
];

const RecruitAlertSettingsPage = () => {
  const profile = useBandProfileStore((state) => state.profile);
  const bandName = profile.name.trim() || "WAVY";

  const [values, setValues] = useState<Record<string, boolean>>({
    "new-applicant": true,
    "application-status": true,
    "recruit-deadline": false,
  });

  const toggle = (id: string) =>
    setValues((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="min-h-dvh bg-neutral-0 pb-24">
      <Header title="모집 공고 알림 설정" />

      <div className="px-6 pt-4">
        <NotificationBandBanner
          bandName={bandName}
          description="현재 선택된 밴드의 세션 모집 알림"
        />

        <div className="mt-6">
          <NotificationToggleList
            items={RECRUIT_ALERT_ITEMS}
            values={values}
            onToggle={toggle}
          />
        </div>
      </div>
    </main>
  );
};

export default RecruitAlertSettingsPage;
