import { Header } from "@/components/band/home/Header";
import { useActiveBandId } from "@/hooks/api/user/useMyProfiles";
import { useBandQuery } from "@/hooks/api/band/useBand";
import { NotificationBandBanner } from "@/components/band/my/NotificationBandBanner";
import {
  NotificationToggleList,
  type NotificationToggleItem,
} from "@/components/band/my/NotificationToggleList";
import { useNotificationSettingToggle } from "@/hooks/useNotificationSettingToggle";
import type { NotificationSettingType } from "@/types/notification";

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

const DEFAULT_VALUES: Record<string, boolean> = {
  "upcoming-live-reminder": true,
  "live-start-status": true,
};

const SETTING_TYPE_BY_ID: Record<string, NotificationSettingType> = {
  "upcoming-live-reminder": "BAND_SCHEDULED_LIVE_REMINDER",
  "live-start-status": "BAND_LIVE_START_STATUS",
};

const LiveAlertSettingsPage = () => {
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
      <Header title="라이브 알림 설정" />

      <div className="px-6 pt-4">
        <NotificationBandBanner
          bandName={bandName}
          description="현재 선택된 밴드의 라이브 운영 알림"
        />

        {statusMessage ? (
          <p className="m-0 mt-3 text-center font-body text-caption2 text-neutral-600">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-6">
          <NotificationToggleList
            items={LIVE_ALERT_ITEMS}
            values={values}
            onToggle={toggle}
            disabled={isDisabled}
          />
        </div>
      </div>
    </main>
  );
};

export default LiveAlertSettingsPage;
