import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import {
  NotificationToggleList,
  type NotificationToggleItem,
} from "@/components/band/my/NotificationToggleList";

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

const ConcertAlertSettingsPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, boolean>>({
    "new-concert": true,
    "concert-reminder": true,
    "concert-info-change": true,
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
          공연 알림 설정
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <div className="mt-4 rounded-xl border border-primary-300 bg-primary-0 p-3 text-center">
        <p className="m-0 text-caption2 leading-5 text-neutral-600">
          별도의 알림 상세 모달 없이 목록 우측 토글로 켜고 끕니다
        </p>
      </div>

      <div className="mt-6">
        <NotificationToggleList
          items={CONCERT_ALERT_ITEMS}
          values={values}
          onToggle={toggle}
          tone="primary"
        />
      </div>
    </main>
  );
};

export default ConcertAlertSettingsPage;
