import type { KeyboardEvent, MouseEventHandler, ReactNode } from 'react'
import arrowIcon from '../../../assets/Arrow.svg'
import locationIcon from '../../../assets/location.svg'
import { listCardClassName } from './shared'

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
  onClick?: MouseEventHandler<HTMLElement>
  ariaLabel?: string
}

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
  onClick,
  ariaLabel,
}: ConcertCardProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) {
      return
    }

    event.preventDefault()
    event.currentTarget.click()
  }

  return (
    <article
      aria-label={ariaLabel}
      className={`${listCardClassName}${onClick ? ' cursor-pointer' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="font-body flex h-[62px] w-[50px] shrink-0 flex-col items-center justify-center rounded-[8px] bg-primary-300 text-neutral-0">
        <span className="text-body1">{month}</span>
        <span className="text-brand mt-[4px]">{day}</span>
      </div>

      <div className="ml-[10px] min-w-0 flex-1">
        <h3 className="font-body text-body1 m-0 truncate text-neutral-900">
          {title}
        </h3>
        <p className="font-body text-caption2 m-0 mt-[3px] flex items-center gap-[4px] truncate text-neutral-700">
          {locationIconSrc ? (
            <img
              alt={locationIconAlt}
              className="h-[12px] w-[12px] shrink-0 object-contain"
              src={locationIconSrc}
            />
          ) : null}
          {location}
        </p>
        <p className="font-body text-body5 m-0 mt-[5px] truncate text-neutral-500">
          {dateTime}
          <span className="mx-[6px] text-neutral-500">|</span>
          <span className="text-primary-400">{dDay}</span>
        </p>
      </div>

      {arrowIconSrc ? (
        <img
          alt={arrowIconAlt}
          className="ml-[10px] h-[24px] w-[24px] shrink-0 object-contain"
          src={arrowIconSrc}
        />
      ) : (
        <span className="font-body text-h2 ml-[10px] shrink-0 text-neutral-600">
          ›
        </span>
      )}
    </article>
  )
}

export default ConcertCard
