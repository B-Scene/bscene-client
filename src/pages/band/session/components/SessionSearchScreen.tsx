import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import CloseCircleIcon from "@/assets/icons/band/close-circle.svg";
import SearchContextIcon from "@/assets/icons/band/searchContext.svg";
import {
  useAddSessionRecruitmentInterest,
  useDeleteSessionSearchHistory,
  useRemoveSessionRecruitmentInterest,
  useSessionRecruitmentsQuery,
  useSessionSearchHistoryQuery,
} from "@/hooks/api/session/useSessionRecruitment";
import { useSessionApplicationsSearchInfiniteQuery } from "@/hooks/api/session/useSessionApplication";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import type {
  SessionRecruitmentListItem,
  SessionRecruitmentSort,
} from "@/types/session/sessionRecruitment";
import type { SessionApplicationSearchItem } from "@/types/session/sessionApplication";
import type { SessionFilterValues, SessionRecruitmentPost } from "../types";

import { RecruitmentPostCard } from "./RecruitmentPostCard";
import {
  SessionCandidateCard,
  type SessionCandidateCardData,
} from "./SessionCandidateCard";
import { SessionApplicationDetailScreen } from "./SessionApplicationDetailScreen";
import { SessionFilterBar } from "./SessionFilterBar";
import { SessionFilterBottomSheet } from "./SessionFilterBottomSheet";

interface SessionSearchScreenProps {
  mode?: "recruitment" | "find";
  values: SessionFilterValues;
  onBack: () => void;
  onApplyFilters: (values: SessionFilterValues) => void;
  onSelectRecruitment?: (post: SessionRecruitmentPost) => void;
}

interface SearchHistoryItem {
  keywordId: number;
  keyword: string;
}

const RECENT_KEYWORD_LIMIT = 10;
const SESSION_FIND_SEARCH_PAGE_SIZE = 8;

const toDeadlineLabel = (dDay: number) => {
  if (dDay < 0) return "마감";
  if (dDay === 0) return "오늘 마감";

  return `D-${dDay}`;
};

const normalizeKeyword = (value: string) => value.trim();

const normalizeSessionEnumValue = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue.toLowerCase() === "etc.") {
    return "etc";
  }

  return trimmedValue;
};

const getFilterParam = (value: string) => {
  return value === "전체" ? undefined : normalizeSessionEnumValue(value);
};

const normalizePost = (post: SessionRecruitmentPost): SessionRecruitmentPost => {
  return {
    ...post,
    genre: normalizeSessionEnumValue(post.genre),
    location: normalizeSessionEnumValue(post.location),
    tags: post.tags.map(normalizeSessionEnumValue),
  };
};

const mapRecruitmentToPost = (
  recruitment: SessionRecruitmentListItem,
): SessionRecruitmentPost => {
  return {
    id: recruitment.sessionRecruitmentId,
    isMine: recruitment.isMine ?? false,
    deadline: toDeadlineLabel(recruitment.dDay),
    title: recruitment.recruitmentTitle,
    bandName: recruitment.bandName,
    genre: normalizeSessionEnumValue(recruitment.bandGenre),
    location: normalizeSessionEnumValue(recruitment.bandRegion),
    description: recruitment.summary,
    tags: [recruitment.part, recruitment.skillLevel]
      .filter(Boolean)
      .map(normalizeSessionEnumValue),
    bookmarked: recruitment.isInterested,
  };
};

const mapApplicationToCandidate = (
  application: SessionApplicationSearchItem,
): SessionCandidateCardData => {
  return {
    id: application.sessionApplicationId,
    name: application.nickname,
    profileImageUrl: application.profileImageUrl,
    skill: normalizeSessionEnumValue(application.skillLevel),
    part: normalizeSessionEnumValue(application.part),
    genre: normalizeSessionEnumValue(application.genre),
    location: normalizeSessionEnumValue(application.region),
    applicationTitle: application.title,
    summary: application.oneLineIntro,
  };
};

