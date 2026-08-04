import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowIcon from "@/assets/Arrow.svg";
import CheckActiveIcon from "@/assets/icons/check-active.svg";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import BandImage from "@/assets/Img_Band.png";
import BandCard from "@/components/common/Card/BandCard";
import ConcertCard from "@/components/common/Card/ConcertCard";
import { Header } from "@/components/common/Header/Header";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import Modal from "@/components/Modal/Modal";
import {
  useFanExploreSearchQuery,
  useFollowExploreBand,
  useUnfollowExploreBand,
} from "@/hooks/api/fan/useFanExplore";
import { useSlideUpSheet } from "@/hooks/useSlideUpSheet";
import { ExploreFilterBar } from "@/pages/fan/explore/FanExplorePage";
import { FanExploreContentNewsList } from "@/pages/fan/explore/components/FanExploreContentNewsList";
import type {
  FanExploreBand,
  FanExplorePerformance,
  FanExploreSort,
} from "@/types/fan/explore";
import { getGenreLabel, getRegionLabel } from "@/utils/bandLabels";
import { addRecentSearch } from "./recentSearches";

const SEARCH_RESULT_SORT_OPTIONS = ["정확도순", "인기순"] as const;
type SearchResultSortOption = (typeof SEARCH_RESULT_SORT_OPTIONS)[number];
type SearchResultSortState = {
  keyword: string;
  sort: SearchResultSortOption;
  selectedByUser: boolean;
};
const SEARCH_SORT_TO_API: Record<SearchResultSortOption, FanExploreSort> = {
  정확도순: "ACCURACY",
  인기순: "POPULAR",
};

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const toDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPerformanceDate = (performance: FanExplorePerformance) => {
  const dateValue =
    performance.startAt ??
    performance.startedAt ??
    performance.startDateTime ??
    performance.performanceDate ??
    performance.startDate;
  const timeValue =
    performance.performanceTime ?? performance.startTime ?? performance.time;

  if (dateValue && timeValue && !dateValue.includes("T")) {
    return toDate(`${dateValue}T${timeValue}`);
  }

  return toDate(dateValue);
};

