import type { KeyboardEvent, ReactNode } from "react";
import BandProfileImage from "@/assets/icons/band/band-default-profile.svg";

type FollowedNewsCardVariant = "gallery" | "video" | "image" | "text";

type FollowedNewsCardProps = {
  variant?: FollowedNewsCardVariant;
  profileImageSrc?: string;
  profileImageAlt?: string;
  bandName?: ReactNode;
  meta?: ReactNode;
  content?: ReactNode;
  mediaUrls?: string[];
  videoThumbnailUrl?: string;
  tags?: string[];
  onClick?: () => void;
  ariaLabel?: string;
};

const ImagePlaceholderIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="5"
      width="16"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 16L10.5 12.5L13 15L14.5 13.5L18 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayPlaceholderIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="3" />
    <path d="M12 9.5L19 14L12 18.5V9.5Z" fill="currentColor" />
  </svg>
);

const Placeholder = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => (
  <div
    className={`flex shrink-0 items-center justify-center bg-neutral-300 text-neutral-700 ${className}`}
  >
    {children}
  </div>
);

export const FollowedNewsCard = ({
  variant = "text",
  profileImageSrc = BandProfileImage,
  profileImageAlt = "",
  bandName = "밴드명",
  meta = "장르 · 지역 · 몇시간 전",
  content = (
    <>
      팬분들께 전하고 싶은 소식을 적어보세요
      <br />
      팬분들께 전하고 싶은 소식을 적어보세요
    </>
  ),
  mediaUrls = [],
  videoThumbnailUrl,
  tags = ["해시태그", "해시태그", "지역", "장르"],
  onClick,
  ariaLabel,
}: FollowedNewsCardProps) => {
  const imageUrls = mediaUrls.slice(0, 2);
  const isInteractive = Boolean(onClick);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onClick();
  };

  return (
    <article
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className="box-border flex w-full flex-col rounded-[12px] bg-neutral-0 px-4 py-3 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]"
    >
      <header className="flex items-center gap-[11px]">
        <img
          src={profileImageSrc}
          alt={profileImageAlt}
          className="size-[36px] shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <h2 className="m-0 truncate font-body text-caption3 text-neutral-900">
            {bandName}
          </h2>
          <p className="m-0 truncate font-body text-caption2 text-neutral-700">
            {meta}
          </p>
        </div>
      </header>

      {variant === "gallery" ? (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-1">
            {imageUrls.length > 0
              ? imageUrls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-[92px] w-full rounded-[4px] object-cover"
                  />
                ))
              : Array.from({ length: 2 }).map((_, index) => (
                  <Placeholder key={index} className="h-[92px] w-full">
                    <ImagePlaceholderIcon />
                  </Placeholder>
                ))}
          </div>
          {mediaUrls.length > 1 ? (
            <div className="mt-[6px] flex justify-center gap-[2px]">
              {mediaUrls.map((url, index) => (
                <span
                  key={`${url}-${index}`}
                  className={
                    index === 0
                      ? "size-[3px] rounded-full bg-primary-400"
                      : "size-[3px] rounded-full bg-neutral-400"
                  }
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {variant === "video" ? (
        videoThumbnailUrl ? (
          <div className="relative mx-auto mt-4 h-[92px] w-[164px] overflow-hidden rounded-[4px]">
            <img
              src={videoThumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/20 text-neutral-0">
              <PlayPlaceholderIcon />
            </div>
          </div>
        ) : (
          <Placeholder className="mx-auto mt-4 h-[92px] w-[164px]">
            <PlayPlaceholderIcon />
          </Placeholder>
        )
      ) : null}

      {variant === "image" ? (
        mediaUrls[0] ? (
          <img
            src={mediaUrls[0]}
            alt=""
            className="mx-auto mt-4 h-[92px] w-[164px] rounded-[4px] object-cover"
          />
        ) : (
          <Placeholder className="mx-auto mt-4 h-[92px] w-[164px]">
            <ImagePlaceholderIcon />
          </Placeholder>
        )
      ) : null}

      <p
        className={`m-0 font-body text-caption2 text-neutral-900 ${
          variant === "text" ? "mt-4" : "mt-2"
        }`}
      >
        {content}
      </p>

      {tags.length > 0 ? (
        <div className="mt-3 flex max-h-[38px] max-w-full flex-wrap gap-1 overflow-hidden">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex h-[16px] min-w-[35px] max-w-full items-center justify-center truncate whitespace-nowrap rounded-full bg-primary-50 px-[5px] font-body text-label4 text-primary-400"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
};
