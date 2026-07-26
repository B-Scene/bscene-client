import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import { FollowedNewsCard } from "@/components/fan/home/FollowedNewsCard";
import { useFollowingPostsInfiniteQuery } from "@/hooks/api/fan/useFanHome";
import type {
  FollowingPostItem,
  FollowingPostMediaType,
} from "@/types/fan/home";

type NewsCardVariant = "gallery" | "video" | "image" | "text";

const toDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatPostedAgo = (item: FollowingPostItem) => {
  if (typeof item.postedAgo === "number") {
    return `${item.postedAgo}시간 전`;
  }

  const createdAt = toDate(item.createdAt);
  if (!createdAt) return undefined;

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / 60_000),
  );

  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return `${Math.floor(diffHours / 24)}일 전`;
};

const firstImageUrl = (...values: Array<string | null | undefined>) => {
  return values.find((value): value is string => Boolean(value));
};

const normalizeUrls = (value?: string[] | string | null) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value) return [value];
  return [];
};

const getMediaUrls = (item: FollowingPostItem) => {
  return [
    ...normalizeUrls(item.mediaUrl),
    ...normalizeUrls(item.mediaUrls),
    ...normalizeUrls(item.imageUrls),
    ...normalizeUrls(item.images),
    ...normalizeUrls(item.imageUrl),
    ...normalizeUrls(item.contentImageUrl),
    ...normalizeUrls(item.mainImageUrl),
    ...normalizeUrls(item.thumbnailUrl),
    ...normalizeUrls(item.thumbnailImageUrl),
  ];
};

const getProfileImageUrl = (item: FollowingPostItem) => {
  return firstImageUrl(
    item.bandProfileImageUrl,
    item.bandImageUrl,
    item.bandProfileUrl,
    item.bandLogoUrl,
    item.profileImageUrl,
    item.avatarUrl,
    item.logoUrl,
  );
};

const isVideoPost = (mediaType?: FollowingPostMediaType | null) => {
  return String(mediaType ?? "").toUpperCase() === "VIDEO";
};

const getVariant = (item: FollowingPostItem): NewsCardVariant => {
  if (isVideoPost(item.mediaType) || item.videoThumbnailUrl) return "video";

  const mediaUrls = getMediaUrls(item);
  if (mediaUrls.length > 1) return "gallery";
  if (mediaUrls.length === 1) return "image";
  return "text";
};

const FollowedBandNewsPage = () => {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const followingPostsQuery = useFollowingPostsInfiniteQuery(10);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = followingPostsQuery;
  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (
        entry?.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        void fetchNextPage();
      }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  return (
    <main className="min-h-dvh bg-neutral-0 px-5 pb-[calc(var(--bottom-nav-height)+24px)]">
      <header className="-mx-5 flex h-[60px] items-center justify-between px-[15px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center justify-center"
        >
          <img src={ArrowLeftIcon} alt="" className="size-6" />
        </button>

        <h1 className="m-0 font-body text-label2 text-neutral-900">
          팔로우한 밴드 소식
        </h1>

        <span aria-hidden="true" className="size-6" />
      </header>

      <section className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <p className="m-0 font-body text-body3 text-neutral-600">
            소식을 불러오는 중이에요
          </p>
        ) : null}

        {isError ? (
          <div className="rounded-[12px] bg-neutral-50 px-4 py-6">
            <p className="m-0 font-body text-body3 text-neutral-700">
              소식을 불러오지 못했어요
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-[8px] bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {posts.map((item, index) => {
          const mediaUrls = getMediaUrls(item);
          const postedAgo = formatPostedAgo(item);
          const meta =
            [item.genre, item.region, postedAgo].filter(Boolean).join(" · ") ||
            "장르 · 지역";
          const id = String(item.postId ?? item.id ?? `post-${index}`);

          return (
            <FollowedNewsCard
              key={id}
              variant={getVariant(item)}
              profileImageSrc={getProfileImageUrl(item)}
              bandName={item.bandName ?? "밴드명"}
              meta={meta}
              content={item.content ?? item.title ?? "새로운 소식이 도착했어요"}
              mediaUrls={mediaUrls}
              videoThumbnailUrl={
                item.videoThumbnailUrl ??
                item.thumbnailUrl ??
                item.thumbnailImageUrl ??
                undefined
              }
              tags={item.tags ?? []}
            />
          );
        })}

        <div ref={loadMoreRef} className="h-4" />

        {isFetchingNextPage ? (
          <p className="m-0 text-center font-body text-caption2 text-neutral-600">
            더 불러오는 중이에요
          </p>
        ) : null}
      </section>
    </main>
  );
};

export default FollowedBandNewsPage;
