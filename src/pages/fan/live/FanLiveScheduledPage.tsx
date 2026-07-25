import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import BandLiveCard from "@/components/common/Card/BandLiveCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import "./FanLivePage.css";
import {
  FanLiveFilterTabs,
  FanLiveListHeader,
  type FanLiveFilter,
} from "./components/FanLiveHomeParts";

const FOLLOWED_ITEMS = ["scheduled-followed-1", "scheduled-followed-2"];
const ALL_ITEMS = ["scheduled-all-1", "scheduled-all-2", "scheduled-all-3"];

export function FanLiveScheduledPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<FanLiveFilter>("followed");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifiedIds, setNotifiedIds] = useState(
    () => new Set<string>(["scheduled-all-3"]),
  );
  const isEmpty = searchParams.get("empty") === "true";
  const items = filter === "followed" ? FOLLOWED_ITEMS : ALL_ITEMS;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleItems = items.filter(() =>
    "라이브 제목 밴드명".toLocaleLowerCase().includes(normalizedQuery),
  );
  const hasNoResults = !isEmpty && visibleItems.length === 0;

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
      <FanLiveListHeader
        title="예정된 라이브"
        onBack={() => navigate(-1)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <FanLiveFilterTabs value={filter} onChange={setFilter} />

      <section className="fan-live-home-scroll relative h-[calc(100%_-_176px)] overflow-y-auto px-5 pb-6">
        {isEmpty || hasNoResults ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex w-[219px] flex-col items-center gap-3 text-center">
              <h2 className="m-0 font-body text-label1 text-neutral-900">
                {hasNoResults ? "검색 결과가 없어요" : "예정된 라이브가 없어요"}
              </h2>
              <p className="m-0 font-body text-caption1 text-neutral-600">
                {hasNoResults ? (
                  "다른 검색어를 입력해 보세요"
                ) : (
                  <>
                    새로운 라이브 일정이 등록되면
                    <br />
                    알림을 보내드릴게요
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-6">
            {visibleItems.map((id) => {
              const isNotified = notifiedIds.has(id);
              return (
                <BandLiveCard
                  key={id}
                  imageSrc={BandImage}
                  imageAlt="예정된 밴드 라이브 이미지"
                  title="라이브 제목"
                  bandName="밴드명"
                  schedule="5.28. (화) 오후 8:00"
                  showNotificationButton={filter === "all"}
                  notificationLabel={isNotified ? "알림 받는 중" : "알림 받기"}
                  notificationVariant={isNotified ? "soft" : "outline"}
                  notificationContentSize={isNotified ? "compact" : "default"}
                  tone="pink"
                  onNotificationClick={() => toggleNotification(id)}
                />
              );
            })}
          </div>
        )}
      </section>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

export default FanLiveScheduledPage;