const formatDateTime = (date: Date | null) => {
  if (!date) return "일정 미정";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day}. ${hour}:${minute}`;
};

const formatDday = (date: Date | null, status?: string | null) => {
  if (!date) return status ?? "준비중";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.ceil(
    (dateStart.getTime() - todayStart.getTime()) / 86_400_000,
  );

  if (diffDays < 0) return "종료";
  if (diffDays === 0) return "D-DAY";
  return `D-${diffDays}`;
};

const getBandInfo = (band: FanExploreBand) => band.band ?? band;

const getBandId = (band: FanExploreBand) => {
  const bandInfo = getBandInfo(band);

  return typeof bandInfo.bandId === "number"
    ? bandInfo.bandId
    : typeof bandInfo.id === "number"
      ? bandInfo.id
      : null;
};

const getPerformanceId = (performance: FanExplorePerformance) =>
  performance.performanceId ?? performance.concertId ?? performance.id;

const SectionTitle = ({
  title,
  count,
  showMore = false,
  onMoreClick,
}: {
  title: string;
  count: number;
  showMore?: boolean;
  onMoreClick?: () => void;
}) => {
  return (
    <div className="mb-[16px] flex items-center justify-between">
      <h2 className="m-0 flex items-center gap-[8px] font-body text-label1 text-neutral-900">
        {title}
        <span className="font-body text-body5 text-neutral-600">총 {count}개</span>
      </h2>

      {showMore ? (
        <button
          type="button"
          onClick={onMoreClick}
          className="flex translate-x-[8px] items-center gap-[2px] font-body text-body1 text-neutral-400"
        >
          더보기
          <img src={ArrowIcon} alt="" className="size-5 opacity-28" />
        </button>
      ) : null}
    </div>
  );
};

const SearchResultTopBar = ({ initialKeyword }: { initialKeyword: string }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword);
  const hasKeyword = keyword.length > 0;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    navigate(`/fan/explore/search/results?q=${encodeURIComponent(trimmedKeyword)}`, {
      replace: true,
    });
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

const SearchResultSortSheet = ({
  open,
  onClose,
  selectedSort,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedSort: SearchResultSortOption;
  onSelect: (sort: SearchResultSortOption) => void;
}) => {
  const { rendered, isVisible, handleTransitionEnd } = useSlideUpSheet(open);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="정렬 닫기"
        onClick={onClose}
        className={`absolute inset-0 bg-neutral-900/75 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="정렬"
        onTransitionEnd={handleTransitionEnd}
        className={[
          "relative z-10 flex w-[393px] max-w-full flex-col items-start gap-[10px] rounded-t-[20px] bg-neutral-0 px-[15px] pb-[48px] pt-[32px] transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        {SEARCH_RESULT_SORT_OPTIONS.map((option) => {
          const isSelected = selectedSort === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className={[
                "box-border flex h-6 w-full items-center justify-between px-3 font-body text-label2",
                isSelected ? "text-primary-400" : "text-neutral-900",
              ].join(" ")}
            >
              {option}
              <span className="flex h-5 w-5 items-center justify-center">
                {isSelected ? (
                  <img src={CheckActiveIcon} alt="" className="h-5 w-5" />
                ) : null}
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
};

const FanExploreSearchResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "WAVY";
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [sortState, setSortState] = useState<SearchResultSortState>(() => ({
    keyword,
    sort: "정확도순",
    selectedByUser: false,
  }));
  const appliedSort =
    sortState.keyword === keyword ? sortState.sort : "정확도순";
  const shouldHighlightSort =
    sortState.keyword === keyword && sortState.selectedByUser;
  const selectedSortQuery = shouldHighlightSort ? "&sortSelected=1" : "";
  const [unfollowTargetBandId, setUnfollowTargetBandId] = useState<number | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const searchQuery = useFanExploreSearchQuery({
    keyword,
    type: "ALL",
    sort: SEARCH_SORT_TO_API[appliedSort],
  });
  const followBandMutation = useFollowExploreBand();
  const unfollowBandMutation = useUnfollowExploreBand();
  const isFollowPending =
    followBandMutation.isPending || unfollowBandMutation.isPending;
  const bands = searchQuery.data?.bands ?? [];
  const performances = searchQuery.data?.performances ?? [];
  const contents = searchQuery.data?.contents ?? [];
  const unfollowTarget = bands.find((band) => getBandId(band) === unfollowTargetBandId);
  const visiblePerformances = performances.slice(0, 4);
  const visibleContents = contents.slice(0, 4);
  const resultCounts = {
    bands: bands.length,
    concerts: performances.length,
    contents: contents.length,
  };

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => setToastMessage(null), 2000);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

  const followBand = async (band: FanExploreBand) => {
    const bandId = getBandId(band);
    if (bandId == null || isFollowPending) return;

    const bandInfo = getBandInfo(band);
    const isFollowing =
      bandInfo.isFollowing ??
      bandInfo.following ??
      band.isFollowing ??
      band.following ??
      false;

    if (isFollowing) {
      setUnfollowTargetBandId(bandId);
      return;
    }

    const name = bandInfo.name ?? bandInfo.bandName ?? keyword;

    try {
      setToastMessage(`${name}를 팔로우했어요`);
      await followBandMutation.mutateAsync(bandId);
    } catch {
      setToastMessage("밴드 팔로우에 실패했어요");
    }
  };

  const confirmUnfollow = async () => {
    if (unfollowTargetBandId == null || isFollowPending) return;

    setUnfollowTargetBandId(null);

    try {
      await unfollowBandMutation.mutateAsync(unfollowTargetBandId);
      const bandInfo = unfollowTarget ? getBandInfo(unfollowTarget) : null;
      const name = bandInfo?.name ?? bandInfo?.bandName;
      setToastMessage(name ? `${name} 팔로우를 취소했어요` : "팔로우를 취소했어요");
    } catch {
      setToastMessage("팔로우 취소에 실패했어요");
    }
  };

  return (
    <main className="min-h-dvh bg-neutral-0 pb-[calc(var(--bottom-nav-height)+24px)]">
      <SearchResultTopBar key={keyword} initialKeyword={keyword} />
      <ExploreFilterBar
        appliedFilters={{ genre: "전체", region: "전체", content: "전체" }}
        appliedSort={appliedSort}
        highlightSort={shouldHighlightSort}
        onSortClick={() => setIsSortSheetOpen(true)}
      />

      <section className="px-[23px] pt-[16px]">
        <SectionTitle title="밴드" count={resultCounts.bands} />
        {searchQuery.isLoading ? (
          <p className="m-0 font-body text-caption2 text-neutral-600">
            검색 결과를 불러오는 중이에요
          </p>
        ) : searchQuery.isError ? (
          <button
            type="button"
            onClick={() => void searchQuery.refetch()}
            className="font-body text-caption2 text-primary-400"
          >
            검색 결과 다시 불러오기
          </button>
        ) : (
          bands.map((band) => {
            const bandInfo = getBandInfo(band);
            const bandId = getBandId(band);
            const name = bandInfo.name ?? bandInfo.bandName ?? keyword;
            const genre = bandInfo.genre ? getGenreLabel(bandInfo.genre) : "장르";
            const region = bandInfo.region
              ? getRegionLabel(bandInfo.region)
              : "지역";

            return (
              <BandCard
                key={String(bandInfo.bandId ?? bandInfo.id ?? name)}
                imageSrc={
                  bandInfo.profileImageUrl ??
                  bandInfo.bandProfileImageUrl ??
                  bandInfo.imageUrl ??
                  BandImage
                }
                imageAlt={`${name} 프로필`}
                title={name}
                subtitle={`${genre} · ${region}`}
                description={bandInfo.description ?? bandInfo.introduction ?? ""}
                following={
                  bandInfo.isFollowing ??
                  bandInfo.following ??
                  band.isFollowing ??
                  band.following ??
                  false
                }
                onClick={() => {
                  if (bandId == null) return;

                  navigate(`/fan/bands/${bandId}`, {
                    state: {
                      bandPreview: {
                        bandId,
                        name,
                        genre: bandInfo.genre,
                        region: bandInfo.region,
                        profileImageUrl:
                          bandInfo.profileImageUrl ??
                          bandInfo.bandProfileImageUrl ??
                          bandInfo.imageUrl ??
                          null,
                        description:
                          bandInfo.description ?? bandInfo.introduction ?? "",
                        followerCount:
                          bandInfo.followerCount ??
                          bandInfo.followers ??
                          band.followerCount ??
                          band.followers ??
                          0,
                        isFollowing:
                          bandInfo.isFollowing ??
                          bandInfo.following ??
                          band.isFollowing ??
                          band.following ??
                          false,
                      },
                    },
                  });
                }}
                onToggleFollow={() => void followBand(band)}
                className="!h-[86px] !w-[348px] !gap-[16px]"
                contentClassName="!h-auto flex-1 shrink !w-auto"
                descriptionClassName="line-clamp-2 text-primary-300"
                descriptionMultiline
              />
            );
          })
        )}
      </section>

      <div aria-hidden="true" className="mt-[16px] h-[16px] w-full max-w-[393px] bg-primary-0" />

      <section className="bg-neutral-0 px-[23px] py-[16px]">
        <SectionTitle
          title="공연"
          count={resultCounts.concerts}
          showMore
          onMoreClick={() =>
            navigate(
              `/fan/explore/search/results/concerts?q=${encodeURIComponent(
                keyword,
              )}&sort=${SEARCH_SORT_TO_API[appliedSort]}${selectedSortQuery}`,
            )
          }
        />
        <div className="flex flex-col gap-[12px]">
          {visiblePerformances.map((performance) => {
            const performanceId = getPerformanceId(performance);
            const date = getPerformanceDate(performance);
            const title =
              performance.performanceTitle ??
              performance.performanceName ??
              performance.concertTitle ??
              performance.concertName ??
              performance.title ??
              performance.name ??
              "공연명";
            const poster =
              performance.posterImageUrl ??
              performance.posterUrl ??
              performance.posterImage ??
              performance.performancePosterUrl ??
              performance.performanceImageUrl ??
              performance.imageUrl ??
              performance.thumbnailUrl;

            return (
              <ConcertCard
                key={String(performanceId ?? title)}
                showThumbnail={Boolean(poster)}
                thumbnailSrc={poster ?? undefined}
                month={date ? MONTH_LABELS[date.getMonth()] : "TBD"}
                day={date ? String(date.getDate()).padStart(2, "0") : "--"}
                title={title}
                location={
                  performance.location ??
                  performance.venue ??
                  performance.place ??
                  "공연 장소 미정"
                }
                dateTime={formatDateTime(date)}
                status={
                  <span className="text-primary-500">
                    {formatDday(date, performance.status)}
                  </span>
                }
                onClick={() => {
                  if (performanceId != null) {
                    navigate(`/fan/home/concerts/${performanceId}`);
                  }
                }}
                ariaLabel={`${title} 상세보기`}
              />
            );
          })}
        </div>
      </section>

      <div aria-hidden="true" className="h-[16px] w-full max-w-[393px] bg-primary-0" />

      <section className="px-[23px] py-[16px]">
        <SectionTitle
          title="콘텐츠"
          count={resultCounts.contents}
          showMore
          onMoreClick={() =>
            navigate(
              `/fan/explore/search/results/contents?q=${encodeURIComponent(
                keyword,
              )}&sort=${SEARCH_SORT_TO_API[appliedSort]}${selectedSortQuery}`,
            )
          }
        />
        <FanExploreContentNewsList
          contents={visibleContents}
          keyword={keyword}
          className="flex flex-col gap-[12px]"
        />
      </section>

      <SearchResultSortSheet
        open={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        selectedSort={appliedSort}
        onSelect={(nextSort) => {
          setSortState({ keyword, sort: nextSort, selectedByUser: true });
        }}
      />

      <ModalOverlay
        open={unfollowTargetBandId !== null}
        onClose={() => setUnfollowTargetBandId(null)}
      >
        <Modal
          title="팔로우를 취소할까요?"
          description={
            <>
              이 밴드의 소식이
              <br />
              홈피드에서 사라져요
            </>
          }
          cancelLabel="취소"
          confirmLabel="확인"
          onCancel={() => setUnfollowTargetBandId(null)}
          onConfirm={() => void confirmUnfollow()}
        />
      </ModalOverlay>

      <Toast
        open={toastMessage !== null}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        tone={toastMessage?.includes("실패") ? "error" : "success"}
      />
    </main>
  );
};

export default FanExploreSearchResultPage;
