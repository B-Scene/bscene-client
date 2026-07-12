import type { ReactNode } from "react";
import BandProfileImage from "@/assets/icons/band/band-default-profile.svg";

type FollowedNewsCardVariant = "gallery" | "video" | "image" | "text";

type FollowedNewsCardProps = {
  variant?: FollowedNewsCardVariant;
  bandName?: ReactNode;
  meta?: ReactNode;
  content?: ReactNode;
  tags?: string[];
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
  bandName = "밴드명",
  meta = "장르 · 지역 · 몇시간 전",
  content = (
    <>
      팬분들께 전하고 싶은 소식을 적어보세요
      <br />
      팬분들께 전하고 싶은 소식을 적어보세요
    </>
  ),
  tags = ["해시태그", "해시태그", "지역", "장르"],
}: FollowedNewsCardProps) => {
  return (
    <article className="box-border flex w-full flex-col rounded-[12px] bg-neutral-0 px-4 py-3 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]">
      <header className="flex items-center gap-[11px]">
        <img
          src={BandProfileImage}
          alt=""
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
            <Placeholder className="h-[92px] w-[156px]">
              <ImagePlaceholderIcon />
            </Placeholder>
            <Placeholder className="h-[92px] w-[156px]">
              <ImagePlaceholderIcon />
            </Placeholder>
          </div>
          <div className="mt-[6px] flex justify-center gap-[2px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={
                  index === 0
                    ? "size-[3px] rounded-full bg-primary-400"
                    : "size-[3px] rounded-full bg-neutral-400"
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      {variant === "video" ? (
        <Placeholder className="mx-auto mt-4 h-[92px] w-[164px]">
          <PlayPlaceholderIcon />
        </Placeholder>
      ) : null}

      {variant === "image" ? (
        <Placeholder className="mx-auto mt-4 h-[92px] w-[164px]">
          <ImagePlaceholderIcon />
        </Placeholder>
      ) : null}

      <p
        className={`m-0 font-body text-caption2 text-neutral-900 ${
          variant === "text" ? "mt-4" : "mt-2"
        }`}
      >
        {content}
      </p>

      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex h-[16px] min-w-[35px] items-center justify-center rounded-full bg-primary-50 px-[5px] font-body text-label4 text-primary-400"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
};
