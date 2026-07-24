import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { ExploreFilterBar } from "@/pages/fan/explore/FanExplorePage";
import { addRecentSearch } from "./recentSearches";

const CONCERT_RESULTS = [
  { id: "concert-more-1", showThumbnail: true },
  {
    id: "concert-more-2",
    month: "MAY",
    day: "17",
    dateBadgeClassName: "bg-primary-300",
  },
  { id: "concert-more-3", showThumbnail: true },
  { id: "concert-more-4", showThumbnail: true },
  { id: "concert-more-5", showThumbnail: true },
  { id: "concert-more-6", showThumbnail: true },
  {
    id: "concert-more-7",
    month: "MAY",
    day: "17",
    dateBadgeClassName: "bg-primary-300",
  },
];

const ConcertMoreTopBar = ({ initialKeyword }: { initialKeyword: string }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword);
  const hasKeyword = keyword.length > 0;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    navigate(
      `/fan/explore/search/results/concerts?q=${encodeURIComponent(
        trimmedKeyword,
      )}`,
      { replace: true },
    );
  };

  return (
    <header className="flex h-[48px] w-full max-w-[393px] items-center gap-[16px] bg-neutral-0 px-[15px]">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
        className="flex size-6 shrink-0 items-center justify-center"
      >
        <img src={ArrowLeftIcon} alt="" className="size-6" />
      </button>

      <form
        role="search"
        onSubmit={submitSearch}
        className="flex h-[36px] min-w-0 flex-1 items-center rounded-full border border-neutral-500 bg-neutral-0 px-[15px]"
      >
        <input
          type="text"
          aria-label="검색어"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent font-body text-caption3 text-neutral-900 outline-none"
        />
        {hasKeyword ? (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setKeyword("")}
            className="ml-[8px] flex size-4 shrink-0 items-center justify-center"
          >
            <img src={TimesCircleIcon} alt="" className="size-4" />
          </button>
        ) : null}
      </form>
    </header>
  );
};

const FanExploreConcertMorePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "WAVY";

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <ConcertMoreTopBar initialKeyword={keyword} />
      <ExploreFilterBar
        appliedFilters={{ genre: "전체", region: "전체", content: "공연" }}
        appliedSort="인기순"
      />

      <section className="px-[25px] pt-[16px]">
        <h1 className="m-0 flex items-center gap-[8px] font-body text-label1 text-neutral-900">
          공연
          <span className="font-body text-body5 text-neutral-600">
            총 {CONCERT_RESULTS.length}개
          </span>
        </h1>

        <div className="mt-[16px] flex flex-col gap-[12px]">
          {CONCERT_RESULTS.map((concert) => (
            <ConcertCard
              key={concert.id}
              showThumbnail={concert.showThumbnail}
              month={concert.month}
              day={concert.day}
              title={`${keyword} 단독 공연`}
              location="홍대 롤링홀"
              dateTime="2026.05.17. 18:00"
              status={<span className="text-primary-500">D-7</span>}
              dateBadgeClassName={concert.dateBadgeClassName}
              onClick={() => navigate(`/fan/home/concerts/${concert.id}`)}
              ariaLabel={`${keyword} 단독 공연 상세보기`}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default FanExploreConcertMorePage;
