import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import {
  NotificationToggleList,
  type NotificationToggleItem,
} from "@/components/band/my/NotificationToggleList";

const LIVE_ALERT_ITEMS: NotificationToggleItem[] = [
  {
    id: "followed-band-live-start",
    title: "팔로우 밴드 라이브 시작 알림",
    description: "팔로우한 밴드가 라이브를 시작하면 알려드려요",
  },
  {
    id: "upcoming-live-reminder",
    title: "예정 라이브 리마인드",
    description: "알림 신청한 라이브 시작 30분 전에 알려드려요",
  },
  {
    id: "live-replay",
    title: "라이브 다시보기 등록 알림",
    description: "종료된 라이브의 다시보기가 등록되면 알려드려요",
  },
];

const LiveAlertSettingsPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, boolean>>({
    "followed-band-live-start": true,
    "upcoming-live-reminder": true,
    "live-replay": false,
  });

  const toggle = (id: string) =>
    setValues((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="-mx-5 flex h-15 items-center justify-between px-3.75">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">
          라이브 알림 설정
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <div className="mt-4 rounded-xl border border-primary-300 bg-primary-0 p-3 text-center">
        <p className="m-0 text-caption2 leading-5 text-neutral-600">
          팔로우한 밴드와 직접 알림을 신청한 예정 라이브를 기준으로
          <br />
          알림을 받습니다
        </p>
      </div>

      <div className="mt-6">
        <NotificationToggleList
          items={LIVE_ALERT_ITEMS}
          values={values}
          onToggle={toggle}
          tone="primary"
        />
      </div>
    </main>
  );
};

export default LiveAlertSettingsPage;
