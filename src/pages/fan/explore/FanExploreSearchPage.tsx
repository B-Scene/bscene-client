import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseIcon from "@/assets/icons/close.svg";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import SearchIcon from "@/assets/icons/band/search.svg";
import {
  useDeleteAllFanExploreRecentSearches,
  useDeleteFanExploreRecentSearch,
  useFanExploreRecentSearchesQuery,
} from "@/hooks/api/fan/useFanExplore";
import type { NormalizedFanExploreRecentSearch } from "@/types/fan/explore";
import {
  addRecentSearch,
  getRecentSearches,
  setRecentSearches,
} from "./recentSearches";

const FanExploreSearchPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [localRecentKeywords, setLocalRecentKeywords] = useState(() =>
    getRecentSearches(),
  );
  const [hiddenRecentKeywords, setHiddenRecentKeywords] = useState<string[]>([]);
  const recentSearchesQuery = useFanExploreRecentSearchesQuery();
  const deleteRecentSearchMutation = useDeleteFanExploreRecentSearch();
  const deleteAllRecentSearchesMutation =
    useDeleteAllFanExploreRecentSearches();
  const localRecentItems = useMemo(
    () =>
      localRecentKeywords.map((recentKeyword) => ({
        recentSearchId: null,
        keyword: recentKeyword,
      })),
    [localRecentKeywords],
  );
  const apiRecentItems = recentSearchesQuery.data?.items ?? [];
  const baseRecentItems = recentSearchesQuery.isError
    ? localRecentItems
    : recentSearchesQuery.data
      ? apiRecentItems
      : localRecentItems;
  const recentSearchItems = useMemo(
    () =>
      baseRecentItems.filter(
        ({ keyword: recentKeyword }) =>
          !hiddenRecentKeywords.includes(recentKeyword),
      ),
    [baseRecentItems, hiddenRecentKeywords],
  );
  const recentKeywords = useMemo(
    () => recentSearchItems.map(({ keyword }) => keyword),
    [recentSearchItems],
  );
  const isDeletingRecentSearch =
    deleteRecentSearchMutation.isPending ||
    deleteAllRecentSearchesMutation.isPending;
  const isSearchActive = keyword.length > 0;
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    setLocalRecentKeywords(addRecentSearch(trimmedKeyword));
    setHiddenRecentKeywords((keywords) =>
      keywords.filter((item) => item !== trimmedKeyword),
    );
    navigate(`/fan/explore/search/results?q=${encodeURIComponent(trimmedKeyword)}`);
  };

  const searchRecentKeyword = (recentKeyword: string) => {
    const trimmedKeyword = recentKeyword.trim();
    if (!trimmedKeyword) return;

    const nextKeywords = addRecentSearch(trimmedKeyword);

    setKeyword(trimmedKeyword);
    setLocalRecentKeywords(nextKeywords);
    setHiddenRecentKeywords((keywords) =>
      keywords.filter((item) => item !== trimmedKeyword),
    );
    navigate(`/fan/explore/search/results?q=${encodeURIComponent(trimmedKeyword)}`);
  };

  const updateRecentKeywords = (keywords: string[]) => {
    const hiddenKeywords = baseRecentItems
      .map(({ keyword: recentKeyword }) => recentKeyword)
      .filter((recentKeyword) => !keywords.includes(recentKeyword));

    setLocalRecentKeywords(keywords);
    setRecentSearches(keywords);
    setHiddenRecentKeywords((currentKeywords) =>
      Array.from(new Set([...currentKeywords, ...hiddenKeywords])),
    );
  };

  const removeAllRecentSearches = async () => {
    await deleteAllRecentSearchesMutation.mutateAsync();
    updateRecentKeywords([]);
  };

  const removeRecentSearch = async ({
    recentSearchId,
    keyword: recentKeyword,
  }: NormalizedFanExploreRecentSearch) => {
    const nextKeywords = recentKeywords.filter((item) => item !== recentKeyword);

    if (recentSearchId != null) {
      await deleteRecentSearchMutation.mutateAsync(recentSearchId);
    }

    setHiddenRecentKeywords((currentKeywords) =>
      Array.from(new Set([...currentKeywords, recentKeyword])),
    );
    setLocalRecentKeywords(nextKeywords);
    setRecentSearches(nextKeywords);
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
                disabled={isDeletingRecentSearch}
                onClick={() => void removeAllRecentSearches()}
                className="font-body text-body5 text-neutral-600"
              >
                전체 삭제
              </button>
            ) : null}
          </div>

          {recentSearchItems.length > 0 ? (
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              {recentSearchItems.map((recentSearch) => (
                <div
                  key={`${recentSearch.recentSearchId ?? "local"}-${recentSearch.keyword}`}
                  className="flex h-[26px] items-center gap-[8px] rounded-full border border-neutral-400 bg-neutral-0 px-[6px] py-[7px] font-body text-caption3 text-neutral-600"
                >
                  <button
                    type="button"
                    onClick={() => searchRecentKeyword(recentSearch.keyword)}
                    className="min-w-0 max-w-[120px] truncate"
                  >
                    {recentSearch.keyword}
                  </button>
                  <button
                    type="button"
                    aria-label={`${recentSearch.keyword} 삭제`}
                    disabled={isDeletingRecentSearch}
                    onClick={() => void removeRecentSearch(recentSearch)}
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
