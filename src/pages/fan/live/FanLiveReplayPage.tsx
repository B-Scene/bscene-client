import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PlayIcon from "@/assets/icons/band/play-button.svg";
import VideoCard from "@/components/common/Card/VideoCard";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import "./FanLivePage.css";
import {
  FanLiveFilterTabs,
  FanLiveListHeader,
  type FanLiveFilter,
} from "./components/FanLiveHomeParts";

type ReplaySort = "latest" | "popular";

const FOLLOWED_REPLAYS = ["replay-followed-1", "replay-followed-2"];
const ALL_REPLAYS = [
  "replay-all-1",
  "replay-all-2",
  "replay-all-3",
  "replay-all-4",
  "replay-all-5",
];

export function FanLiveReplayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<FanLiveFilter>("followed");
  const [sort, setSort] = useState<ReplaySort>("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const isEmpty = searchParams.get("empty") === "true";
  const items = filter === "followed" ? FOLLOWED_REPLAYS : ALL_REPLAYS;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const visibleItems = items.filter(() =>
    "라이브 제목명 밴드명".toLocaleLowerCase().includes(normalizedQuery),
  );
  const hasNoResults = !isEmpty && visibleItems.length === 0;

  return (
    <main className="relative h-full overflow-hidden bg-neutral-0 text-neutral-900">
      <FanLiveListHeader
        title="다시보기"
        onBack={() => navigate(-1)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <FanLiveFilterTabs value={filter} onChange={setFilter} />

      <div className="flex h-[calc(100%_-_176px)] flex-col">
        {isEmpty || hasNoResults ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex w-[219px] flex-col items-center gap-3 text-center">
              <h2 className="m-0 font-body text-label1 text-neutral-900">
                {hasNoResults ? "검색 결과가 없어요" : "저장된 다시보기가 없어요"}
              </h2>
              <p className="m-0 font-body text-caption1 text-neutral-600">
                {hasNoResults ? (
                  "다른 검색어를 입력해 보세요"
                ) : (
                  <>
                    라이브가 종료되면 밴드가
                    <br />
                    녹음본 저장 여부를 선택해요
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-14 shrink-0 items-center justify-between px-5">
              <p className="m-0 font-body text-caption2 text-neutral-700">
                라이브는 최대 72시간까지 보관됩니다
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSort("latest")}
                  className={`rounded-full px-[15px] py-1 font-body text-caption3 ${
                    sort === "latest"
                      ? "bg-primary-50 text-primary-400"
                      : "bg-neutral-300 text-neutral-600"
                  }`}
                >
                  최신순
                </button>
                <button
                  type="button"
                  onClick={() => setSort("popular")}
                  className={`rounded-full px-[15px] py-1 font-body text-caption2 ${
                    sort === "popular"
                      ? "bg-primary-50 text-primary-400"
                      : "bg-neutral-300 text-neutral-600"
                  }`}
                >
                  인기순
                </button>
              </div>
            </div>

            <section className="fan-live-home-scroll flex flex-1 flex-col items-center gap-3 overflow-y-auto px-5 pb-6">
              {visibleItems.map((id) => (
                <VideoCard
                  key={id}
                  title="라이브 제목명"
                  bandName="밴드명"
                  duration="00:00:00"
                  onClick={() => navigate(`/fan/live/replays/${id}`)}
                  ariaLabel="라이브 다시보기 열기"
                  timeAgo={
                    <span className="flex items-center gap-1">
                      <img src={PlayIcon} alt="" className="size-3 opacity-40" />
                      6,785
                    </span>
                  }
                />
              ))}
            </section>
          </>
        )}
      </div>

      <BottomNavBar modeOverride="fan" activeColorModeOverride="fan" />
    </main>
  );
}

export default FanLiveReplayPage;
