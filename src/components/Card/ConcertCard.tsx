import type { ReactNode } from 'react'
import arrowIcon from '../../assets/Arrow.svg'
import locationIcon from '../../assets/location.svg'

type ConcertCardProps = {
  month?: ReactNode
  day?: ReactNode
  title?: ReactNode
  location?: ReactNode
  locationIconSrc?: string
  locationIconAlt?: string
  dateTime?: ReactNode
  dDay?: ReactNode
  arrowIconSrc?: string
  arrowIconAlt?: string
}

const cardClassName =
  'box-border flex h-[86px] w-[348px] max-w-full items-center rounded-[16px] bg-[var(--color-neutral-0)] px-[16px] py-[12px] text-left shadow-[0_4px_8px_color-mix(in_srgb,var(--color-neutral-900)_10%,transparent)]'

const ConcertCard = ({
  month = 'MAY',
  day = '17',
  title = 'WAVY 단독 공연',
  location = '홍대 롤링홀',
  locationIconSrc = locationIcon,
  locationIconAlt = '',
  dateTime = '2026.05.17. 18:00',
  dDay = 'D-7',
  arrowIconSrc = arrowIcon,
  arrowIconAlt = '',
}: ConcertCardProps) => {
  return (
    <article className={cardClassName}>
      <div className="font-body flex h-[62px] w-[50px] shrink-0 flex-col items-center justify-center rounded-[8px] bg-[var(--color-primary-300)] text-[var(--color-neutral-0)]">
        <span className="text-body1">{month}</span>
        <span className="text-brand mt-[4px]">{day}</span>
      </div>

      <div className="ml-[10px] min-w-0 flex-1">
        <h3 className="font-body text-body1 m-0 truncate text-[var(--color-neutral-900)]">
          {title}
        </h3>
        <p className="font-body text-caption2 m-0 mt-[3px] flex items-center gap-[4px] truncate text-[var(--color-neutral-700)]">
          {locationIconSrc ? (
            <img
              alt={locationIconAlt}
              className="h-[12px] w-[12px] shrink-0 object-contain"
              src={locationIconSrc}
            />
          ) : null}
          {location}
        </p>
        <p className="font-body text-body5 m-0 mt-[5px] truncate text-[var(--color-neutral-500)]">
          {dateTime}
          <span className="mx-[6px] text-[var(--color-neutral-500)]">|</span>
          <span className="text-[var(--color-primary-400)]">{dDay}</span>
        </p>
      </div>

      {arrowIconSrc ? (
        <img
          alt={arrowIconAlt}
          className="ml-[10px] h-[24px] w-[24px] shrink-0 object-contain"
          src={arrowIconSrc}
        />
      ) : (
        <span className="font-body text-h2 ml-[10px] shrink-0 text-[var(--color-neutral-600)]">
          ›
        </span>
      )}
    </article>
  )
}

export default ConcertCard
