import { useMemo, type Ref } from "react";
import { useNavigate } from "react-router-dom";
import {
  FollowedNewsList,
  type FollowedNewsListItem,
} from "@/components/fan/home/FollowedNewsList";
import type { FanExploreContent } from "@/types/fan/explore";
import { getGenreLabel, getRegionLabel } from "@/utils/bandLabels";

type FanExploreContentNewsListProps = {
  contents: FanExploreContent[];
  keyword: string;
  limit?: number;
  className?: string;
  isLoading?: boolean;
  isError?: boolean;
  isFetchingNextPage?: boolean;
  onRetry?: () => void;
  loadMoreRef?: Ref<HTMLDivElement>;
};

const toArray = (value?: string[] | string | null) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value) return [value];
  return [];
};

const getContentId = (content: FanExploreContent) =>
  content.contentId ?? content.postId ?? content.id;

const toDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatPostedAgo = (createdAt?: string | null) => {
  const createdDate = toDate(createdAt);
  if (!createdDate) return undefined;

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / 60_000),
  );

  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return `${Math.floor(diffHours / 24)}일 전`;
};

const getContentBody = (content: FanExploreContent) => {
  if (typeof content.content === "string") return content.content;

  return (
    content.contentText ??
    content.body ??
    content.text ??
    ""
  );
};

const getContentVariant = (content: FanExploreContent, mediaUrls: string[]) => {
  const mediaType = String(
    content.mediaType ?? content.contentType ?? content.type ?? "",
  ).toUpperCase();

  if (mediaType === "VIDEO") return "video";
  if (mediaUrls.length > 1) return "gallery";
  if (mediaUrls.length === 1) return "image";
  return "text";
};

export const FanExploreContentNewsList = ({
  contents,
  keyword,
  limit,
  className,
  isLoading = false,
  isError = false,
  isFetchingNextPage = false,
  onRetry,
  loadMoreRef,
}: FanExploreContentNewsListProps) => {
  const navigate = useNavigate();
  const items = useMemo<FollowedNewsListItem[]>(() => {
    const visibleContents = limit ? contents.slice(0, limit) : contents;

    return visibleContents.map((content) => {
      const contentId = getContentId(content);
      const createdAt = content.createdAt;
      const postedAgo = formatPostedAgo(createdAt);
      const mediaUrls = [
        ...toArray(content.mediaUrls),
        ...toArray(content.mediaUrl),
        ...toArray(content.imageUrls),
        ...toArray(content.images),
        ...toArray(content.imageUrl),
      ];

      return {
        id: String(contentId ?? getContentBody(content) ?? keyword),
        variant: getContentVariant(content, mediaUrls),
        profileImageSrc:
          content.profileImageUrl ?? content.bandProfileImageUrl ?? undefined,
        bandName: content.bandName ?? content.name ?? keyword,
        meta: [
          content.genre ? getGenreLabel(content.genre) : null,
          content.region ? getRegionLabel(content.region) : null,
          postedAgo,
        ]
          .filter(Boolean)
          .join(" · "),
        content: getContentBody(content),
        mediaUrls,
        videoThumbnailUrl:
          content.videoThumbnailUrl ?? content.thumbnailUrl ?? undefined,
        tags: Array.isArray(content.tags) ? content.tags : [],
        onClick: () => {
          if (contentId == null) return;

          navigate(
            `/fan/explore/contents/${contentId}?q=${encodeURIComponent(
              keyword,
            )}${
              createdAt ? `&createdAt=${encodeURIComponent(createdAt)}` : ""
            }`,
          );
        },
        ariaLabel: `${content.title || getContentBody(content) || "게시물"} 상세보기`,
      };
    });
  }, [contents, keyword, limit, navigate]);

  return (
    <FollowedNewsList
      items={items}
      className={className}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      onRetry={onRetry}
      loadMoreRef={loadMoreRef}
      loadingText="콘텐츠를 불러오는 중이에요"
      errorText="콘텐츠를 불러오지 못했어요"
      retryText="콘텐츠 다시 불러오기"
    />
  );
};
