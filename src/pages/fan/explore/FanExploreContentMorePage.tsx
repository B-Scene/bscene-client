import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import { Header } from "@/components/common/Header/Header";
import {
  useFanExploreContentSearchQuery,
  useFanExploreSearchQuery,
} from "@/hooks/api/fan/useFanExplore";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import {
  ExploreFilterBar,
  ExploreFilterSheet,
  type AppliedExploreFilters,
} from "@/pages/fan/explore/FanExplorePage";
import { FanExploreContentNewsList } from "@/pages/fan/explore/components/FanExploreContentNewsList";
import type { FanExploreContent, FanExploreSort } from "@/types/fan/explore";
import {
  BAND_GENRE_BY_LABEL,
  BAND_REGION_BY_LABEL,
} from "@/utils/bandLabels";
import { addRecentSearch } from "./recentSearches";

const SORT_LABELS: Record<FanExploreSort, "정확도순" | "인기순"> = {
  ACCURACY: "정확도순",
  POPULAR: "인기순",
  RECOMMEND: "정확도순",
};

const getSortParam = (value: string | null): FanExploreSort => {
  if (value === "POPULAR") return "POPULAR";
  return "ACCURACY";
};

const getFilterLabelParam = (value: string | null) => value || "전체";

const getGenreFilterParam = (genre: string) => {
  if (genre === "전체") return undefined;
  return BAND_GENRE_BY_LABEL[genre] ?? genre;
};

const getRegionFilterParam = (region: string) => {
  if (region === "전체") return undefined;
  return BAND_REGION_BY_LABEL[region] ?? region;
};

const getResultPathByContent = (content: string) => {
  if (content === "밴드") return "/fan/explore/search/results/bands";
  if (content === "공연") return "/fan/explore/search/results/concerts";
  if (content === "영상" || content === "콘텐츠") {
    return "/fan/explore/search/results/contents";
  }
  return "/fan/explore/search/results";
};

const getContentId = (content: FanExploreContent) =>
  content.contentId ?? content.postId ?? content.id;

const mergeContents = (
  primaryContents: FanExploreContent[],
  fallbackContents: FanExploreContent[],
) => {
  const seenIds = new Set<string>();

  return [...primaryContents, ...fallbackContents].filter((content, index) => {
    const key = String(getContentId(content) ?? `${content.content ?? ""}-${index}`);

    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });
};

const ContentMoreTopBar = ({ initialKeyword }: { initialKeyword: string }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword);
  const hasKeyword = keyword.length > 0;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    navigate(
      `/fan/explore/search/results/contents?q=${encodeURIComponent(
        trimmedKeyword,
      )}`,
      { replace: true },
    );
  };

  return (
    <>
      <Header title="" />

      <form
        role="search"
        onSubmit={submitSearch}
        className="mx-3.75 mt-2.5 flex h-9 items-center rounded-full border border-neutral-500 bg-neutral-0 px-3.75"
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
    </>
  );
};

const FanExploreContentMorePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "WAVY";
  const sort = getSortParam(searchParams.get("sort"));
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const shouldHighlightSort =
    sort === "POPULAR" || searchParams.get("sortSelected") === "1";
  const appliedFilters: AppliedExploreFilters = {
    genre: getFilterLabelParam(searchParams.get("genre")),
    region: getFilterLabelParam(searchParams.get("region")),
    content: "영상",
  };
  const contentsQuery = useFanExploreContentSearchQuery({
    keyword,
    sort,
    genre: getGenreFilterParam(appliedFilters.genre),
    region: getRegionFilterParam(appliedFilters.region),
    size: 30,
  });
  const allSearchQuery = useFanExploreSearchQuery({
    keyword,
    type: "ALL",
    sort,
    genre: getGenreFilterParam(appliedFilters.genre),
    region: getRegionFilterParam(appliedFilters.region),
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = contentsQuery;
  const pagedContents = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const contents = useMemo(
    () => mergeContents(pagedContents, allSearchQuery.data?.contents ?? []),
    [allSearchQuery.data?.contents, pagedContents],
  );
  const totalCount = contents.length;
  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });
  const isInitialLoading =
    isLoading && allSearchQuery.isLoading && contents.length === 0;
  const isContentError = isError && allSearchQuery.isError && contents.length === 0;

  const applyFilters = (filters: AppliedExploreFilters) => {
    const params = new URLSearchParams({
      q: keyword,
      sort,
    });

    if (shouldHighlightSort) params.set("sortSelected", "1");
    if (filters.genre !== "전체") params.set("genre", filters.genre);
    if (filters.region !== "전체") params.set("region", filters.region);

    navigate(`${getResultPathByContent(filters.content)}?${params.toString()}`, {
      replace: true,
    });
  };

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <ContentMoreTopBar initialKeyword={keyword} />
      <ExploreFilterBar
        appliedFilters={appliedFilters}
        appliedSort={SORT_LABELS[sort]}
        highlightSort={shouldHighlightSort}
        onFilterClick={() => setIsFilterSheetOpen(true)}
      />

      <section className="px-[25px] pt-[16px]">
        <h1 className="m-0 flex items-center gap-[8px] font-body text-label1 text-neutral-900">
          콘텐츠
          <span className="font-body text-body5 text-neutral-600">
            총 {totalCount}개
          </span>
        </h1>

        <FanExploreContentNewsList
          contents={contents}
          keyword={keyword}
          className="mt-[16px] flex flex-col gap-[12px]"
          isLoading={isInitialLoading}
          isError={isContentError}
          isFetchingNextPage={isFetchingNextPage}
          onRetry={() => {
            void contentsQuery.refetch();
            void allSearchQuery.refetch();
          }}
          loadMoreRef={sentinelRef}
        />
      </section>

      <ExploreFilterSheet
        open={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        appliedFilters={appliedFilters}
        contentSelectable
        onApply={applyFilters}
      />
    </main>
  );
};

export default FanExploreContentMorePage;
