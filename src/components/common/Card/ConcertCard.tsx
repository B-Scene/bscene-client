import type { KeyboardEvent, MouseEventHandler, ReactNode } from "react";
import arrowIcon from "@/assets/Arrow.svg";
import locationIcon from "@/assets/icons/band/ic_location.svg";

type ConcertCardProps = {
  month?: ReactNode;
  day?: ReactNode;
  title?: ReactNode;
  location?: ReactNode;
  locationIconSrc?: string;
  locationIconAlt?: string;
  dateTime?: ReactNode;
  status?: ReactNode;
  arrowIconSrc?: string;
  arrowIconAlt?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ariaLabel?: string;
  actions?: ReactNode;
  dateBadgeClassName?: string;
  isPending?: boolean;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  showThumbnail?: boolean;
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

const ConcertCard = ({
  month = "MAY",
  day = "17",
  title = "WAVY 단독 공연",
  location = "홍대 롤링홀",
  locationIconSrc = locationIcon,
  locationIconAlt = "",
  dateTime = "2026.05.17. 18:00",
  status = "등록 완료",
  arrowIconSrc = arrowIcon,
  arrowIconAlt = "",
  onClick,
  ariaLabel,
  actions,
  dateBadgeClassName = "bg-secondary-300",
  isPending = false,
  thumbnailSrc,
  thumbnailAlt = "",
  showThumbnail = false,
}: ConcertCardProps) => {
  const dateBadgeColorClassName = isPending
    ? "bg-neutral-300"
    : dateBadgeClassName;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      !onClick ||
      event.repeat ||
      (event.key !== "Enter" && event.key !== " ")
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <article
      aria-label={ariaLabel}
      className={`box-border flex h-[86px] w-full max-w-[348px] items-center justify-between gap-4 rounded-xl bg-neutral-0 px-4 py-3 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]${
        onClick ? " cursor-pointer" : ""
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {showThumbnail ? (
          <div className="flex h-[62px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-300 text-neutral-700">
            {thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt={thumbnailAlt}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlaceholderIcon />
            )}
          </div>
        ) : (
          <div
            className={`flex h-[62px] w-[50px] shrink-0 flex-col items-center justify-center rounded-lg ${dateBadgeColorClassName}`}
          >
            <span className="text-center text-[16px] leading-none font-medium text-[#FFFDFB]">
              {month}
            </span>

            <span className="mt-[4px] text-center text-[24px] leading-none font-semibold text-[#FFFDFB]">
              {day}
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-[5px]">
          <div className="flex flex-col gap-[3px]">
            <h3 className="font-body text-body1 m-0 truncate text-neutral-900">
              {title}
            </h3>

            <p className="font-body text-caption2 m-0 flex items-center gap-1 text-neutral-700">
              {locationIconSrc && (
                <img
                  src={locationIconSrc}
                  alt={locationIconAlt}
                  className="shrink-0"
                />
              )}

              <span className="truncate">{location}</span>
            </p>
          </div>

          <p className="font-body text-body5 m-0 flex items-center gap-1 text-neutral-500">
            <span className="truncate">{dateTime}</span>

            <span className="text-neutral-400">|</span>

            <span className="text-secondary-500">{status}</span>
          </p>
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center">{actions}</div>
      ) : arrowIconSrc ? (
        <img
          src={arrowIconSrc}
          alt={arrowIconAlt}
          className="h-6 w-6 shrink-0"
        />
      ) : (
        <span className="text-h2 shrink-0 text-neutral-600">›</span>
      )}
    </article>
  );
};

export default ConcertCard;
