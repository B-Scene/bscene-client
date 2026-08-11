import { Header } from "@/components/common/Header/Header";
import {
  NotificationToggleList,
  type NotificationToggleItem,
} from "@/components/band/my/NotificationToggleList";
import { useNotificationSettingToggle } from "@/hooks/useNotificationSettingToggle";
import type { NotificationSettingType } from "@/types/notification";

const CONCERT_ALERT_ITEMS: NotificationToggleItem[] = [
  {
    id: "new-concert",
    title: "팔로우 밴드 새 공연 알림",
    description: "팔로우한 밴드가 공연을 등록하면 알려드려요",
  },
  {
    id: "concert-reminder",
    title: "참여 예정 공연 리마인드",
    description: "공연 시작 1시간 전에 알려드려요",
  },
  {
    id: "concert-info-change",
    title: "공연 정보 변경 알림",
    description: "일시 · 장소 · 티켓 정보가 바뀌면 알려드려요",
  },
];

const DEFAULT_VALUES: Record<string, boolean> = {
  "new-concert": true,
  "concert-reminder": true,
  "concert-info-change": true,
};

const SETTING_TYPE_BY_ID: Record<string, NotificationSettingType> = {
  "new-concert": "FAN_FOLLOWED_BAND_PERFORMANCE",
  "concert-reminder": "FAN_PERFORMANCE_REMINDER",
  "concert-info-change": "FAN_PERFORMANCE_UPDATE",
};

const ConcertAlertSettingsPage = () => {
  const { values, isDisabled, statusMessage, toggle } =
    useNotificationSettingToggle({
      mode: "FAN",
      defaultValues: DEFAULT_VALUES,
      settingTypeById: SETTING_TYPE_BY_ID,
    });

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <Header title="공연 알림 설정" />

      <div className="px-5">
        <div className="mt-4 rounded-xl border border-primary-300 bg-primary-0 p-3 text-center">
          <p className="m-0 text-caption2 leading-5 text-neutral-600">
            별도의 알림 상세 모달 없이 목록 우측 토글로 켜고 끕니다
          </p>
        </div>

        {statusMessage ? (
          <p className="m-0 mt-3 text-center font-body text-caption2 text-neutral-600">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-6">
          <NotificationToggleList
            items={CONCERT_ALERT_ITEMS}
            values={values}
            onToggle={toggle}
            tone="primary"
            disabled={isDisabled}
          />
        </div>
      </div>
    </main>
  );
};

export default ConcertAlertSettingsPage;
