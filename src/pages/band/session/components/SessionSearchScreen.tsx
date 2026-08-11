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
import { SessionFilterBar } from "./SessionFilterBar";
import { SessionFilterBottomSheet } from "./SessionFilterBottomSheet";
import {
  SessionCandidateCard,
  type SessionCandidateCardData,
} from "./SessionCandidateCard";
import { SessionApplicationDetailScreen } from "./SessionApplicationDetailScreen";

interface SessionSearchScreenProps {
  mode?: "recruitment" | "find";
  values: SessionFilterValues;
  onBack: () => void;
  onApplyFilters: (values: SessionFilterValues) => void;
  onSelectRecruitment?: (post: SessionRecruitmentPost) => void;
}

const SESSION_FIND_PAGE_SIZE = 20;

const toDeadlineLabel = (dDay: number) => {
  if (dDay < 0) return "마감";
  if (dDay === 0) return "오늘 마감";
  return `D-${dDay}`;
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
    genre: recruitment.bandGenre,
    location: recruitment.bandRegion,
    description: recruitment.summary,
    tags: [recruitment.part, recruitment.skillLevel].filter(Boolean),
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
    skill: application.skillLevel,
    part: application.part,
    genre: application.genre,
    location: application.region,
    applicationTitle: application.title,
    summary: application.oneLineIntro,
  };
};

const getFilterParam = (value: string) => {
  return value === "전체" ? undefined : value;
};

const includesKeyword = (target: string | undefined, keyword: string) => {
  if (!target) return false;

  return target.toLowerCase().includes(keyword.toLowerCase());
};

