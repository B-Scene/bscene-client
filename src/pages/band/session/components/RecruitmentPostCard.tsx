import type { MouseEvent } from "react";

import type { SessionRecruitmentPost } from "../types";
import { StarIcon } from "./SessionIcons";

interface RecruitmentPostCardProps {
  post: SessionRecruitmentPost;
  onToggleBookmark: (postId: number) => void;
  onSelect?: (postId: number) => void;
}

const getPostedAgoLabel = (postedAgo?: number) => {
  if (typeof postedAgo !== "number" || !Number.isFinite(postedAgo)) {
    return "";
  }

  if (postedAgo <= 0) {
    return "오늘";
  }

  return `${postedAgo}일 전`;
};

export const RecruitmentPostCard = ({
  post,
  onToggleBookmark,
  onSelect,
}: RecruitmentPostCardProps) => {
  const postedAgoLabel = getPostedAgoLabel(post.postedAgo);

  const handleBookmarkClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleBookmark(post.id);
  };

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(post.id)}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(post.id);
        }
      }}
      className={[
        "relative min-h-[184px] w-full overflow-hidden rounded-[14px] bg-neutral-0 px-6 py-[18px] shadow-[0_0_12px_rgba(0,0,0,0.08)] outline-none",
        onSelect
          ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary-500"
          : "",
      ].join(" ")}
    >
      <span className="inline-flex h-[22px] items-center justify-center rounded-full bg-secondary-500 px-3 py-0.5 text-caption3 text-neutral-0">
        {post.deadline}
      </span>

      <button
        type="button"
        aria-label={post.bookmarked ? "북마크 해제" : "북마크"}
        aria-pressed={post.bookmarked}
        onClick={handleBookmarkClick}
        className="absolute top-[22px] right-7 flex size-7 items-center justify-center"
      >
        <StarIcon active={post.bookmarked} className="size-6" />
      </button>

      <h2 className="mt-3.5 text-label1 text-neutral-900">{post.title}</h2>

      <div className="mt-1 flex min-w-0 items-center gap-2 text-caption3 text-neutral-600">
        <p className="min-w-0 truncate">
          {post.bandName} · {post.genre} · {post.location}
        </p>

        {postedAgoLabel ? (
          <>
            <span className="h-4 w-px shrink-0 bg-neutral-300" />
            <span className="shrink-0 text-secondary-500">
              {postedAgoLabel}
            </span>
          </>
        ) : null}
      </div>

      <p className="mt-2 max-w-[300px] text-caption2 leading-[22px] text-neutral-800">
        {post.description}
      </p>

      <p className="mt-1 text-caption3 text-secondary-500">
        {post.tags.join(" · ")}
      </p>
    </article>
  );
};