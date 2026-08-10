import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TimesCircleIcon from "@/assets/icons/ic_Times Circle.svg";
import BandImage from "@/assets/icons/band/band-default-profile.svg";
import BandCard from "@/components/common/Card/BandCard";
import { Header } from "@/components/common/Header/Header";
import { ModalOverlay } from "@/components/common/Modal/ModalOverlay";
import { Toast } from "@/components/common/Toast/Toast";
import Modal from "@/components/Modal/Modal";
import {
  useFanExploreBandSearchQuery,
  useFanExploreSearchQuery,
  useFollowExploreBand,
  useUnfollowExploreBand,
} from "@/hooks/api/fan/useFanExplore";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";
import {
  ExploreFilterBar,
  ExploreFilterSheet,
  type AppliedExploreFilters,
} from "@/pages/fan/explore/FanExplorePage";
import type { FanExploreBand, FanExploreSort } from "@/types/fan/explore";
import {
  BAND_GENRE_BY_LABEL,
  BAND_REGION_BY_LABEL,
  getGenreLabel,
  getRegionLabel,
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

const getBandInfo = (band: FanExploreBand) => band.band ?? band;

const getBandId = (band: FanExploreBand) => {
  const bandInfo = getBandInfo(band);

  return typeof bandInfo.bandId === "number"
    ? bandInfo.bandId
    : typeof bandInfo.id === "number"
      ? bandInfo.id
      : null;
};

const mergeBands = (
  primaryBands: FanExploreBand[],
  fallbackBands: FanExploreBand[],
) => {
  const seenIds = new Set<string>();

  return [...primaryBands, ...fallbackBands].filter((band, index) => {
    const bandInfo = getBandInfo(band);
    const key = String(
      getBandId(band) ?? `${bandInfo.name ?? bandInfo.bandName ?? ""}-${index}`,
    );

    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });
};

const BandMoreTopBar = ({ initialKeyword }: { initialKeyword: string }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(initialKeyword);
  const hasKeyword = keyword.length > 0;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    navigate(
      `/fan/explore/search/results/bands?q=${encodeURIComponent(trimmedKeyword)}`,
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

const FanExploreBandMorePage = () => {
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
    content: "밴드",
  };
  const bandsQuery = useFanExploreBandSearchQuery({
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
  } = bandsQuery;
  const pagedBands = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const bands = useMemo(
    () => mergeBands(pagedBands, allSearchQuery.data?.bands ?? []),
    [allSearchQuery.data?.bands, pagedBands],
  );
  const totalCount = bands.length;
  const [unfollowTargetBandId, setUnfollowTargetBandId] = useState<number | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const followBandMutation = useFollowExploreBand();
  const unfollowBandMutation = useUnfollowExploreBand();
  const isFollowPending =
    followBandMutation.isPending || unfollowBandMutation.isPending;
  const unfollowTarget = bands.find((band) => getBandId(band) === unfollowTargetBandId);
  const sentinelRef = useInfiniteScrollObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: fetchNextPage,
  });
  const isInitialLoading =
    isLoading && allSearchQuery.isLoading && bands.length === 0;
  const isBandError = isError && allSearchQuery.isError && bands.length === 0;

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => setToastMessage(null), 2000);

    return () => window.clearTimeout(timerId);
  }, [toastMessage]);

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
      <BandMoreTopBar initialKeyword={keyword} />
      <ExploreFilterBar
        appliedFilters={appliedFilters}
        appliedSort={SORT_LABELS[sort]}
        highlightSort={shouldHighlightSort}
        onFilterClick={() => setIsFilterSheetOpen(true)}
      />

      <section className="px-[25px] pt-[16px]">
        <h1 className="m-0 flex items-center gap-[8px] font-body text-label1 text-neutral-900">
          밴드
          <span className="font-body text-body5 text-neutral-600">
            총 {totalCount}개
          </span>
        </h1>

        <div className="mt-[16px] flex flex-col gap-[12px]">
          {isInitialLoading ? (
            <p className="m-0 font-body text-caption2 text-neutral-600">
              밴드를 불러오는 중이에요
            </p>
          ) : isBandError ? (
            <button
              type="button"
              onClick={() => {
                void bandsQuery.refetch();
                void allSearchQuery.refetch();
              }}
              className="font-body text-caption2 text-primary-400"
            >
              밴드 다시 불러오기
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
                            bandInfo.followersCount ??
                            bandInfo.followerCnt ??
                            bandInfo.followCount ??
                            bandInfo.followers ??
                            band.followerCount ??
                            band.followersCount ??
                            band.followerCnt ??
                            band.followCount ??
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
                  className="!h-[86px] !w-full !gap-[16px]"
                  contentClassName="!h-auto flex-1 shrink !w-auto"
                  descriptionClassName="line-clamp-2 text-primary-300"
                  descriptionMultiline
                />
              );
            })
          )}
        </div>
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      </section>

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

export default FanExploreBandMorePage;