export const SessionSearchScreen = ({
  mode = "recruitment",
  values,
  onBack,
  onApplyFilters,
  onSelectRecruitment,
}: SessionSearchScreenProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState<SessionRecruitmentSort>("LATEST");
  const [bookmarkOverrides, setBookmarkOverrides] = useState<
    Record<number, boolean>
  >({});
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);

  const searchHistoryQuery = useSessionSearchHistoryQuery();
  const deleteSearchHistoryMutation = useDeleteSessionSearchHistory();
  const addInterestMutation = useAddSessionRecruitmentInterest();
  const removeInterestMutation = useRemoveSessionRecruitmentInterest();

  const trimmedKeyword = keyword.trim();
  const isSearching = trimmedKeyword.length > 0;
  const isResultMode = submittedKeyword.length > 0;

  const recruitmentSearchResultQuery = useSessionRecruitmentsQuery(
    {
      keyword: submittedKeyword,
      sort,
      size: 20,
    },
    mode === "recruitment" && isResultMode,
  );

  const applicationSearchParams = useMemo(
    () => ({
      part: getFilterParam(values.part),
      skillLevel: getFilterParam(values.skill),
      genre: getFilterParam(values.genre),
      region: getFilterParam(values.region),
      size: SESSION_FIND_PAGE_SIZE,
    }),
    [values.part, values.skill, values.genre, values.region],
  );

  const applicationSearchResultQuery = useSessionApplicationsSearchInfiniteQuery(
    applicationSearchParams,
  );

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
        const matchesPart =
          values.part === "전체" || post.tags.includes(values.part);

        const matchesSkill =
          values.skill === "전체" || post.tags.includes(values.skill);

        const matchesGenre =
          values.genre === "전체" || post.genre.includes(values.genre);

        const matchesRegion =
          values.region === "전체" || post.location.includes(values.region);

        return matchesPart && matchesSkill && matchesGenre && matchesRegion;
      });
  }, [bookmarkOverrides, recruitmentSearchResultQuery.data, values]);

  const searchedCandidates = useMemo(() => {
    const apiCandidates =
      applicationSearchResultQuery.data?.pages.flatMap((page) =>
        page.content.map(mapApplicationToCandidate),
      ) ?? [];

    return apiCandidates.filter((candidate) => {
      const matchesPart =
        values.part === "전체" || candidate.part.includes(values.part);

      const matchesSkill =
        values.skill === "전체" || candidate.skill.includes(values.skill);

      const matchesGenre =
        values.genre === "전체" || candidate.genre.includes(values.genre);

      const matchesRegion =
        values.region === "전체" || candidate.location.includes(values.region);

      const matchesKeyword =
        !submittedKeyword ||
        includesKeyword(candidate.name, submittedKeyword) ||
        includesKeyword(candidate.applicationTitle, submittedKeyword) ||
        includesKeyword(candidate.summary, submittedKeyword) ||
        includesKeyword(candidate.part, submittedKeyword) ||
        includesKeyword(candidate.skill, submittedKeyword) ||
        includesKeyword(candidate.genre, submittedKeyword) ||
        includesKeyword(candidate.location, submittedKeyword);

      return (
        matchesPart &&
        matchesSkill &&
        matchesGenre &&
        matchesRegion &&
        matchesKeyword
      );
    });
  }, [
    applicationSearchResultQuery.data,
    submittedKeyword,
    values.part,
    values.skill,
    values.genre,
    values.region,
  ]);

  const loadMoreCandidates = useCallback(() => {
    if (
      !applicationSearchResultQuery.hasNextPage ||
      applicationSearchResultQuery.isFetchingNextPage
    ) {
      return;
    }

    void applicationSearchResultQuery.fetchNextPage();
  }, [applicationSearchResultQuery]);

  const loadMoreCandidatesRef = useInfiniteScrollObserver({
    enabled:
      mode === "find" &&
      isResultMode &&
      Boolean(applicationSearchResultQuery.hasNextPage) &&
      !applicationSearchResultQuery.isFetchingNextPage &&
      !applicationSearchResultQuery.isLoading &&
      !applicationSearchResultQuery.isError,
    onIntersect: loadMoreCandidates,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [isResultMode]);

  const handleSearchKeyword = () => {
    if (!trimmedKeyword) return;

    setSubmittedKeyword(trimmedKeyword);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearchKeyword();
  };

  const handleClearKeyword = () => {
    setKeyword("");
    setSubmittedKeyword("");
    inputRef.current?.focus();
  };

  const handleRemoveKeyword = (keywordId: number) => {
    deleteSearchHistoryMutation.mutate(keywordId);
  };

  const handleRecentKeywordClick = (recentKeyword: string) => {
    setKeyword(recentKeyword);
    setSubmittedKeyword(recentKeyword);
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

          <form
            onSubmit={handleSubmit}
            className="flex min-w-0 flex-1 items-center"
          >
            <SearchField
              ref={inputRef}
              keyword={keyword}
              isSearching={isSearching}
              onChange={setKeyword}
              onClear={handleClearKeyword}
              onSearch={handleSearchKeyword}
            />
          </form>
        </header>

        <SessionFilterBar
          values={values}
          sort={sort}
          onSortChange={setSort}
          showSelectedValues={false}
          onOpenFilter={() => setIsFilterOpen(true)}
        />

        <section className="flex flex-col gap-4 px-[22px] pt-4">
          {mode === "recruitment" ? (
            recruitmentSearchResultQuery.isLoading ? (
              <SearchLoadingMessage />
            ) : recruitmentSearchResultQuery.isError ? (
              <SearchErrorMessage
                onRetry={() => recruitmentSearchResultQuery.refetch()}
              />
            ) : searchedPosts.length > 0 ? (
              searchedPosts.map((post) => (
                <RecruitmentPostCard
                  key={post.id}
                  post={post}
                  onToggleBookmark={handleToggleBookmark}
                  onSelect={() => {
                    onSelectRecruitment?.(post);
                  }}
                />
              ))
            ) : (
              <SearchEmptyMessage />
            )
          ) : applicationSearchResultQuery.isLoading ? (
            <SearchLoadingMessage message="세션 뮤지션을 불러오고 있어요" />
          ) : applicationSearchResultQuery.isError ? (
            <SearchErrorMessage
              message="세션 뮤지션을 불러오지 못했어요"
              onRetry={() => applicationSearchResultQuery.refetch()}
            />
          ) : searchedCandidates.length > 0 ? (
            <>
              {searchedCandidates.map((candidate) => (
                <SessionCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onSelect={setSelectedApplicationId}
                />
              ))}

              <div ref={loadMoreCandidatesRef} className="h-1" />

              {applicationSearchResultQuery.isFetchingNextPage ? (
                <p className="py-3 text-center text-caption2 text-neutral-500">
                  세션 뮤지션을 더 불러오는 중이에요
                </p>
              ) : null}
            </>
          ) : (
            <SearchEmptyMessage message="검색 결과가 없어요" />
          )}
        </section>

        {isFilterOpen ? (
          <SessionFilterBottomSheet
            values={values}
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

      <form
        onSubmit={handleSubmit}
        className="flex h-12 w-full items-center px-[22px]"
      >
        <SearchField
          ref={inputRef}
          keyword={keyword}
          isSearching={isSearching}
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
        ) : searchHistoryQuery.data && searchHistoryQuery.data.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchHistoryQuery.data.map((recentKeyword) => (
              <span
                key={recentKeyword.keywordId}
                className="flex h-6 items-center gap-1 rounded-full border border-neutral-300 bg-neutral-0 px-2 text-caption2 text-neutral-600"
              >
                <button
                  type="button"
                  onClick={() =>
                    handleRecentKeywordClick(recentKeyword.keyword)
                  }
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
  onChange: (keyword: string) => void;
  onClear: () => void;
  onSearch: () => void;
}

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ keyword, isSearching, onChange, onClear, onSearch }, ref) => {
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
          aria-label="파트, 장르, 지역 검색"
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
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
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

const SearchLoadingMessage = ({
  message = "검색 결과를 불러오고 있어요",
}: {
  message?: string;
}) => {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
      {message}
    </div>
  );
};

const SearchErrorMessage = ({
  message = "검색 결과를 불러오지 못했어요",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center shadow-[0_0_12px_rgba(0,0,0,0.08)]">
      <p className="text-caption1 text-neutral-500">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-[8px] bg-secondary-500 px-4 py-2 text-caption2 text-neutral-0"
      >
        다시 시도
      </button>
    </div>
  );
};

const SearchEmptyMessage = ({
  message = "검색 결과가 없어요",
}: {
  message?: string;
}) => {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[14px] bg-neutral-0 px-6 text-center text-caption1 text-neutral-500 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
      {message}
    </div>
  );
};