import { Header } from "@/components/band/home/Header";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { useBandQuery } from "@/hooks/api/band/useBand";
import { useNotificationSettingToggle } from "@/hooks/useNotificationSettingToggle";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import {
  NotificationToggleList,
  type NotificationToggleItem,
} from "@/components/band/my/NotificationToggleList";
import type { NotificationSettingType } from "@/types/notification";

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

const DEFAULT_VALUES: Record<string, boolean> = {
  "new-applicant": true,
  "application-status": true,
  "recruit-deadline": false,
};

const SETTING_TYPE_BY_ID: Record<string, NotificationSettingType> = {
  "new-applicant": "BAND_NEW_SESSION_APPLICATION",
  "application-status": "BAND_SESSION_APPLICATION_STATUS",
  "recruit-deadline": "BAND_SESSION_RECRUITMENT_DEADLINE",
};

const RecruitAlertSettingsPage = () => {
  const activeBandId = useActiveBandId();
  const { data: band } = useBandQuery(activeBandId ?? NaN);
  const bandName = band?.name ?? "";
  const { values, isDisabled, statusMessage, toggle } =
    useNotificationSettingToggle({
      mode: "BAND",
      defaultValues: DEFAULT_VALUES,
      settingTypeById: SETTING_TYPE_BY_ID,
    });

  return (
    <main className="min-h-dvh bg-neutral-0 pb-24">
      <Header title="모집 공고 알림 설정" />

      <div className="px-6 pt-4">
        <NotificationBandBanner
          bandName={bandName}
          description="현재 선택된 밴드의 세션 모집 알림"
        />

        {statusMessage ? (
          <p className="m-0 mt-3 text-center font-body text-caption2 text-neutral-600">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-6">
          <NotificationToggleList
            items={RECRUIT_ALERT_ITEMS}
            values={values}
            onToggle={toggle}
            disabled={isDisabled}
          />
        </div>
      </div>
    </main>
  );
};

export default RecruitAlertSettingsPage;