export const SessionSearchScreen = ({
  mode = "recruitment",
  values,
  onBack,
  onApplyFilters,
  onSelectRecruitment,
}: SessionSearchScreenProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSyncedHistoryKeywordRef = useRef("");

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState<SessionRecruitmentSort>("LATEST");
  const [bookmarkOverrides, setBookmarkOverrides] = useState<
    Record<number, boolean>
  >({});
  const [optimisticRecentKeywords, setOptimisticRecentKeywords] = useState<
    SearchHistoryItem[]
  >([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);

  const searchHistoryQuery = useSessionSearchHistoryQuery();
  const deleteSearchHistoryMutation = useDeleteSessionSearchHistory();
  const addInterestMutation = useAddSessionRecruitmentInterest();
  const removeInterestMutation = useRemoveSessionRecruitmentInterest();

  const trimmedKeyword = normalizeKeyword(keyword);
  const isSearching = trimmedKeyword.length > 0;
  const isResultMode = submittedKeyword.length > 0;
  const isFindMode = mode === "find";

  const normalizedValues = useMemo<SessionFilterValues>(() => {
    return {
      part: normalizeSessionEnumValue(values.part),
      skill: normalizeSessionEnumValue(values.skill),
      genre: normalizeSessionEnumValue(values.genre),
      region: normalizeSessionEnumValue(values.region),
    };
  }, [values]);

  const recruitmentSearchResultQuery = useSessionRecruitmentsQuery(
    {
      keyword: submittedKeyword,
      sort,
      size: 20,
    },
    isResultMode && !isFindMode,
  );

  const applicationSearchParams = useMemo(
    () => ({
      keyword: submittedKeyword,
      part: getFilterParam(normalizedValues.part),
      skillLevel: getFilterParam(normalizedValues.skill),
      genre: getFilterParam(normalizedValues.genre),
      region: getFilterParam(normalizedValues.region),
      size: SESSION_FIND_SEARCH_PAGE_SIZE,
    }),
    [
      normalizedValues.genre,
      normalizedValues.part,
      normalizedValues.region,
      normalizedValues.skill,
      submittedKeyword,
    ],
  );

  const applicationSearchResultQuery = useSessionApplicationsSearchInfiniteQuery(
    applicationSearchParams,
    isResultMode && isFindMode,
  );

  const addOptimisticRecentKeyword = useCallback((nextKeyword: string) => {
    const normalizedKeyword = normalizeKeyword(nextKeyword);

    if (!normalizedKeyword) {
      return;
    }

    setOptimisticRecentKeywords((currentKeywords) => {
      const filteredKeywords = currentKeywords.filter(
        (recentKeyword) =>
          normalizeKeyword(recentKeyword.keyword) !== normalizedKeyword,
      );

      return [
        {
          keywordId: -Date.now(),
          keyword: normalizedKeyword,
        },
        ...filteredKeywords,
      ].slice(0, RECENT_KEYWORD_LIMIT);
    });
  }, []);

  const recentKeywords = useMemo<SearchHistoryItem[]>(() => {
    const serverKeywords =
      (searchHistoryQuery.data ?? []) as SearchHistoryItem[];

    const seenKeywordSet = new Set<string>();
    const mergedKeywords: SearchHistoryItem[] = [];

    [...optimisticRecentKeywords, ...serverKeywords].forEach(
      (recentKeyword) => {
        const normalizedKeyword = normalizeKeyword(recentKeyword.keyword);

        if (!normalizedKeyword || seenKeywordSet.has(normalizedKeyword)) {
          return;
        }

        seenKeywordSet.add(normalizedKeyword);
        mergedKeywords.push(recentKeyword);
      },
    );

    return mergedKeywords.slice(0, RECENT_KEYWORD_LIMIT);
  }, [optimisticRecentKeywords, searchHistoryQuery.data]);

  const searchedPosts = useMemo(() => {
    const apiPosts =
      recruitmentSearchResultQuery.data?.content.map(mapRecruitmentToPost) ??
      [];

    return apiPosts
      .map((post) => ({
        ...post,
        bookmarked: bookmarkOverrides[post.id] ?? post.bookmarked,
      }))
      .filter((post) => {
        const normalizedPost = normalizePost(post);
        const normalizedTags = normalizedPost.tags;

        const matchesPart =
          normalizedValues.part === "전체" ||
          normalizedTags.includes(normalizedValues.part);

        const matchesSkill =
          normalizedValues.skill === "전체" ||
          normalizedTags.includes(normalizedValues.skill);

        const matchesGenre =
          normalizedValues.genre === "전체" ||
          normalizedPost.genre.includes(normalizedValues.genre);

        const matchesRegion =
          normalizedValues.region === "전체" ||
          normalizedPost.location.includes(normalizedValues.region);

        return matchesPart && matchesSkill && matchesGenre && matchesRegion;
      });
  }, [
    bookmarkOverrides,
    normalizedValues,
    recruitmentSearchResultQuery.data,
  ]);

  const searchedCandidates = useMemo(() => {
    const apiCandidates =
      applicationSearchResultQuery.data?.pages.flatMap((page) =>
        page.content.map(mapApplicationToCandidate),
      ) ?? [];

    return apiCandidates.filter((candidate) => {
      const matchesPart =
        normalizedValues.part === "전체" ||
        candidate.part.includes(normalizedValues.part);

      const matchesSkill =
        normalizedValues.skill === "전체" ||
        candidate.skill.includes(normalizedValues.skill);

      const matchesGenre =
        normalizedValues.genre === "전체" ||
        candidate.genre.includes(normalizedValues.genre);

      const matchesRegion =
        normalizedValues.region === "전체" ||
        candidate.location.includes(normalizedValues.region);

      return matchesPart && matchesSkill && matchesGenre && matchesRegion;
    });
  }, [applicationSearchResultQuery.data, normalizedValues]);

  const loadMoreCandidateResults = useCallback(() => {
    if (
      !applicationSearchResultQuery.hasNextPage ||
      applicationSearchResultQuery.isFetchingNextPage
    ) {
      return;
    }

    void applicationSearchResultQuery.fetchNextPage();
  }, [applicationSearchResultQuery]);

  const candidateLoadMoreRef = useInfiniteScrollObserver({
    enabled:
      isFindMode &&
      Boolean(applicationSearchResultQuery.hasNextPage) &&
      !applicationSearchResultQuery.isFetchingNextPage &&
      !applicationSearchResultQuery.isLoading &&
      !applicationSearchResultQuery.isError,
    onIntersect: loadMoreCandidateResults,
  });

  const isActiveSearchSuccess = isFindMode
    ? applicationSearchResultQuery.isSuccess
    : recruitmentSearchResultQuery.isSuccess;

  useEffect(() => {
    inputRef.current?.focus();
  }, [isResultMode]);

  useEffect(() => {
    const serverKeywordSet = new Set(
      ((searchHistoryQuery.data ?? []) as SearchHistoryItem[])
        .map((recentKeyword) => normalizeKeyword(recentKeyword.keyword))
        .filter(Boolean),
    );

    if (serverKeywordSet.size === 0) {
      return;
    }

    setOptimisticRecentKeywords((currentKeywords) =>
      currentKeywords.filter(
        (recentKeyword) =>
          !serverKeywordSet.has(normalizeKeyword(recentKeyword.keyword)),
      ),
    );
  }, [searchHistoryQuery.data]);

  useEffect(() => {
    if (!isResultMode || !submittedKeyword || !isActiveSearchSuccess) {
      return;
    }

    if (lastSyncedHistoryKeywordRef.current === submittedKeyword) {
      return;
    }

    lastSyncedHistoryKeywordRef.current = submittedKeyword;
    void searchHistoryQuery.refetch();
  }, [
    isActiveSearchSuccess,
    isResultMode,
    searchHistoryQuery,
    submittedKeyword,
  ]);

  const refetchActiveSearchResult = () => {
    if (isFindMode) {
      void applicationSearchResultQuery.refetch();
      return;
    }

    void recruitmentSearchResultQuery.refetch();
  };

  const handleSearchKeyword = () => {
    if (!trimmedKeyword) return;

    addOptimisticRecentKeyword(trimmedKeyword);

    if (trimmedKeyword === submittedKeyword) {
      refetchActiveSearchResult();
      void searchHistoryQuery.refetch();
      return;
    }

    setSubmittedKeyword(trimmedKeyword);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearchKeyword();
  };

  const handleClearKeyword = () => {
    setKeyword("");
    setSubmittedKeyword("");
    void searchHistoryQuery.refetch();

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleRemoveKeyword = (keywordId: number) => {
    setOptimisticRecentKeywords((currentKeywords) =>
      currentKeywords.filter(
        (recentKeyword) => recentKeyword.keywordId !== keywordId,
      ),
    );

    if (keywordId < 0) {
      return;
    }

    deleteSearchHistoryMutation.mutate(keywordId, {
      onSuccess: () => {
        void searchHistoryQuery.refetch();
      },
    });
  };

  const handleRecentKeywordClick = (recentKeyword: string) => {
    const normalizedKeyword = normalizeKeyword(recentKeyword);

    if (!normalizedKeyword) {
      return;
    }

    setKeyword(normalizedKeyword);
    setSubmittedKeyword(normalizedKeyword);
    addOptimisticRecentKeyword(normalizedKeyword);
  };

  const handleSelectPost = (post: SessionRecruitmentPost) => {
    onSelectRecruitment?.(normalizePost(post));
  };

  const handleToggleBookmark = (postId: number) => {
    const currentPost = searchedPosts.find((post) => post.id === postId);
    const currentBookmarked =
      bookmarkOverrides[postId] ?? currentPost?.bookmarked ?? false;
    const nextBookmarked = !currentBookmarked;

    setBookmarkOverrides((currentOverrides) => ({
      ...currentOverrides,
      [postId]: nextBookmarked,
    }));

    const mutation = nextBookmarked
      ? addInterestMutation
      : removeInterestMutation;

    mutation.mutate(postId, {
      onError: () => {
        setBookmarkOverrides((currentOverrides) => ({
          ...currentOverrides,
          [postId]: currentBookmarked,
        }));
      },
    });
  };

  if (selectedApplicationId) {
    return (
      <SessionApplicationDetailScreen
        sessionApplicationId={selectedApplicationId}
        onBack={() => setSelectedApplicationId(null)}
      />
    );
  }

  if (isResultMode) {
    return (
      <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
        <header className="flex h-12 w-full items-center gap-1 bg-neutral-0 px-[15px]">
          <BackButton onBack={onBack} />

          <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center">
            <SearchField
              ref={inputRef}
              keyword={keyword}
              isSearching={isSearching}
              ariaLabel={
                isFindMode ? "세션 지원서 검색" : "세션 모집 공고 검색"
              }
              onChange={setKeyword}
              onClear={handleClearKeyword}
              onSearch={handleSearchKeyword}
            />
          </form>
        </header>

        <SessionFilterBar
          values={normalizedValues}
          sort={sort}
          onSortChange={setSort}
          showSelectedValues={false}
          onOpenFilter={() => setIsFilterOpen(true)}
        />

        {isFindMode ? (
          <section className="flex flex-col gap-[18px] px-6 pt-[18px]">
            {applicationSearchResultQuery.isLoading ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
                세션 뮤지션 검색 결과를 불러오고 있어요
              </div>
            ) : applicationSearchResultQuery.isError ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center shadow-[0_0_8px_rgba(0,0,0,0.08)]">
                <p className="text-caption1 text-neutral-500">
                  세션 뮤지션 검색 결과를 불러오지 못했어요
                </p>

                <button
                  type="button"
                  onClick={() => void applicationSearchResultQuery.refetch()}
                  className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
                >
                  다시 시도
                </button>
              </div>
            ) : searchedCandidates.length > 0 ? (
              <>
                {searchedCandidates.map((candidate) => (
                  <SessionCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onSelect={setSelectedApplicationId}
                  />
                ))}

                <div ref={candidateLoadMoreRef} className="h-1" />

                {applicationSearchResultQuery.isFetchingNextPage ? (
                  <p className="py-3 text-center text-caption2 text-neutral-500">
                    세션 뮤지션을 더 불러오는 중이에요
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex min-h-[220px] items-center justify-center rounded-[12px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_8px_rgba(0,0,0,0.08)]">
                  검색 결과가 없어요
                </div>

                {applicationSearchResultQuery.hasNextPage ? (
                  <div ref={candidateLoadMoreRef} className="h-1" />
                ) : null}
              </>
            )}
          </section>
        ) : (
          <section className="flex flex-col gap-4 px-[22px] pt-4">
            {recruitmentSearchResultQuery.isLoading ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
                검색 결과를 불러오고 있어요
              </div>
            ) : recruitmentSearchResultQuery.isError ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center shadow-[0_0_12px_rgba(0,0,0,0.08)]">
                <p className="text-caption1 text-neutral-500">
                  검색 결과를 불러오지 못했어요
                </p>

                <button
                  type="button"
                  onClick={() => void recruitmentSearchResultQuery.refetch()}
                  className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
                >
                  다시 시도
                </button>
              </div>
            ) : searchedPosts.length > 0 ? (
              searchedPosts.map((post) => (
                <RecruitmentPostCard
                  key={post.id}
                  post={post}
                  onToggleBookmark={handleToggleBookmark}
                  onSelect={
                    onSelectRecruitment ? () => handleSelectPost(post) : undefined
                  }
                />
              ))
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
                검색 결과가 없어요
              </div>
            )}
          </section>
        )}

        {isFilterOpen ? (
          <SessionFilterBottomSheet
            values={normalizedValues}
            onApply={onApplyFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        ) : null}
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="flex h-12 w-full items-center bg-neutral-0 px-[15px]">
        <BackButton onBack={onBack} />
      </header>

      <form onSubmit={handleSubmit} className="flex h-12 w-full items-center px-[22px]">
        <SearchField
          ref={inputRef}
          keyword={keyword}
          isSearching={isSearching}
          ariaLabel={isFindMode ? "세션 지원서 검색" : "세션 모집 공고 검색"}
          onChange={setKeyword}
          onClear={handleClearKeyword}
          onSearch={handleSearchKeyword}
        />
      </form>

      <section className="mt-[26px] px-[38px]">
        <h2 className="text-body1 text-neutral-900">최근 검색어</h2>

        {searchHistoryQuery.isLoading ? (
          <p className="mt-4 text-caption2 text-neutral-600">
            최근 검색어를 불러오고 있어요
          </p>
        ) : searchHistoryQuery.isError ? (
          <p className="mt-4 text-caption2 text-neutral-600">
            최근 검색어를 불러오지 못했어요
          </p>
        ) : recentKeywords.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {recentKeywords.map((recentKeyword) => (
              <span
                key={`${recentKeyword.keywordId}-${recentKeyword.keyword}`}
                className="flex h-6 items-center gap-1 rounded-full border border-neutral-300 bg-neutral-0 px-2 text-caption2 text-neutral-600"
              >
                <button
                  type="button"
                  onClick={() => handleRecentKeywordClick(recentKeyword.keyword)}
                >
                  {recentKeyword.keyword}
                </button>

                <button
                  type="button"
                  aria-label={`${recentKeyword.keyword} 삭제`}
                  onClick={() => handleRemoveKeyword(recentKeyword.keywordId)}
                  className="text-neutral-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-caption2 text-neutral-600">
            최근 검색어가 없습니다
          </p>
        )}
      </section>
    </main>
  );
};

interface BackButtonProps {
  onBack: () => void;
}

const BackButton = ({ onBack }: BackButtonProps) => {
  return (
    <button
      type="button"
      aria-label="세션 화면으로 돌아가기"
      onClick={onBack}
      className="flex size-8 shrink-0 items-center justify-center"
    >
      <img src={ArrowLeftIcon} alt="" className="size-5" />
    </button>
  );
};

interface SearchFieldProps {
  keyword: string;
  isSearching: boolean;
  ariaLabel: string;
  onChange: (keyword: string) => void;
  onClear: () => void;
  onSearch: () => void;
}

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      keyword,
      isSearching,
      ariaLabel,
      onChange,
      onClear,
      onSearch,
    },
    ref,
  ) => {
    return (
      <div
        className={[
          "relative flex h-9 w-full items-center rounded-full bg-neutral-0",
          isSearching ? "border border-secondary-500 px-[14px]" : "",
        ].join(" ")}
      >
        {!isSearching ? (
          <img
            src={SearchContextIcon}
            alt=""
            className="pointer-events-none absolute inset-0 h-9 w-full"
          />
        ) : (
          <SearchLensIcon className="size-5 shrink-0 text-secondary-500" />
        )}

        <input
          ref={ref}
          type="text"
          role="searchbox"
          inputMode="search"
          aria-label={ariaLabel}
          value={keyword}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearch();
            }
          }}
          className={[
            "relative z-10 h-full min-w-0 flex-1 bg-transparent outline-none",
            isSearching
              ? "ml-2 text-caption2 text-neutral-900"
              : "pr-[22px] pl-[36px] text-transparent caret-neutral-900",
          ].join(" ")}
        />

        {isSearching ? (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={onClear}
            className="relative z-10 ml-2 flex size-4 shrink-0 items-center justify-center"
          >
            <img src={CloseCircleIcon} alt="" className="size-4" />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchField.displayName = "SearchField";

const SearchLensIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m13.5 13.5 3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};