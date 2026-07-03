import type { ReactNode } from 'react'
import headsetIcon from '../../../assets/Headset.svg'

type LiveNowCardProps = {
  imageSrc: string
  imageAlt?: string
  title?: ReactNode
  bandName?: ReactNode
  listenerCount?: ReactNode
  listenerIconSrc?: string
  listenerIconAlt?: string
  liveBadgeSrc?: string
  liveBadgeAlt?: string
}

const cardClassName =
  'box-border flex h-[86px] w-[348px] max-w-full items-center rounded-[16px] bg-[var(--color-neutral-0)] px-[16px] py-[12px] text-left shadow-[0_4px_8px_color-mix(in_srgb,var(--color-neutral-900)_10%,transparent)]'

const LiveNowCard = ({
  imageSrc,
  imageAlt = '',
  title = '라이브 제목',
  bandName = '밴드명',
  listenerCount = '68명 청취 중',
  listenerIconSrc = headsetIcon,
  listenerIconAlt = '',
  liveBadgeSrc,
  liveBadgeAlt = '',
}: LiveNowCardProps) => {
  return (
    <article className={`${cardClassName} relative`}>
      <div className="relative h-[62px] w-[62px] shrink-0 rounded-full shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary-400)_80%,transparent)]">
        <img
          alt={imageAlt}
          className="h-full w-full rounded-full object-cover"
          src={imageSrc}
        />
        <span className="font-body text-label4 absolute bottom-[-2px] left-1/2 inline-flex h-[12px] w-[27px] -translate-x-1/2 items-center justify-center rounded-full bg-[var(--color-primary-400)] text-[var(--color-neutral-0)]">
          {liveBadgeSrc ? (
            <img
              alt={liveBadgeAlt}
              className="h-full w-full object-contain"
              src={liveBadgeSrc}
            />
          ) : (
            'LIVE'
          )}
        </span>
      </div>

      <div className="ml-[10px] min-w-0 flex-1 pr-[66px]">
        <h3 className="font-body text-body1 m-0 truncate text-[var(--color-neutral-900)]">
          {title}
        </h3>
        <p className="font-body text-caption2 m-0 mt-[2px] truncate text-[var(--color-neutral-700)]">
          {bandName}
        </p>
        <p className="font-body text-caption2 m-0 mt-[4px] flex items-center gap-[6px] truncate text-[var(--color-primary-400)]">
          {listenerIconSrc ? (
            <img
              alt={listenerIconAlt}
              className="h-[13px] w-[12px] shrink-0 object-contain"
              src={listenerIconSrc}
            />
          ) : null}
          {listenerCount}
        </p>
      </div>

      <button
        className="font-body text-caption3 absolute right-[16px] bottom-[12px] inline-flex h-[22px] w-[51px] shrink-0 cursor-pointer items-center justify-center rounded-full border-[1px] border-[var(--color-primary-400)] bg-[var(--color-neutral-0)] text-[var(--color-primary-400)] transition duration-150 ease-out active:translate-y-px focus-visible:outline-0 focus-visible:ring-4 focus-visible:ring-[var(--color-primary-400)]"
        type="button"
      >
        입장
      </button>
    </article>
  )
}

export default LiveNowCard
