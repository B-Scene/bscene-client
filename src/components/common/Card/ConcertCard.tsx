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
};

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
}: ConcertCardProps) => {
  const isPending = status === "준비중";

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
      className={`box-border flex h-[86px] w-[348px] max-w-full items-center gap-16 rounded-xl bg-neutral-0 px-4 py-3 text-left shadow-[0_0_8px_0_rgba(0,0,0,0.10)]${onClick ? " cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex flex-1 items-center gap-4">
        <div
          className={`font-body flex shrink-0 flex-col items-center justify-center rounded-lg px-2 py-[7px] text-neutral-0 ${
            isPending ? "bg-neutral-300" : "bg-secondary-300"
          }`}
        >
          <span className="text-[16px] leading-[normal] font-medium text-[#FFFDFB]">
            {month}
          </span>
          <span className="text-[24px] leading-[normal] font-semibold text-[#FFFDFB] text-center">
            {day}
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-[5px]">
          <div className="flex flex-col gap-[3px]">
            <h3 className="font-body text-body1 m-0 truncate text-neutral-900">
              {title}
            </h3>
            <p className="font-body text-caption2 m-0 flex items-center gap-[4px] text-neutral-700">
              {locationIconSrc ? (
                <img
                  alt={locationIconAlt}
                  className="shrink-0 object-contain"
                  src={locationIconSrc}
                />
              ) : null}
              <span className="min-w-0 truncate">{location}</span>
            </p>
          </div>

          <p className="font-body text-body5 m-0 flex items-center gap-[6px] text-neutral-500">
            <span className="min-w-0 truncate">{dateTime}</span>
            <span className="shrink-0 text-neutral-400">|</span>
            <span className="shrink-0 text-secondary-500">{status}</span>
          </p>
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          {actions}
        </div>
      ) : arrowIconSrc ? (
        <img
          alt={arrowIconAlt}
          className="h-[24px] w-[24px] shrink-0 object-contain"
          src={arrowIconSrc}
        />
      ) : (
        <span className="font-body text-h2 shrink-0 text-neutral-600">›</span>
      )}
    </article>
  );
};

export default ConcertCard;
