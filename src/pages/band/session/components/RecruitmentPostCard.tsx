import type { MouseEvent } from "react";
import type { SessionRecruitmentPost } from "../types";
import { StarIcon } from "./SessionIcons";

interface RecruitmentPostCardProps {
  post: SessionRecruitmentPost;
  onToggleBookmark: (postId: number) => void;
  onSelect?: (postId: number) => void;
}

export const RecruitmentPostCard = ({
  post,
  onToggleBookmark,
  onSelect,
}: RecruitmentPostCardProps) => {
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
        "relative h-[172px] w-full overflow-hidden rounded-[14px] bg-neutral-0 px-6 pt-4 pb-3 shadow-[0_0_12px_rgba(0,0,0,0.08)] outline-none",
        onSelect ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary-500" : "",
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
      <p className="mt-1 text-caption3 text-neutral-600">
        {post.bandName} · {post.genre} · {post.location}
      </p>
      <p className="mt-2 max-w-[300px] text-caption2 text-neutral-800">{post.description}</p>
      <p className="mt-1 text-caption3 text-secondary-500">{post.tags.join(" · ")}</p>
    </article>
  );
};
