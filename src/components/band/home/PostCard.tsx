import { useRef, useState, type ReactNode } from "react";
import DefaultBandAvatar from "@/assets/icons/band/band-default-profile.svg";
import PlayButtonIcon from "@/assets/icons/band/play-button.svg";

export interface PostMediaItem {
  type: "image" | "video";
  url: string;
}

interface PostCardProps {
  bandName: string;
  avatarUrl?: string;
  metaLabel: string;
  mediaItems?: PostMediaItem[];
  caption: string;
  onClick?: () => void;
  actions?: ReactNode;
}

const MEDIA_ITEM_WIDTH = 156;
const MEDIA_GAP = 8;
const ITEMS_PER_SLIDE = 2;
const SLIDE_WIDTH = ITEMS_PER_SLIDE * (MEDIA_ITEM_WIDTH + MEDIA_GAP);

export const PostCard = ({
  bandName,
  avatarUrl,
  metaLabel,
  mediaItems = [],
  caption,
  onClick,
  actions,
}: PostCardProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slideCount = Math.ceil(mediaItems.length / ITEMS_PER_SLIDE);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const slide = Math.round(el.scrollLeft / SLIDE_WIDTH);
    setActiveSlide(Math.min(Math.max(slide, 0), slideCount - 1));
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({
      left: index * SLIDE_WIDTH,
      behavior: "smooth",
    });
    setActiveSlide(index);
  };

  const header = (
    <>
      <img
        src={avatarUrl || DefaultBandAvatar}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-caption3 text-neutral-900">
          {bandName}
        </span>
        <span className="truncate text-caption2 text-neutral-700">
          {metaLabel}
        </span>
      </div>
    </>
  );

  const mediaCarousel = (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-none"
    >
      {mediaItems.map((item, index) => (
        <div
          key={index}
          className={`relative flex h-23 w-39 shrink-0 snap-start items-center justify-center overflow-hidden bg-neutral-300${
            mediaItems.length === 1 ? " mx-auto" : ""
          }`}
        >
          {item.type === "video" ? (
            <>
              <img
                src={item.url}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <img src={PlayButtonIcon} alt="" className="relative size-9" />
            </>
          ) : (
            <img src={item.url} alt="" className="size-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <article className="flex flex-col gap-4 rounded-xl bg-neutral-0 py-3 px-4 shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
      <div className="flex items-center justify-between gap-3">
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            {header}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {header}
          </div>
        )}

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        {mediaItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {onClick ? (
              <button
                type="button"
                onClick={onClick}
                className="block w-full text-left"
              >
                {mediaCarousel}
              </button>
            ) : (
              mediaCarousel
            )}

            {slideCount > 1 ? (
              <div className="flex justify-center gap-1">
                {Array.from({ length: slideCount }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${index + 1}번째 슬라이드로 이동`}
                    onClick={() => goToSlide(index)}
                    className={`size-0.75 rounded-full ${
                      index === activeSlide
                        ? "bg-secondary-500"
                        : "bg-neutral-300"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="block w-full text-left"
          >
            <p className="line-clamp-2 text-caption2 text-neutral-900">
              {caption}
            </p>
          </button>
        ) : (
          <p className="line-clamp-2 text-caption2 text-neutral-900">
            {caption}
          </p>
        )}
      </div>
    </article>
  );
};
