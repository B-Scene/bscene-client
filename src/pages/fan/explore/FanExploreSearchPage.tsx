import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseIcon from "@/assets/icons/close.svg";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import SearchIcon from "@/assets/icons/band/search.svg";
import {
  addRecentSearch,
  getRecentSearches,
  setRecentSearches,
} from "./recentSearches";

const FanExploreSearchPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [recentKeywords, setRecentKeywords] = useState(() => getRecentSearches());
  const isSearchActive = keyword.length > 0;
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    setRecentKeywords(addRecentSearch(trimmedKeyword));
    navigate(`/fan/explore/search/results?q=${encodeURIComponent(trimmedKeyword)}`);
  };

  const searchRecentKeyword = (recentKeyword: string) => {
    const trimmedKeyword = recentKeyword.trim();
    if (!trimmedKeyword) return;

    const nextKeywords = addRecentSearch(trimmedKeyword);

    setKeyword(trimmedKeyword);
    setRecentKeywords(nextKeywords);
    navigate(`/fan/explore/search/results?q=${encodeURIComponent(trimmedKeyword)}`);
  };

  const updateRecentKeywords = (keywords: string[]) => {
    setRecentKeywords(keywords);
    setRecentSearches(keywords);
  };

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="flex h-[48px] w-full max-w-[393px] items-center gap-[118px] bg-neutral-0 px-[15px] py-[5px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 shrink-0 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>
      </header>

      <div className="pl-[23px] pr-[22px]">
        <form
          role="search"
          onSubmit={submitSearch}
          className={[
            "mt-[6px] flex h-[36px] w-full items-center rounded-full border-[1px] bg-neutral-0 px-[15px]",
            isSearchActive
              ? "border-primary-400 shadow-[0_0_4px_0_rgba(240,69,121,0.50)]"
              : "border-neutral-500",
          ].join(" ")}
        >
          <img
            src={SearchIcon}
            alt=""
            className={[
              "size-[16px] shrink-0",
              isSearchActive
                ? "[filter:brightness(0)_saturate(100%)_invert(39%)_sepia(80%)_saturate(2432%)_hue-rotate(319deg)_brightness(96%)_contrast(96%)]"
                : "",
            ].join(" ")}
          />
          <input
            type="text"
            aria-label="검색어"
            placeholder="밴드명, 장르, 지역, 곡명 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="ml-[8px] min-w-0 flex-1 border-0 bg-transparent font-body text-caption3 text-neutral-900 outline-none placeholder:text-neutral-500"
          />
          {isSearchActive ? (
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

        <section className="mt-[16px] px-[18px]">
          <div className="flex items-center justify-between">
            <h1 className="m-0 font-body text-body1 text-neutral-900">
              최근 검색어
            </h1>
            {recentKeywords.length > 0 ? (
              <button
                type="button"
                onClick={() => updateRecentKeywords([])}
                className="font-body text-body5 text-neutral-600"
              >
                전체 삭제
              </button>
            ) : null}
          </div>

          {recentKeywords.length > 0 ? (
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              {recentKeywords.map((recentKeyword) => (
                <div
                  key={recentKeyword}
                  className="flex h-[26px] items-center gap-[8px] rounded-full border border-neutral-400 bg-neutral-0 px-[6px] py-[7px] font-body text-caption3 text-neutral-600"
                >
                  <button
                    type="button"
                    onClick={() => searchRecentKeyword(recentKeyword)}
                    className="min-w-0 max-w-[120px] truncate"
                  >
                    {recentKeyword}
                  </button>
                  <button
                    type="button"
                    aria-label={`${recentKeyword} 삭제`}
                    onClick={() =>
                      updateRecentKeywords(
                        recentKeywords.filter((item) => item !== recentKeyword),
                      )
                    }
                    className="flex size-[12px] shrink-0 items-center justify-center"
                  >
                    <img src={CloseIcon} alt="" className="size-[12px]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="m-0 mt-[8px] font-body text-caption2 text-neutral-600">
              최근 검색어가 없습니다
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default FanExploreSearchPage;
