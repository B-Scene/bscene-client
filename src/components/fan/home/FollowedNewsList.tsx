import type { ReactNode, Ref } from "react";
import { FollowedNewsCard } from "@/components/fan/home/FollowedNewsCard";

type FollowedNewsListItemVariant = "gallery" | "video" | "image" | "text";

export type FollowedNewsListItem = {
  id: string;
  variant?: FollowedNewsListItemVariant;
  profileImageSrc?: string;
  bandName?: ReactNode;
  meta?: ReactNode;
  content?: ReactNode;
  mediaUrls?: string[];
  videoThumbnailUrl?: string;
  tags?: string[];
  onClick?: () => void;
  ariaLabel?: string;
};

type FollowedNewsListProps = {
  items: FollowedNewsListItem[];
  isLoading?: boolean;
  isError?: boolean;
  isFetchingNextPage?: boolean;
  onRetry?: () => void;
  loadMoreRef?: Ref<HTMLDivElement>;
  className?: string;
  loadingText?: string;
  errorText?: string;
  retryText?: string;
  fetchingText?: string;
};

export const FollowedNewsList = ({
  items,
  isLoading = false,
  isError = false,
  isFetchingNextPage = false,
  onRetry,
  loadMoreRef,
  className = "mt-6 flex flex-col gap-3",
  loadingText = "소식을 불러오는 중이에요",
  errorText = "소식을 불러오지 못했어요",
  retryText = "다시 시도",
  fetchingText = "더 불러오는 중이에요",
}: FollowedNewsListProps) => {
  return (
    <section className={className}>
      {isLoading ? (
        <p className="m-0 font-body text-body3 text-neutral-600">
          {loadingText}
        </p>
      ) : null}

      {isError ? (
        <div className="rounded-[12px] bg-neutral-50 px-4 py-6">
          <p className="m-0 font-body text-body3 text-neutral-700">
            {errorText}
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-[8px] bg-primary-400 px-4 py-2 font-body text-caption3 text-neutral-0"
            >
              {retryText}
            </button>
          ) : null}
        </div>
      ) : null}

      {items.map((item) => (
        <FollowedNewsCard
          key={item.id}
          variant={item.variant}
          profileImageSrc={item.profileImageSrc}
          bandName={item.bandName}
          meta={item.meta}
          content={item.content}
          mediaUrls={item.mediaUrls}
          videoThumbnailUrl={item.videoThumbnailUrl}
          tags={item.tags}
          onClick={item.onClick}
          ariaLabel={item.ariaLabel}
        />
      ))}

      {loadMoreRef ? (
        <div ref={loadMoreRef} aria-hidden="true" className="h-4" />
      ) : null}

      {isFetchingNextPage ? (
        <p className="m-0 text-center font-body text-caption2 text-neutral-600">
          {fetchingText}
        </p>
      ) : null}
    </section>
  );
};
