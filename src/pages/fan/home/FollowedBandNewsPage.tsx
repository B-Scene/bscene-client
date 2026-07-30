import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FollowedNewsList,
  type FollowedNewsListItem,
} from "@/components/fan/home/FollowedNewsList";
import { Header } from "@/components/common/Header/Header";
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
  const newsItems = useMemo<FollowedNewsListItem[]>(() => {
    return posts.map((item, index) => {
      const mediaUrls = getMediaUrls(item);
      const postedAgo = formatPostedAgo(item);
      const meta =
        [item.genre, item.region, postedAgo].filter(Boolean).join(" · ") ||
        "장르 · 지역";
      const postId = item.postId ?? item.id;
      const id = String(postId ?? `post-${index}`);

      return {
        id,
        variant: getVariant(item),
        profileImageSrc: getProfileImageUrl(item),
        bandName: item.bandName ?? "밴드명",
        meta,
        content: item.content ?? item.title ?? "새로운 소식이 도착했어요",
        mediaUrls,
        videoThumbnailUrl:
          item.videoThumbnailUrl ??
          item.thumbnailUrl ??
          item.thumbnailImageUrl ??
          undefined,
        tags: item.tags ?? [],
        onClick: () => {
          if (postId == null) return;

          navigate(
            `/fan/explore/contents/${postId}${
              item.createdAt
                ? `?createdAt=${encodeURIComponent(item.createdAt)}`
                : ""
            }`,
          );
        },
        ariaLabel: `${item.title ?? item.content ?? "게시물"} 상세보기`,
      };
    });
  }, [navigate, posts]);

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
      <Header title="팔로우한 밴드 소식" align="betweenCompact" className="-mx-5" />

      <FollowedNewsList
        items={newsItems}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        onRetry={() => void refetch()}
        loadMoreRef={loadMoreRef}
      />
    </main>
  );
};

export default FollowedBandNewsPage;
