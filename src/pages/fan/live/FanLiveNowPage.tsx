import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BandImage from "@/assets/Img_Band.png";
import LiveNowCard from "@/components/common/Card/LiveNowCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import "./FanLivePage.css";
import {
  FanLiveFilterTabs,
  FanLiveListHeader,
  type FanLiveFilter,
} from "./components/FanLiveHomeParts";

const LIVE_ITEMS = ["live-now-1", "live-now-2", "live-now-3"];

export function FanLiveNowPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<FanLiveFilter>("followed");
  const [searchQuery, setSearchQuery] = useState("");
  const isEmpty = searchParams.get("empty") === "true";
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleItems = LIVE_ITEMS.filter(() =>
    "라이브 제목 밴드명".toLocaleLowerCase().includes(normalizedQuery),
  );
  const hasNoResults = !isEmpty && visibleItems.length === 0;

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveListHeader
        title="진행 중인 라이브"
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
                {hasNoResults ? "검색 결과가 없어요" : "지금 진행 중인 라이브가 없어요"}
              </h2>
              <p className="m-0 font-body text-caption1 text-neutral-600">
                {hasNoResults ? (
                  "다른 검색어를 입력해 보세요"
                ) : (
                  <>
                    팔로우한 밴드가 라이브를 시작하면
                    <br />
                    알림을 보내드릴게요
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-6">
            {visibleItems.map((id) => (
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
        )}
      </section>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

export default FanLiveNowPage;
